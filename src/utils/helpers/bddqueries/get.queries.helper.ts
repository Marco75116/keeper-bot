import { desc, eq, isNull } from "drizzle-orm";
import { redisClient } from "../../clients/redis.client";
import { db } from "../../clients/drizzle.client";
import {
  attempts,
  cashierWalletTon,
  poolPrize,
  user,
  users,
} from "../../../db/schema";
import type { User } from "../../types/global.type";
import { POOL_CACHED_KEY } from "../../constants/global.constant";

export const setCachedUser = async (idtg: number): Promise<User | null> => {
  const userResults = await db
    .select()
    .from(users)
    .where(eq(users.idtg, idtg))
    .limit(1);

  const user = userResults[0] || null;

  if (user) {
    await redisClient.set(`user:${idtg}`, JSON.stringify(user), {
      EX: 300,
    });
  }

  return user;
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

export const getUser = async (idtg: number): Promise<User | null> => {
  try {
    const cachedUser = await redisClient.get(`user:${idtg}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
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
