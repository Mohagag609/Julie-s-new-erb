# Unified Real Estate & Treasury ERP

This is a Next.js 14 based ERP system for managing real estate and treasury operations. The system is designed to be simple, robust, and incrementally built.

**Core Stack:**
- Next.js 14 (App Router)
- TypeScript
- Prisma + PostgreSQL
- Zod (for API validation)

**Note:** This project is intentionally built **without authentication** or RBAC for simplicity, as per the requirements. The `ENABLE_AUTH` flag in `.env` is hardcoded to `false`.

---

## Quick Start

Follow these steps to get the development environment running.

**1. Install Dependencies:**
```bash
npm install
```

**2. Set Up Environment Variables:**
Copy the example environment file and fill in your database details.
```bash
cp .env.example .env
```
Open the `.env` file and set your `DATABASE_URL`. For a local PostgreSQL server, it might look like this:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/erp_db?schema=public"
```

**3. Run Database Migrations:**
This command will sync your database schema with the `prisma/schema.prisma` file.
```bash
npx prisma migrate dev --name init
```

**4. Seed the Database:**
This will populate the database with initial demo data (1 client, 1 project, 1 unit, 1 contract, 24 installments).
```bash
npm run db:seed
```

**5. Run the Development Server:**
```bash
npm run dev
```
The application should now be running at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

- `npm run dev`: Starts the Next.js development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts a production server.
- `npm run lint`: Lints the codebase.
- `npm run db:migrate`: Runs database migrations.
- `npm run db:generate`: Generates the Prisma client.
- `npm run db:seed`: Populates the database with test data.
- `npm run db:studio`: Opens the Prisma Studio to view and edit data.

---

## Health & Verification

You can quickly check the status of the application and its components:

- **API Health:** [http://localhost:3000/api/health](http://localhost:3000/api/health) (should return `{"ok":true,"db":"up",...}`).
- **Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (should show numbers greater than 0 after seeding).
- **Installments:** [http://localhost:3000/real-estate/installments](http://localhost:3000/real-estate/installments) (should show a table with 24 installments).

---

## Troubleshooting

- **White Screen or Errors on Pages:**
  1. First, check `/api/health`.
  2. If it shows `db: "down"`, your `DATABASE_URL` in `.env` is likely incorrect or the database server is not running.
  3. Correct the URL and ensure your PostgreSQL server is active.

- **Prisma Errors or Schema Mismatch:**
  If you get errors related to the database schema, it's sometimes best to start fresh.
  ```bash
  # This will DELETE ALL DATA in the database
  npx prisma migrate reset

  # Then, re-seed the data
  npm run db:seed
  ```
