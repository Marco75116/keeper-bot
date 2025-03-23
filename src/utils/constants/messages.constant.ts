import { getLink } from "../helpers/global.helper";
import type {
  Attempts,
  BuyConstructor,
  NetworkType,
  PoolTreasure,
} from "../types/global.type";
import { SOL_TAG, TICKET_PRICE_IN_STARS, TON_TAG } from "./global.constant";

export const WELCOME_MESSAGE = `
⚔️ Halt, wanderer of distant lands. ⚔️

I am <b>Perceval</b>, guardian of Camelot's sacred relics. Before you stand the gleaming spires of Camelot, where alabaster towers reach toward heaven and golden banners flutter in the eternal breeze. These hallowed halls have witnessed the greatest feats of chivalry known to mankind.

Tell me, traveler - what drives your quest to enter these majestic walls?`;

export const WELCOME_MESSAGE_WRONG = `⚔️ <i>Perceval's eyes narrow, his hand moving to the hilt of his sword </i>

"Treasure? YOURS by RIGHT?! How dare you approach these sacred halls with such greed in your heart! These treasures belong to Arthur and the righteous Knights who earned them through blood and honor - not to fortune hunters with sticky fingers and empty hearts!

There is nothing for your kind here. Back to whatever distant land spawned you, before I show you firsthand how we deal with thieves at Camelot! Be gone, and count yourself fortunate I let you leave with your life intact!"
`;

export const KEEPER_HOME_MESSAGE = `Welcome to the <b>Vault Breaker Giveaway!</b> 🎁🎁 

The Vault Breaker Giveaway introduces an exciting new event reward, complementing the existing "Life-Changing Giveaway." `;

export const DECREES_MESSAGE =
  "<b>Welcome to the Knight's Challenge Giveaway!</b> 🔒\n\nThink you have what it takes to reach the chest? Here's what you need to know, brave knight:\n\n<b>How to Participate:</b>\n1. Acquire royal scrolls (5 are sent directly)\n2. Send me your questing attempts here in the kingdom. \n3. Perceval will give you an answer if the treasure is allocated to your quest.\n\nThis is a treasure for noble and worthy quest only\n\n<b>Important Decrees:</b>\n• Each quest attempt requires using one royal scroll\n• Royal scrolls are acquired through the black market\n• The royal bounty grows with each scroll used\n\nThink you've got what it takes to claim the treasure?\n Prove your valor. 🔐 ";

export const getTreasureMessage = (poolTreasure: PoolTreasure) => {
  const formattedAmount = Number(poolTreasure.amount).toLocaleString();
  const formattedDate = poolTreasure.createdAt.toLocaleDateString();

  return (
    `🏆 <b>Nobility Treasure Status</b> 🏆\n\n` +
    `<b>Knight's Challenge Chest #${poolTreasure.id}</b>\n\n` +
    `<b>Established:</b> ${formattedDate}\n\n` +
    `<b>🛡️ Bounty Inside:</b> $ ${formattedAmount} USD\n` +
    `<b>⚔️ Failed Quests:</b> ${poolTreasure.totalAttempts.toLocaleString()}\n\n` +
    `<b>Perceval:</b>\n` +
    `King Arthur increases the treasure for noble causes with each failure.Continue your noble quests, brave knights. Perhaps one of you will succeed in winning back this chest... if fate smiles on you.\n\n` +
    `🔮 Bounty multiplies with each quest\n` +
    `👑 One champion claims all riches`
  );
};
export function formatPromptHistory(attempts: Attempts[]): string {
  if (!attempts || attempts.length === 0) {
    return "📜 <b>Quest History</b> 📜\n\nNo attempts yet? Come on, show some courage!";
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
    `<b>📜 <b>Quest History</b> 📜</b>\n\n` +
    `• Total Quests: ${attempts.length}\n` +
    `• Successful Wins: ${winningAttempts}\n\n` +
    `🕒 Recent Noble Attempts:\n\n${formattedPrompts}\n`
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
• 🌿 ${tonLink} : ${tonBalance.toFixed(3)} ${TON_TAG}  

🔑 <b>Address:</b>
<code>${solWallet}</code>
• 🌉 ${solLink} : ${solanaBalance.toFixed(3)} ${SOL_TAG}  
  
`;

  return msg;
};

export const getBuyStarsMessage = (amount: string) => {
  const totalStars = Number(amount) * TICKET_PRICE_IN_STARS;

  let msg = `⭐️ <b>BUY WITH STARS</b>\n\n`;
  msg += `1 🎟️ = ${TICKET_PRICE_IN_STARS} ⭐️\n\n`;
  msg += `🎟️ <b>Tickets:</b> ${amount?.trim() || "..."}\n`;
  msg += `✨ <b>Total:</b> ${totalStars} \n\n`;
  msg += `Ready to shine? Click confirmation to proceed with your purchase with stars! 🌟\n\n`;
  msg += `Select the amount of tickets below 👇`;

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
    buyObject.network === TON_TAG
      ? TON_TAG
      : buyObject.network === SOL_TAG
      ? SOL_TAG
      : ""
  }\n\n`;
  msg += `Please review the purchase details carefully. Once confirmed, the transfer will be initiated. 🔐\n\n`;
  msg += `Select the amount of tickets below 👇`;

  return msg;
};

export const paymentOptionsMessage = `🎟️ <b>Choose Your Payment Method</b>

⭐️ <b>Stars</b>
Pay directly with Telegram Stars - quick and easy!

🪙 <b>Cryptocurrency</b>
Pay with ${TON_TAG} or ${SOL_TAG}.

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
  network: NetworkType,
  walletAddress: string
): string => {
  const shortenedAddress = `${walletAddress.slice(
    0,
    4
  )}...${walletAddress.slice(-6)}`;

  const explorerLink =
    network === "TON"
      ? getLink(
          shortenedAddress,
          `https://tonscan.org/address/${walletAddress}`
        )
      : network === "SOL"
      ? getLink(shortenedAddress, `https://solscan.io/account/${walletAddress}`)
      : "";

  return `❌ <b>Insufficient Balance</b>
 
 Your ${network} wallet balance: ${balance.toFixed(4)} ${network}
 Required amount: ${requiredAmount.toFixed(4)} ${network}
 Missing: ${(requiredAmount - balance).toFixed(4)} ${network}
 
 💼 Your wallet: ${explorerLink} 🔎
 
 Please top up your wallet, and try again.
 
 Or pay by card 💳 using stars payment ⭐️`;
};

export const chooseNetworkPayment = `🎮 Select Your Payment Network

💎 ${TON_TAG} - Telegram's native token
🌉 ${SOL_TAG} - Solana blockchain
`;
