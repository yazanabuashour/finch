# Finch

Finch is a personal finance application for tracking your expenses. It provides a simple interface to add new expenses, view your monthly spending, and see a breakdown of your spending by category.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Drizzle](https://orm.drizzle.team/)
- **UI:** [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

First, install the dependencies:

```bash
bun install
```

Next, set up your environment variables by copying the example file and adding your database connection string and Clerk keys.

```bash
cp .env.example .env
```

Then, start the local database using the provided script:

```bash
./start-database.sh
```

Apply the database schema:

```bash
bun run db:push
```

Finally, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

When you change the database schema (located in `src/server/db/schema.ts`), you can apply the changes to your database by running:

```bash
bun run db:push
```

This command will update your database to match the schema, which is useful for development but should be used with caution in production.

## Todo

- [ ] Auto backup db
- [ ] Ability to see trends/breakdown for any past month
- [ ] Should description be notNull on transaction table?
- [ ] Disable or add loading text for Add Transaction button when submitting
- [ ] Fetch secrets and populate local .env file
- [ ] Vercel development/staging environment
- [ ] development environment slowness
- [ ] DB constraint: enforce `transactions.type` matches `categories.type`
  - Make `(categories.id, categories.type)` unique; reference from `transactions(category_id, type)` and drop the old FK on `category_id`.
  - Add backfill + migration and keep `transactions.type` for query performance and historical stability.
- [ ] add db:push as part of CI/CD
- [ ] resetting development db from production should change the user id to match the development user id
- [ ] add tests
- [ ] use react compiler
- [ ] backfill health-related transactions to use the health category
- [ ] system prompt or other ai instructions
- [ ] prettier in ci/cd
- [ ] yearly summaries
- [ ] improve search/filter performance in history when viewing all transactions
- [ ] multi-month select in history page
