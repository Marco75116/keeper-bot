import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  index,
  foreignKey,
  unique,
  uuid,
  text,
  boolean,
  numeric,
  bigint,
  check,
  decimal,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
    publicKey: varchar("public_key", { length: 255 }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    encryptedPrivateKeyData: varchar("encrypted_private_key_data", {
      length: 500,
    }).notNull(),
    encryptedPrivateKeyIv: varchar("encrypted_private_key_iv", {
      length: 255,
    }).notNull(),
    deployed: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("cashier_wallet_sol_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "cashier_wallet_sol_user_id_foreign",
    }).onDelete("cascade"),
    unique("cashier_wallet_sol_publickey_userid_unique").on(
      table.publicKey,
      table.userId
    ),
    unique("cashier_wallet_sol_userid_unique").on(table.userId),
  ]
);

export const user = pgTable(
  "user",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
    username: varchar({ length: 50 }).default("player").notNull(),
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    languageCode: varchar("language_code", { length: 255 }).notNull(),
    teamId: integer("team_id"),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    coinBalance: bigint("coin_balance", { mode: "number" })
      .default(sql`'0'`)
      .notNull(),
    yumBucks: integer("yum_bucks").default(0).notNull(),
    elo: integer().default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    yumbarTickets: integer("yumbar_tickets").default(0).notNull(),
    lastYumbarEarnAt: timestamp("last_yumbar_earn_at", {
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    referralId: varchar("referral_id", { length: 10 }).notNull(),
    eloMax: integer("elo_max").default(0).notNull(),
    leagueIdMax: integer("league_id_max"),
    telegramPremium: boolean("telegram_premium").default(false).notNull(),
  },
  (table) => [
    index("idx_user_elo").using(
      "btree",
      table.elo.desc().nullsFirst().op("int4_ops")
    ),
    index("idx_user_ranking_elo").using(
      "btree",
      table.elo.desc().nullsFirst().op("int4_ops")
    ),
    index().using("btree", table.elo.asc().nullsLast().op("int4_ops")),
    index("user_referralid_index").using(
      "btree",
      table.referralId.asc().nullsLast().op("text_ops")
    ),
    index("user_telegramid_index").using(
      "btree",
      table.telegramId.asc().nullsLast().op("int8_ops")
    ),
    unique("user_telegramid_unique").on(table.telegramId),
    unique("user_referralid_unique").on(table.referralId),
  ]
);

export const cashierWalletTon = pgTable(
  "cashier_wallet_ton",
  {
    publicKey: varchar("public_key", { length: 255 }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    encryptedPrivateKeyData: varchar("encrypted_private_key_data", {
      length: 500,
    }).notNull(),
    encryptedPrivateKeyIv: varchar("encrypted_private_key_iv", {
      length: 255,
    }).notNull(),
    address: varchar({ length: 255 }).notNull(),
    deployed: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("cashier_wallet_ton_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "cashier_wallet_ton_user_id_foreign",
    }).onDelete("cascade"),
    unique("cashier_wallet_ton_publickey_userid_unique").on(
      table.publicKey,
      table.userId
    ),
    unique("cashier_wallet_ton_userid_unique").on(table.userId),
  ]
);

export const ticketPurchasesViaBot = pgTable(
  "ticket_purchases_via_bot",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    amountTickets: integer("amount_tickets").notNull(),
    network: text("network").notNull(),
    price: decimal("price", {
      precision: 18,
      scale: 9,
    }).notNull(),
    txHash: varchar("tx_hash", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("ticket_purchases_via_bot_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    index("ticket_purchases_via_bot_txhash_index").using(
      "btree",
      table.txHash.asc().nullsLast().op("text_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "ticket_purchases_via_bot_userid_foreign",
    }).onDelete("cascade"),
    check(
      "ticket_purchases_via_bot_network_check",
      sql`network = ANY (ARRAY['TON'::text, 'SOL'::text, 'XTR'::text])`
    ),
  ]
);
