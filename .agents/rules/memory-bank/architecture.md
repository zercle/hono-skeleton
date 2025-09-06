# System Architecture

## Architectural Pattern

This boilerplate follows **Clean Architecture** principles with **Domain-Driven Design (DDD)** concepts. The updated briefs propose **mono-repo architecture** where each domain contains its own complete Clean Architecture implementation, ensuring clear separation of concerns, domain isolation, and maintainable code structure. This also includes enhanced database migration strategies, robust repository abstractions, standardized JSON API responses, and comprehensive testing architecture.

## Layered Architecture Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                       │
│                    (src/app.ts, src/routes/)                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                        Handler Layer                            │
│                       (src/handler/)                           │
│              Request Validation & Response Formatting           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       Use Case Layer                            │
│                      (src/usecase/)                            │
│                    Business Logic & Rules                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                       Domain Layer                              │
│                      (src/domain/)                             │
│                 Domain Models & Interfaces                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                    Repository Layer                             │
│                    (src/repository/)                           │
│                   Data Access & Persistence                     │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│                   Infrastructure Layer                          │
│                  (src/infrastructure/)                         │
│            Database, Config, External Services                  │
└─────────────────────────────────────────────────────────────────┘
```

## Current Project Structure

### Actual Structure (Production-Ready State)

```
.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts                      # Hono app and route registration
│   ├── server.ts                   # Server startup
│   ├── domains/                    # Domain-specific modules
│   │   ├── auth/                   # Authentication domain
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   ├── usecases/
│   │   │   │   ├── auth.usecase.ts
│   │   │   │   └── interfaces/
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── interfaces/
│   │   │   ├── handlers/
│   │   │   │   └── auth.handler.ts
│   │   │   ├── routes/
│   │   │   │   └── auth.routes.ts
│   │   │   ├── models/
│   │   │   │   └── auth.models.ts
│   │   │   └── tests/
│   │   │       ├── auth.usecase.test.ts
│   │   │       └── auth.handler.test.ts
│   │   ├── posts/                  # Posts domain
│   │   │   ├── entities/
│   │   │   │   └── post.entity.ts
│   │   │   ├── usecases/
│   │   │   ├── repositories/
│   │   │   ├── handlers/
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── tests/
│   │   └── greeting/               # Greeting domain (example)
│   │       ├── entities/
│   │       ├── usecases/
│   │       ├── repositories/
│   │       ├── handlers/
│   │       ├── routes/
│   │       ├── models/
│   │       └── tests/
│   └── shared/                     # Shared infrastructure
│       ├── database/
│       │   ├── connection.ts
│       │   └── base-repository.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── cors.middleware.ts
│       │   └── validation.middleware.ts
│       ├── config/
│       │   └── app.config.ts
│       ├── utils/
│       │   ├── uuid.util.ts        # UUIDv7 generator
│       │   ├── response.util.ts
│       │   └── validation.util.ts
│       ├── types/
│       │   └── common.types.ts
│       └── container/
│           └── di.container.ts
├── .env.example
├── bun.lockb
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Target Structure (From Brief.md)

```
hono-skeleton/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts                      # Hono app and route registration
│   ├── server.ts                   # Server startup
│   ├── domains/                    # Domain-specific modules
│   ├── shared/                     # Shared infrastructure
│   └── tests/                      # Unit and integration tests
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Key Architectural Decisions

### 1. Runtime & Framework Choice

- **Bun Runtime**: Fast JavaScript runtime with built-in bundler, test runner, and package manager
- **Hono.js**: Lightweight, fast web framework with excellent TypeScript support
- **TypeScript**: Strong typing throughout the application

### 2. Data Layer Strategy

- **Prisma ORM**: Type-safe database client with migrations
- **Bun ORM**: Used for type-safe SQL queries and entity/data access, similar to SQLC generated code
- **Database Migrations**: Support for `node-pg-migrate` or `umzug` with `pg` driver for robust schema evolution
- **Repository Pattern**: Abstraction layer over data access, with interfaces/abstractions to enable mocking
- **Database Agnostic**: Can work with PostgreSQL, MySQL, SQLite, etc.

### 3. Dependency Management

- **tsyringe**: Lightweight dependency injection container
- **Interface-Based Design**: All dependencies injected via interfaces
- **Singleton Services**: Business logic services as singletons

### 4. Request Flow Pattern

```
HTTP Request → Route → Handler → UseCase → Repository → Database
                ↓         ↓        ↓         ↓
            Validation  Format   Business  Data Access
```

## Critical Code Flows

### 1. Application Bootstrap

- Entry point: `src/index.ts` (current) → `src/server.ts` (target)
- App configuration: `src/app.ts` (target)
- Route registration: Centralized in `src/app.ts`
- DI container setup: In infrastructure layer

### 2. Request Handling

- Route definition → Handler invocation → Use case execution
- Error handling via middleware
- Response formatting in handlers using `omniti-labs/jsend` specification via middleware or helper functions

### 3. Database Operations

- Use case → Repository interface → Prisma implementation
- Transaction management at use case level
- Migration handling via Prisma CLI

## Component Relationships

### Core Dependencies

- **Handlers** depend on **Use Cases** (via interfaces)
- **Use Cases** depend on **Repositories** (via interfaces)
- **Repositories** implement domain interfaces
- **Infrastructure** provides concrete implementations

### Cross-Cutting Concerns

- **Authentication**: JWT middleware
- **Validation**: Request validation middleware
- **Logging**: Structured logging throughout layers
- **Error Handling**: Global error handler

## Technology Integration Points

### Web Framework (Hono.js)

- Route definitions in `/routes` folder
- Middleware for auth, validation, error handling
- Context object for request/response handling

### Database (Prisma)

- Schema definition in `prisma/schema.prisma`
- Client generation for type safety
- Migration management via CLI

### Dependency Injection (tsyringe)

- Container registration in infrastructure
- Decorator-based injection
- Lifecycle management for services

## Security Architecture

- **Authentication**: JWT-based with middleware
- **Input Validation**: Request-level validation
- **Environment Variables**: Secure configuration management
- **CORS**: Configurable cross-origin policies

## Testing Strategy Architecture

- **Unit Tests**: Individual layer testing with `jest` or `sinon` for mocking repository methods
- **Integration Tests**: Cross-layer functionality, including database layer tests with `pg-mock` or Bun query mocking
- **API Tests**: End-to-end request/response cycles
- **Bun Test Runner**: Native testing framework
