import { bot } from "../../clients/telegraf.client";
import {
  KEEPER_HOME_MESSAGE,
  WELCOME_MESSAGE_WRONG,
} from "../../constants/messages.constant";
import { handleMessage } from "../../helpers/global.helper";
import { WELCOME_ACTIONS } from "../actions/global.actions";
import {
  getCloseKeyBoard,
  getKeeperHomeKeyboard,
} from "../keyboards/global.keyboards";

export const handleWelcome = () => {
  bot.action(WELCOME_ACTIONS.CLOSE, async (ctx) => {
    await ctx.answerCbQuery();
    try {
      await ctx.deleteMessage(ctx.update.callback_query.message?.message_id);
    } catch (error: any) {
      if (error?.response?.error_code === 400 && 
          error?.response?.description?.includes("message can't be deleted")) {
        console.error("Cannot delete message:", error.response.description);
      } else {
        console.error("Error deleting message:", error);
      }
    }
  });

  bot.action(WELCOME_ACTIONS.KEEPER, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, KEEPER_HOME_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(WELCOME_ACTIONS.WRONG, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, WELCOME_MESSAGE_WRONG, getCloseKeyBoard());
  });
};
