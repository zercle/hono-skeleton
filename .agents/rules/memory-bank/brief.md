# Hono.js Backend Boilerplate Template (Bun Runtime)

## 1. Introduction

This document provides a standardized template for initializing new backend projects using **Hono.js** on the **Bun** runtime and package manager. The boilerplate follows **Clean Architecture** and **SOLID principles** to offer a scalable and maintainable foundation for backend systems.

**Purpose:** Streamline project setup and enforce consistency across backend codebases with Bun-powered Hono.js applications.

---

## 2. Core Principles & Architecture

The boilerplate adopts a domain-driven Clean Architecture approach to decouple business logic from infrastructure concerns.

### Layered Architecture

- **Presentation/API Layer** (`src/app.ts`, `src/routes/`): Handles HTTP requests and routing with Hono.js.
- **Handler Layer** (`src/handler/`): Validates requests, invokes use cases, and formats HTTP responses.
- **Use Case/Service Layer** (`src/usecase/`): Contains business rules and orchestrates repository interactions.
- **Domain Layer** (`src/domain/`): Defines domain models and interfaces.
- **Repository/Infrastructure Layer** (`src/repository/`): Implements data persistence using Prisma ORM.
- **Shared Infrastructure** (`src/infrastructure/`): Contains shared components like database connection, configuration, and middleware.

### Key Tools & Libraries

| Feature               | Tool / Library                       |
| --------------------- | ------------------------------------ |
| HTTP Framework        | Hono.js                              |
| Dependency Injection  | tsyringe                             |
| Database ORM          | Prisma                               |
| Configuration         | dotenv                               |
| Migrations            | Prisma Migrate                       |
| JWT Authentication    | jsonwebtoken                         |
| UUID Generation       | uuid npm package                     |
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

## 4. Project Structure Overview

```
.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts              # Hono app and route registration
│   ├── server.ts           # Server startup
│   ├── domain/             # Domain models and interfaces
│   ├── repository/         # Database repositories
│   ├── usecase/            # Business logic services
│   ├── handler/            # HTTP handlers
│   ├── routes/             # Route definitions
│   ├── infrastructure/     # DB connections, config, middleware
│   └── tests/              # Unit and integration tests
├── .env.example
├── bun.lockb
├── package.json           # Optional if migrated from npm/yarn
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 5. Adding a New Domain

1. **Define DB Schema**

Add new models to `prisma/schema.prisma`, run migrations with Bun Prisma CLI.

2. **Implement Repository**

Create repository class in `src/repository/`.

3. **Implement Use Case**

Create business logic service in `src/usecase/`.

4. **Implement Handlers**

Create HTTP handlers in `src/handler/`.

5. **Define Routes**

Add routes in `src/routes/` and register them in `app.ts`.

6. **Register Dependencies**

Use `tsyringe` container to register new classes.

7. **Write Tests**

Use Bun's built-in test runner for unit and integration testing.

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
