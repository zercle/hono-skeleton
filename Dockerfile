# syntax=docker/dockerfile:1.4
# Dockerfile for the Hono.js backend application
FROM oven/bun:latest AS base

# Install dependencies and build the application
FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

FROM deps AS builder
WORKDIR /app
COPY . .
RUN bun prisma generate
RUN bun run build # Assuming a build script will be added to package.json

# Production stage
FROM oven/bun:latest AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bunuser
USER bunuser

# Copy necessary files from the builder stage
COPY --from=builder --chown=bunuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=bunuser:nodejs /app/bun.lockb ./bun.lockb
COPY --from=builder --chown=bunuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=bunuser:nodejs /app/dist ./dist
COPY --from=builder --chown=bunuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=bunuser:nodejs /app/.env.example ./ # Copy .env.example for reference, actual .env will be mounted

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Run the application
CMD ["bun", "run", "dist/index.js"] # Assuming build output is dist/index.js