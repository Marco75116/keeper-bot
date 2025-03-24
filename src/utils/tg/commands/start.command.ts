import { message } from "telegraf/filters";
import { bot } from "../../clients/telegraf.client";
import {
  formatPromptHistory,
  getChallengeMessage,
  paymentOptionsMessage,
  getTreasureMessage,
  getRandomRiddle,
  getWalletsMessage,
  DECREES_MESSAGE,
  KEEPER_HOME_MESSAGE,
  WELCOME_MESSAGE,
  getBuyStarsMessage,
  getBuyCryptoMessage,
  getSolPaymentSuccessMessage,
  loadingStatesTx,
  getTONPaymentSuccessMessage,
  paymentFailMessage,
  loadingStatesBalance,
  getInsufficientBalanceMessage,
  chooseNetworkPayment,
} from "../../constants/messages.constant";
import {
  getAttemptKeyBoard,
  getBuyCryptoKeyboard,
  getBuyCryptoOptionKeyboard,
  getBuyStarsKeyboard,
  getBuyStarsKeyConfimationBoard,
  getChallengeKeyBoard,
  getInsufficientBalanceKeyBoard,
  getKeeperHomeKeyboard,
  getPaymentOptionsKeyboard,
  getPaymentSuccessKeyBoard,
  getWalletKeyBoard,
  getWelcomeKeyboard,
} from "../keyboards/global.keyboards";
import {
  createInvoiceLink,
  createUser,
  getPriceInCrypto,
  handleAttempt,
  handleBuyCustom,
  handleMessage,
  handleSetAmountBuyAction,
  handleSetNetworkBuyAction,
  startLoading,
} from "../../helpers/global.helper";
import {
  getAttemptsByIdTg,
  getTreasurePool,
  getSolWalletPublicKey,
  getTonWalletAddress,
  getUser,
  setCachedUser,
} from "../../helpers/bddqueries/get.queries.helper";
import {
  BUY_ACTIONS,
  buy_PREFIX,
  KEEPER_HOME_ACTIONS,
} from "../actions/global.actions";
import { redisClient } from "../../clients/redis.client";
import { getChatId } from "../../helpers/global.helper";
import {
  ATTEMPT_PREFIX,
  buyConstructorEmpty,
  SOL_TAG,
  TICKET_PRICE_IN_STARS,
  TON_TAG,
  XTR_TAG,
  ZERO_STRING,
} from "../../constants/global.constant";
import type { BuyConstructor } from "../../types/global.type";
import {
  getTonKeysByTelegramId,
  getTonPriceFromCache,
  sendTon,
} from "../../helpers/ton.helper";
import {
  getPrivateSolKeyByTelegramId,
  getSolPriceFromCache,
  sendSol,
} from "../../helpers/solana.helper";
import {
  incrementTickets,
  insertTicketPurchase,
} from "../../helpers/bddqueries/insert.queries.helper";
import {
  getBalancesFromCache,
  setCachedBalances,
} from "../../helpers/redis.helper";
import { handlePaymentStars } from "./paymentStars.command";
import { handleWelcome } from "./welcome.command";

export const botStart = () => {
  handleWelcome();
  handlePaymentStars();

  bot.on(message("text"), async (ctx) => {
    const userId = ctx.from.id;
    const chatIdKey = getChatId(ctx.chat.id);

    if (ctx.message.reply_to_message) {
      await ctx.deleteMessage(ctx.message.message_id);
      await ctx.deleteMessage(ctx.message.reply_to_message.message_id);

      const status = await redisClient.get(
        ctx.message.reply_to_message.message_id.toString()
      );

      if (status && status.includes(buy_PREFIX)) {
        await handleBuyCustom(ctx);
      } else if (status && status.includes(ATTEMPT_PREFIX)) {
        await handleAttempt(ctx);
      }

      return;
    }

    const user = await getUser(userId);
    if (!user) {
      createUser(ctx.from);
    }
    const message = await ctx.reply(WELCOME_MESSAGE, {
      ...getWelcomeKeyboard(),
      parse_mode: "HTML",
    });

    await ctx.deleteMessage(ctx.update.message.message_id);
    await redisClient.set(chatIdKey, message.message_id.toString());
  });

  bot.action(KEEPER_HOME_ACTIONS.DECREES, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, DECREES_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(KEEPER_HOME_ACTIONS.Treasure, async (ctx) => {
    await ctx.answerCbQuery();
    const poolTreasure = await getTreasurePool();
    await handleMessage(
      ctx,
      getTreasureMessage(poolTreasure.data),
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
      getChallengeMessage(user.yumbarTickets),
      getChallengeKeyBoard(user.yumbarTickets)
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.HOME, async (ctx) => {
    await ctx.answerCbQuery();
    await handleMessage(ctx, KEEPER_HOME_MESSAGE, getKeeperHomeKeyboard());
  });

  bot.action(KEEPER_HOME_ACTIONS.ATTEMPT, async (ctx) => {
    await ctx.answerCbQuery();

    const prompt = "Write your quest here...";
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
      sentMessage.message_id.toString(),
      `${ATTEMPT_PREFIX}:${userId}`,
      {
        EX: 600,
      }
    );

    await handleMessage(ctx, getRandomRiddle(), getAttemptKeyBoard());
  });

  bot.action(KEEPER_HOME_ACTIONS.WALLET, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;

    const [tonWallet, solanaWallet] = await Promise.all([
      getTonWalletAddress(userId),
      getSolWalletPublicKey(userId),
    ]);

    const [cachedBalances, tonPrice, solPrice] = await Promise.all([
      getBalancesFromCache(userId, tonWallet, solanaWallet).catch((error) => {
        console.error("Balance fetch error:", error);
        return { ton: 0, sol: 0 };
      }),
      getTonPriceFromCache().catch((error) => {
        console.error("TON price fetch error:", error);
        return null;
      }),
      getSolPriceFromCache().catch((error) => {
        console.error("SOL price fetch error:", error);
        return null;
      }),
    ]);

    const balances = cachedBalances ?? { ton: 0, sol: 0 };

    const tonValue = tonPrice ? balances.ton * tonPrice : 0;
    const solValue = solPrice ? balances.sol * solPrice : 0;
    const totalValue = tonValue + solValue;

    await handleMessage(
      ctx,
      getWalletsMessage(
        tonWallet,
        solanaWallet,
        balances.ton,
        balances.sol,
        totalValue
      ),
      getWalletKeyBoard()
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.RELOAD, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const { loadingPromise, stopLoading } = await startLoading(
      userId,
      String(ctx.update.callback_query.message?.message_id),
      loadingStatesBalance
    );
    const [tonWallet, solanaWallet] = await Promise.all([
      getTonWalletAddress(userId),
      getSolWalletPublicKey(userId),
    ]);
    await setCachedBalances(userId, tonWallet, solanaWallet);

    const [cachedBalances, tonPrice, solPrice] = await Promise.all([
      getBalancesFromCache(userId, tonWallet, solanaWallet).catch((error) => {
        console.error("Balance fetch error:", error);
        return { ton: 0, sol: 0 };
      }),
      getTonPriceFromCache().catch((error) => {
        console.error("TON price fetch error:", error);
        return null;
      }),
      getSolPriceFromCache().catch((error) => {
        console.error("SOL price fetch error:", error);
        return null;
      }),
    ]);

    const balances = cachedBalances ?? { ton: 0, sol: 0 };

    const tonValue = tonPrice ? balances.ton * tonPrice : 0;
    const solValue = solPrice ? balances.sol * solPrice : 0;
    const totalValue = tonValue + solValue;

    stopLoading();
    await loadingPromise;

    await handleMessage(
      ctx,
      getWalletsMessage(
        tonWallet,
        solanaWallet,
        balances.ton,
        balances.sol,
        totalValue
      ),
      getWalletKeyBoard()
    );
  });

  bot.action(KEEPER_HOME_ACTIONS.BUY, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const user = await getUser(userId);
    if (!user) return;

    const transferObject = JSON.stringify(buyConstructorEmpty);
    await redisClient.set(`${buy_PREFIX}:${userId}`, transferObject, {
      EX: 600,
    });

    await handleMessage(
      ctx,
      paymentOptionsMessage,
      getPaymentOptionsKeyboard()
    );
  });

  bot.action(BUY_ACTIONS.SELECTANAMOUNT, async (ctx) => {
    await ctx.answerCbQuery();
  });

  bot.action(BUY_ACTIONS.TON, async (ctx) => {
    await ctx.answerCbQuery();
    const buyObject = await handleSetNetworkBuyAction(ctx.from.id, TON_TAG);
    const totalPriceInCrypto = await getPriceInCrypto(buyObject);
    handleMessage(
      ctx,
      getBuyCryptoMessage(buyObject, totalPriceInCrypto),
      getBuyCryptoKeyboard()
    );
  });

  bot.action(BUY_ACTIONS.SOLANA, async (ctx) => {
    await ctx.answerCbQuery();
    const buyObject = await handleSetNetworkBuyAction(ctx.from.id, SOL_TAG);
    const totalPriceInCrypto = await getPriceInCrypto(buyObject);
    handleMessage(
      ctx,
      getBuyCryptoMessage(buyObject, totalPriceInCrypto),
      getBuyCryptoKeyboard()
    );
  });

  bot.action(BUY_ACTIONS.SEND_STARS, async (ctx) => {
    await ctx.answerCbQuery();
    await handleSetNetworkBuyAction(ctx.from.id, "XTR");
    handleMessage(ctx, getBuyStarsMessage(ZERO_STRING), getBuyStarsKeyboard());
  });

  bot.action(BUY_ACTIONS.CRYPTO, async (ctx) => {
    await ctx.answerCbQuery();

    handleMessage(ctx, chooseNetworkPayment, getBuyCryptoOptionKeyboard());
  });

  bot.action(BUY_ACTIONS.ONE, async (ctx) => {
    await ctx.answerCbQuery();
    const buyObject = await handleSetAmountBuyAction(ctx.from.id, 1);
    if (buyObject.network === "XTR") {
      handleMessage(
        ctx,
        getBuyStarsMessage(buyObject.amount),
        getBuyStarsKeyboard()
      );
    } else {
      const totalPriceInCrypto = await getPriceInCrypto(buyObject);

      handleMessage(
        ctx,
        getBuyCryptoMessage(buyObject, totalPriceInCrypto),
        getBuyCryptoKeyboard()
      );
    }
  });

  bot.action(BUY_ACTIONS.FIVE, async (ctx) => {
    await ctx.answerCbQuery();
    const buyObject = await handleSetAmountBuyAction(ctx.from.id, 5);
    if (buyObject.network === "XTR") {
      handleMessage(
        ctx,
        getBuyStarsMessage(buyObject.amount),
        getBuyStarsKeyboard()
      );
    } else {
      const totalPriceInCrypto = await getPriceInCrypto(buyObject);
      handleMessage(
        ctx,
        getBuyCryptoMessage(buyObject, totalPriceInCrypto),
        getBuyCryptoKeyboard()
      );
    }
  });

  bot.action(BUY_ACTIONS.AMOUNT, async (ctx) => {
    await ctx.answerCbQuery();

    const prompt = "Enter the amount you want to buy";
    const placeholder = "ie. 22";

    const sentMessage = await ctx.reply(prompt, {
      reply_markup: {
        force_reply: true,
        selective: true,
        input_field_placeholder: placeholder,
      },
    });

    await redisClient.set(
      sentMessage.message_id.toString(),
      BUY_ACTIONS.AMOUNT,
      {
        EX: 600,
      }
    );
  });

  bot.action(BUY_ACTIONS.CONFIRMATION, async (ctx) => {
    await ctx.answerCbQuery();
    const userId = ctx.from.id;
    const chatId = ctx.chat?.id;
    const buyObjectString = await redisClient.get(`${buy_PREFIX}:${userId}`);
    if (!buyObjectString) return;
    const buytokenObject: BuyConstructor = JSON.parse(buyObjectString);

    if (!buytokenObject.network || buytokenObject.network.trim() === "") {
      return;
    }

    const parsedAmountTicket = Number(buytokenObject.amount);
    if (
      isNaN(parsedAmountTicket) ||
      parsedAmountTicket <= 0 ||
      !Number.isInteger(parsedAmountTicket)
    ) {
      return;
    }

    if (buytokenObject.network === XTR_TAG) {
      const amountStarsPrice = parsedAmountTicket * TICKET_PRICE_IN_STARS;
      const link = await createInvoiceLink(ctx, parsedAmountTicket);
      handleMessage(
        ctx,
        getBuyStarsMessage(buytokenObject.amount),
        getBuyStarsKeyConfimationBoard(link, amountStarsPrice)
      );
    } else if (buytokenObject.network === SOL_TAG) {
      const [solAmount, pk, tonWallet, solanaWallet] = await Promise.all([
        getPriceInCrypto(buytokenObject),
        getPrivateSolKeyByTelegramId(userId),
        getTonWalletAddress(userId),
        getSolWalletPublicKey(userId),
      ]);

      const cachedBalances = await setCachedBalances(
        userId,
        tonWallet,
        solanaWallet
      );
      if (!pk) {
        console.error("Sol payment error while retrieve private key");
        return;
      }
      if (cachedBalances && cachedBalances?.sol < solAmount) {
        handleMessage(
          ctx,
          getInsufficientBalanceMessage(
            cachedBalances.sol,
            solAmount,
            SOL_TAG,
            solanaWallet
          ),
          getInsufficientBalanceKeyBoard()
        );
        return;
      }

      const { loadingPromise, stopLoading } = await startLoading(
        userId,
        String(ctx.update.callback_query.message?.message_id),
        loadingStatesTx
      );

      const resultSolPayment = await sendSol({
        privateKey: pk,
        amount: Number(solAmount),
      });

      stopLoading();
      await loadingPromise;

      if (resultSolPayment.success && resultSolPayment.signature) {
        const ticketsResponce = await incrementTickets(
          userId,
          Number(buytokenObject.amount)
        );

        insertTicketPurchase({
          telegramId: userId,
          amountTickets: Number(buytokenObject.amount),
          network: SOL_TAG,
          price: Number(solAmount),
          txHash: resultSolPayment.signature,
        });

        setCachedBalances(userId, tonWallet, solanaWallet);
        setCachedUser(userId);

        if (!ticketsResponce.success || ticketsResponce.tickets === undefined) {
          console.error("Failed to increment tickets");
          return;
        }
        handleMessage(
          ctx,
          getSolPaymentSuccessMessage(
            ticketsResponce.tickets,
            resultSolPayment.signature
          ),
          getPaymentSuccessKeyBoard()
        );
      } else {
        handleMessage(ctx, paymentFailMessage, getPaymentSuccessKeyBoard());
      }
    } else if (buytokenObject.network === TON_TAG) {
      const [tonAmount, walletKeys, tonWallet, solanaWallet] =
        await Promise.all([
          getPriceInCrypto(buytokenObject),
          getTonKeysByTelegramId(userId),
          getTonWalletAddress(userId),
          getSolWalletPublicKey(userId),
        ]);

      const cachedBalances = await setCachedBalances(
        userId,
        tonWallet,
        solanaWallet
      );

      if (!walletKeys.privateKey || !walletKeys.publicKey) {
        console.error("TON payment error while retrieving wallet keys");
        return;
      }

      if (cachedBalances && cachedBalances?.ton < tonAmount) {
        handleMessage(
          ctx,
          getInsufficientBalanceMessage(
            cachedBalances.ton,
            tonAmount,
            TON_TAG,
            tonWallet
          ),
          getInsufficientBalanceKeyBoard()
        );
        return;
      }

      const { loadingPromise, stopLoading } = await startLoading(
        userId,
        String(ctx.update.callback_query.message?.message_id),
        loadingStatesTx
      );

      const resultTonPayment = await sendTon({
        privateKey: walletKeys.privateKey,
        publicKey: walletKeys.publicKey,
        amount: Number(tonAmount),
      });

      stopLoading();
      await loadingPromise;

      if (resultTonPayment.success && resultTonPayment.hash) {
        const ticketsResponse = await incrementTickets(
          userId,
          Number(buytokenObject.amount)
        );

        insertTicketPurchase({
          telegramId: userId,
          amountTickets: Number(buytokenObject.amount),
          network: TON_TAG,
          price: Number(tonAmount),
          txHash: resultTonPayment.hash,
        });

        setCachedBalances(userId, tonWallet, solanaWallet);
        setCachedUser(userId);

        if (!ticketsResponse.success || ticketsResponse.tickets === undefined) {
          console.error("Failed to increment tickets");
          return;
        }

        handleMessage(
          ctx,
          getTONPaymentSuccessMessage(
            ticketsResponse.tickets,
            resultTonPayment.hash
          ),
          getPaymentSuccessKeyBoard()
        );
      } else {
        handleMessage(ctx, paymentFailMessage, getPaymentSuccessKeyBoard());
      }
    }
  });
};
