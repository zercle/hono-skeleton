# Context

Repository: Hono Backend Mono-Repo Template

## Current focus
- Align Memory Bank and repo plans with:
  - Hono Framework on Bun (current stable)
  - Database: PostgreSQL 17 as primary
  - Cache: Valkey 8 (Redis-compatible) replacing Redis
  - Configuration conventions:
    - DB_* preferred with DB_URL fallback
    - VALKEY_* preferred with VALKEY_URL fallback (redis:// URL acceptable with Valkey)
  - Transitional support to avoid breaking existing environments

## Sources of truth in repo
- Project brief at [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)
- Product definition at [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- Architecture at [.agents/rules/memory-bank/architecture.md](.agents/rules/memory-bank/architecture.md)
- Tech guide at [.agents/rules/memory-bank/tech.md](.agents/rules/memory-bank/tech.md)
- Root environment example at [.env.example](.env.example)
- Config service at [packages/api/src/infrastructure/config/config.service.ts](packages/api/src/infrastructure/config/config.service.ts)
- Docker Compose at [compose.yml](compose.yml)
- DB config at [packages/db/drizzle.config.ts](packages/db/drizzle.config.ts)
- DB client at [packages/db/src/index.ts](packages/db/src/index.ts)
- Shared config types at [packages/shared/src/types/index.ts](packages/shared/src/types/index.ts)

## Repository state snapshot
- Mono-repo with packages:
  - API service at [packages/api](packages/api)
  - Database package (Drizzle schema, migrations, scripts) at [packages/db](packages/db)
  - Shared utilities and DI tokens at [packages/shared](packages/shared)
- Compose services in [compose.yml](compose.yml):
  - PostgreSQL 17: image postgres:17-alpine (OK)
  - Redis 7: image redis:7-alpine (to be replaced by Valkey 8)
  - API service uses DB_URL; no DB_* or VALKEY_* vars yet
- Configuration code paths:
  - [packages/api/src/infrastructure/config/config.service.ts](packages/api/src/infrastructure/config/config.service.ts) currently maps `database.url` from `DB_URL` and does not assemble from DB_*
  - [packages/shared/src/types/index.ts](packages/shared/src/types/index.ts) includes `database.url` and lacks cache config shape
  - No cache client or adapters yet (Valkey not referenced)
- DB tooling:
  - [packages/db/drizzle.config.ts](packages/db/drizzle.config.ts) reads `process.env.DB_URL` only
  - [packages/db/src/index.ts](packages/db/src/index.ts) constructs connection from `process.env.DB_URL` only

## Decisions captured
- Framework/runtime: Hono on Bun (current stable 1.x)
- Persistence: PostgreSQL 17 with Drizzle ORM; SQLite allowed for tests/in-memory
- Caching: Valkey 8 (Redis protocol compatible) replaces Redis
- Configuration:
  - Prefer DB_* (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD) with DB_URL fallback
  - Prefer VALKEY_* (VALKEY_HOST, VALKEY_PORT, VALKEY_PASSWORD optional) with VALKEY_URL fallback (redis:// URL acceptable)
- Documentation reflects cache addition and version pins in architecture and tech guides

## Recent updates
- Updated tech guide to include:
  - Bun current stable, Postgres 17, Valkey 8
  - VALKEY_* conventions and examples
- Updated architecture to:
  - Include Valkey in Infrastructure and Request Lifecycle (optional caching)
  - Add config keys for VALKEY_*
  - Update diagram to include cache node
- Updated product to:
  - List Valkey 8 in Core Value and Key Features
  - Add cache configuration conventions

## Compose review and deltas
- PostgreSQL service already at 17-alpine (meets decision)
- Cache service is Redis 7; change to Valkey 8:
  - Replace `redis:7-alpine` with `valkey/valkey:8-alpine`
  - Healthcheck should use `valkey-cli ping` (or keep `redis-cli ping` if image includes it; prefer `valkey-cli`)
- API service environment:
  - Currently uses `DB_URL` only
  - Add cache environment variables:
    - `VALKEY_HOST=valkey`
    - `VALKEY_PORT=6379`
    - optionally `VALKEY_PASSWORD` if configured
  - Consider adding DB_* variables for parity; keep `DB_URL` for backward compatibility until code supports assembly

## Implications
- Introduce cache configuration and optional adapters for read-through/write-through patterns
- Maintain backward compatibility with existing DB_URL while adding DB_* assembly
- Provide environment examples for VALKEY_* and document migration from Redis to Valkey
- CI and local dev flows should use Valkey image and variables

## Next actionable steps
1. Config: Support DB_* assembly and add cache config mapping
   - Update [packages/api/src/infrastructure/config/config.service.ts](packages/api/src/infrastructure/config/config.service.ts) to:
     - Assemble `database.url` from DB_* if present; fallback to `DB_URL`
     - Map `cache` from VALKEY_*; fallback to `VALKEY_URL`
   - Extend types in [packages/shared/src/types/index.ts](packages/shared/src/types/index.ts) to include:
     - `cache: { host: string; port: number; password?: string; url?: string }`
   - Extend interfaces in [packages/api/src/infrastructure/config/config.interface.ts](packages/api/src/infrastructure/config/config.interface.ts) to include cache shape
2. Add cache adapter scaffolding (optional, non-blocking)
   - Create a thin Valkey client wrapper under `packages/api/src/infrastructure/cache/` to centralize connection logic
   - Register via DI only where needed; default to disabled if env not provided
3. Compose migration
   - Replace Redis service with Valkey 8 in [compose.yml](compose.yml)
   - Add `VALKEY_HOST` and `VALKEY_PORT` to API service environment block
4. Environment examples
   - Update [.env.example](.env.example) with DB_* (commented) and VALKEY_* examples; retain DB_URL fallback
5. Drizzle and DB scripts
   - In [packages/db/drizzle.config.ts](packages/db/drizzle.config.ts), assemble URL from DB_* if present before falling back to DB_URL
6. Documentation refresh
   - Update [packages/db/README.md](packages/db/README.md) to mention PostgreSQL 17 and DB_* usage
   - Add brief cache section in API README or domain docs when cache is first used

## Coordination checkpoints
- Select Valkey client library for Bun compatibility (e.g., node-redis works with Valkey via redis protocol; evaluate alternatives if needed)
- Secret handling for `VALKEY_PASSWORD` and database credentials in CI/CD
- Confirm healthcheck tooling available in Valkey image (use `valkey-cli ping`)

## Proposed updates to brief.md (do not edit directly)
- Key Tools & Libraries:
  - Add: Caching: Valkey 8 (Redis-compatible)
  - Clarify: Database: PostgreSQL 17
- Configuration:
  - Document `VALKEY_*` with `VALKEY_URL` fallback alongside DB_* conventions
- Quick Start:
  - Optional note to run Valkey via Docker Compose

## Status
- Architecture, Tech, and Product Memory Bank files updated to include Postgres 17 and Valkey 8
- Compose reviewed; changes required to replace Redis with Valkey and add VALKEY_* envs
- Code not yet updated for DB_* assembly or cache support

## Acceptance criteria for this update
- Memory Bank reflects:
  - Hono + Bun runtime focus
  - PostgreSQL 17 and Valkey 8 with configuration conventions
  - Compose migration path from Redis to Valkey
  - Concrete next steps with file-level targets for config and types