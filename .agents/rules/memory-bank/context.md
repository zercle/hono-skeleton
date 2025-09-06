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
- Repository is organized as a Bun + Hono mono-repo with source code present under [packages/api](packages/api), [packages/db](packages/db), and [packages/shared](packages/shared)
- The Memory Bank brief describes a single-app src/ layout; this is an intentional divergence captured here
- CI workflows exist under [.github/workflows/ci.yml](.github/workflows/ci.yml); a root [package.json](package.json) and workspace packages are present

## Implications
- Core Memory Bank docs mirror the brief exactly by directive; any divergence from the current mono-repo implementation is documented here in context
- Ensure CI steps in [.github/workflows/ci.yml](.github/workflows/ci.yml) map to implemented scripts at the root [package.json](package.json) and/or workspace packages under [packages/*](packages)
- Consumers should treat [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md) as architectural intent; context highlights where the live repo differs

## Decisions captured
- Adopt Domain-Driven Clean Architecture with Hono on Bun as per brief
- Use Drizzle ORM with PostgreSQL for persistence
- Use Zod for validation, TSyringe for DI, JWT for auth, UUIDv7 for identifiers, and JSend response format

## Recent updates
- Updated core docs to strictly mirror the brief:
  - [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
  - [.agents/rules/memory-bank/architecture.md](.agents/rules/memory-bank/architecture.md)
  - [.agents/rules/memory-bank/tech.md](.agents/rules/memory-bank/tech.md)
- Confirmed CI workflow presence at [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Documented divergence between brief’s single-app structure and repo’s mono-repo structure here in context

## Risks and assumptions
- Risk: CI red until package.json and scripts are added
- Assumption: This repo is an early scaffold of the template; code will be introduced in subsequent commits or via template sync
- Assumption: Bun 1.x is the target runtime based on CI matrix

## Next actionable steps
1. Maintain [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md) as the source of truth; keep other core docs in sync with it
2. Create a follow-up task to reconcile or revise the brief if and when we decide to document the mono-repo structure explicitly
3. Verify CI steps in [.github/workflows/ci.yml](.github/workflows/ci.yml) align with scripts implemented in [package.json](package.json) and workspace packages under [packages/*](packages)
4. Ensure OpenAPI documentation location is tracked; current path exists at [packages/api/docs](packages/api/docs)
5. Periodically review this context file to capture any new divergences discovered

## Coordination checkpoints
- Confirm whether this repository will host full mono-repo code or a subset that references external templates
- Confirm database provisioning approach for local and CI (Docker service, managed Postgres, or mock)

## Status
- Core Memory Bank files present and aligned with the brief: [brief.md](.agents/rules/memory-bank/brief.md), [product.md](.agents/rules/memory-bank/product.md), [architecture.md](.agents/rules/memory-bank/architecture.md), [tech.md](.agents/rules/memory-bank/tech.md)
- Divergences between brief and current mono-repo layout are documented here in context
- Initialization phase for Memory Bank documentation considered complete pending review

## Acceptance criteria for closing initialization
- Core Memory Bank files present and populated: brief.md, product.md, context.md, architecture.md, tech.md
- Next actions agreed and tracked
- CI expectations documented and reconciled with actual scripts

## Owners and stakeholders
- Technical lead: Kilo Code
- Repo owner: please add handle in [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md) if different