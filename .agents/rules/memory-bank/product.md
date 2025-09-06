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
  - Dependency Injection: TSyringe
  - Validation: Zod schemas
  - Persistence: Drizzle ORM + PostgreSQL with migrations
  - Auth: Hono JWT middleware
  - Identifiers: UUIDv7 (index-friendly)
  - Response format: JSend standard
  - Documentation: Hono OpenAPI + Swagger UI
  - Testing: Bun test + Vitest
  - Developer experience: Bun --watch hot reload

## Key Features
- Domain-Driven Clean Architecture layout with boundaries across entities, use cases, repositories, handlers, routes, and models
- Hono-based HTTP API
- Drizzle ORM with PostgreSQL and managed migrations
- Zod validation and JSend response format
- TSyringe dependency injection and modular composition
- JWT auth primitives using Hono middleware
- UUIDv7 identifiers
- Bun-native testing workflow (Bun test + Vitest optional)
- OpenAPI docs with Swagger UI
- Hot reload via Bun --watch

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

## Sources of Truth
- Project brief: .agents/rules/memory-bank/brief.md