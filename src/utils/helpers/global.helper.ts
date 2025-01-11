import type { InlineKeyboardMarkup, User } from "telegraf/types";
import type { EncryptedData } from "../types/global.type";
import { createWallet, faucet } from "./viem.helper";
import crypto from "crypto";
import {
  createPrizePool,
  decrementTickets,
  incrementPoolPrize,
  insertAttempt,
  insertUser,
  insertWallet,
  updatePoolPrizeWinner,
} from "./bddqueries/insert.queries.helper";
import { Context, Markup } from "telegraf";
import { bot } from "../clients/telegraf.client";
import { redisClient } from "../clients/redis.client";
import { updateCachedUser } from "./bddqueries/get.queries.helper";
import { formatAttemptConversation } from "../constants/messages.constant";
import {
  getAttemptKeyBoard,
  getEmptyKeyBoard,
} from "../tg/keyboards/global.keyboards";
import { URL_KEEPER } from "../constants/global.constant";

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
  let encrypted = cipher.update(privateKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

export const decrypt = (encryptedObject: EncryptedData): string => {
  const iv = Buffer.from(encryptedObject.iv, "hex");
  const encryptedText = Buffer.from(encryptedObject.encryptedData, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const createUser = (tgUser: User) => {
  const walletDetails = createWallet();
  const encryptedData = encrypt(walletDetails.privateKey);
  insertUser({
    idtg: tgUser.id,
    firstname: tgUser.first_name,
    tgusername: tgUser.username,
    wallet: walletDetails.walletAddress,
    tickets: 5,
  });
  insertWallet({
    idtg: tgUser.id,
    wallet: walletDetails.walletAddress,
    encryptedData,
  });
  // skip for now
  // faucet(walletDetails.walletAddress);
};

export const handleMessage = async (
  ctx: Context,
  text: string,
  keyBoard: Markup.Markup<InlineKeyboardMarkup>
) => {
  try {
    const chatId = ctx.chat?.id;
    if ("callback_query" in ctx.update && ctx.update.callback_query.message) {
      const options: any = {
        parse_mode: "HTML",
        link_preview_options: {
          is_disabled: true,
        },
        ...keyBoard,
      };

      await bot.telegram.editMessageText(
        chatId,
        ctx.update.callback_query.message.message_id,
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

export const handleAttempt = async (ctx: any) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  const chatIdKey = getChatId(ctx.chat.id);
  const messageId = await redisClient.get(chatIdKey);

  if (messageId) {
    const passed = await decrementTickets(userId);
    if (!passed.success) return;

    if (passed.tickets !== undefined && passed.attempts !== undefined) {
      await updateCachedUser(userId, {
        tickets: passed.tickets,
        attempts: passed.attempts,
      });
    }

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

    const { data, success, error } = await sendChatMessage(ctx.message.text);

    isProcessing = false;
    await loadingPromise;

    if (!success || !data) {
      console.error("Chat API error:", error);
      return;
    }

    await incrementPoolPrize();

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
      passed.attempts,
      data.is_secret_discovered
    );

    await insertAttempt({
      idtg: userId,
      userPrompt: ctx.message.text,
      keeperMessage: data.response,
      isWin: data.is_secret_discovered,
    });

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
