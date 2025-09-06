# Product

## Name
Hono Backend Mono-Repo Template

## Purpose
Provide a production-grade backend template built on Bun and Hono that demonstrates Domain-Driven Clean Architecture with strong boundaries, testability, and operational readiness out of the box.

## Problem Statement
Teams starting new backend services often spend significant effort on bootstrapping project structure, wiring dependencies, configuring CI, and establishing best practices. This template reduces setup time and enforces a maintainable architecture from day one.

## Target Users
- Backend engineers and teams adopting Bun and Hono
- Organizations standardizing on Clean Architecture and DDD
- Developers who need a fast, opinionated starting point with testing and CI built-in

## Core Value
- Speed to first production-ready service
- Clear architectural boundaries for long-term maintainability
- Ready-to-use patterns for auth, validation, configuration, DI, and database

## Key Features
- Domain-Driven Clean Architecture layout with boundaries across entities, use cases, repositories, handlers, and routes
- Hono-based HTTP API with OpenAPI docs and Swagger UI
- Drizzle ORM with PostgreSQL and managed migrations
- Zod validation and JSend response format
- TSyringe dependency injection and modular composition
- JWT auth primitives and UUIDv7 identifiers
- Bun-native testing and development workflow
- CI workflow for linting, formatting, tests, and Docker build

## Non-Goals
- Building a UI or frontend application
- Providing domain-specific business logic beyond examples
- Supporting every database or message broker out of the box
- Replacing organization-specific DevOps and deployment policies

## Success Criteria
- A new service can be created, tested, documented, and containerized in under one hour
- Code remains modular and testable as features grow
- CI runs reliably on each change with fast feedback
- Teams can extend domains without breaking cross-boundary contracts

## KPIs
- Bootstrap time to first API endpoint and test passing
- CI duration and pass rate
- Unit/integration test coverage for public endpoints and use cases
- Defect rate from boundary violations (e.g., domain leakage)

## User Experience Principles
- Minimal ceremony to add a new domain or endpoint
- Consistent API responses using JSend standard
- Clear errors with safe defaults in production
- Discoverable documentation via OpenAPI and Swagger UI

## Example Use Cases
- Build an Auth domain with register, login, profile, and refresh endpoints
- Add a Posts domain that demonstrates CRUD with repository and use case separation
- Extend configuration for multiple environments using YAML plus .env overrides

## Current Repository Signals
- The Memory Bank brief describes the intended architecture and stack at [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)
- CI workflow exists at [.github/workflows/ci.yml](.github/workflows/ci.yml) referencing scripts for linting, formatting, unit tests, integration tests, and Docker build
- Source packages and application code are not present in this repository snapshot; this template may be in an early stage or intentionally minimal

## Open Questions
- Will this repo include the full mono-repo structure (api, shared, db) or link to a separate template?
- Which package manager and workspace strategy will be standardized (Bun workspaces, pnpm, or npm)?
- What testing matrix and environments should CI validate beyond Linux (e.g., macOS, Windows)?