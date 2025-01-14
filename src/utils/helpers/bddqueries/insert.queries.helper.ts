import { eq, isNull, sql } from "drizzle-orm";
import { attempts, poolPrize, users } from "../../../db/schema";
import { db } from "../../clients/drizzle.client";
import type { CreateAttemptParams } from "../../types/global.type";

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
