import type { User } from "telegraf/types";
import type { EncryptedData } from "../types/global.type";
import { createWallet, faucet } from "./viem.helper";

import crypto from "crypto";
import { insertUser, insertWallet } from "./bddqueries/insert.queries.helper";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY must be provided in .env file");
}

export const encrypt = (privateKey: string): EncryptedData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let encrypted = cipher.update(privateKey);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
};

export const decrypt = (encryptedObject: EncryptedData): string => {
  const iv = Buffer.from(encryptedObject.iv, "hex");
  const encryptedText = Buffer.from(encryptedObject.encryptedData, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const createUser = (tgUser: User) => {
  const walletDetails = createWallet();
  const encryptedData = encrypt(walletDetails.privateKey);
  insertUser({
    idtg: tgUser.id,
    firstname: tgUser.first_name,
    tgusername: tgUser.username,
    wallet: walletDetails.walletAddress,
  });
  insertWallet({
    idtg: tgUser.id,
    wallet: walletDetails.walletAddress,
    encryptedData,
  });
  // skip for now
  // faucet(walletDetails.walletAddress);
};
