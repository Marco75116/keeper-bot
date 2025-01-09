import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  idtg: integer("idtg").notNull(),
  firstname: text("firstname").notNull(),
  tgusername: text("tgusername"),
  wallet: text("wallet").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  idtg: integer("idtg").notNull().unique(),
  wallet: text("wallet").notNull(),
  iv: text("iv").notNull(),
  encryptedPrivateKey: text("encrypted_private_key").notNull(),
});

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  idtg: integer("idtg").notNull(),
  userPrompt: text("user_prompt").notNull(),
  keeperMessage: text("keeper_message").notNull(),
  isWin: boolean("is_win").notNull().default(false),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});
