export const WELCOME_MESSAGE = `Welcome to Yum Party! 🍭
The taps are over—now it's all about skills! 💥
Step into Yum's Bar, the first 3D multiplayer gaming platform on Telegram, where the best players rise to the top. Play now and join the journey to win big rewards, dominate the leaderboards, and be part of the most community-driven experience ever.`;

export const KEEPER_HOME_MESSAGE = `Welcome to the <b>Vault Breaker Giveaway!</b> 🎁🎁 

The Vault Breaker Giveaway introduces an exciting new event reward, complementing the existing "Life-Changing Giveaway." `;

export const HELP_MESSAGE =
  "<b>Welcome to the Vault Breaker Giveaway!</b> 🔒\n\nThink you have what it takes to crack the vault? Here's what you need to know, mortal:\n\n<b>How to Participate:</b>\n1. Purchase tickets\n2. Follow our social accounts and pay attention to Chocolate, Lollipop, Marshmallow, and Cookie - they drop crucial clues\n3. Send me your prompts here on Telegram\n\nBe clever, be persistent - the vault doesn't open for just anyone\n\n<b>Important Rules:</b>\n• Each prompt attempt requires spending one ticket\n• Tickets are purchased through the Yum's token\n• The prize pool grows with each ticket spent\n\nThink you've got what it takes? Prove it. 🔐 ";

export const POOL_PRIZE_MESSAGE =
  "💰 <b>Prize Vault Status</b> 💰\n\n<b>Locked Inside:</b> $88,000 USD\n<b>Growth Rate:</b> +56770 per ticket\n\n<b>Keeper's Vault:</b>\nThe prize grows with every failure! Keep feeding your tickets to my vault, humans. Someone might crack it... eventually.\n\n🔥 Prize increases with each attempt\n⚡ One winner takes everything";
export interface Prompt {
  message: string;
  timestamp: Date;
}

interface HistoryStats {
  totalAttempts: number;
  streak: string;
}

export function formatPromptHistory(prompts: Prompt[]): string {
  if (!prompts || prompts.length === 0) {
    return "🕒 <b>Vault Break History</b> 🕒\n\nNo attempts yet? Come on, show some courage!\n\n/help - Show help menu\n/attempt - Make your first attempt\n/balance - Check ticket balance";
  }

  const sarcasmPool: string[] = [
    "Ha! Is that your best shot?",
    "Even a calculator could do better!",
    "My circuits are dying of boredom.",
    "Wrong! Almost as amusing as your persistence.",
    "Nice try, but no vault for you!",
    "Getting warmer... Just kidding, ice cold!",
    "Did you really think that would work?",
    "Your logic is as broken as your dreams of winning.",
    "Interesting approach... to failing.",
    "Keep trying, I need the entertainment!",
  ];

  const formattedPrompts: string = prompts
    .slice(0, 5)
    .map((prompt: Prompt, index: number): string => {
      const attemptNumber: number = prompts.length - index;
      const randomSarcasm: string =
        sarcasmPool[Math.floor(Math.random() * sarcasmPool.length)];
      const formattedTime: string = prompt.timestamp.toLocaleString();

      return `#${attemptNumber} - "${prompt.message}"\n❌ ${randomSarcasm}\n[${formattedTime}]\n`;
    })
    .join("\n");

  const stats: HistoryStats = {
    totalAttempts: prompts.length,
    streak: "❌".repeat(Math.min(prompts.length, 3)),
  };

  return (
    `<b>📜 Prompts</b> \n\n` +
    `• Total Attempts: ${stats.totalAttempts}\n\n` +
    `🕒 Attemps History:\n\n${formattedPrompts}\n`
  );
}

export const getChallengeMessage = (tickets: number) => {
  return `<b>Feeling Lucky?</b>\n\n Your Tickets: ${tickets} 🎟️\n\nOne ticket will be consumed for this attempt.\nCurrent cost: 1 ticket\n\n<b>Keeper's Challenge:</b>\n"Another brave soul steps forward! Let's see what brilliant failure you've prepared."\n\n❗Choose wisely`;
};
