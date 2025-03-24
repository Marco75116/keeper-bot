import { redisClient } from "../clients/redis.client";
import {
  BALANCES_CACHE_EXPIRY,
  BALANCES_CACHE_KEY,
} from "../constants/global.constant";
import type { CachedBalances } from "../types/global.type";
import { getSOLBalance } from "./solana.helper";
import { getTONBalance } from "./ton.helper";

export const setCachedBalances = async (
  userId: number,
  tonAddress: string,
  solAddress: string
): Promise<CachedBalances | null> => {
  try {
    const [tonBalance, solBalance] = await Promise.all([
      getTONBalance(tonAddress),
      getSOLBalance(solAddress),
    ]);

    const balances: CachedBalances = {
      ton: tonBalance,
      sol: solBalance,
    };

    const casheKey = `${BALANCES_CACHE_KEY}-${userId}`;

    await redisClient.set(casheKey, JSON.stringify(balances), {
      EX: BALANCES_CACHE_EXPIRY,
    });

    return balances;
  } catch (error) {
    console.error("Error setting cached balances:", error);
    return null;
  }
};

export const getBalancesFromCache = async (
  userId: number,
  tonAddress: string,
  solAddress: string
): Promise<CachedBalances | null> => {
  try {
    const casheKey = `${BALANCES_CACHE_KEY}-${userId}`;
    const cachedBalances = await redisClient.get(casheKey);
    if (cachedBalances) {
      const parsedBalances = JSON.parse(cachedBalances) as CachedBalances;

      return {
        sol: Number(parsedBalances.sol),
        ton: Number(parsedBalances.ton),
      };
    }

    const newCachedBalances = await setCachedBalances(
      userId,
      tonAddress,
      solAddress
    );
    return newCachedBalances;
  } catch (error) {
    console.error("Error fetching balances from cache:", error);
    return null;
  }
};

export const getTonBalanceFromCache = async (
  userId: number,
  tonAddress: string,
  solAddress: string
): Promise<number | null> => {
  const balances = await getBalancesFromCache(userId, tonAddress, solAddress);
  return balances?.ton ?? null;
};

export const getSolBalanceFromCache = async (
  userId: number,
  tonAddress: string,
  solAddress: string
): Promise<number | null> => {
  const balances = await getBalancesFromCache(userId, tonAddress, solAddress);
  return balances?.sol ?? null;
};
