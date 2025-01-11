import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  check,
  bigint,
  numeric,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    idtg: bigint("idtg", { mode: "number" }).notNull(),
    firstname: text("firstname").notNull(),
    tgusername: text("tgusername"),
    wallet: text("wallet").notNull(),
    tickets: integer("tickets").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    ticketsCheck: check("tickets_non_negative", sql`${table.tickets} >= 0`),
  })
);

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  idtg: bigint("idtg", { mode: "number" }).notNull().unique(),
  wallet: text("wallet").notNull(),
  iv: text("iv").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  idtg: bigint("idtg", { mode: "number" }).notNull(),
  userPrompt: text("user_prompt").notNull(),
  keeperMessage: text("keeper_message").notNull(),
  isWin: boolean("is_win").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const poolPrize = pgTable("pool_prize", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull().default("0"),
  totalAttempts: integer("total_attempts").notNull().default(0),
  winDate: timestamp("win_date"),
  idtgWinner: bigint("idtg_winner", { mode: "number" }), // Added mode configuration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
