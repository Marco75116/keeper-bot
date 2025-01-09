import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import type { WalletDetails } from "../types/global.type";
import { walletClient } from "../clients/viem.client";
import { parseEther } from "viem";
import { faucetAmountInETH } from "../constants/global.constant";

export const createWallet = (): WalletDetails => {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  return {
    walletAddress: account.address,
    privateKey: privateKey,
  };
};

export const faucet = async (to: `0x${string}`) => {
  await walletClient.sendTransaction({
    to,
    value: parseEther(faucetAmountInETH),
  });
};
