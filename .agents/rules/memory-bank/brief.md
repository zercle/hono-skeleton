# Hono Backend Mono-Repo Template (Bun Runtime)

## Architecture
**Domain-Driven Clean Architecture** with mono-repo structure. Each domain contains complete Clean Architecture implementation with SOLID principles and domain isolation, powered by Hono.js and Bun runtime.

## Key Tools & Libraries
- **Runtime:** Bun (fast JavaScript runtime)
- **HTTP Framework:** Hono.js
- **DI:** TSyringe (TypeScript DI container)
- **Config:** YAML files + .env + environment validation (hierarchical loading)
- **Database:** Drizzle ORM + PostgreSQL
- **Migrations:** Drizzle migrations
- **JSON Format:** JSend standard
- **Auth:** Hono JWT middleware
- **UUID:** UUIDv7 (index-friendly)
- **Validation:** Zod schemas
- **Testing:** Bun test + Vitest
- **Hot Reload:** Built-in Bun --watch
- **Docs:** Hono OpenAPI + Swagger UI

## Project Structure
```
.
├── src/
│   ├── app.ts                  # Hono app setup
│   ├── server.ts               # Entry point
│   ├── domains/                # Domain modules
│   │   ├── auth/               # Complete domain
│   │   │   ├── entities/
│   │   │   ├── usecases/
│   │   │   ├── repositories/
│   │   │   ├── handlers/
│   │   │   ├── routes/
│   │   │   ├── models/
│   │   │   └── tests/
│   │   └── posts/              # Another domain
│   ├── infrastructure/         # Shared infra
│   │   ├── database/
│   │   ├── middleware/
│   │   └── config/
│   └── shared/                 # Shared components
│       ├── types/
│       ├── utils/
│       └── container/
├── drizzle/                    # Database migrations
├── docs/                       # OpenAPI docs
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── compose.yml
```

## Quick Start
```bash
# Initialize
bun init
bun add hono drizzle-orm postgres zod tsyringe

# Setup configuration
cp .env.example .env
# Create environment-specific config
mkdir -p config
cp config/development.yaml.example config/development.yaml

# Run migrations
bun run db:migrate

# Start server
bun run dev
# Or with hot reload (default)
bun --watch src/server.ts
```

## Adding New Domain
1. Create directory structure:
   ```bash
   mkdir -p src/domains/{domain}/{entities,usecases,repositories,handlers,routes,models,tests}
   ```
2. Define entity with UUIDv7
3. Create Zod schemas (validation models)
4. Implement repository interface & implementation
5. Implement usecase interface & implementation
6. Create Hono handlers
7. Define routes with OpenAPI
8. Register dependencies in DI container
9. Write Bun tests
10. Generate OpenAPI docs

## Development Commands
```bash
# Development
bun run dev                     # Hot reload enabled
bun --watch src/server.ts

# Database
bun run db:generate            # Generate migrations
bun run db:migrate             # Run migrations
bun run db:seed                # Seed database

# Testing
bun test
bun test --watch

# Linting
bun run lint
bun run format

# Build
bun run build
bun run start                  # Production
```

## Package.json Scripts
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
    "format": "prettier --write src/**/*.ts"
  }
}
```

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
    "uuidv7": "^0.6.0"
  },
  "devDependencies": {
    "bun-types": "latest",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "drizzle-kit": "^0.20.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

## Configuration Files
```yaml
# config/development.yaml
server:
  port: 3000
  host: 0.0.0.0
database:
  url: postgres://user:pass@localhost:5432/db
auth:
  jwt:
    expiresIn: 24h
cors:
  origins: ["http://localhost:3000"]
```

```env
# .env (local overrides)
PORT=3001
JWT_SECRET=your-secret-key
DB_URL=postgres://user:pass@localhost:5432/local_db
```

## Example Domain Implementation
```typescript
// Entity
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Zod Schema
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

// Hono Handler
export const authHandler = new Hono()
  .post('/register', async (c) => {
    const body = await c.req.json();
    const validated = CreateUserSchema.parse(body);
    // Implementation
  })
  .post('/login', async (c) => {
    // Implementation
  });
```

## Docker Setup
```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .
EXPOSE 3000
CMD ["bun", "dist/server.js"]
```