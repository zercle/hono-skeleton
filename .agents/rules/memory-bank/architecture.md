# Architecture

## Overview
Domain-Driven Clean Architecture on Hono with the Bun runtime. Clear boundaries separate delivery, application, domain, and infrastructure concerns. Dependencies point inward, validation is explicit at the edges, and operational concerns are addressed with standard middleware and configuration.

Source of truth:
- brief at .agents/rules/memory-bank/brief.md

## Project Structure
The architecture mirrors the structure described in the brief and adapted to the current mono-repo under packages:

```
.
├── packages/
│   ├── api/                      # Hono app, domains, routes, handlers
│   ├── db/                       # Drizzle schema, migrations, DB scripts
│   └── shared/                   # Shared types, DI tokens, utilities
├── compose.yml                   # Local orchestration
├── Dockerfile                    # Container build
└── package.json                  # Workspaces and scripts
```

## Clean Architecture Boundaries
- Delivery
  - Hono routes and handlers
  - Maps HTTP requests to handlers and returns standardized responses
  - Depends on use case interfaces only
- Application (Use Cases)
  - Orchestrates business rules and workflows
  - Depends on domain entities and repository interfaces
- Domain
  - Entities and value objects
  - Pure logic and invariants
- Infrastructure
  - Concrete implementations of repository interfaces and adapters
  - Database, cache (Valkey), configuration, middleware, logging
- Shared
  - Types, utilities, DI container, tokens

Dependency rules:
- Delivery depends inward on Use Cases and shared contracts
- Use Cases depend inward on Domain and outward only on interfaces
- Infrastructure depends inward to implement interfaces; no inward dependency on infrastructure from core layers
- Shared has no downstream runtime dependencies

## Request Lifecycle
- Routing
  - Hono routes accept HTTP requests and map to handlers
- Validation
  - Zod schemas validate inputs and shape models
- Use case execution
  - Handlers resolve use cases from the DI container and invoke them with validated inputs
- Data access and caching
  - Use cases call repository ports; DI supplies implementations backed by Drizzle or raw SQL
  - Optional caching via Valkey adapters (read-through, write-through, or cache-aside) for appropriate queries
- Response shaping
  - JSend envelopes for success and error formats
- Errors and logging
  - Middleware coordinates safe error handling and structured logs

```mermaid
graph TD
A[Client] --> B[Hono Routes]
B --> C[Handlers]
C --> D[Zod Validation]
D --> E[Use Cases]
E --> F[Repository Ports]
F --> G[Infrastructure Adapters]
G --> H[PostgreSQL 17 (primary) or SQLite (tests)]
E --> K[Cache (Valkey 8, optional)]
E --> I[JSend Response]
I --> J[Client]
```

## Configuration and Environments
- Hierarchical configuration with YAML per environment plus .env overrides
- Precedence
  1. Default/base configuration
  2. Environment-specific YAML
  3. .env for local overrides
  4. Process environment in production
- Database configuration convention
  - Prefer DB_* variables for container and infra compatibility:
    - DB_HOST
    - DB_PORT
    - DB_NAME
    - DB_USER
    - DB_PASSWORD
  - Optional fallback: DB_URL for legacy or simple setups
  - The configuration layer should assemble a connection string from DB_* when provided; otherwise read DB_URL
- Cache configuration convention (Valkey)
  - Prefer VALKEY_* variables for container and infra compatibility:
    - VALKEY_HOST
    - VALKEY_PORT
    - VALKEY_PASSWORD (optional)
  - Optional fallback: VALKEY_URL (redis:// syntax is acceptable with Valkey)
  - The configuration layer should assemble cache connection details from VALKEY_* when provided; otherwise read VALKEY_URL
- Expected keys
  - server: port, host
  - database: host, port, name, user, password, url (optional/fallback)
  - cache: host, port, password, url (optional/fallback)
  - auth.jwt: expiresIn
  - cors: origins

## Database Layer Organization
- Options
  - Drizzle ORM: schema-first with type-safe queries and migration generation
  - Raw SQL: powered by Bun runtime with built-in SQLite or PostgreSQL drivers
- Guidance
  - Use Drizzle for most domains to benefit from schema typing and migrations
  - Raw SQL is acceptable for high-performance, specialized queries or very small utilities
- Migrations
  - Use drizzle-kit to generate and apply migrations when using Drizzle
  - For raw SQL paths, maintain SQL migrations under packages/db/migrations and run them via scripts

## Domain Testing Strategy
- Goals
  - Fast, isolated tests without requiring a live database by default
  - Confidence in domain logic and repository contracts
- Structure
  - Each domain maintains its own mocks directory or package:
    - src/domains/<domain>/mocks for interfaces and test doubles
  - Use bun:test as the primary runner
- Techniques
  - Mock repository interfaces using TypeScript types to avoid real DB access
  - Provide mock implementations for handlers and external adapters as needed
  - Optional test runners: vitest or jest can be used when additional features are desired
  - Alternative: in-memory SQLite to exercise SQL paths without external services
- Integration tests
  - Spin up ephemeral DB containers via Compose or use in-memory SQLite
  - Run migrations before integration tests

## API Documentation
- Hono OpenAPI generation
- Swagger UI endpoint for discoverability
- Contracts synchronized with schemas and routes

## Error Handling and Logging
- Centralized error middleware
  - Sanitizes details in production
  - Maps validation and domain errors to appropriate status codes
- Structured logging via standard middleware patterns
  - Correlate request context where available

## Security Considerations
- JWT-based authentication via Hono JWT middleware
- Password hashing with bcrypt
- UUIDv7 identifiers
- CORS with explicit allowed origins
- Input validation at all public boundaries
- Avoid leaking internal details in error responses

## Scripts and Commands
Reference scripts defined in the brief’s package.json

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

## Acceptance for Architectural Readiness
- Folder structure and dependency direction match Clean Architecture
- DI container registers use cases and repository implementations by tokens
- Configuration validated with environment-aware overrides and DB_* convention with DB_URL fallback
- Cache configuration validated and documented with VALKEY_* convention and VALKEY_URL fallback; cache adapters optional and isolated
- Primary database target is PostgreSQL 17; SQLite allowed for tests
- OpenAPI generated and served with Swagger UI
- Tests cover public use cases, repository contracts, and critical adapters