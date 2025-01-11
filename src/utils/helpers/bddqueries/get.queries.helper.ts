import { desc, eq, isNull } from "drizzle-orm";
import { redisClient } from "../../clients/redis.client";
import { db } from "../../clients/drizzle.client";
import { attempts, poolPrize, users } from "../../../db/schema";
import type { User } from "../../types/global.type";

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

export const getPrizePool = async () => {
  return await db
    .select()
    .from(poolPrize)
    .where(isNull(poolPrize.winDate))
    .limit(1);
};
