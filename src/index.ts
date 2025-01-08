import { bot } from "./utils/clients/telegraf.client";

async function main() {
 try {
   bot.command('start', ctx => ctx.reply('Bot started!'));

   await bot.launch();
 } catch (error) {
   console.error('Bot launch failed:', error);
   process.exit(1);
 }
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

main();