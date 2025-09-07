# Tech

## Stack Overview
- Runtime: Bun current stable (1.x)
- Language: TypeScript
- HTTP Framework: Hono
- Dependency Injection: TSyringe
- Config: YAML per environment plus .env overrides with environment validation
- Persistence: Drizzle ORM + PostgreSQL 17, with option for raw SQL using Bun builtin drivers (SQLite/PostgreSQL)
- Caching: Valkey 8 (Redis-compatible protocol) for cache, session, and rate limiting use cases
- Validation: Zod schemas
- Auth/Security: Hono JWT middleware, jsonwebtoken, bcrypt, UUIDv7 identifiers
- Response Format: JSend standard
- Documentation: Hono OpenAPI + Swagger UI
- Testing: bun test; optional vitest or jest
- Developer Experience: Bun --watch for hot reload

Sources:
- brief at [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)
- product at [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- architecture at [.agents/rules/memory-bank/architecture.md](.agents/rules/memory-bank/architecture.md)

## Environment and Prerequisites
- Install Bun current stable (1.x)
- PostgreSQL 17 available locally or via Docker/Podman
- Valkey 8 available locally or via Docker/Podman
- SQLite optional (for in-memory testing or lightweight services)
- Docker or Podman recommended for containerized workflows and CI parity

Recommended local setup:
- Run PostgreSQL 17 via Docker Compose
- Run Valkey 8 via Docker Compose
- Create separate databases for development and test
- Use .env for local overrides such as DB_* variables or DB_URL, and VALKEY_* or VALKEY_URL

## Configuration Model
- Hierarchical configuration using YAML per environment (e.g., config/development.yaml) plus .env overrides
- Precedence:
  1. Default/base config
  2. Environment-specific YAML
  3. .env for local overrides
  4. Process environment in production

- Database configuration convention:
  - Preferred keys for container compatibility:
    - DB_HOST
    - DB_PORT
    - DB_NAME
    - DB_USER
    - DB_PASSWORD
  - Optional fallback: DB_URL
  - Behavior:
    - If DB_* keys are present, assemble the connection string from them
    - Otherwise, read DB_URL
  - Rationale:
    - DB_* aligns with typical container orchestration and secret management patterns
    - Fallback maintains compatibility with existing tooling

Example .env (PostgreSQL 17):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hono_skeleton
DB_USER=postgres
DB_PASSWORD=postgres
# Optional fallback for legacy/simple setups
# DB_URL=postgres://postgres:postgres@localhost:5432/hono_skeleton
```

Example .env (SQLite in-memory for tests):
```
DB_DRIVER=sqlite
DB_URL=:memory:
```

- Cache configuration convention (Valkey 8):
  - Preferred keys:
    - VALKEY_HOST
    - VALKEY_PORT
    - VALKEY_PASSWORD (optional)
  - Optional fallback: VALKEY_URL (redis:// syntax is acceptable with Valkey)
  - Behavior:
    - If VALKEY_* keys are present, assemble the connection from them
    - Otherwise, read VALKEY_URL
  - Rationale:
    - Explicit host/port pairs align with container orchestration; URL fallback preserves portability

Example .env (Valkey 8):
```
VALKEY_HOST=localhost
VALKEY_PORT=6379
# VALKEY_PASSWORD= # optional
# Optional fallback (Redis protocol URL works with Valkey)
# VALKEY_URL=redis://:password@localhost:6379/0
```

- Expected top-level keys (from YAML + env):
  - server: port, host
  - database: host, port, name, user, password, url (optional/fallback), driver (postgres/sqlite)
  - cache: host, port, password, url (optional/fallback)
  - auth.jwt: expiresIn
  - cors: origins

## Database and Migrations
- Primary path: Drizzle ORM for schema and type-safe queries
- Migration tooling: drizzle-kit to generate and run migrations
- Alternate path: Raw SQL using Bun builtin drivers (PostgreSQL/SQLite)
  - Suitable for specialized high-performance queries or minimal services
- Workflow:
  - Update schema definitions (Drizzle) or SQL files (raw)
  - Generate migration SQL with drizzle-kit (when using Drizzle)
  - Apply migrations locally and in CI/deploy
- Storage locations:
  - Schemas and types under packages/db/src/schema
  - Migrations under packages/db/migrations
  - DB scripts under packages/db/scripts

## Security
- JWT via Hono JWT middleware with jsonwebtoken
- Password hashing with bcrypt
- UUIDv7 identifiers for index-friendly IDs
- CORS with explicit allowed origins
- Validate all public inputs at the boundary with Zod
- Sanitize error messages in production

## API Documentation
- Generate OpenAPI from route and schema definitions
- Serve Swagger UI for discovery
- Keep contracts synchronized with code and tests

## Testing Strategy
- Test runners:
  - Primary: bun test
  - Optional: vitest or jest (for extended features like watch plugins, richer reporters, or mocking utilities)
- Unit tests:
  - Focus on use cases and pure domain logic
  - Avoid real database in unit scope; mock repository interfaces with TypeScript
- Domain mocks:
  - Each domain maintains a mocks directory or package (e.g., packages/api/src/domains/<domain>/mocks)
  - Provide mock implementations for repository interfaces and external adapters
- Integration tests:
  - Option 1: Use in-memory SQLite to test SQL paths without external services
  - Option 2: Spin up ephemeral Postgres 17 via Docker Compose for higher fidelity
  - Run migrations before integration tests
- Goals:
  - Fast feedback loop for domain logic
  - Reliable contract tests at boundaries
  - Minimal external dependencies in unit scope

## Developer Commands and Scripts
Reference from the brief’s example package.json

```json
{
  "scripts": {
    "dev": "bun --watch src/server.ts",
    "build": "bun build src/server.ts --outdir ./dist",
    "start": "bun dist/server.js",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "db:generate": "drizzle-kit generate:pg",
    "db:migrate": "bun src/scripts/migrate.ts",
    "db:seed": "bun src/scripts/seed.ts",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  }
}
```

## Core Dependencies (from brief)
```json
{
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "drizzle-orm": "^0.29.0",
    "postgres": "^3.4.0",
    "zod": "^3.22.0",
    "tsyringe": "^4.8.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "uuidv7": "^0.6.0"
  },
  "devDependencies": {
    "bun-types": "latest",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Constraints and Assumptions
- Bun current stable (1.x) is the target runtime
- PostgreSQL 17 is the primary production database; SQLite can be used for tests or lightweight scenarios
- Valkey 8 is the standard cache; Redis references should be replaced by Valkey unless interacting with external managed Redis services
- Production deployments are containerized (Docker/Podman)
- DB_* convention is preferred with DB_URL fallback for DB; VALKEY_* with VALKEY_URL fallback for cache
- This document mirrors the brief; divergences in the actual repository are tracked in context at [.agents/rules/memory-bank/context.md](.agents/rules/memory-bank/context.md)