import { Address, WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey, mnemonicNew } from "@ton/crypto";
import { tonClient } from "../clients/ton.client";
import {
  TON_DECIMALS,
  TON_PRICE_CACHE_EXPIRY,
  TON_PRICE_CACHE_KEY,
} from "../constants/global.constant";
import type { TonPriceResult } from "../types/global.type";
import type { Exchange } from "ccxt";
import ccxt from "ccxt";
import { redisClient } from "../clients/redis.client";

export const getTONBalance = async (addressString: string) => {
  try {
    const address = Address.parse(addressString);
    const balance = await tonClient.getBalance(address);

    return Number(balance) / 10 ** TON_DECIMALS;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};

export const createTONWalletV5 = async () => {
  try {
    const mnemonic = await mnemonicNew();
    const { publicKey, secretKey } = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV5R1.create({
      publicKey: publicKey,
      workchain: 0,
    });
    const contract = tonClient.open(wallet);
    const address = wallet.address.toString();

    return { wallet, contract, publicKey, secretKey, address };
  } catch (error) {
    console.error("Error creating Wallet:", error);
  }
};

export async function getTonPrice(
  currency: string = "USDT"
): Promise<TonPriceResult> {
  try {
    const exchange: Exchange = new (ccxt["binance"] as any)({
      enableRateLimit: true,
    });

    const symbol = `TON/${currency}`;

    const ticker = await exchange.fetchTicker(symbol);

    if (!ticker || !ticker.last) {
      throw new Error("Could not fetch TON price");
    }

    return {
      success: true,
      price: ticker.last,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const setCachedTonPrice = async (
  currency: string = "USDT"
): Promise<number | null> => {
  try {
    const priceResult = await getTonPrice(currency);

    if (!priceResult.success || !priceResult.price) {
      console.log("Error retrieving cached TON price");
      return null;
    }

    await redisClient.set(
      TON_PRICE_CACHE_KEY,
      JSON.stringify(priceResult.price),
      {
        EX: TON_PRICE_CACHE_EXPIRY,
      }
    );

    return priceResult.price;
  } catch (error) {
    console.error("Error setting cached TON price:", error);
    return null;
  }
};

export const getTonPriceFromCache = async (
  currency: string = "USDT"
): Promise<number | null> => {
  try {
    const cachedPrice = await redisClient.get(TON_PRICE_CACHE_KEY);
    if (cachedPrice) {
      const parsedPrice = JSON.parse(cachedPrice);
      return Number(parsedPrice);
    }

    const newCachedPrice = await setCachedTonPrice(currency);
    return newCachedPrice ?? null;
  } catch (error) {
    console.error("Error fetching TON price from cache:", error);
    return null;
  }
};
