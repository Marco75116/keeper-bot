import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { PROJECT_WALLET, solanaClient } from "../clients/solana.client";
import {
  SOL_PRICE_CACHE_EXPIRY,
  SOL_PRICE_CACHE_KEY,
  SOLANA_DECIMALS,
} from "../constants/global.constant";
import type {
  EncryptedData,
  SendSolResult,
  SolPriceResult,
  SolWalletDetails,
} from "../types/global.type";
import { decrypt } from "./global.helper";
import { cashierWalletSol, user } from "../../db/schema";
import { db } from "../clients/drizzle.client";
import { eq } from "drizzle-orm";
import bs58 from "bs58";
import ccxt, { Exchange } from "ccxt";
import { redisClient } from "../clients/redis.client";

export const getSOLBalance = async (addressString: string) => {
  try {
    const address = new PublicKey(addressString);
    const balance = await solanaClient.getBalance(address);

    return Number(balance) / 10 ** SOLANA_DECIMALS;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
export async function getPrivateSolKeyByTelegramId(
  telegramId: number
): Promise<string | null> {
  try {
    const walletData = await db
      .select({
        encryptedPrivateKeyData: cashierWalletSol.encryptedPrivateKeyData,
        encryptedPrivateKeyIv: cashierWalletSol.encryptedPrivateKeyIv,
      })
      .from(cashierWalletSol)
      .where(eq(cashierWalletSol.userId, telegramId))
      .limit(1);

    if (!walletData.length) {
      throw new Error("No wallet found for this telegram user");
    }

    const wallet = walletData[0];

    const encryptedObject: EncryptedData = {
      encryptedData: wallet.encryptedPrivateKeyData,
      iv: wallet.encryptedPrivateKeyIv,
    };

    const privateKey = decrypt(encryptedObject);

    return privateKey;
  } catch (error) {
    console.error("Error retrieving private key:", error);
    return null;
  }
}

export async function sendSol({
  privateKey,
  amount,
}: {
  privateKey: string;
  amount: number;
}): Promise<SendSolResult> {
  try {
    const lamports = Math.round(amount * 1e9);

    const decodedKey = bs58.decode(privateKey);
    const senderKeypair = Keypair.fromSecretKey(decodedKey);

    let recipientPubKey = new PublicKey(PROJECT_WALLET);

    const { blockhash, lastValidBlockHeight } =
      await solanaClient.getLatestBlockhash();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: senderKeypair.publicKey,
        toPubkey: recipientPubKey,
        lamports,
      })
    );

    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;
    transaction.lastValidBlockHeight = lastValidBlockHeight;

    transaction.sign(senderKeypair);
    const signature = await solanaClient.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: "confirmed",
      }
    );

    const confirmation = await solanaClient.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    return {
      success: true,
      signature,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export const setCachedSolPrice = async (
  currency: string = "USDT"
): Promise<number | null> => {
  try {
    const priceResult = await getSolPrice(currency);

    if (!priceResult.success || !priceResult.price) {
      console.log("Error retrieving cached SOL price");
      return null;
    }

    await redisClient.set(
      SOL_PRICE_CACHE_KEY,
      JSON.stringify(priceResult.price),
      {
        EX: SOL_PRICE_CACHE_EXPIRY,
      }
    );

    return priceResult.price;
  } catch (error) {
    console.error("Error setting cached SOL price:", error);
    return null;
  }
};

export const getSolPriceFromCache = async (
  currency: string = "USDT"
): Promise<number | null> => {
  try {
    const cachedPrice = await redisClient.get(SOL_PRICE_CACHE_KEY);
    if (cachedPrice) {
      const parsedPrice = JSON.parse(cachedPrice);
      return Number(parsedPrice);
    }

    const newCachedPrice = await setCachedSolPrice(currency);
    return newCachedPrice ?? null;
  } catch (error) {
    console.error("Error fetching SOL price from cache:", error);
    return null;
  }
};

export async function getSolPrice(
  currency: string = "USDT",
  exchangeName: keyof typeof ccxt = "binance"
): Promise<SolPriceResult> {
  try {
    const exchange: Exchange = new (ccxt[exchangeName] as any)({
      enableRateLimit: true,
    });

    const symbol = `SOL/${currency}`;

    const ticker = await exchange.fetchTicker(symbol);

    if (!ticker || !ticker.last) {
      throw new Error("Could not fetch SOL price");
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

export const createSOLWallet = (): SolWalletDetails => {
  const keypair = Keypair.generate();

  const publicKey = keypair.publicKey.toString();
  const privateKey = bs58.encode(keypair.secretKey);

  return {
    publicKey,
    privateKey,
  };
};
