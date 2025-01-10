import type { InlineKeyboardMarkup, User } from "telegraf/types";
import type { EncryptedData } from "../types/global.type";
import { createWallet, faucet } from "./viem.helper";
import crypto from "crypto";
import {
  decrementTickets,
  insertAttempt,
  insertUser,
  insertWallet,
} from "./bddqueries/insert.queries.helper";
import { Context, Markup } from "telegraf";
import { bot } from "../clients/telegraf.client";
import { redisClient } from "../clients/redis.client";
import { updateCachedUser } from "./bddqueries/get.queries.helper";
import {
  formatAttemptConversation,
  getRandomSarcasm,
} from "../constants/messages.constant";
import { getAttemptKeyBoard } from "../tg/keyboards/global.keyboards";

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

    const sarcasm = getRandomSarcasm();

    let isWin = false;
    if (ctx.message.text === "42") {
      isWin = true;
    }
    const postAttempScreen = formatAttemptConversation(
      ctx.message.text,
      sarcasm,
      58888,
      passed.attempts,
      isWin
    );

    insertAttempt({
      idtg: userId,
      userPrompt: ctx.message.text,
      keeperMessage: sarcasm,
      isWin: isWin,
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
