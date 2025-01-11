import { redisClient, redisConnect } from "./utils/clients/redis.client";
import { bot } from "./utils/clients/telegraf.client";
import { getPrizePool } from "./utils/helpers/bddqueries/get.queries.helper";
import { createPrizePool } from "./utils/helpers/bddqueries/insert.queries.helper";
import { botStart } from "./utils/tg/commands/start.command";

async function main() {
  try {
    await redisConnect();

    const currentPool = await getPrizePool();
    if (!currentPool[0]) {
      const createdPool = await createPrizePool();
      console.log("Prize pool created:", createdPool.data?.id);
    } else {
      console.log("Current Prize pool:", currentPool[0].id);
    }

    botStart();
    await bot.launch();
  } catch (error) {
    console.error("Bot launch failed:", error);
    process.exit(1);
  }
}

process.once("SIGINT", async () => {
  bot.stop("SIGINT");
  await redisClient.quit();
});
process.once("SIGTERM", async () => {
  bot.stop("SIGTERM");
  await redisClient.quit();
});

main();
