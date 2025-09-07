# Database Package

This package contains database schema definitions, migrations, and seeding scripts.

## Setup

Set the `DB_URL` environment variable to point to your PostgreSQL database:

```bash
export DB_URL=postgres://username:password@localhost:5432/mydb
```

## Running Migrations

To run pending migrations:

```bash
bun run migrate
```

Or from the root directory:

```bash
bun run -w packages/db migrate
```

## Seeding Data

To seed the database with initial data:

```bash
bun run seed
```

Or from the root directory:

```bash
bun run -w packages/db seed
```

## Migration Management

Migrations are stored in `packages/db/migrations/` as SQL files. They are executed in lexicographic order.
