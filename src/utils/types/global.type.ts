import { attempts, poolPrize, user } from "../../db/schema";

export type User = typeof user.$inferSelect;
export type Attempts = typeof attempts.$inferSelect;
export type PoolPrize = typeof poolPrize.$inferSelect;

export interface WalletDetails {
  walletAddress: `0x${string}`;
  privateKey: string;
}

export interface EncryptedData {
  iv: string;
  encryptedData: string;
}

export interface CreateAttemptParams {
  idtg: number;
  userPrompt: string;
  keeperMessage: string;
  isWin: boolean;
}

export type NetworkType = "TON" | "SOL" | "XTR" | "";

export interface BuyConstructor {
  network: NetworkType;
  amount: string;
}
export interface CachedUser {
  telegramId: number;
  yumbarTickets: number;
  attempts: number;
}

export type SendSolResult = {
  success: boolean;
  signature?: string;
  error?: string;
};

export type SolPriceResult = {
  success: boolean;
  price?: number;
  error?: string;
};

export type TonPriceResult = {
  success: boolean;
  price?: number;
  error?: string;
};
