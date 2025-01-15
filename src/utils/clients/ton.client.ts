import { TonClient } from "@ton/ton";
import { TON_ENDPOINT } from "../constants/global.constant";

export const tonClient = new TonClient({
  endpoint: TON_ENDPOINT,
});

export const TON_PROJECT_WALLET = Bun.env.TON_PROJECT_WALLET_1!;

if (!TON_PROJECT_WALLET) {
  throw new Error("Project wallet address not found in environment variables");
}
