import { Markup } from "telegraf";
import { WELCOME_ACTIONS } from "../actions/global.actions";

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
