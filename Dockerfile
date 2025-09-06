# Use Bun as the base image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies into temp directory
FROM base AS deps
COPY package.json bun.lock* ./
COPY packages/api/package.json ./packages/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
COPY tsconfig.base.json ./
RUN bun install --frozen-lockfile

# Build the application
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Final runtime image
FROM oven/bun:1-slim AS runtime
WORKDIR /app

# Copy the built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/packages/api/config ./packages/api/config
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 hono
USER hono

EXPOSE 3000

CMD ["bun", "dist/server.js"]