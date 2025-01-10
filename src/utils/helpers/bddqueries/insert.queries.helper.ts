import { eq, sql } from "drizzle-orm";
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
      tickets: params.tickets,
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
export const decrementTickets = async (idtg: number) => {
  try {
    const result = await db
      .update(users)
      .set({
        tickets: sql`${users.tickets} - 1`,
        attempts: sql`${users.attempts} + 1`,
      })
      .where(eq(users.idtg, idtg))
      .returning({
        tickets: users.tickets,
        attempts: users.attempts,
      });

    return {
      success: true,
      tickets: result[0].tickets,
      attempts: result[0].attempts,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};
