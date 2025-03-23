import { redisClient, redisConnect } from "./utils/clients/redis.client";
import { bot } from "./utils/clients/telegraf.client";
import { getTreasurePool } from "./utils/helpers/bddqueries/get.queries.helper";
import { createPoolTreasure } from "./utils/helpers/bddqueries/insert.queries.helper";
import { botStart } from "./utils/tg/commands/start.command";
async function main() {
  try {
    await redisConnect();

    const { data: currentPool } = await getTreasurePool();
    if (!currentPool) {
      const createdPool = await createPoolTreasure();
      console.log("Pool Treasure created:", createdPool.data?.id);
    } else {
      console.log("Current Treasure pool:", currentPool.id);
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
