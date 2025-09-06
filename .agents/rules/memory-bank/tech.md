# Technology Stack & Development Setup

## Runtime & Core Technologies

### Runtime Environment

- **Bun**: Latest version
  - Ultra-fast JavaScript runtime (faster than Node.js)
  - Built-in bundler, test runner, and package manager
  - Native TypeScript support
  - Hot reload capabilities

### Web Framework

- **Hono.js v4.9.6**: Lightweight, fast web framework
  - TypeScript-first design
  - Middleware support
  - JSX support for server-side rendering
  - Edge runtime compatibility
  - Excellent performance characteristics

### Language

- **TypeScript**: Strict mode enabled
  - JSX support configured for Hono JSX
  - Modern ES features available
  - Strong type checking throughout

## Key Tools & Libraries

| Feature               | Tool / Library                       |
| --------------------- | ------------------------------------ |
| HTTP Framework        | Hono.js                              |
| Dependency Injection  | tsyringe                             |
| Database ORM          | Prisma, Bun ORM                      |
| Configuration         | dotenv                               |
| Migrations            | Prisma Migrate, node-pg-migrate or umzug with pg driver |
| JWT Authentication    | jsonwebtoken                         |
| UUID Generation       | **uuidv7** (index-friendly)         |
| Validation            | class-validator or custom middleware |
| Testing               | Bun test runner, Jest, Sinon, pg-mock |
| Linting & Formatting  | ESLint, Prettier                     |
| OpenAPI Documentation | swagger-jsdoc + swagger-ui-express   |
| API Response Format   | jsend (via custom middleware/helper) |


## Current Development Setup (Production-Ready)

### Package Configuration

```json
{
  "name": "hono-skeleton",
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "docker:build": "docker build -t hono-skeleton .",
    "docker:run": "docker run -p 3000:3000 hono-skeleton",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  },
  "dependencies": {
    "hono": "^4.9.6",
    "prisma": "^5.17.0",
    "@prisma/client": "^5.17.0",
    "tsyringe": "^4.8.0",
    "dotenv": "^16.4.5",
    "jsonwebtoken": "^9.0.2",
    "uuid": "^10.0.0",
    "class-validator": "^0.14.2",
    "class-transformer": "^0.5.1",
    "reflect-metadata": "^0.2.2"
  },
  "devDependencies": {
    "@eslint/js": "^9.35.0",
    "@types/bun": "latest",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/uuid": "^10.0.0",
    "@typescript-eslint/eslint-plugin": "^7.17.0",
    "@typescript-eslint/parser": "^7.17.0",
    "eslint": "^9.8.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.2.1",
    "prettier": "^3.3.3"
  }
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  }
}
```

### Available Commands

**Development:**
- `bun install` - Install dependencies
- `bun run dev` - Start development server with hot reload
- `bun test` - Run test suite (7 tests passing)
- `bun test:watch` - Run tests in watch mode

**Code Quality:**
- `bun run lint` - ESLint code checking (passing)
- `bun run format` - Prettier code formatting

**Database:**
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run database migrations

**Docker:**
- `bun run docker:build` - Build Docker image
- `bun run docker:run` - Run Docker container
- `bun run docker:up` - Start Docker Compose stack
- `bun run docker:down` - Stop Docker Compose stack

**Server Status:** Currently running on `http://localhost:3000`

## Architecture Evolution Notes

### Mono-Repo Update
The project briefs have been updated to implement **mono-repo architecture**:
- **Domain-specific Clean Architecture**: Each domain (`src/domains/{domain}/`) contains its complete layered architecture
- **UUIDv7 integration**: Better database indexing performance compared to standard UUIDs
- **Shared infrastructure**: Cross-domain concerns moved to `src/shared/` (database, middleware, config, utils)
- **Domain isolation**: Self-contained domain packages with their own entities, usecases, repositories, handlers, routes, models, and tests

### Current vs Updated Architecture
- **Current implementation**: Traditional Clean Architecture with shared layers
- **Updated briefs**: Mono-repo with domain-specific Clean Architecture
- **Migration path**: Future implementations can follow the updated mono-repo patterns

## Development Environment Requirements

### Prerequisites

- Bun runtime installed (https://bun.sh)
- Docker & Docker Compose (for full stack development)
- Git for version control

### Recommended IDE Setup

- VS Code with TypeScript support
- ESLint and Prettier extensions (when configured)
- Bun extensions for improved development experience

## Technical Constraints & Design Decisions

### Runtime Choice: Bun

- **Performance**: Significantly faster than Node.js
- **Developer Experience**: Built-in tooling reduces complexity
- **TypeScript**: Native support eliminates transpilation overhead
- **Package Management**: Faster than npm/yarn

### Framework Choice: Hono.js

- **Lightweight**: Minimal overhead, fast startup
- **TypeScript-First**: Excellent type safety
- **Edge Compatible**: Can run on various runtimes
- **Middleware System**: Flexible request/response handling

### Architecture Constraints

- **Clean Architecture**: Enforced separation of concerns
- **Dependency Injection**: All services must be injectable
- **Interface-Driven**: All dependencies via interfaces
- **Type Safety**: No `any` types in production code

## Tool Usage Patterns

### Development Workflow

1. `bun install` - Install dependencies
2. `bun run dev` - Start development with hot reload
3. Code changes auto-reload the server
4. TypeScript errors shown in real-time

### Database Workflow (Active)

1. Schema defined in `prisma/schema.prisma` (User, Post models)
2. `bun prisma migrate dev` - Migrations applied successfully
3. `bun prisma generate` - Prisma client generated and operational
4. Type-safe Prisma client used in all repositories

### Testing Workflow (Active)

1. `bun test` - 7 tests passing (unit + integration)
2. `bun test --watch` - Watch mode available
3. Tests organized by domain in `src/tests/`

### Code Quality Workflow (Active)

1. `bun run lint` - ESLint passing with strict rules
2. `bun run format` - Prettier configured and applied
3. Full code formatting and linting operational

## Performance Characteristics

### Bun Runtime Benefits

- Faster startup times
- Lower memory usage
- Built-in bundling (no webpack needed)
- Native TypeScript execution

### Hono.js Benefits

- Minimal bundle size
- Fast routing
- Efficient middleware execution
- Low latency response times

## Deployment Considerations

### Container Strategy

- Multi-stage Docker builds
- Bun runtime in production container
- Optimized layer caching

### Environment Management

- `.env` files for local development
- Environment variables for production
- Configuration validation on startup

## Future Technology Considerations

### Potential Additions

- **Rate Limiting**: For API protection
- **Caching**: Redis or in-memory caching
- **Monitoring**: Application performance monitoring
- **Logging**: Structured logging with correlation IDs
- **Health Checks**: Kubernetes-ready health endpoints

### Scaling Considerations

- Horizontal scaling via load balancers
- Database connection pooling
- Microservice architecture support
- Event-driven architecture capabilities
