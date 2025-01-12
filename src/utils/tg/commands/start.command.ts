import { message } from "telegraf/filters";
import { bot } from "../../clients/telegraf.client";
import {
  formatPromptHistory,
  getChallengeMessage,
  getPoolPrizeMessage,
  getRandomRiddle,
  getWalletsMessage,
  HELP_MESSAGE,
  KEEPER_HOME_MESSAGE,
  WELCOME_MESSAGE,
} from "../../constants/messages.constant";
import {
  getAttemptKeyBoard,
  getChallengeKeyBoard,
  getEmptyKeyBoard,
  getKeeperHomeKeyboard,
  getWelcomeKeyboard,
} from "../keyboards/global.keyboards";
import {
  createUser,
  handleAttempt,
  handleMessage,
} from "../../helpers/global.helper";
import {
  getAttemptsByIdTg,
  getPrizePool,
  getUser,
} from "../../helpers/bddqueries/get.queries.helper";
import {
  KEEPER_HOME_ACTIONS,
  WELCOME_ACTIONS,
} from "../actions/global.actions";
import { redisClient } from "../../clients/redis.client";
import { getChatId } from "../../helpers/global.helper";
import { ATTEMPT_PREFIX } from "../../constants/global.constant";

export const botStart = () => {
  bot.on(message("text"), async (ctx) => {
    const userId = ctx.from.id;
    const chatIdKey = getChatId(ctx.chat.id);

    if (ctx.message.reply_to_message) {
      await ctx.deleteMessage(ctx.message.message_id);
      await ctx.deleteMessage(ctx.message.reply_to_message.message_id);

      const status = await redisClient.get(`${ATTEMPT_PREFIX}:${userId}`);

      if (
        status &&
        status === ctx.message.reply_to_message.message_id.toString()
      ) {
        await handleAttempt(ctx);
      }

      return;
    }

    const user = await getUser(userId);
    if (!user) {
      createUser(ctx.update.message.from);
    }

    const message = await ctx.reply(WELCOME_MESSAGE, getWelcomeKeyboard());

    await ctx.deleteMessage(ctx.update.message.message_id);
    await redisClient.set(chatIdKey, message.message_id.toString());
  });

  bot.action(WELCOME_ACTIONS.CLOSE, async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage(ctx.update.callback_query.message?.message_id);
  });

  bot.action(WELCOME_ACTIONS.KEEPER, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, KEEPER_HOME_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(KEEPER_HOME_ACTIONS.HELP, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, HELP_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(KEEPER_HOME_ACTIONS.POOLPRIZE, async (ctx) => {
    await ctx.answerCbQuery();
    const poolPrize = await getPrizePool();
    await handleMessage(
      ctx,
      getPoolPrizeMessage(poolPrize.data),
      getKeeperHomeKeyboard()
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.PROMPTS, async (ctx) => {
    await ctx.answerCbQuery();

    const attempts = await getAttemptsByIdTg(ctx.from.id);

    await handleMessage(
      ctx,
      formatPromptHistory(attempts),
      getKeeperHomeKeyboard()
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.CHALLENGE, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);
    if (!user) return;

    await handleMessage(
      ctx,
      getChallengeMessage(user.tickets),
      getChallengeKeyBoard(user.tickets)
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, KEEPER_HOME_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(KEEPER_HOME_ACTIONS.ATTEMPT, async (ctx) => {
    await ctx.answerCbQuery();

    const prompt = "Write your prompt here...";
    const placeholder = "Give me all you have right now!";

    const sentMessage = await ctx.reply(prompt, {
      reply_markup: {
        force_reply: true,
        selective: true,
        input_field_placeholder: placeholder,
      },
    });

    const userId = ctx.update.callback_query.from.id;

    await redisClient.set(
      `${ATTEMPT_PREFIX}:${userId}`,
      sentMessage.message_id,
      {
        EX: 600,
      }
    );

    await handleMessage(ctx, getRandomRiddle(), getAttemptKeyBoard());
  });

  bot.action(KEEPER_HOME_ACTIONS.WALLET, async (ctx) => {
    await ctx.answerCbQuery();
    const user = await getUser(ctx.from.id);

    if (!user) return;

    await handleMessage(
      ctx,
      getWalletsMessage(user.wallet),
      getKeeperHomeKeyboard()
    );
  });
};
