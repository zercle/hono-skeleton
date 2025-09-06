# Technology Stack

## Runtime & Framework
- **Runtime**: Bun 1.x ONLY (NOT Node.js) - native JavaScript runtime with built-in package manager
- **Web Framework**: Hono.js 4.x (lightweight, fast, edge-compatible) - NOT Express or other Node.js frameworks
- **Language**: TypeScript ONLY (strict type checking enabled, zero JavaScript files)

## Core Dependencies
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
    "uuidv7": "^0.6.0",
    "yaml": "^2.3.0"
  }
}
```

## Development Dependencies
```json
{
  "devDependencies": {
    "bun-types": "latest",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "@types/yaml": "^2.0.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Database & ORM
- **Database**: PostgreSQL (production-ready relational database)
- **ORM**: Drizzle ORM (type-safe, performant SQL toolkit)
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Native PostgreSQL driver

## Authentication & Security
- **JWT**: JSON Web Tokens for stateless authentication
- **Hashing**: Bcrypt for password hashing
- **Middleware**: Hono JWT middleware for route protection
- **UUID**: UUIDv7 for index-friendly unique identifiers
- **CORS**: Configurable cross-origin resource sharing

## Validation & Serialization
- **Validation**: Zod schemas for runtime type checking
- **Response Format**: JSend standard for consistent API responses
- **OpenAPI**: Hono OpenAPI for API documentation
- **Swagger UI**: Interactive API documentation

## Dependency Injection
- **Container**: TSyringe for TypeScript dependency injection
- **Pattern**: Constructor injection with interfaces
- **Registration**: Centralized container setup
- **Benefits**: Testability and loose coupling

## Testing
- **Test Runner**: Bun test ONLY (native test runner, NOT Jest/Vitest/Mocha)
- **Compatibility**: Bun-native testing, no Node.js testing frameworks
- **Types**: Unit tests and integration tests
- **Coverage**: Built-in Bun coverage reporting
- **Mocking**: Easy mocking with DI container

### Testability Without Real Data Access
- **Ports and Adapters**: All external dependencies must be accessed through interfaces to allow fakes/mocks in tests
- **In-Memory Adapters**:
  - Provide in-memory or fake implementations for every repository and external client interface
  - Register these adapters in tests by overriding DI bindings
- **DI-Driven Swapping**:
  - Use the centralized DI container to swap implementations in tests
  - Example bindings: [src/shared/container/container.ts](src/shared/container/container.ts)
- **Repository Contracts**:
  - Define repository interfaces per domain (e.g., [src/domains/auth/repositories/UserRepository.ts](src/domains/auth/repositories/UserRepository.ts))
  - Production adapters use Drizzle/Postgres; tests use in-memory arrays/maps
- **No Real I/O in Unit Tests**:
  - Unit tests run with only in-memory adapters and pure functions
  - Integration tests may run against in-memory adapters to validate HTTP and routing behavior without a real DB
- **Determinism**:
  - Prefer injecting time/ID generators for deterministic tests
  - Use seeded data builders and fixtures instead of DB seed scripts

### Test Categories
- **Unit**: Use cases, validators, utilities — no I/O; DI overrides to in-memory/fakes
- **Integration (No-DB)**: HTTP handlers and middleware using in-memory adapters to cover end-to-end behavior without real data sources
- **Integration (DB-Optional)**: When needed, explicitly opt-in tests may run against a real database; these are separate and non-blocking for the core suite

### Suggested Conventions
- Place test doubles near domains or under a dedicated test support folder
- Provide helper utilities to override DI bindings for tests
- Keep test scenarios independent and isolated; avoid shared global state

## Development Tools
- **Hot Reload**: Built-in Bun `--watch` mode (NOT nodemon or other Node.js tools)
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier for code formatting
- **Type Checking**: TypeScript compiler in strict mode
- **Package Manager**: Bun ONLY (NOT npm, yarn, or pnpm)

## Build & Deployment
- **Build Tool**: Bun build ONLY (NOT Webpack, Rollup, Vite, or esbuild)
- **Container**: Docker with multi-stage builds
- **Base Image**: `oven/bun:1` official Docker image (NOT Node.js images)
- **Process Manager**: Bun native process management for production
- **Environment**: Docker Compose for local development

## CI/CD
- **Platform**: GitHub Actions
- **Workflow**: Lint → Test → Build → Docker
- **Matrix**: Multiple Bun versions support
- **Caching**: Dependencies and build artifacts
- **Deployment**: Docker image creation

## Development Environment
- **Package Manager**: Bun (faster than npm/yarn)
- **Node Version**: Compatible with Node.js 18+
- **TypeScript**: Strict configuration with path mapping
- **IDE Support**: Full TypeScript intellisense
- **Debugging**: Native Bun debugger support

## Configuration Management
- **Hierarchical Loading**: YAML files → .env files → runtime environment variables
- **YAML Config**: Environment-specific files in `./config/<env>.yaml`
- **Fallback**: `.env` files for local development overrides
- **Runtime Override**: Environment variables take highest priority
- **Schema**: Zod schemas for configuration validation
- **Secrets**: Environment variables for sensitive data
- **Multi-env**: Support for dev/staging/prod environments

## API Documentation
- **Standard**: OpenAPI 3.0 specification
- **Generation**: Automatic from Zod schemas and route definitions
- **UI**: Swagger UI for interactive testing
- **Export**: JSON/YAML spec export capability

## Monitoring & Observability
- **Health Checks**: Built-in health check endpoints
- **Logging**: Structured logging with levels
- **Metrics**: Basic performance and usage metrics
- **Error Tracking**: Error handling and reporting

## Graceful Shutdown
- **Signals**: Handle SIGINT and SIGTERM to initiate an orderly shutdown in [src/server.ts](src/server.ts)
- **Readiness/Liveness**:
  - Flip readiness to unhealthy immediately to stop new traffic
  - Keep liveness healthy during the drain period so orchestrators do not restart the instance prematurely
- **Connection Drain**:
  - Stop accepting new connections and allow in-flight requests to complete within a configurable timeout
  - After timeout, force-close with structured logs to aid incident analysis
- **Resource Cleanup**:
  - Close database pools and drivers (see [src/infrastructure/database/connection.ts](src/infrastructure/database/connection.ts))
  - Flush logs and ensure buffers are drained (see [src/infrastructure/logging/logger.ts](src/infrastructure/logging/logger.ts))
  - Close any other outbound clients (cache, queues) if present
- **Configuration**:
  - Grace period and timeouts configured via YAML/.env and validated by Zod
  - Centralize lifecycle wiring in the entrypoint and infrastructure close handlers

## Development Scripts
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
    "format": "prettier --write src/**/*.ts",
    "format:check": "prettier --check src/**/*.ts",
    "test:unit": "bun test --filter unit",
    "test:integration": "bun test --filter integration"
  }
}
```

## Configuration Structure

### YAML Configuration (Primary)
```yaml
# config/development.yaml
server:
  port: 3000
  host: 0.0.0.0
  nodeEnv: development

database:
  url: postgres://user:pass@localhost:5432/dev_db

auth:
  jwt:
    expiresIn: 24h
    refreshExpiresIn: 7d

redis:
  url: redis://localhost:6379

cors:
  origins: ["http://localhost:3000", "http://localhost:5173"]
  credentials: true

api:
  title: Hono Skeleton API
  version: 1.0.0
  description: Production-ready Hono.js backend
  swagger:
    enabled: true

logging:
  level: info
  pretty: true

rateLimit:
  windowMs: 900000
  maxRequests: 100

security:
  bcryptRounds: 12
  passwordMinLength: 8
```

### Environment Variables (Overrides)
```env
# .env - Local development overrides
PORT=3001
DATABASE_URL=postgres://user:pass@localhost:5432/local_override
JWT_SECRET=your-local-secret-key
REDIS_URL=redis://localhost:6380
```

### Runtime Environment Variables (Final Override)
```bash
# Deployment environment variables
export NODE_ENV=production
export DATABASE_URL=postgres://prod-user:prod-pass@prod-host:5432/prod_db
export JWT_SECRET=production-secret
export REDIS_URL=redis://prod-redis:6379
```

## Performance Characteristics
- **Startup Time**: Sub-second with Bun runtime
- **Memory Usage**: Low memory footprint
- **Request Throughput**: High concurrency support
- **Bundle Size**: Optimized build output
- **Database**: Connection pooling for efficiency

## Compatibility
- **Node.js**: Compatible with Node.js ecosystem
- **Edge**: Hono.js supports edge runtimes
- **Serverless**: Can run in serverless environments
- **Docker**: Full containerization support
- **Platform**: Cross-platform (Linux, macOS, Windows)