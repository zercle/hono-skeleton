# Hono.js Backend Mono-Repo Template (Bun Runtime)

## 1. Introduction

This document provides a standardized template for initializing new backend mono-repo projects using **Hono.js** on the **Bun** runtime and package manager. The boilerplate follows **Domain-Driven Clean Architecture** with each domain having its own complete Clean Architecture implementation within its domain package, promoting **SOLID principles** and domain isolation.

**Purpose:** Streamline mono-repo setup with domain-specific Clean Architecture, ensuring scalability, maintainability, and clear domain boundaries.

---

## 2. Core Principles & Architecture

The boilerplate adopts a **mono-repo with domain-specific Clean Architecture** approach where each domain is a complete, self-contained module with its own layered architecture.

### Mono-Repo Domain Architecture

Each domain package contains its complete Clean Architecture implementation:

- **Domain Package** (`src/domains/{domain}/`): Complete domain module
  - **Entities** (`entities/`): Core domain entities and value objects
  - **Use Cases** (`usecases/`): Domain-specific business logic
  - **Repositories** (`repositories/`): Domain data access interfaces and implementations  
  - **Handlers** (`handlers/`): Domain HTTP handlers
  - **Routes** (`routes/`): Domain-specific route definitions
  - **Models** (`models/`): DTOs and request/response models
  - **Tests** (`tests/`): Domain-specific tests

### Shared Infrastructure

- **Shared Infrastructure** (`src/shared/`): Cross-domain shared components
  - **Database** (`database/`): Prisma client and connection management
  - **Middleware** (`middleware/`): Authentication, validation, CORS
  - **Config** (`config/`): Application configuration
  - **Utils** (`utils/`): Shared utilities and helpers
  - **Types** (`types/`): Shared TypeScript types

### Key Tools & Libraries

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
| Testing               | Bun test runner                      |
| Linting & Formatting  | ESLint, Prettier                     |
| OpenAPI Documentation | swagger-jsdoc + swagger-ui-express   |

---

## 3. Getting Started: Project Initialization

### Prerequisites

- Bun runtime (https://bun.sh) installed
- Docker & Docker Compose
- Bun as package manager

### Initial Setup

1. **Initialize Project**

```bash
bun create hono@latest .
```

2. **Configure Environment**

Create `.env` and `.env.example` with database URL and other configs.

3. **Setup Database**

- Define schema in `prisma/schema.prisma`.
- Run migrations:

```bash
bun prisma migrate dev
bun prisma generate
```

4. **Create Application Structure**

Follow layered architecture folders under `src/`.

5. **Run Application**

```bash
bun run src/server.ts
```

---

## 4. Mono-Repo Project Structure Overview

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

---

## 5. Adding a New Domain (Mono-Repo Approach)

1. **Create Domain Directory Structure**

```bash
mkdir -p src/domains/{domain-name}/{entities,usecases,repositories,handlers,routes,models,tests}
mkdir -p src/domains/{domain-name}/usecases/interfaces
mkdir -p src/domains/{domain-name}/repositories/interfaces
```

2. **Define Domain Entity with UUIDv7**

Create entity in `src/domains/{domain}/entities/` with UUIDv7 ID:

```typescript
import { uuidv7 } from '../../shared/utils/uuid.util';

export interface DomainEntity {
  id: string;  // UUIDv7 for index-friendly ordering
  createdAt: Date;
  updatedAt: Date;
}
```

3. **Create Domain Models**

Define request/response DTOs in `src/domains/{domain}/models/`.

4. **Implement Repository Interface & Implementation**

- Interface in `src/domains/{domain}/repositories/interfaces/`
- Implementation in `src/domains/{domain}/repositories/`

5. **Implement Use Case Interface & Implementation**

- Interface in `src/domains/{domain}/usecases/interfaces/`
- Implementation in `src/domains/{domain}/usecases/`

6. **Implement Handlers**

Create HTTP handlers in `src/domains/{domain}/handlers/`.

7. **Define Routes**

Create routes in `src/domains/{domain}/routes/` and register in `app.ts`.

8. **Add Database Schema**

Add new models to `prisma/schema.prisma` with UUIDv7 default:

```prisma
model DomainModel {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  // ... other fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

9. **Register Dependencies**

Update `src/shared/container/di.container.ts` with new domain services.

10. **Write Domain Tests**

Create comprehensive tests in `src/domains/{domain}/tests/`.

---

## 6. Development Commands

- **Run development server**

```bash
bun run dev
```

- **Run database migrations**

```bash
bun prisma migrate dev
bun prisma generate
```

- **Run tests**

```bash
bun test
```

- **Lint and format**

```bash
bun run eslint .
bun run prettier --write .
```

## 7. Document

- bun: @https://bun.com/docs
- hono: @https://hono.dev/docs/
