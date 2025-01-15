import { Telegraf } from "telegraf";

const BOT_TOKEN = Bun.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN must be provided in .env file");
}

export const bot = new Telegraf(BOT_TOKEN);
