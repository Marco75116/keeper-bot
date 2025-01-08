import { message } from "telegraf/filters";
import { bot } from "../../clients/telegraf.client";
import { WELCOME_MESSAGE } from "../../constants/messages.constant";
import { getWelcomeKeyboard } from "../keyboards/global.keyboards";

export const botStart = () => {
  bot.on(message("text"), async (ctx) => {
    await ctx.reply(WELCOME_MESSAGE, getWelcomeKeyboard());
  });
};
