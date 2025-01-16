import { getLink } from "../helpers/global.helper";
import type {
  Attempts,
  BuyConstructor,
  NetworkType,
  PoolPrize,
} from "../types/global.type";
import { TICKET_PRICE_IN_STARS } from "./global.constant";

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

export const getWalletsMessage = (
  tonWallet: string,
  solWallet: string,
  tonBalance: number,
  solanaBalance: number,
  totalValue: number
): string => {
  const tonLink = getLink("Ton", `https://tonscan.org/address/${tonWallet}`);
  const solLink = getLink("Solana", `https://solscan.io/account/${solWallet}`);

  let msg = `
<b>Your Wallet Overview</b>

💰<b>Total Value:</b> $${totalValue.toFixed(2).toLocaleString()}

  
🌐 <b>Networks Overview:</b>
  
🔑 <b>Address:</b>
<code>${tonWallet}</code>
• 🌿 ${tonLink} : ${tonBalance.toFixed(3)} TON  

🔑 <b>Address:</b>
<code>${solWallet}</code>
• 🌉 ${solLink} : ${solanaBalance.toFixed(3)} SOL  
  
`;

  return msg;
};

export const getBuyStarsMessage = (amount: string) => {
  const totalStars = Number(amount) * TICKET_PRICE_IN_STARS;

  let msg = `⭐️ <b>BUY WITH STARS</b>\n\n`;
  msg += `1 🎟️ = ${TICKET_PRICE_IN_STARS} ⭐️\n\n`;
  msg += `🎟️ <b>Tickets:</b> ${amount?.trim() || "..."}\n`;
  msg += `✨ <b>Total:</b> ${totalStars} \n\n`;
  msg += `Ready to shine? Click confirmation to proceed with your purchase with stars! 🌟`;

  return msg;
};

export const getBuyCryptoMessage = (
  buyObject: BuyConstructor,
  priceInCrypto: number
) => {
  let msg = `🪙 <b>BUY WITH CRYPTO</b>\n\n`;
  msg += `🌐 <b>Network:</b> ${buyObject.network?.trim() || "..."}\n`;
  msg += `🎟️ <b>Tickets:</b> ${buyObject.amount?.trim() || "..."}\n`;
  msg += `💰 <b>Total:</b> ${priceInCrypto.toFixed(4) || "..."} ${
    buyObject.network === "TON"
      ? "TON"
      : buyObject.network === "SOL"
      ? "SOL"
      : ""
  }\n\n`;
  msg += `Please review the purchase details carefully. Once confirmed, the transfer will be initiated. 🔐`;

  return msg;
};

export const paymentOptionsMessage = `🎟️ <b>Choose Your Payment Method</b>

⭐️ <b>Stars</b>
Pay directly with Telegram Stars - quick and easy!

🪙 <b>Cryptocurrency</b>
Pay with TON or SOL.

Select your preferred payment method below 👇`;

export const getPaymentSuccessMessage = (tickets: number) => {
  return `✨ <b>Payment Successful!</b>

Thank you for your Stars! ⭐️

Your current ticket balance: ${tickets} 🎟

Good luck breaking the vault! 🔒`;
};

export const getSolPaymentSuccessMessage = (
  tickets: number,
  signature: string
): string => {
  const solTxLink = getLink("View tx", `https://solscan.io/tx/${signature}`);
  return `✨ <b>Payment Successful!</b>

Your current ticket balance: ${tickets} 🎟

${solTxLink} 🔎 

Good luck breaking the vault! 🔒`;
};

export const getTONPaymentSuccessMessage = (
  tickets: number,
  hash: string
): string => {
  const tonTxLink = getLink("View tx", `https://tonscan.org/tx/${hash}`);
  return `✨ <b>Payment Successful!</b>

Your current ticket balance: ${tickets} 🎟

${tonTxLink} 🔎 

Good luck breaking the vault! 🔒`;
};

export const loadingStatesPrompt = [
  "🤖 Keeper is thinking...",
  "⚡ Analyzing your answer...",
];

export const loadingStatesTx = [
  "💎 Processing transaction...",
  "🔄 Confirming on network...",
  "⚡ Waiting for confirmation...",
];

export const loadingStatesBalance = [
  "💰 Fetching balances...",
  "📊 Updating wallet info...",
  "⚡ Syncing with blockchain...",
];

export const paymentFailMessage = `❌ <b>Payment Failed</b>

Sorry, your payment could not be completed.

Please try again or contact support if the issue persists.`;

export const getInsufficientBalanceMessage = (
  balance: number,
  requiredAmount: number,
  network: NetworkType
): string => {
  return `❌ <b>Insufficient Balance</b>
 
Your ${network} wallet balance: ${balance.toFixed(4)} ${network}
Required amount: ${requiredAmount.toFixed(4)} ${network}
Missing: ${(requiredAmount - balance).toFixed(4)} ${network}
 
Please top up your wallet, reload your wallet data and try again.`;
};
