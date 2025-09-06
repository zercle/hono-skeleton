# Use the official Bun image as the base image
FROM oven/bun:1 AS base
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 bunjs

# Dependencies stage
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile --production

# Development dependencies stage
FROM base AS deps-dev
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build stage
FROM deps-dev AS build
COPY . .
RUN bun run type-check
RUN bun run build

# Production stage
FROM base AS runtime

# Install dumb-init for proper signal handling
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=build --chown=bunjs:bunjs /app/dist ./dist
COPY --from=deps --chown=bunjs:bunjs /app/node_modules ./node_modules
COPY --from=build --chown=bunjs:bunjs /app/package.json ./

# Create necessary directories
RUN mkdir -p /app/uploads && chown -R bunjs:bunjs /app/uploads
RUN mkdir -p /app/logs && chown -R bunjs:bunjs /app/logs

# Switch to non-root user
USER bunjs

# Expose the port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun --version || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["bun", "run", "start"]