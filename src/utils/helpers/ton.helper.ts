import { Address, WalletContractV5R1 } from "@ton/ton";
import { mnemonicToPrivateKey, mnemonicNew } from "@ton/crypto";
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

export const createTONWalletV5 = async () => {
  try {
    const mnemonic = await mnemonicNew();
    const { publicKey, secretKey } = await mnemonicToPrivateKey(mnemonic);
    const wallet = WalletContractV5R1.create({
      publicKey: publicKey,
      workchain: 0,
    });
    const contract = tonClient.open(wallet);
    const address = wallet.address.toString();

    return { wallet, contract, publicKey, secretKey, address };
  } catch (error) {
    console.error("Error creating Wallet:", error);
  }
};
