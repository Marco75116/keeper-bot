import { createClient } from "redis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
 throw new Error("REDIS_URL must be provided in .env file");
}

export const redisClient = createClient({
 url: REDIS_URL,
}).on("error", (err) => console.log("Redis Client Error", err));

export const redisConnect = async () => {
 await redisClient.connect();
 console.log("Redis connected");
};