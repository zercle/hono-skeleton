# Tech

## Stack Overview
- Runtime: Bun 1.x
- Language: TypeScript
- HTTP Framework: Hono
- Dependency Injection: TSyringe
- Config: YAML per environment plus .env overrides with environment validation
- Persistence: Drizzle ORM + PostgreSQL with migrations
- Validation: Zod schemas
- Auth/Security: Hono JWT middleware, jsonwebtoken, bcrypt, UUIDv7 identifiers
- Response Format: JSend standard
- Documentation: Hono OpenAPI + Swagger UI
- Testing: Bun test + Vitest
- Developer Experience: Bun --watch for hot reload

Sources:
- brief at [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)
- product at [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- architecture at [.agents/rules/memory-bank/architecture.md](.agents/rules/memory-bank/architecture.md)

## Environment and Prerequisites
- Install Bun 1.x
- PostgreSQL available locally or via Docker
- Docker optional for containerized workflows

Recommended local setup:
- Run Postgres via Docker or Docker Compose
- Create separate databases for development and test
- Use .env for local overrides such as DATABASE_URL and JWT_SECRET

## Configuration Model
- YAML per environment (e.g., config/development.yaml) plus .env overrides
- Precedence:
  1. Default/base config
  2. Environment-specific YAML
  3. .env for local overrides
  4. Process environment in production
- Expected keys:
  - server: port, host
  - database: url
  - auth.jwt: expiresIn
  - cors: origins

## Database and Migrations
- Drizzle ORM for schema and queries
- drizzle-kit to generate and run migrations
- Workflow:
  - Update schema definitions in code
  - Generate SQL migrations
  - Apply migrations locally and in CI/deploy

## Security
- JWT via Hono JWT middleware with jsonwebtoken
- Password hashing with bcrypt
- UUIDv7 identifiers for index-friendly IDs
- CORS with explicit allowed origins
- Validate all public inputs at the boundary with Zod

## API Documentation
- Generate OpenAPI from route and schema definitions
- Serve Swagger UI for discovery
- Keep contracts synchronized with code

## Testing Strategy
- Unit tests for use cases and isolated components
- Integration tests for HTTP handlers and repositories
- Use Bun test runner; Vitest may be layered if desired
- Run migrations before integration tests

## Developer Commands and Scripts
Reference from the brief’s example package.json:

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
- Bun 1.x is the target runtime
- PostgreSQL is required for integration and runtime
- Production deployments are containerized
- This document mirrors the brief; divergences in the actual repository are tracked in context at [.agents/rules/memory-bank/context.md](.agents/rules/memory-bank/context.md)