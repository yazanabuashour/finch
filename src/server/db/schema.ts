import {
  relations,
  type InferSelectModel,
  type InferInsertModel,
} from "drizzle-orm";
import {
  pgTable,
  serial,
  varchar,
  integer,
  decimal,
  timestamp,
  text,
  date,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "expense",
  "income",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    userCategoryUnique: unique("user_category_unique").on(
      table.userId,
      table.name,
    ),
  }),
);

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transactionDate: date("transaction_date", { mode: "date" }).notNull(),
  type: transactionTypeEnum("type").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const monthlySummaries = pgTable(
  "monthly_summaries",
  {
    id: serial("id").primaryKey(),
    monthStartDate: date("month_start_date").notNull(),
    totalIncome: decimal("total_income", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    totalSpending: decimal("total_spending", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    netSavings: decimal("net_savings", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    endOfMonthCash: decimal("end_of_month_cash", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userMonthUnique: unique("user_month_unique").on(
      table.userId,
      table.monthStartDate,
    ),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  categories: many(categories),
  monthlySummaries: many(monthlySummaries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const monthlySummariesRelations = relations(
  monthlySummaries,
  ({ one }) => ({
    user: one(users, {
      fields: [monthlySummaries.userId],
      references: [users.id],
    }),
  }),
);

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type MonthlySummary = InferSelectModel<typeof monthlySummaries>;
export type NewMonthlySummary = InferInsertModel<typeof monthlySummaries>;
