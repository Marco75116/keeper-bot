import { Connection } from "@solana/web3.js";
import { SOLANA_ENDPOINT } from "../constants/global.constant";

export const solanaClient = new Connection(SOLANA_ENDPOINT, "confirmed");

export const PROJECT_WALLET = Bun.env.SOL_PROJECT_WALLET_1!;

if (!PROJECT_WALLET) {
  throw new Error("Project wallet address not found in environment variables");
}
