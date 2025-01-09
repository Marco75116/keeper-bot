import { eq } from "drizzle-orm";
import { redisClient } from "../../clients/redis.client";
import { db } from "../../clients/drizzle.client";
import { users } from "../../../db/schema";
import type { User } from "../../types/global.type";

export const getUser = async (idtg: number): Promise<User | null> => {
  try {
    const cachedUser = await redisClient.get(`user:${idtg}`);
    if (cachedUser) {
      return JSON.parse(cachedUser);
    }

    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.idtg, idtg))
      .limit(1);

    const user = userResults[0] || null;

    if (user) {
      await redisClient.set(`user:${idtg}`, JSON.stringify(user), {
        EX: 1200,
      });
    }

    return user;
  } catch (error) {
    console.error(`Error fetching user with idtg ${idtg}:`, error);
    return null;
  }
};
