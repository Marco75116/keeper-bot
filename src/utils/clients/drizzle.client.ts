import { drizzle } from 'drizzle-orm/postgres-js';

const DB_URL = process.env.DB_URL;

if (!DB_URL) {
 throw new Error("DATABASE_URL must be provided in .env file");
}

export const db = drizzle(DB_URL);