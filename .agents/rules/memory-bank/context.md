# Context

Repository: Hono Backend Mono-Repo Template

## Current focus
- Initialize and populate Memory Bank with authoritative, minimal-yet-useful documentation for continuity across sessions
- Capture architecture intent from template brief and align with operational signals from repo

## Sources of truth in repo
- Project brief at [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)
- Product definition at [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- CI workflow at [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Workflows note at [.github/workflows/README.md](.github/workflows/README.md)

## Repository state snapshot
- The workspace currently contains Memory Bank files and GitHub Actions CI config
- No application source directories or package manifests are present in this snapshot
- The brief describes an intended mono-repo layout and scripts that are not yet materialized here

## Implications
- CI steps reference scripts such as lint, format:check, test:unit, test:integration that will fail until a package.json with those scripts exists
- The brief lists dependencies and scripts typical for the API service; these are design intents, not yet implemented in this repository state

## Decisions captured
- Adopt Domain-Driven Clean Architecture with Hono on Bun as per brief
- Use Drizzle ORM with PostgreSQL for persistence
- Use Zod for validation, TSyringe for DI, JWT for auth, UUIDv7 for identifiers, and JSend response format

## Recent updates
- Added Memory Bank product document at [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- Confirmed CI workflow presence at [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Risks and assumptions
- Risk: CI red until package.json and scripts are added
- Assumption: This repo is an early scaffold of the template; code will be introduced in subsequent commits or via template sync
- Assumption: Bun 1.x is the target runtime based on CI matrix

## Next actionable steps
1. Define package management and workspace strategy (Bun workspaces or other)
2. Add top-level package.json with scripts aligned to CI or adjust CI to match actual scripts
3. Introduce initial source structure as described in the brief (api, shared, db) and minimal hello-world service to make CI pass
4. Add linting and formatting configs consistent with the planned toolchain
5. Add unit test scaffolding and at least one integration test target for the CI stages

## Coordination checkpoints
- Confirm whether this repository will host full mono-repo code or a subset that references external templates
- Confirm database provisioning approach for local and CI (Docker service, managed Postgres, or mock)

## Status
- Memory Bank initialization in progress; core documents being written

## Acceptance criteria for closing initialization
- Core Memory Bank files present and populated: brief.md, product.md, context.md, architecture.md, tech.md
- Next actions agreed and tracked
- CI expectations documented and reconciled with actual scripts

## Owners and stakeholders
- Technical lead: Kilo Code
- Repo owner: please add handle in [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md) if different