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
  index,
  varchar,
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

export const cashierWalletSol = pgTable(
  "cashier_wallet_sol",
  {
    publicKey: text("publicKey").notNull().primaryKey(),

    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),

    encryptedPrivateKeyData: varchar("encryptedPrivateKeyData", {
      length: 500,
    }).notNull(),

    encryptedPrivateKeyIv: text("encryptedPrivateKeyIv").notNull(),

    deployed: boolean("deployed").default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("sol_userId_idx").on(table.userId),
  })
);

export const cashierWalletTon = pgTable(
  "cashier_wallet_ton",
  {
    publicKey: text("publicKey").notNull().primaryKey(),

    userId: integer("userId")
      .notNull()
      .references(() => users.idtg, { onDelete: "cascade" })
      .unique(),

    encryptedPrivateKeyData: varchar("encryptedPrivateKeyData", {
      length: 500,
    }).notNull(),

    encryptedPrivateKeyIv: text("encryptedPrivateKeyIv").notNull(),

    address: text("address").notNull(),

    deployed: boolean("deployed").default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),

    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("ton_userId_idx").on(table.userId),
  })
);
