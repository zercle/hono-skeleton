# System Architecture

## Architectural Pattern

This boilerplate follows **Clean Architecture** principles with **Domain-Driven Design (DDD)** concepts, ensuring clear separation of concerns and maintainable code structure.

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
hono-skeleton/
├── .agents/
│   └── rules/memory-bank/           # Memory Bank documentation
├── prisma/
│   ├── schema.prisma               # Database schema (User, Post models)
│   └── migrations/                 # Database migrations
├── src/
│   ├── app.ts                      # Hono app configuration
│   ├── server.ts                   # Server startup with graceful shutdown
│   ├── index.ts                    # Entry point with signal handling
│   ├── domain/                     # Domain models and interfaces
│   │   ├── entities/
│   │   │   └── base.entity.ts     # Base entity interface
│   │   ├── interfaces/
│   │   │   └── repository.interface.ts # Generic repository interface
│   │   └── models/
│   │       ├── greeting.model.ts   # Greeting domain model
│   │       ├── user.model.ts      # User domain model with auth types
│   │       └── post.model.ts      # Post domain model
│   ├── repository/                 # Data access layer
│   │   ├── interfaces/
│   │   │   ├── greeting.repository.interface.ts
│   │   │   ├── user.repository.interface.ts
│   │   │   └── post.repository.interface.ts
│   │   ├── greeting.repository.ts  # In-memory implementation
│   │   ├── user.repository.ts     # Prisma implementation
│   │   └── post.repository.ts     # Prisma implementation
│   ├── usecase/                    # Business logic layer
│   │   ├── interfaces/
│   │   │   ├── greeting.usecase.interface.ts
│   │   │   ├── auth.usecase.interface.ts
│   │   │   └── post.usecase.interface.ts
│   │   ├── greeting.usecase.ts    # Business logic
│   │   ├── auth.usecase.ts       # JWT auth logic
│   │   └── post.usecase.ts       # Post business logic
│   ├── handler/                    # HTTP request handlers
│   │   ├── base.handler.ts        # Base handler with response formatting
│   │   ├── greeting.handler.ts    # Greeting HTTP handlers
│   │   ├── auth.handler.ts       # Auth HTTP handlers
│   │   └── post.handler.ts       # Post HTTP handlers
│   ├── routes/                     # Route definitions
│   │   ├── index.ts              # Route registration
│   │   ├── greeting.routes.ts    # Greeting routes
│   │   ├── auth.routes.ts       # Auth routes
│   │   └── post.routes.ts       # Post routes
│   ├── infrastructure/             # External concerns
│   │   ├── config/
│   │   │   └── app.config.ts     # Application configuration
│   │   ├── database/
│   │   │   └── connection.ts     # Prisma client setup
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts # JWT auth middleware
│   │   └── container/
│   │       └── di.container.ts   # tsyringe DI container
│   └── tests/                     # Test files
│       ├── greeting.test.ts      # Domain unit tests
│       └── app.test.ts          # Integration tests
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .eslintrc.json                 # ESLint legacy config
├── eslint.config.js              # ESLint v9 config
├── .prettierrc                   # Prettier configuration
├── .dockerignore                 # Docker ignore rules
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Development stack with PostgreSQL/Redis
├── package.json                  # Full dependency list with scripts
├── tsconfig.json                 # TypeScript configuration
├── bun.lockb                     # Dependency lock file
├── dev.db                        # SQLite database file
├── .gitignore                    # Git ignore rules
├── README.md                     # Comprehensive documentation
├── CLAUDE.md                     # Memory Bank guidelines
├── GEMINI.md                     # Memory Bank guidelines
└── LICENSE                       # MIT License
```

### Target Structure (From Brief.md)

```
hono-skeleton/
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations
├── src/
│   ├── app.ts                      # Hono app and route registration
│   ├── server.ts                   # Server startup
│   ├── domain/                     # Domain models and interfaces
│   ├── repository/                 # Database repositories
│   ├── usecase/                    # Business logic services
│   ├── handler/                    # HTTP handlers
│   ├── routes/                     # Route definitions
│   ├── infrastructure/             # DB connections, config, middleware
│   └── tests/                      # Unit and integration tests
├── .env.example                    # Environment template
├── Dockerfile                      # Container configuration
├── docker-compose.yml              # Local development stack
└── [existing files...]
```

## Key Architectural Decisions

### 1. Runtime & Framework Choice

- **Bun Runtime**: Fast JavaScript runtime with built-in bundler, test runner, and package manager
- **Hono.js**: Lightweight, fast web framework with excellent TypeScript support
- **TypeScript**: Strong typing throughout the application

### 2. Data Layer Strategy

- **Prisma ORM**: Type-safe database client with migrations
- **Repository Pattern**: Abstraction layer over data access
- **Database Agnostic**: Can work with PostgreSQL, MySQL, SQLite

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
- Response formatting in handlers

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

- **Unit Tests**: Individual layer testing
- **Integration Tests**: Cross-layer functionality
- **API Tests**: End-to-end request/response cycles
- **Bun Test Runner**: Native testing framework
