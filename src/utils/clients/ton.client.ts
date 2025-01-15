import { TonClient } from "@ton/ton";
import { TON_ENDPOINT } from "../constants/global.constant";
import TonWeb from "tonweb";

export const TON_API_KEY = Bun.env.TON_API_KEY!;

if (!TON_API_KEY) {
  throw new Error("TON_API_KEY not found in environment variables");
}

export const tonClient = new TonClient({
  endpoint: TON_ENDPOINT,
  apiKey: TON_API_KEY,
});

export const tonweb = new TonWeb(
  new TonWeb.HttpProvider(TON_ENDPOINT, {
    apiKey: Bun.env.TON_API_KEY,
  })
);

export const TON_PROJECT_WALLET = Bun.env.TON_PROJECT_WALLET_1!;

if (!TON_PROJECT_WALLET) {
  throw new Error(
    "TON Project wallet address not found in environment variables"
  );
}
export const projectWalletAddress = new TonWeb.utils.Address(
  TON_PROJECT_WALLET
).toString(true, true, true);
