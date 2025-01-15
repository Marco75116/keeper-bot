import type { InlineKeyboardMarkup } from "telegraf/types";
import type {
  BuyConstructor,
  EncryptedData,
  NetworkType,
} from "../types/global.type";
import crypto, { randomUUID } from "crypto";
import {
  createPrizePool,
  decrementTickets,
  incrementPoolPrize,
  insertAttempt,
  updatePoolPrizeWinner,
} from "./bddqueries/insert.queries.helper";
import { Context, Markup } from "telegraf";
import { bot } from "../clients/telegraf.client";
import { redisClient } from "../clients/redis.client";
import {
  setCachedUser,
  updateCachedPrizePool,
} from "./bddqueries/get.queries.helper";
import {
  formatAttemptConversation,
  getBuyCryptoMessage,
  getBuyStarsMessage,
} from "../constants/messages.constant";
import {
  getAttemptKeyBoard,
  getBuyCryptoKeyboard,
  getBuyStarsKeyboard,
  getEmptyKeyBoard,
} from "../tg/keyboards/global.keyboards";
import {
  buyConstructorEmpty,
  TICKET_PRICE_IN_STARS,
  TICKET_PRICE_USD,
  URL_KEEPER,
} from "../constants/global.constant";
import { buy_PREFIX } from "../tg/actions/global.actions";
import { getSolPriceFromCache } from "./solana.helper";
import { getTonPriceFromCache } from "./ton.helper";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY must be provided in .env file");
}

export const encrypt = (privateKey: string): EncryptedData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
};

export const decrypt = (encryptedObject: EncryptedData): string => {
  const iv = Buffer.from(encryptedObject.iv, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedObject.encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

export const handleMessage = async (
  ctx: Context,
  text: string,
  keyBoard: Markup.Markup<InlineKeyboardMarkup>,
  message_id?: number
) => {
  try {
    const chatId = ctx.chat?.id;
    const options: any = {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: true,
      },
      ...keyBoard,
    };
    if ("callback_query" in ctx.update && ctx.update.callback_query.message) {
      await bot.telegram.editMessageText(
        chatId,
        ctx.update.callback_query.message.message_id,
        undefined,
        text,
        options
      );
    } else if (message_id) {
      await bot.telegram.editMessageText(
        chatId,
        message_id,
        undefined,
        text,
        options
      );
    }
  } catch (error) {
    console.error("Error in handleMessage:", error);
  }
};

export const getChatId = (chatId: number): string => {
  return `chatId-${chatId}`;
};

export const handleBuyCustom = async (ctx: any) => {
  const amount = ctx.message.text.trim();
  const numAmount = Number(amount);

  if (isNaN(numAmount) || numAmount <= 0) {
    return;
  }

  const buyObject = await handleSetAmountBuyAction(ctx.from.id, numAmount);

  const chatIdKey = getChatId(ctx.chat.id);
  const messageId = await redisClient.get(chatIdKey);

  if (buyObject.network === "XTR") {
    await handleMessage(
      ctx,
      getBuyStarsMessage(buyObject.amount),
      getBuyStarsKeyboard(),
      Number(messageId)
    );
  } else {
    const totalPriceInCrypto = await getPriceInCrypto(buyObject);
    await handleMessage(
      ctx,
      getBuyCryptoMessage(buyObject, totalPriceInCrypto),
      getBuyCryptoKeyboard(),
      Number(messageId)
    );
  }
};
const startLoading = async (chatId: number, messageId: string) => {
  let isProcessing = true;
  const loadingStates = [
    "🤖 Keeper is thinking...",
    "⚡ Analyzing your answer...",
  ];

  const loadingLoop = async () => {
    let i = 0;
    while (isProcessing) {
      const options: any = {
        parse_mode: "HTML",
        ...getEmptyKeyBoard(),
      };

      await bot.telegram.editMessageText(
        chatId,
        Number(messageId),
        undefined,
        loadingStates[i % loadingStates.length],
        options
      );

      await new Promise((resolve) => setTimeout(resolve, 1000));
      i++;
    }
  };

  const loadingPromise = loadingLoop();
  return { loadingPromise, stopLoading: () => (isProcessing = false) };
};

export const handleAttempt = async (ctx: any) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  const chatIdKey = getChatId(ctx.chat.id);
  const messageId = await redisClient.get(chatIdKey);

  if (!messageId) return;

  const { loadingPromise, stopLoading } = await startLoading(chatId, messageId);

  try {
    const { data, success, error } = await sendChatMessage(ctx.message.text);

    if (!success || !data) {
      console.error("Chat API error:", error);
      return;
    }

    const passed = await decrementTickets(userId);
    if (!passed.success) return;

    await insertAttempt({
      idtg: userId,
      userPrompt: ctx.message.text,
      keeperMessage: data.response,
      isWin: data.is_secret_discovered,
    });

    const userUpdated = await setCachedUser(userId);

    const incrementResult = await incrementPoolPrize();

    if (incrementResult.success && incrementResult.data) {
      await updateCachedPrizePool({
        amount: incrementResult.data.amount,
        totalAttempts: incrementResult.data.totalAttempts,
      });
    }

    let amountPrizePoolWin = 0;
    if (data?.is_secret_discovered) {
      const returnPrizePoolWin = await updatePoolPrizeWinner(userId);
      amountPrizePoolWin = Number(returnPrizePoolWin.data?.amount);
      console.log(`User ${userId} won the prize pool!`);
      const createdPool = await createPrizePool();
      console.log("Prize pool created:", createdPool.data?.id);
    }

    const postAttempScreen = formatAttemptConversation(
      ctx.message.text,
      data.response,
      amountPrizePoolWin,
      userUpdated?.attempts,
      data.is_secret_discovered
    );

    stopLoading();
    await loadingPromise;

    const options: any = {
      parse_mode: "HTML",
      link_preview_options: {
        is_disabled: false,
      },
      ...getAttemptKeyBoard(),
    };

    await bot.telegram.editMessageText(
      chatId,
      Number(messageId),
      undefined,
      postAttempScreen,
      options
    );
  } catch (error) {
    stopLoading();
    await loadingPromise;
    throw error;
  }
};
export interface ChatResponse {
  response: string;
  is_secret_discovered: boolean;
  status: "success" | "error";
}

export interface ChatResult {
  success: boolean;
  data?: ChatResponse;
  error?: unknown;
}

export const sendChatMessage = async (message: string): Promise<ChatResult> => {
  try {
    const response = await fetch(URL_KEEPER, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const getLink = (text: string, link: string) => {
  return `<b><a href="${link}">${text}</a></b>`;
};

export const handleSetAmountBuyAction = async (
  userId: number,
  amount: number
): Promise<BuyConstructor> => {
  const buyObjectString = await redisClient.get(`${buy_PREFIX}:${userId}`);
  if (!buyObjectString) return buyConstructorEmpty;
  const buytokenObject: BuyConstructor = JSON.parse(buyObjectString);

  buytokenObject.amount = String(amount);

  await redisClient.set(
    `${buy_PREFIX}:${userId}`,
    JSON.stringify(buytokenObject)
  );

  return buytokenObject;
};

export const handleSetNetworkBuyAction = async (
  userId: number,
  network: NetworkType
): Promise<BuyConstructor> => {
  const buyObjectString = await redisClient.get(`${buy_PREFIX}:${userId}`);
  if (!buyObjectString) return buyConstructorEmpty;
  const buytokenObject: BuyConstructor = JSON.parse(buyObjectString);

  buytokenObject.network = network;

  await redisClient.set(
    `${buy_PREFIX}:${userId}`,
    JSON.stringify(buytokenObject)
  );

  return buytokenObject;
};

export async function createInvoiceLink(
  telegraf: Context<any>,
  amountTicket: number
) {
  const productLabel = `${amountTicket} ticket${
    amountTicket > 1 ? "s" : ""
  } 🎟️`;
  const payload = randomUUID();

  try {
    const link = await telegraf.telegram.createInvoiceLink({
      currency: "XTR",
      prices: [
        { label: productLabel, amount: amountTicket * TICKET_PRICE_IN_STARS },
      ],
      title: productLabel,
      provider_token: "",
      description: productLabel,
      payload,
    });

    return link;
  } catch (e) {
    throw e;
  }
}

export async function getPriceInCrypto(
  buyObject: BuyConstructor
): Promise<number> {
  try {
    if (buyObject.network === "" || buyObject.amount == "") {
      return 0;
    }

    const numTickets = Number(buyObject.amount);
    if (isNaN(numTickets)) {
      throw new Error("Invalid ticket amount");
    }

    const totalUsdCost = numTickets * TICKET_PRICE_USD;

    switch (buyObject.network) {
      case "SOL": {
        const solPrice = await getSolPriceFromCache();
        if (!solPrice) return 0;
        return totalUsdCost / solPrice;
      }

      case "TON": {
        const tonPrice = await getTonPriceFromCache();
        if (!tonPrice) return 0;
        return totalUsdCost / tonPrice;
      }
      default:
        return 0;
    }
  } catch (error) {
    console.error("Error calculating crypto amount:", error);
    return 0;
  }
}
