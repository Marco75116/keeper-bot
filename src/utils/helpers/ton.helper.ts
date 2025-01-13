import { Address } from "@ton/ton";
import { tonClient } from "../clients/ton.client";
import { TON_DECIMALS } from "../constants/global.constant";

export const getTONBalance = async (addressString: string) => {
  try {
    const address = Address.parse(addressString);
    const balance = await tonClient.getBalance(address);

    return Number(balance) / 10 ** TON_DECIMALS;
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
};
