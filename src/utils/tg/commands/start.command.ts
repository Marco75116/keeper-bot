import { message } from "telegraf/filters";
import { bot } from "../../clients/telegraf.client";
import { WELCOME_MESSAGE } from "../../constants/messages.constant";
import { getWelcomeKeyboard } from "../keyboards/global.keyboards";
import { createUser } from "../../helpers/global.helper";
import { getUser } from "../../helpers/bddqueries/get.queries.helper";

export const botStart = () => {
  bot.on(message("text"), async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id;

    const user = await getUser(userId);
    if (!user) {
      createUser(ctx.update.message.from);
    }

    await ctx.reply(WELCOME_MESSAGE, getWelcomeKeyboard());
  });
};
