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
- [ ] Ability to edit past transactions
- [ ] Make sure any state is managed by url params
- [ ] Disable or add loading text for Add Transaction button when submitting

