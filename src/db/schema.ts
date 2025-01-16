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
  doublePrecision,
  numeric,
  bigint,
  check,
  real,
  jsonb,
  primaryKey,
  pgMaterializedView,
  decimal,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const knexMigrations = pgTable("knex_migrations", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }),
  batch: integer(),
  migrationTime: timestamp("migration_time", {
    withTimezone: true,
    mode: "string",
  }),
});

export const knexMigrationsLock = pgTable("knex_migrations_lock", {
  index: serial().primaryKey().notNull(),
  isLocked: integer("is_locked"),
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

export const lotteryParticipant = pgTable(
  "lottery_participant",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    lotteryId: uuid("lottery_id").notNull(),
    userId: uuid("user_id").notNull(),
    nbTickets: integer("nb_tickets").default(1).notNull(),
    lastParticipation: timestamp("last_participation", {
      withTimezone: true,
      mode: "string",
    }).default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("lottery_participant_lotteryid_index").using(
      "btree",
      table.lotteryId.asc().nullsLast().op("uuid_ops")
    ),
    index("lottery_participant_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    index("lottery_user_index").using(
      "btree",
      table.lotteryId.asc().nullsLast().op("uuid_ops"),
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.lotteryId],
      foreignColumns: [lottery.id],
      name: "lottery_participant_lotteryid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "lottery_participant_userid_foreign",
    }).onDelete("cascade"),
    unique("lottery_participant_lotteryid_userid_unique").on(
      table.lotteryId,
      table.userId
    ),
  ]
);

export const lottery = pgTable("lottery", {
  id: uuid()
    .default(sql`uuid_generate_v4()`)
    .primaryKey()
    .notNull(),
  name: varchar({ length: 100 }).notNull(),
  description: text(),
  participationPrice: integer("participation_price").notNull(),
  nbWinners: integer("nb_winners").notNull(),
  startDate: timestamp("start_date", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  endDate: timestamp("end_date", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
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

export const lotteryPrize = pgTable(
  "lottery_prize",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    lotteryId: uuid("lottery_id").notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    type: varchar({ length: 100 }).notNull(),
    quantity: doublePrecision().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("lottery_prize_lotteryid_index").using(
      "btree",
      table.lotteryId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.lotteryId],
      foreignColumns: [lottery.id],
      name: "lottery_prize_lotteryid_foreign",
    }).onDelete("cascade"),
  ]
);

export const league = pgTable(
  "league",
  {
    id: serial().primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull(),
    eloMin: integer("elo_min").notNull(),
    topPercentRequired: numeric("top_percent_required", {
      precision: 5,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("league_elomin_toppercentrequired_index").using(
      "btree",
      table.eloMin.asc().nullsLast().op("int4_ops"),
      table.topPercentRequired.asc().nullsLast().op("int4_ops")
    ),
    unique("league_name_unique").on(table.name),
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

export const product = pgTable(
  "product",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    label: varchar({ length: 255 }).notNull(),
    order: integer().notNull(),
    category: text().notNull(),
    price: real().notNull(),
    quantity: integer().default(1),
    currency: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    description: varchar({ length: 255 }),
    offer: integer().default(0),
    yumProductId: integer("yum_product_id"),
  },
  (table) => [
    index().using("btree", table.category.asc().nullsLast().op("text_ops")),
    index().using(
      "btree",
      table.category.asc().nullsLast().op("text_ops"),
      table.order.asc().nullsLast().op("int4_ops")
    ),
    index().using("btree", table.yumProductId.asc().nullsLast().op("int4_ops")),
    unique("product_category_order_unique").on(table.order, table.category),
    check(
      "product_currency_check",
      sql`currency = ANY (ARRAY['USD'::text, 'COIN'::text])`
    ),
    check(
      "product_category_check",
      sql`category = ANY (ARRAY['Ticket'::text, 'Coin'::text, 'Emote'::text])`
    ),
  ]
);

export const reward = pgTable(
  "reward",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    type: text().notNull(),
    claimed: boolean().default(false),
    note: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("reward_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "reward_userid_foreign",
    }).onDelete("cascade"),
  ]
);

export const lotteryWinner = pgTable(
  "lottery_winner",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    lotteryId: uuid("lottery_id").notNull(),
    userId: uuid("user_id").notNull(),
    rewarded: boolean().default(false).notNull(),
    rewardedAt: timestamp("rewarded_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("lottery_winner_lotteryid_index").using(
      "btree",
      table.lotteryId.asc().nullsLast().op("uuid_ops")
    ),
    index("lottery_winner_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.lotteryId],
      foreignColumns: [lottery.id],
      name: "lottery_winner_lotteryid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "lottery_winner_userid_foreign",
    }).onDelete("cascade"),
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

export const userPresale = pgTable("user_presale", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  telegramId: bigint("telegram_id", { mode: "number" }).primaryKey().notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  yums: bigint({ mode: "number" }).notNull(),
});

export const referral = pgTable(
  "referral",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    inviterId: uuid("inviter_id"),
    invitedId: uuid("invited_id"),
    inviterRewardId: uuid("inviter_reward_id"),
    invitedRewardId: uuid("invited_reward_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    inviterTelegramId: bigint("inviter_telegram_id", { mode: "number" }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    invitedTelegramId: bigint("invited_telegram_id", { mode: "number" }),
    rewarded: boolean().default(false).notNull(),
  },
  (table) => [
    index("referral_invited_telegram_id_idx").using(
      "btree",
      table.invitedTelegramId.asc().nullsLast().op("int8_ops")
    ),
    index("referral_invitedid_index").using(
      "btree",
      table.invitedId.asc().nullsLast().op("uuid_ops")
    ),
    index("referral_invitedrewardid_index").using(
      "btree",
      table.invitedRewardId.asc().nullsLast().op("uuid_ops")
    ),
    index("referral_inviter_telegram_id_idx").using(
      "btree",
      table.inviterTelegramId.asc().nullsLast().op("int8_ops")
    ),
    index("referral_inviterid_index").using(
      "btree",
      table.inviterId.asc().nullsLast().op("uuid_ops")
    ),
    index("referral_inviterrewardid_index").using(
      "btree",
      table.inviterRewardId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.inviterId],
      foreignColumns: [user.id],
      name: "referral_inviter_id_foreign",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.invitedId],
      foreignColumns: [user.id],
      name: "referral_invited_id_foreign",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.invitedRewardId],
      foreignColumns: [reward.id],
      name: "referral_invitedrewardid_foreign",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.inviterRewardId],
      foreignColumns: [reward.id],
      name: "referral_inviterrewardid_foreign",
    }).onDelete("set null"),
    unique("referral_invitedid_unique").on(table.invitedId),
    check(
      "referral_no_self_invite",
      sql`(inviter_id IS NULL) OR (inviter_id <> invited_id)`
    ),
  ]
);

export const rewardItem = pgTable(
  "reward_item",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    rewardId: uuid("reward_id").notNull(),
    type: text().notNull(),
    amount: doublePrecision().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("reward_item_rewardid_index").using(
      "btree",
      table.rewardId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.rewardId],
      foreignColumns: [reward.id],
      name: "reward_item_rewardid_foreign",
    }).onDelete("cascade"),
  ]
);

export const walletSolDeeplink = pgTable(
  "wallet_sol_deeplink",
  {
    publicKey: varchar("public_key", { length: 255 }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    encryptedPrivateKeyData: varchar("encrypted_private_key_data", {
      length: 500,
    }).notNull(),
    encryptedPrivateKeyIv: varchar("encrypted_private_key_iv", {
      length: 255,
    }).notNull(),
    amount: real().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("wallet_sol_deeplink_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "cashier_wallet_sol_user_id_foreign",
    }).onDelete("cascade"),
    unique("wallet_sol_deeplink_publickey_userid_unique").on(
      table.publicKey,
      table.userId
    ),
    unique("wallet_sol_deeplink_userid_unique").on(table.userId),
  ]
);

export const productTransaction = pgTable(
  "product_transaction",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    productId: uuid("product_id").notNull(),
    step: text().default("INIT"),
    status: text().default("PENDING"),
    log: varchar({ length: 500 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    debitCurrency: text("debit_currency").notNull(),
    txHash: varchar("tx_hash", { length: 255 }),
  },
  (table) => [
    index("idx_userid_status").using(
      "btree",
      table.userId.asc().nullsLast().op("text_ops"),
      table.status.asc().nullsLast().op("uuid_ops")
    ),
    index().using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("product_transaction_txid_index").using(
      "btree",
      table.txHash.asc().nullsLast().op("text_ops")
    ),
    index("product_transaction_userid_index").using(
      "btree",
      table.userId.asc().nullsLast().op("uuid_ops")
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [product.id],
      name: "product_transaction_productid_foreign",
    }),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "product_transaction_userid_foreign",
    }).onDelete("cascade"),
    check(
      "product_transaction_status_check",
      sql`status = ANY (ARRAY['PENDING'::text, 'SUCCEED'::text, 'ERROR'::text])`
    ),
    check(
      "product_transaction_step_check",
      sql`step = ANY (ARRAY['INIT'::text, 'DEBIT'::text, 'CREDIT'::text, 'DONE'::text, 'CONFIRM_DEBIT'::text])`
    ),
    check(
      "product_transaction_debit_currency_check",
      sql`debit_currency = ANY (ARRAY['TON'::text, 'SOL'::text, 'XTR'::text, 'COIN'::text])`
    ),
  ]
);

export const emote = pgTable(
  "emote",
  {
    id: integer().primaryKey().notNull(),
    name: varchar({ length: 50 }).notNull(),
    default: boolean().default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index().using("btree", table.default.asc().nullsLast().op("bool_ops")),
  ]
);

export const userHistoryS1 = pgTable("user_history_s1", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  telegramId: bigint("telegram_id", { mode: "number" }).primaryKey().notNull(),
  globalRank: integer("global_rank").notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  coinsPerHour: bigint("coins_per_hour", { mode: "number" }).notNull(),
  leagueId: integer("league_id").notNull(),
});

export const userHistoryS2 = pgTable("user_history_s2", {
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  telegramId: bigint("telegram_id", { mode: "number" }).primaryKey().notNull(),
  globalRank: integer("global_rank").notNull(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  coinsPerHour: bigint("coins_per_hour", { mode: "number" }).notNull(),
  leagueId: integer("league_id").notNull(),
});

export const userEmote = pgTable(
  "user_emote",
  {
    userId: uuid("user_id").notNull(),
    emoteId: integer("emote_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.emoteId],
      foreignColumns: [emote.id],
      name: "user_emote_emoteid_foreign",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "user_emote_userid_foreign",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.emoteId],
      name: "user_emote_pkey",
    }),
  ]
);
export const userRanking = pgMaterializedView("user_ranking", {
  userId: uuid("user_id"),
  elo: integer(),
  globalRank: integer("global_rank"),
  globalRankPercentile: doublePrecision("global_rank_percentile"),
  leagueId: integer("league_id"),
  leagueRank: integer("league_rank"),
}).as(
  sql`WITH ranked_users AS ( SELECT "user".id, "user".elo, row_number() OVER (ORDER BY "user".elo DESC)::integer AS global_rank, (row_number() OVER (ORDER BY "user".elo DESC)::numeric * 100.0 / count(*) OVER ()::numeric)::double precision AS global_rank_percentile FROM "user" ), league_assignment AS ( SELECT r.id AS user_id, r.elo, r.global_rank, r.global_rank_percentile, ( SELECT l.id FROM league l WHERE r.elo >= l.elo_min AND r.global_rank_percentile <= l.top_percent_required::double precision ORDER BY l.id DESC LIMIT 1) AS league_id FROM ranked_users r ), league_ranked_users AS ( SELECT la.user_id, la.elo, la.global_rank, la.global_rank_percentile, la.league_id, row_number() OVER (PARTITION BY la.league_id ORDER BY la.elo DESC)::integer AS league_rank FROM league_assignment la ) SELECT user_id, elo, global_rank, global_rank_percentile, league_id, league_rank FROM league_ranked_users`
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
