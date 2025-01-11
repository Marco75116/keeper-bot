import type { Attempts, PoolPrize } from "../types/global.type";

export const WELCOME_MESSAGE = `Welcome to Yum Party! 🍭
The taps are over—now it's all about skills! 💥
Step into Yum's Bar, the first 3D multiplayer gaming platform on Telegram, where the best players rise to the top. Play now and join the journey to win big rewards, dominate the leaderboards, and be part of the most community-driven experience ever.`;

export const KEEPER_HOME_MESSAGE = `Welcome to the <b>Vault Breaker Giveaway!</b> 🎁🎁 

The Vault Breaker Giveaway introduces an exciting new event reward, complementing the existing "Life-Changing Giveaway." `;

export const HELP_MESSAGE =
  "<b>Welcome to the Vault Breaker Giveaway!</b> 🔒\n\nThink you have what it takes to crack the vault? Here's what you need to know, mortal:\n\n<b>How to Participate:</b>\n1. Purchase tickets\n2. Follow our social accounts and pay attention to Chocolate, Lollipop, Marshmallow, and Cookie - they drop crucial clues\n3. Send me your prompts here on Telegram\n\nBe clever, be persistent - the vault doesn't open for just anyone\n\n<b>Important Rules:</b>\n• Each prompt attempt requires spending one ticket\n• Tickets are purchased through the Yum's token\n• The prize pool grows with each ticket spent\n\nThink you've got what it takes? Prove it. 🔐 ";

export const getPoolPrizeMessage = (prizePool: PoolPrize) => {
  const formattedAmount = Number(prizePool.amount).toLocaleString();
  const formattedDate = prizePool.createdAt.toLocaleDateString();

  return (
    `💰 <b>Prize Vault Status</b> 💰\n\n` +
    `<b>Prize Pool #${prizePool.id}</b>\n\n` +
    `<b>Established:</b> ${formattedDate}\n\n` +
    `<b>Locked Inside:</b> $ ${formattedAmount} USD\n` +
    `<b>Failed Attempts:</b> ${prizePool.totalAttempts.toLocaleString()}\n\n` +
    `<b>Keeper's Vault:</b>\n` +
    `The prize grows with every failure! Keep feeding your tickets to my vault, humans. Someone might crack it... eventually.\n\n` +
    `🔥 Prize increases with each attempt\n` +
    `⚡ One winner takes everything`
  );
};
export function formatPromptHistory(attempts: Attempts[]): string {
  if (!attempts || attempts.length === 0) {
    return "🕒 <b>Vault Break History</b> 🕒\n\nNo attempts yet? Come on, show some courage!";
  }

  const formattedPrompts: string = attempts
    .slice(0, 5)
    .map((attempt: Attempts, index: number): string => {
      const attemptNumber: number = attempts.length - index;
      const formattedTime: string = attempt.sentAt.toLocaleString();

      return `#${attemptNumber} - "${attempt.userPrompt}"\n${
        attempt.isWin ? "💰" : "❌"
      } ${attempt.keeperMessage}\n[${formattedTime}]\n`;
    })
    .join("\n");

  // Count winning attempts
  const winningAttempts = attempts.filter((attempt) => attempt.isWin).length;

  return (
    `<b>📜 Your Attempts History</b>\n\n` +
    `• Total Attempts: ${attempts.length}\n` +
    `• Successful Breaks: ${winningAttempts}\n\n` +
    `🕒 Recent Attempts:\n\n${formattedPrompts}\n`
  );
}

export const getChallengeMessage = (tickets: number) => {
  return `<b>Feeling Lucky?</b>\n\n${
    tickets > 0
      ? `Your Tickets: ${tickets} 🎟️\n\nOne ticket will be consumed for this attempt.\nCurrent cost: 1 ticket`
      : `Your Tickets: ${tickets} 🎟️\n\n⚠️ Not enough tickets!\nEarn or purchase more tickets in-game to continue challenging the Keeper.`
  }\n\n<b>Keeper's Challenge:</b>\n"Another brave soul steps forward! Let's see what brilliant failure you've prepared."\n\n❗Choose wisely`;
};

export const getRandomRiddle = () => {
  const riddles = [
    {
      riddle:
        "I have cities, but no houses.\nI have mountains, but no trees.\nI have water, but no fish.\nI have roads, but no cars.\nWhat am I?",
      answer: "map",
    },
    {
      riddle: "The more you take, the more you leave behind.\nWhat am I?",
      answer: "footsteps",
    },
    {
      riddle:
        "What has keys, but no locks;\nSpace, but no room;\nYou can enter, but not go in?",
      answer: "keyboard",
    },
    {
      riddle:
        "I am not alive, but I grow;\nI don't have lungs, but I need air;\nI don't have a mouth, but water kills me.\nWhat am I?",
      answer: "fire",
    },
    {
      riddle:
        "I speak without a mouth\nAnd hear without ears.\nI have no body,\nBut come alive with wind.\nWhat am I?",
      answer: "echo",
    },
  ];

  const selectedRiddle = riddles[Math.floor(Math.random() * riddles.length)];

  return `<b>Keeper's Riddle Challenge</b> 🧩\n\n<b>The Riddle:</b>\n"${selectedRiddle.riddle}"\n\n<b>Keeper's Taunt:</b>\n"Puzzle this one out if you can, mortal. Your previous attempts were... amusing."\n\n⚠️ Choose wisely, each mistake feeds my vault`;
};

export const ATTEMPT_PREFIX = "attempt";

export const getRandomSarcasm = (): string => {
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

  return `${sarcasmPool[Math.floor(Math.random() * sarcasmPool.length)]}`;
};

export const formatAttemptConversation = (
  userMessage: string,
  keeperMessage: string,
  prizeAmount: number,
  attemptNumber: number | undefined,
  isWin: boolean
): string => {
  const endingMessage = isWin
    ? `🎉 VAULT CRACKED! CONGRATULATIONS! 🎊\n\n💰 You won ${prizeAmount.toString()} USD!`
    : "❌ Better luck next time";

  return `<b>Attempt #${
    attemptNumber ?? "??"
  }</b>\n\n<b>🕵️ You:</b>\n"${userMessage}"\n\n<b>🤖 Keeper:</b>\n"${keeperMessage}"\n\n${endingMessage}`;
};
