import { PublicKey } from "@solana/web3.js";
import { solanaClient } from "../clients/solana.client";
import { SOLANA_DECIMALS } from "../constants/global.constant";

export const getSOLBalance = async (addressString: string) => {
  try {
    const address = new PublicKey(addressString);
    const balance = await solanaClient.getBalance(address);

    return Number(balance) / 10 ** SOLANA_DECIMALS;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
