import { desc, eq, isNull, sql } from "drizzle-orm";
import { redisClient } from "../../clients/redis.client";
import { db } from "../../clients/drizzle.client";
import {
  attempts,
  cashierWalletSol,
  cashierWalletTon,
  poolPrize,
  user,
} from "../../../db/schema";
import type { CachedUser } from "../../types/global.type";
import { POOL_CACHED_KEY } from "../../constants/global.constant";

export const setCachedUser = async (
  telegramId: number
): Promise<CachedUser | null> => {
  const [userResults, attemptsCount] = await Promise.all([
    db
      .select({
        telegramId: user.telegramId,
        yumbarTickets: user.yumbarTickets,
      })
      .from(user)
      .where(eq(user.telegramId, telegramId))
      .limit(1),
    db
      .select({
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(attempts)
      .where(eq(attempts.idtg, telegramId)),
  ]);

  if (!userResults[0]) return null;

  const userData = {
    ...userResults[0],
    attempts: attemptsCount[0].count,
  };

  await redisClient.set(`user:${telegramId}`, JSON.stringify(userData), {
    EX: 300,
  });

  return userData;
};
export const updateCachedUser = async (
  idtg: number,
  updates: { tickets?: number; attempts?: number }
) => {
  try {
    const cachedUser = await redisClient.get(`user:${idtg}`);
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      const updatedUser = {
        ...userData,
        ...updates,
      };
      await redisClient.set(`user:${idtg}`, JSON.stringify(updatedUser), {
        EX: 300,
      });
    }
  } catch (error) {
    console.error("Error updating cached user:", error);
  }
};

export const getUser = async (idtg: number): Promise<CachedUser | null> => {
  try {
    const cachedUser = await redisClient.get(`user:${idtg}`);
    if (cachedUser) {
      const parsed = JSON.parse(cachedUser);
      return {
        telegramId: Number(parsed.telegramId),
        yumbarTickets: Number(parsed.yumbarTickets),
        attempts: Number(parsed.attempts),
      };
    }

    return await setCachedUser(idtg);
  } catch (error) {
    console.error(`Error fetching user with idtg ${idtg}:`, error);
    return null;
  }
};

export const getAttemptsByIdTg = async (idtg: number) => {
  return await db
    .select()
    .from(attempts)
    .where(eq(attempts.idtg, idtg))
    .orderBy(desc(attempts.sentAt));
};

export const setCachedPrizePool = async () => {
  const result = await db
    .select()
    .from(poolPrize)
    .where(isNull(poolPrize.winDate))
    .limit(1);

  const activePrizePool = result[0] || null;

  if (activePrizePool) {
    await redisClient.set(POOL_CACHED_KEY, JSON.stringify(activePrizePool), {
      EX: 300,
    });
  }

  return activePrizePool;
};

export const updateCachedPrizePool = async (updates: {
  amount?: string;
  totalAttempts?: number;
}) => {
  try {
    const cachedPool = await redisClient.get(POOL_CACHED_KEY);
    if (cachedPool) {
      const poolData = JSON.parse(cachedPool);
      const updatedPool = {
        ...poolData,
        ...updates,
      };
      await redisClient.set(POOL_CACHED_KEY, JSON.stringify(updatedPool), {
        EX: 300,
      });
    }
  } catch (error) {
    console.error("Error updating cached prize pool:", error);
  }
};

export const getPrizePool = async () => {
  try {
    const cachedPool = await redisClient.get(POOL_CACHED_KEY);
    if (cachedPool) {
      const parsed = JSON.parse(cachedPool);
      return {
        success: true,
        data: {
          ...parsed,
          amount: Number(parsed.amount),
          createdAt: new Date(parsed.createdAt),
        },
      };
    }

    const pool = await setCachedPrizePool();
    return {
      success: true,
      data: pool,
    };
  } catch (error) {
    console.error("Error fetching prize pool:", error);
    return {
      success: false,
      error: error,
    };
  }
};

export const getTonWalletAddress = async (telegramId: number) => {
  try {
    const result = await db
      .select({
        address: cashierWalletTon.address,
      })
      .from(cashierWalletTon)
      .innerJoin(user, eq(cashierWalletTon.userId, user.id))
      .where(eq(user.telegramId, telegramId))
      .limit(1);

    return result[0]?.address;
  } catch (error) {
    console.error("Error fetching TON wallet address:", error);
    throw error;
  }
};

export const getSolWalletPublicKey = async (telegramId: number) => {
  try {
    const result = await db
      .select({
        publicKey: cashierWalletSol.publicKey,
      })
      .from(cashierWalletSol)
      .innerJoin(user, eq(cashierWalletSol.userId, user.id))
      .where(eq(user.telegramId, telegramId))
      .limit(1);

    return result[0]?.publicKey;
  } catch (error) {
    console.error("Error fetching SOL wallet public key:", error);
    throw error;
  }
};
