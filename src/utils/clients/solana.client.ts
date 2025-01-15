import { Connection } from "@solana/web3.js";

export const SOLANA_ENDPOINT = Bun.env.SOLANA_ENDPOINT!;

if (!SOLANA_ENDPOINT) {
  throw new Error("SOLANA_ENDPOINT not found in environment variables");
}

export const solanaClient = new Connection(SOLANA_ENDPOINT, "confirmed");

export const PROJECT_WALLET = Bun.env.SOL_PROJECT_WALLET_1!;

if (!PROJECT_WALLET) {
  throw new Error(
    "SOLANA Project wallet address not found in environment variables"
  );
}
