# Product

## Name
Hono Backend Mono-Repo Template (Bun Runtime)

## Purpose
Provide a production-grade backend template built on Bun and Hono that demonstrates Domain-Driven Clean Architecture with strong boundaries, testability, and operational readiness out of the box.

## Problem Statement
Teams starting new backend services often spend significant effort on bootstrapping project structure, wiring dependencies, configuring environments, and establishing best practices. This template reduces setup time and enforces a maintainable architecture from day one.

## Target Users
- Backend engineers and teams adopting Bun and Hono
- Organizations standardizing on Clean Architecture and DDD
- Developers who need a fast, opinionated starting point with testing and docs built-in

## Core Value
- Speed to first production-ready service
- Clear architectural boundaries for long-term maintainability
- Ready-to-use patterns for:
  - Configuration: YAML files + .env + environment validation (hierarchical loading)
  - Configuration conventions: Prefer DB_* variables with DB_URL fallback for compatibility; prefer VALKEY_* variables with VALKEY_URL fallback for cache
  - Dependency Injection: TSyringe
  - Validation: Zod schemas
  - Persistence: Drizzle ORM + PostgreSQL 17 with migrations; alternative raw SQL via Bun builtin drivers
  - Caching: Valkey 8 (Redis-compatible) for cache/session/rate-limiting use cases
  - Auth: Hono JWT middleware
  - Identifiers: UUIDv7 (index-friendly)
  - Response format: JSend standard
  - Documentation: Hono OpenAPI + Swagger UI
  - Testing: bun test; per-domain mocks; optional vitest/jest; alternative in-memory SQLite

## Key Features
- Domain-Driven Clean Architecture layout with boundaries across entities, use cases, repositories, handlers, routes, and models
- Hono-based HTTP API
- Drizzle ORM with PostgreSQL 17 and managed migrations; optional raw SQL using Bun builtin drivers
- Zod validation and JSend response format
- TSyringe dependency injection and modular composition
- JWT auth primitives using Hono middleware
- UUIDv7 identifiers
- Caching via Valkey 8 (Redis protocol compatible)
- Bun-native testing workflow:
  - Each domain includes a mocks directory or package for repository and adapter test doubles
  - bun:test as primary runner; vitest/jest supported as alternatives
  - In-memory SQLite option for isolated integration tests
- OpenAPI docs with Swagger UI
- Hot reload via Bun --watch

## Configuration Conventions
- Preferred environment variables for database (container-friendly):
  - DB_HOST
  - DB_PORT
  - DB_NAME
  - DB_USER
  - DB_PASSWORD
- Fallback supported: DB_URL
- The configuration layer should assemble a connection string from DB_* when present; otherwise read DB_URL
- Ensures compatibility with Docker/Podman and secret managers

- Preferred environment variables for cache (Valkey 8):
  - VALKEY_HOST
  - VALKEY_PORT
  - VALKEY_PASSWORD (optional)
- Fallback supported: VALKEY_URL (redis:// syntax is acceptable with Valkey)
- The configuration layer should assemble cache connection details from VALKEY_* when present; otherwise read VALKEY_URL

## Non-Goals
- Building a UI or frontend application
- Providing domain-specific business logic beyond examples
- Supporting every database or message broker out of the box
- Replacing organization-specific DevOps and deployment policies

## Success Criteria
- A new service can be created, tested, documented, and containerized in under one hour
- Code remains modular and testable as features grow
- Tests and docs integrate cleanly with the architecture
- Teams can extend domains without breaking cross-boundary contracts

## User Experience Principles
- Minimal ceremony to add a new domain or endpoint
- Consistent API responses using the JSend standard
- Clear errors with safe defaults in production
- Discoverable documentation via OpenAPI and Swagger UI

## Example Use Cases
- Build an Auth domain with register and login endpoints
- Add a Posts domain that demonstrates CRUD with repository and use case separation
- Extend configuration for multiple environments using YAML plus .env overrides
- Write domain tests using per-domain mocks without a real database; add in-memory SQLite integration tests if needed

## Sources of Truth
- Project brief: .agents/rules/memory-bank/brief.md