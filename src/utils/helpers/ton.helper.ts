import {
  Address,
  internal,
  toNano,
  WalletContractV4,
  WalletContractV5R1,
} from "@ton/ton";
import { mnemonicToPrivateKey, mnemonicNew } from "@ton/crypto";
import {
  projectWalletAddress,
  TON_PROJECT_WALLET,
  tonClient,
  tonweb,
} from "../clients/ton.client";
import {
  TON_DECIMALS,
  TON_PRICE_CACHE_EXPIRY,
  TON_PRICE_CACHE_KEY,
} from "../constants/global.constant";
import type {
  EncryptedData,
  SendTonResult,
  TonPriceResult,
} from "../types/global.type";
import type { Exchange } from "ccxt";
import ccxt from "ccxt";
import { redisClient } from "../clients/redis.client";
import { cashierWalletTon, user } from "../../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../clients/drizzle.client";
import { decrypt } from "./global.helper";

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

export const getTonKeysByTelegramId = async (
  telegramId: number
): Promise<{ privateKey: string | null; publicKey: string | null }> => {
  try {
    const walletData = await db
      .select({
        encryptedPrivateKeyData: cashierWalletTon.encryptedPrivateKeyData,
        encryptedPrivateKeyIv: cashierWalletTon.encryptedPrivateKeyIv,
        publicKey: cashierWalletTon.publicKey,
      })
      .from(cashierWalletTon)
      .where(eq(cashierWalletTon.userId, telegramId))
      .limit(1);
    if (!walletData.length) {
      throw new Error("No TON wallet found for this telegram user");
    }

    const wallet = walletData[0];

    const encryptedObject: EncryptedData = {
      encryptedData: wallet.encryptedPrivateKeyData,
      iv: wallet.encryptedPrivateKeyIv,
    };

    const privateKey = decrypt(encryptedObject);

    return {
      privateKey,
      publicKey: wallet.publicKey,
    };
  } catch (error) {
    console.error("Error retrieving TON private key:", error);
    return {
      privateKey: null,
      publicKey: null,
    };
  }
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForTransactionComplete(
  address: string
): Promise<string | null> {
  let attempts = 0;
  const maxAttempts = 15;
  await sleep(2000);

  const startTime = Math.floor(Date.now() / 1000);

  while (attempts < maxAttempts) {
    await sleep(2000);

    try {
      const transactions = await tonweb.getTransactions(address, 1);

      if (transactions && transactions.length > 0) {
        const tx = transactions[0];

        const timeDiff = startTime - tx.utime;

        if (
          timeDiff <= 40 &&
          tx.out_msgs?.[0]?.destination === projectWalletAddress
        ) {
          return tx.transaction_id.hash;
        }
      }
    } catch (error) {
      console.error("Error checking transaction:", error);
    }

    attempts++;
  }

  return null;
}
export const sendTon = async ({
  privateKey,
  publicKey,
  amount,
}: {
  privateKey: string;
  publicKey: string;
  amount: number;
}): Promise<SendTonResult> => {
  try {
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: Buffer.from(publicKey, "hex"),
    });

    const contract = tonClient.open(wallet);
    const seqno = await contract.getSeqno();
    const TON_FEE = 0.0055;
    const adjustedAmount = toNano(amount - TON_FEE);

    await contract.sendTransfer({
      seqno,
      secretKey: Buffer.from(privateKey, "hex"),
      messages: [
        internal({
          value: adjustedAmount,
          to: TON_PROJECT_WALLET,
          bounce: false,
        }),
      ],
      sendMode: 1,
    });

    const address = wallet.address.toString();

    const transactionHash = await waitForTransactionComplete(address);

    if (!transactionHash) {
      throw new Error("Transaction confirmation timeout");
    }

    return {
      success: true,
      hash: transactionHash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
