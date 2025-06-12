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
  email: varchar("email", { length: 255 }).notNull().unique(),
  // It's critical to store a hash, not the raw password
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    // Each category belongs to a user
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  // A user cannot have two categories with the same name
  (table) => ({
    userCategoryUnique: unique("user_category_unique").on(
      table.userId,
      table.name,
    ),
  }),
);

// 3. Transactions Table (The core of the app)
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  description: text("description"),
  // Use decimal for money to avoid floating point inaccuracies
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  // The date the transaction occurred, not when it was entered
  transactionDate: date("transaction_date").notNull(),
  type: transactionTypeEnum("type").notNull(),
  // Each transaction belongs to a user
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // An expense should have a category. Income might not.
  // ON DELETE SET NULL means if a category is deleted, the transaction remains
  // but its category_id is set to NULL.
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// 4. Monthly Summaries Table (For performance and reporting)
export const monthlySummaries = pgTable(
  "monthly_summaries",
  {
    id: serial("id").primaryKey(),
    // The first day of the month this summary represents
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
    // Each summary belongs to a user
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  // A user can only have one summary row per month
  (table) => ({
    userMonthUnique: unique("user_month_unique").on(
      table.userId,
      table.monthStartDate,
    ),
  }),
);

// --- RELATIONS ---
// Defining relations makes querying with joins incredibly easy and type-safe.

export const usersRelations = relations(users, ({ many }) => ({
  // A user can have many transactions, categories, and summaries
  transactions: many(transactions),
  categories: many(categories),
  monthlySummaries: many(monthlySummaries),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  // A category belongs to one user and can have many transactions
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  // A transaction belongs to one user and (optionally) one category
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
    // A monthly summary belongs to one user
    user: one(users, {
      fields: [monthlySummaries.userId],
      references: [users.id],
    }),
  }),
);

// Optional: Define inferred types for easy use in your application code
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Category = InferSelectModel<typeof categories>;
export type NewCategory = InferInsertModel<typeof categories>;

export type Transaction = InferSelectModel<typeof transactions>;
export type NewTransaction = InferInsertModel<typeof transactions>;

export type MonthlySummary = InferSelectModel<typeof monthlySummaries>;
export type NewMonthlySummary = InferInsertModel<typeof monthlySummaries>;
