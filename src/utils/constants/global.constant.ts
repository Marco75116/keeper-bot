import type { BuyConstructor } from "../types/global.type";

export const TON_TAG = "TON";
export const SOL_TAG = "SOL";
export const XTR_TAG = "XTR";

export const NETWORKS_TAG = [TON_TAG, XTR_TAG, SOL_TAG, ""] as const;

export const faucetAmountInETH = "0.00005";

export const URL_KEEPER = "https://yum-party-ai-python.onrender.com/chat";

export const ATTEMPT_PREFIX = "attempt";

export const POOL_CACHED_KEY = "active_prize_pool";

export const buyConstructorEmpty: BuyConstructor = {
  network: "",
  amount: "",
};

export const YUM_CHANNEL = "https://t.me/yumparty_official";

export const YUM_GAME = "https://t.me/YumGamesTestBot/yumbar";

export const TON_ENDPOINT = "https://toncenter.com/api/v2/jsonRPC";
export const TON_DECIMALS = 9;

export const SOLANA_DECIMALS = 9;

export const TICKET_PRICE_IN_STARS = 40;

export const ZERO_STRING = "0";

export const SOL_PRICE_CACHE_EXPIRY = 300;
export const SOL_PRICE_CACHE_KEY = `${SOL_TAG}:PRICE`;

export const TON_PRICE_CACHE_EXPIRY = 300;
export const TON_PRICE_CACHE_KEY = `${TON_TAG}:PRICE`;

export const TICKET_PRICE_USD = 0.8;

export const BALANCES_CACHE_KEY = "USER:BALANCES";
export const BALANCES_CACHE_EXPIRY = 300;
