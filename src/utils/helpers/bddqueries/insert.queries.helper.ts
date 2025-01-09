import { attempts, users, wallets } from "../../../db/schema";
import { db } from "../../clients/drizzle.client";
import type {
  CreateAttemptParams,
  CreateUserParams,
  EncryptedData,
} from "../../types/global.type";

export const insertUser = async (params: CreateUserParams) => {
  return await db
    .insert(users)
    .values({
      idtg: params.idtg,
      firstname: params.firstname,
      tgusername: params.tgusername,
      wallet: params.wallet,
    })
    .returning();
};

export const insertWallet = async (params: {
  idtg: number;
  wallet: string;
  encryptedData: EncryptedData;
}) => {
  return await db
    .insert(wallets)
    .values({
      idtg: params.idtg,
      wallet: params.wallet,
      iv: params.encryptedData.iv,
      encryptedPrivateKey: params.encryptedData.encryptedData,
    })
    .returning();
};

export const insertAttempt = async (params: CreateAttemptParams) => {
  return await db
    .insert(attempts)
    .values({
      idtg: params.idtg,
      userPrompt: params.userPrompt,
      keeperMessage: params.keeperMessage,
      isWin: params.isWin,
    })
    .returning();
};
