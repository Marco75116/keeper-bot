import { attempts, users } from "../../db/schema";

export type User = typeof users.$inferSelect;
export type Attempts = typeof attempts.$inferSelect;

export interface WalletDetails {
  walletAddress: `0x${string}`;
  privateKey: string;
}

export interface EncryptedData {
  iv: string;
  encryptedData: string;
}

export interface CreateUserParams {
  idtg: number;
  firstname: string;
  tgusername?: string;
  wallet: string;
  tickets: number;
}

export interface CreateAttemptParams {
  idtg: number;
  userPrompt: string;
  keeperMessage: string;
  isWin: boolean;
}
