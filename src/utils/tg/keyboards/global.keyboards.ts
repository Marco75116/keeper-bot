import { Markup } from "telegraf";
import {
  KEEPER_HOME_ACTIONS,
  WELCOME_ACTIONS,
} from "../actions/global.actions";

export const getEmptyKeyBoard = () => {
  return Markup.inlineKeyboard([]);
};

export const getWelcomeKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback("🃏 Play Yum's Bar", WELCOME_ACTIONS.PLAY)],
    [
      Markup.button.callback(
        "🎁 Vault Breaker Giveaway - Challenge Keeper",
        WELCOME_ACTIONS.KEEPER
      ),
    ],
    [
      Markup.button.callback(
        "📢 Subscribe for Updates",
        WELCOME_ACTIONS.SUBSCRIBE
      ),
    ],
    [Markup.button.callback("✕ Close", WELCOME_ACTIONS.CLOSE)],
  ]);
};
export const getKeeperHomeKeyboard = () => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "🎟️ Challenge Keeper",
        KEEPER_HOME_ACTIONS.CHALLENGE
      ),
    ],
    [
      Markup.button.callback("💰 Pool Prize", KEEPER_HOME_ACTIONS.POOLPRIZE),
      Markup.button.callback("📜 Prompts", KEEPER_HOME_ACTIONS.PROMPTS),
    ],
    [
      Markup.button.callback("🔐 Wallet", KEEPER_HOME_ACTIONS.WALLET),
      Markup.button.callback("➡️ Transfer", KEEPER_HOME_ACTIONS.TRANSFER),
    ],
    [Markup.button.callback("🙋‍♂️ Help", KEEPER_HOME_ACTIONS.HELP)],
    [Markup.button.callback("✕ Close", KEEPER_HOME_ACTIONS.CLOSE)],
  ]);
};
