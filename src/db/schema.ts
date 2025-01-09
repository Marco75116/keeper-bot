import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

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
