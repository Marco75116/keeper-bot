import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { PROJECT_WALLET, solanaClient } from "../clients/solana.client";
import { SOLANA_DECIMALS } from "../constants/global.constant";
import type { EncryptedData, SendSolResult } from "../types/global.type";
import { decrypt } from "./global.helper";
import { cashierWalletSol, user } from "../../db/schema";
import { db } from "../clients/drizzle.client";
import { eq } from "drizzle-orm";
import bs58 from "bs58";

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
      .innerJoin(user, eq(user.id, cashierWalletSol.userId))
      .where(eq(user.telegramId, telegramId))
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
    const lamports = amount * 1e9;

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
