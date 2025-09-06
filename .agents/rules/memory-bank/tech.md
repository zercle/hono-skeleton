# Tech

## Stack Overview
- Runtime: Bun 1.x (target in CI)
- Language: TypeScript
- HTTP Framework: Hono
- Validation: Zod
- Dependency Injection: TSyringe
- Persistence: PostgreSQL with Drizzle ORM and drizzle-kit for migrations
- Auth/Security: JSON Web Tokens, bcryptjs for password hashing, UUIDv7 identifiers
- Config: YAML per environment plus .env overrides
- Logging: pino and pino-pretty for structured logs
- API Docs: OpenAPI generation and Swagger UI
- Testing: Bun test runner (unit and integration stages planned in CI)
- Containerization: Docker image build in CI

References:
- CI workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)
- Architecture intent: [.agents/rules/memory-bank/architecture.md](.agents/rules/memory-bank/architecture.md)
- Product goals: [.agents/rules/memory-bank/product.md](.agents/rules/memory-bank/product.md)
- Brief: [.agents/rules/memory-bank/brief.md](.agents/rules/memory-bank/brief.md)

## Environment and Prerequisites
- Bun: Install latest 1.x
- Node.js: Optional (tooling only, Bun is primary runtime)
- Docker: For local Postgres and container image builds
- PostgreSQL: Local server or Docker container for development and integration tests

Recommended local setup (conceptual):
- Use Docker Compose or a single Docker container to run Postgres
- Create a dedicated database per environment (development, test)
- Provide a .env file with overrides such as database URL and JWT secret

## Configuration Model
- Base configuration in YAML per environment (e.g., config/development.yaml)
- .env file for local overrides and secrets (never commit production secrets)
- Environment variable precedence:
  1. Default/base config
  2. Environment-specific YAML
  3. .env entries for local
  4. Process environment for deploy/runtime
- Expected keys (from brief):
  - server: port, host
  - database: url
  - auth.jwt: expiresIn
  - cors: origins

## Logging and Error Handling
- Logging:
  - pino for structured logs; pino-pretty for local readability
  - Log fields to include: level, time, context, trace/request IDs when available
- Error handling:
  - Centralized middleware sanitizes error output in production
  - Map validation and domain errors to explicit HTTP status codes
  - Avoid leaking internal stack traces to clients

## Security
- JWT:
  - HS256 or stronger; secret from environment
  - Short-lived tokens with refresh strategy handled in Auth domain
- Passwords:
  - bcryptjs with configurable cost (rounds) from environment
  - Never log or echo secrets
- CORS:
  - Explicitly configured allowed origins (no wildcard in production)
- Input validation:
  - Zod schemas at the boundary of every public handler
- Headers and transport:
  - Prefer TLS termination upstream in production environments

## Database and Migrations
- Drizzle ORM for schema and queries
- drizzle-kit to generate and manage SQL migrations
- Migration workflow:
  - Update schema definitions
  - Generate migrations
  - Apply migrations for development and CI
- CI/Integration considerations:
  - Ensure Postgres is available (service container or external)
  - Use ephemeral databases for isolation

## API Documentation
- OpenAPI schema generated from route and schema definitions
- Swagger UI endpoint for discovery
- Contracts synchronized with code to prevent drift

## Testing Strategy
- Unit tests:
  - Exercise use cases and isolated components
  - Mock repository interfaces and external services
- Integration tests:
  - Exercise HTTP handlers and repositories with a real Postgres (or container)
  - Run migrations prior to test execution
- Test runner:
  - Bun test runner by default; Vitest optional if desired for ecosystem features
- CI stages (from workflow):
  - test:unit
  - test:integration

## CI/CD Overview
- GitHub Actions runner: ubuntu-latest
- Bun 1.x matrix setup
- Steps executed:
  - bun install --frozen-lockfile
  - bun run lint
  - bun run format:check
  - bun run test:unit
  - bun run test:integration
  - docker build for image creation
- Notes:
  - The repository must provide a package.json with all referenced scripts for CI to pass
  - If the project is a mono-repo, prefer workspace-aware scripts at the root or a task-runner

## Scripts and Tooling (Expected)
The following scripts are expected by CI and should be provided by the repository:
- lint: Run ESLint across the codebase
- format:check: Verify Prettier formatting (no write)
- test:unit: Run unit tests
- test:integration: Run integration tests
- build: Produce production artifacts (and optionally type-check)
- start: Run built server
- migrate/seed: Database lifecycle commands via drizzle-kit and execution scripts

Linting and formatting:
- ESLint:
  - Typescript plugin and parser
  - Rules aligned with Clean Architecture boundaries (optional dependency constraints)
- Prettier:
  - Project-wide formatting; enforce consistent line width, quotes, and trailing commas

## Dependency Management
- Prefer minimal, stable dependencies; pin versions where necessary
- Use exact versions for core infra tools to avoid pipeline drift
- Periodically update and test under CI before merging
- Consider workspaces if adopting a mono-repo (api, shared, db)
  - If using Bun workspaces, define workspace packages and shared tsconfig references

## Observability
- Structured logging with pino; environment-based log levels
- Add request-scoped context in middleware
- Future enhancements:
  - Distributed tracing hooks
  - Standard metrics (latency, throughput, error rates)

## Performance Considerations
- Bun runtime offers fast startup and low overhead
- Validation and serialization costs should be measured on critical paths
- Use connection pooling for Postgres
- Avoid excessive JSON serialization; prefer streaming when necessary

## Constraints and Assumptions
- Runtime is Bun 1.x across local and CI
- Postgres availability is required for integration and runtime
- The current repository snapshot may not yet include code or package.json; CI will fail until scripts and code are added
- Production deployments are containerized using Docker images built in CI

## Open Questions
- Will the repository use Bun workspaces for api, shared, and db packages?
- How will Postgres be provisioned in CI (service container vs. external)?
- Should Vitest be adopted explicitly, or standardize solely on Bun test runner?