import { users } from "../../db/schema";

export type User = typeof users.$inferSelect;

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
}
