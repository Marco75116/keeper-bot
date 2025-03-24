import { eq, isNull, sql } from "drizzle-orm";
import {
  attempts,
  cashierWalletSol,
  cashierWalletTon,
  poolTreasure,
  ticketPurchasesViaBot,
  user,
  wallets,
} from "../../../db/schema";
import { db } from "../../clients/drizzle.client";
import type {
  CreateAttemptParams,
  CreateUserParams,
  EncryptedData,
  InsertTicketPurchaseParams,
  TONWalletParams,
} from "../../types/global.type";

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

export const decrementTickets = async (telegramId: number) => {
  try {
    const result = await db
      .update(user)
      .set({
        yumbarTickets: sql`${user.yumbarTickets} - 1`,
      })
      .where(eq(user.telegramId, telegramId))
      .returning({
        tickets: user.yumbarTickets,
      });

    return {
      success: true,
      tickets: result[0].tickets,
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const createPoolTreasure = async () => {
  try {
    const result = await db.insert(poolTreasure).values({}).returning({
      id: poolTreasure.id,
    });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const incrementPoolTreasure = async () => {
  try {
    const result = await db
      .update(poolTreasure)
      .set({
        amount: sql`${poolTreasure.amount} + 0.56`,
        totalAttempts: sql`${poolTreasure.totalAttempts} + 1`,
      })
      .where(isNull(poolTreasure.winDate))
      .returning({
        amount: poolTreasure.amount,
        totalAttempts: poolTreasure.totalAttempts,
      });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const updatePoolTreasureWinner = async (idtgWinner: number) => {
  try {
    const result = await db
      .update(poolTreasure)
      .set({
        idtgWinner: idtgWinner,
        winDate: new Date(),
      })
      .where(isNull(poolTreasure.winDate))
      .returning({
        id: poolTreasure.id,
        amount: poolTreasure.amount,
        idtgWinner: poolTreasure.idtgWinner,
        winDate: poolTreasure.winDate,
      });

    return {
      success: true,
      data: result[0],
    };
  } catch (error) {
    return {
      success: false,
      error: error,
    };
  }
};

export const incrementTickets = async (
  telegramId: number,
  numberTicketsBought: number
) => {
  try {
    const result = await db
      .update(user)
      .set({
        yumbarTickets: sql`${user.yumbarTickets} + ${numberTicketsBought}`,
      })
      .where(eq(user.telegramId, telegramId))
      .returning({
        tickets: user.yumbarTickets,
      });

    return {
      success: true,
      tickets: result[0].tickets,
    };
  } catch (error) {
    console.error("Error incrementing tickets:", error);
    return {
      success: false,
      error: error,
    };
  }
};

export async function insertTicketPurchase({
  telegramId,
  amountTickets,
  network,
  price,
  txHash,
}: InsertTicketPurchaseParams): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await db.insert(ticketPurchasesViaBot).values({
      userId: telegramId,
      amountTickets: amountTickets,
      network: network,
      price: price.toString(),
      txHash: txHash || "",
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error inserting ticket purchase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const insertUser = async (params: CreateUserParams) => {
  return await db
    .insert(user)
    .values({
      telegramId: params.idtg,
      username: params.tgusername || "player",
      firstName: params.firstname,
      lastName: params.lastName || "",
      languageCode: params.languageCode || "en",
      yumbarTickets: params.tickets,
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
      telegramId: params.idtg,
      wallet: params.wallet,
      iv: params.encryptedData.iv,
      encryptedPrivateKey: params.encryptedData.encryptedData,
    })
    .returning();
};

export const insertTONWallet = async (params: TONWalletParams) => {
  try {
    await db.insert(cashierWalletTon).values({
      ...params,
    });
  } catch (error) {
    console.error("Error inserting TON wallet:", error);
    throw error;
  }
};

export const insertSOLWallet = async ({
  publicKey,
  userId,
  encryptedPrivateKeyData,
  encryptedPrivateKeyIv,
}: {
  publicKey: string;
  userId: number;
  encryptedPrivateKeyData: string;
  encryptedPrivateKeyIv: string;
}) => {
  return await db
    .insert(cashierWalletSol)
    .values({
      publicKey,
      userId,
      encryptedPrivateKeyData,
      encryptedPrivateKeyIv,
    })
    .returning();
};
