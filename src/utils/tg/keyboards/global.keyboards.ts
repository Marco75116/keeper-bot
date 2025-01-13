import { Markup } from "telegraf";
import {
  BUY_ACTIONS,
  KEEPER_HOME_ACTIONS,
  WELCOME_ACTIONS,
} from "../actions/global.actions";
import { YUM_CHANNEL, YUM_GAME } from "../../constants/global.constant";

export const getEmptyKeyBoard = () => {
  return Markup.inlineKeyboard([]);
};

export const getWelcomeKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.url("🃏 Play Yum's Bar", YUM_GAME)],
    [
      Markup.button.callback(
        "🎁 Vault Breaker Giveaway - Challenge Keeper",
        WELCOME_ACTIONS.KEEPER
      ),
    ],
    [Markup.button.url("📢 Subscribe for Updates", YUM_CHANNEL)],
    [Markup.button.callback("✕ Close", WELCOME_ACTIONS.CLOSE)],
  ]);
};
export const getKeeperHomeKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "🎯 Challenge Keeper",
        KEEPER_HOME_ACTIONS.CHALLENGE
      ),
    ],
    [
      Markup.button.callback("💰 Pool Prize", KEEPER_HOME_ACTIONS.POOLPRIZE),
      Markup.button.callback("📜 Prompts", KEEPER_HOME_ACTIONS.PROMPTS),
    ],
    [
      Markup.button.callback("⛓️ Wallet", KEEPER_HOME_ACTIONS.WALLET),
      Markup.button.callback("🎟️ Buy Ticket", KEEPER_HOME_ACTIONS.BUY),
    ],
    [Markup.button.callback("🙋‍♂️ Help", KEEPER_HOME_ACTIONS.HELP)],
    [Markup.button.callback("✕ Close", KEEPER_HOME_ACTIONS.CLOSE)],
  ]);
};
export const getChallengeKeyBoard = (tickets: number) => {
  const buttons = [];

  if (tickets > 0) {
    buttons.push([
      Markup.button.callback("🔓 Crack the Vault", KEEPER_HOME_ACTIONS.ATTEMPT),
    ]);
  }
  buttons.push([
    Markup.button.callback("⬅️ Back", KEEPER_HOME_ACTIONS.HOME),
    Markup.button.callback("✕ Close", KEEPER_HOME_ACTIONS.CLOSE),
  ]);

  return Markup.inlineKeyboard(buttons);
};
export const getAttemptKeyBoard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("⬅️ Back", KEEPER_HOME_ACTIONS.CHALLENGE),
      Markup.button.callback("✕ Close", KEEPER_HOME_ACTIONS.CLOSE),
    ],
  ]);
};

export const getBuyKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("🌿 TON", BUY_ACTIONS.TON),
      Markup.button.callback("🌉 Solana", BUY_ACTIONS.SOLANA),
    ],
    [
      Markup.button.callback(
        "🔢 SELECT AN AMOUNT 🔢",
        BUY_ACTIONS.SELECTANAMOUNT
      ),
    ],
    [
      Markup.button.callback("1", BUY_ACTIONS.ONE),
      Markup.button.callback("5", BUY_ACTIONS.FIVE),
      Markup.button.callback("✏️ Custom", BUY_ACTIONS.AMOUNT),
    ],
    [Markup.button.callback("✅ CONFIRMATION", BUY_ACTIONS.CONFIRMATION)],
    [
      Markup.button.callback("⬅️ Back", KEEPER_HOME_ACTIONS.HOME),
      Markup.button.callback("✕ Close", KEEPER_HOME_ACTIONS.CLOSE),
    ],
  ]);
};
