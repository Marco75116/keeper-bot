import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

export const viemClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const SUPREME_PRIVATE_KEY = process.env.SUPREME_PRIVATE_KEY as `0x${string}`;

if (!SUPREME_PRIVATE_KEY) {
  throw new Error("SUPREME_PRIVATE_KEY must be provided in .env file");
}

export const supremeWallet = privateKeyToAccount(SUPREME_PRIVATE_KEY);

export const walletClient = createWalletClient({
  account: supremeWallet,
  chain: mainnet,
  transport: http(),
});
