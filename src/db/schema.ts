import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  idtg: integer("idtg").notNull(),
  firstname: text("firstname").notNull(),
  tgusername: text("tgusername"),
  suborg: text("suborg").notNull(),
  wallet: text("wallet").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
