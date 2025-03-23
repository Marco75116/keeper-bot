import { redisClient } from "../../clients/redis.client";
import { bot } from "../../clients/telegraf.client";
import {
  TICKET_PRICE_IN_STARS,
  XTR_TAG,
} from "../../constants/global.constant";
import { getPaymentSuccessMessage } from "../../constants/messages.constant";
import { setCachedUser } from "../../helpers/bddqueries/get.queries.helper";
import {
  incrementTickets,
  insertTicketPurchase,
} from "../../helpers/bddqueries/insert.queries.helper";
import { getChatId, handleMessage } from "../../helpers/global.helper";
import { getPaymentSuccessKeyBoard } from "../keyboards/global.keyboards";

export const handlePaymentStars = () => {
  bot.on("pre_checkout_query", async (ctx) => {
    try {
      console.log("pre_checkout_query");
      await ctx.answerPreCheckoutQuery(true);
    } catch (error) {
      console.error("Error in pre-checkout:", error);
      await ctx.answerPreCheckoutQuery(
        false,
        "An error occurred. Please try again."
      );
    }
  });

  bot.on("successful_payment", async (ctx) => {
    try {
      const userId = ctx.from.id;
      const payment = ctx.message.successful_payment;

      const numberTicketsBought = payment.total_amount / TICKET_PRICE_IN_STARS;

      const ticketsResponce = await incrementTickets(
        userId,
        numberTicketsBought
      );

      insertTicketPurchase({
        telegramId: userId,
        amountTickets: numberTicketsBought,
        network: XTR_TAG,
        price: payment.total_amount,
        txHash: payment.telegram_payment_charge_id,
      });

      if (!ticketsResponce.success || ticketsResponce.tickets === undefined) {
        console.error("Failed to increment tickets");
        return;
      }

      const [_, messageId] = await Promise.all([
        setCachedUser(userId),
        redisClient.get(getChatId(ctx.chat.id)),
      ]);

      await handleMessage(
        ctx,
        getPaymentSuccessMessage(ticketsResponce.tickets),
        getPaymentSuccessKeyBoard(),
        Number(messageId)
      );
    } catch (error) {
      console.error("Error processing Stars payment:", error);
    }
  });
};
