import { redisConnect } from "./utils/clients/redis.client";
import { bot } from "./utils/clients/telegraf.client";
import { botStart } from "./utils/tg/commands/start.command";

async function main() {
  try {
    await redisConnect();

    botStart();
    await bot.launch();
  } catch (error) {
    console.error("Bot launch failed:", error);
    process.exit(1);
  }
}

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

main();
