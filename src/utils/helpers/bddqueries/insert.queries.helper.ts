import { eq, isNull, sql } from "drizzle-orm";
import {
  attempts,
  poolPrize,
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
} from "../../types/global.type";
import { v4 as uuidv4 } from "uuid";

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

export const createPrizePool = async () => {
  try {
    const result = await db.insert(poolPrize).values({}).returning({
      id: poolPrize.id,
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

export const incrementPoolPrize = async () => {
  try {
    const result = await db
      .update(poolPrize)
      .set({
        amount: sql`${poolPrize.amount} + 0.56`,
        totalAttempts: sql`${poolPrize.totalAttempts} + 1`,
      })
      .where(isNull(poolPrize.winDate))
      .returning({
        amount: poolPrize.amount,
        totalAttempts: poolPrize.totalAttempts,
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

export const updatePoolPrizeWinner = async (idtgWinner: number) => {
  try {
    const result = await db
      .update(poolPrize)
      .set({
        idtgWinner: idtgWinner,
        winDate: new Date(),
      })
      .where(isNull(poolPrize.winDate))
      .returning({
        id: poolPrize.id,
        amount: poolPrize.amount,
        idtgWinner: poolPrize.idtgWinner,
        winDate: poolPrize.winDate,
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
    const userResult = await db
      .select({
        id: user.id,
      })
      .from(user)
      .where(eq(user.telegramId, telegramId))
      .limit(1);

    if (!userResult.length) {
      return {
        success: false,
        error: "User not found",
      };
    }

    await db.insert(ticketPurchasesViaBot).values({
      userId: userResult[0].id,
      amountTickets: amountTickets,
      network: network,
      price: price.toString(),
      txHash: txHash,
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
      id: uuidv4(),
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
