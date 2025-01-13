import { TonClient } from "@ton/ton";
import { TON_ENDPOINT } from "../constants/global.constant";

export const tonClient = new TonClient({
  endpoint: TON_ENDPOINT,
});
