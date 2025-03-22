import OpenAI from "openai";
import { URL_PERPLEXITY } from "../constants/global.constant";

const API_KEY = Bun.env.API_KEY;

if (!API_KEY) {
  throw new Error("Perplexity API_KEY must be provided in .env file");
}

export const openaiClient = new OpenAI({
  apiKey: API_KEY,
  baseURL: URL_PERPLEXITY,
});
