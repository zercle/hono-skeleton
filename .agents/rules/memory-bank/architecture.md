# System Architecture

## Architectural Pattern
**Domain-Driven Clean Architecture** with mono-repo structure. Each domain contains a complete Clean Architecture implementation following SOLID principles with strict domain isolation.

## Project Structure
```
.
├── src/
│   ├── app.ts                    # Hono app setup and middleware registration
│   ├── server.ts                 # Entry point and server startup
│   ├── domains/                  # Business domains (isolated modules)
│   │   ├── auth/                 # Authentication domain
│   │   │   ├── entities/         # Business entities (User, Token, etc.)
│   │   │   ├── usecases/         # Business logic interfaces & implementations
│   │   │   ├── repositories/     # Data access layer interfaces & implementations
│   │   │   ├── handlers/         # HTTP request handlers (controllers)
│   │   │   ├── routes/           # Route definitions with OpenAPI specs
│   │   │   ├── models/           # Zod validation schemas
│   │   │   └── tests/            # Domain-specific tests
│   │   ├── posts/                # Posts domain (example)
│   │   │   └── [same structure as auth]
│   │   └── [other domains]/      # Additional business domains
│   ├── infrastructure/           # Shared infrastructure concerns
│   │   ├── database/             # Database connection, migrations, schemas
│   │   ├── middleware/           # Common middleware (auth, cors, logging)
│   │   └── config/               # Environment and app configuration
│   └── shared/                   # Shared utilities and types
│       ├── types/                # Common TypeScript types
│       ├── utils/                # Utility functions
│       └── container/            # Dependency injection container setup
├── drizzle/                      # Database migrations and seeds
├── docs/                         # OpenAPI documentation generation
├── config/                       # Configuration files (YAML format)
│   ├── development.yaml          # Development environment config
│   ├── production.yaml           # Production environment config
│   └── test.yaml                 # Test environment config
├── .github/workflows/            # CI/CD pipeline definitions
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── drizzle.config.ts             # Database ORM configuration
└── compose.yml            # Local development environment
```

## Domain Architecture (Clean Architecture)
Each domain follows this layered structure:

### 1. Entities Layer (`entities/`)
- Core business objects with essential properties and methods
- Independent of external concerns (database, HTTP, etc.)
- Example: `User`, `Post`, `Comment`

### 2. Use Cases Layer (`usecases/`)
- Application business logic
- Interfaces define contracts, implementations contain logic
- Depends only on entities, not on external layers
- Example: `CreateUserUseCase`, `AuthenticateUserUseCase`

### 3. Repository Layer (`repositories/`)
- Data persistence abstraction
- Interfaces define data access contracts
- Implementations handle database operations using Drizzle ORM
- Example: `UserRepository`, `PostRepository`

### 4. Handlers Layer (`handlers/`)
- HTTP request/response handling (controllers)
- Input validation using Zod schemas
- Calls use cases and formats responses
- Returns JSend-formatted JSON responses

### 5. Routes Layer (`routes/`)
- HTTP route definitions
- OpenAPI/Swagger documentation
- Middleware application (auth, validation)
- Route-to-handler mapping

### 6. Models Layer (`models/`)
- Zod validation schemas for input/output
- Request/response type definitions
- Data transformation utilities

## Key Architectural Patterns

### Dependency Injection
- **Container**: TSyringe handles DI container registration
- **Registration**: Located in `src/shared/container/`
- **Pattern**: Constructor injection with interface dependencies
- **Benefits**: Testability, loose coupling, easy mocking

### Repository Pattern
- **Interface**: Abstract data access in use cases
- **Implementation**: Concrete database operations
- **Benefits**: Database-agnostic business logic, easy testing

### Ports and Adapters
- **Ports**: Define interfaces for all external dependencies (database repositories, message brokers, cache, HTTP clients, external APIs)
- **Adapters**: Provide multiple implementations per port:
  - Production adapters (e.g., Drizzle + PostgreSQL)
  - In-memory/fake adapters for tests and local development
- **DI-Driven Swapping**: Adapters are registered in the DI container; tests can override bindings to use in-memory adapters without touching production code
- **Outcome**: Business logic and handlers are fully testable without any real data access or network calls

### Use Case Pattern
- **Single Responsibility**: Each use case handles one business operation
- **Interface Segregation**: Clean contracts between layers
- **Benefits**: Focused business logic, easy testing, clear boundaries

### Domain Isolation
- **Independence**: Domains don't directly depend on each other
- **Communication**: Through shared interfaces if needed
- **Benefits**: Team scalability, maintainability, testability

## Data Flow
1. **Request**: HTTP request hits Hono.js router
2. **Routing**: Route maps to appropriate domain handler
3. **Validation**: Zod schema validates input data
4. **Handler**: Formats request and calls use case
5. **Use Case**: Executes business logic, calls repository if needed
6. **Repository**: Performs database operations via Drizzle ORM
7. **Response**: Handler formats response as JSend JSON
8. **Middleware**: Applied for cross-cutting concerns (auth, logging, CORS)

## Database Architecture
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL for production reliability
- **Migrations**: Versioned schema changes in `drizzle/` directory
- **Connection**: Shared connection pool in `src/infrastructure/database/`
- **Schema**: Table definitions co-located with domain repositories

## Configuration Loading Strategy
- **Priority Order**: Runtime environment variables > .env files > YAML config files
- **YAML Files**: Located in `./config/<environment>.yaml` (e.g., `development.yaml`, `production.yaml`)
- **Environment Detection**: Uses NODE_ENV to determine which YAML file to load
- **Local Override**: `.env` file overrides YAML settings for local development
- **Runtime Override**: Environment variables have final say for deployment flexibility
- **Validation**: All configuration sources validated through Zod schemas
- **Hot Reload**: Configuration changes require application restart

## Security Architecture
- **Authentication**: JWT tokens with Hono JWT middleware
- **Authorization**: Route-level and handler-level guards
- **Validation**: Zod schemas prevent injection attacks
- **CORS**: Configurable origins in middleware
- **Environment**: Secrets managed via environment variables
- **Hashing**: Bcrypt for password hashing

## Testing Architecture
- **Unit Tests**: Per domain in `tests/` directories
- **Integration Tests**: Database and HTTP integration testing
- **Test Runner**: Bun test with Vitest compatibility
- **Mocking**: Easy mocking due to dependency injection
- **Coverage**: Tracked per domain and overall

## Deployment Architecture
- **Runtime**: Bun for fast startup and execution
- **Containerization**: Docker with multi-stage builds
- **Environment**: Environment-specific configuration
- **Process**: PM2 or systemd for process management
- **Monitoring**: Health checks and logging endpoints

## Runtime Lifecycle and Graceful Shutdown
- **Signals**: Listen for SIGINT and SIGTERM to initiate shutdown
- **Readiness/Liveness**:
  - Set readiness to unhealthy immediately on shutdown start to stop new traffic
  - Keep liveness healthy during drain period to avoid hard restarts
- **Connection Drain**:
  - Stop accepting new connections and allow in-flight requests to complete within a configurable timeout
  - After timeout, force-close with clear structured logs
- **Resource Cleanup**:
  - Close database pools and other outbound clients (e.g., cache, queues)
  - Flush logs and metrics before exit
- **Configuration**:
  - Grace period and timeouts are configurable via environment/config files
  - Lifecycle wiring concentrated in entrypoint ([`src/server.ts`](src/server.ts)) and infrastructure close handlers ([`src/infrastructure/database/connection.ts`](src/infrastructure/database/connection.ts))