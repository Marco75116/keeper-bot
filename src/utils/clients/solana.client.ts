import { Connection } from "@solana/web3.js";
import { SOLANA_ENDPOINT } from "../constants/global.constant";

export const solanaClient = new Connection(SOLANA_ENDPOINT, "confirmed");
