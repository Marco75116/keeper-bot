export const WELCOME_ACTIONS = {
  KEEPER: "keeper",
  CLOSE: "close",
};

export const KEEPER_HOME_ACTIONS = {
  HOME: "home",
  CHALLENGE: "challenge",
  HELP: "help",
  POOLPRIZE: "poolprize",
  PROMPTS: "prompts",
  CLOSE: "close",
  ATTEMPT: "attempt",
  WALLET: "wallet",
  BUY: "buy",
};

export const buy_PREFIX = "buy";

export const BUY_ACTIONS = {
  SOLANA: `${buy_PREFIX}-solana`,
  TON: `${buy_PREFIX}-ton`,
  AMOUNT: `${buy_PREFIX}-amount`,
  CONFIRMATION: `${buy_PREFIX}-confirmation`,
  SELECTANAMOUNT: `${buy_PREFIX}-selectanamount`,
  ONE: `${buy_PREFIX}-one`,
  FIVE: `${buy_PREFIX}-FIVE`,
};
