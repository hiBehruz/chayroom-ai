# syntax=docker/dockerfile:1

# Base image with pnpm matching packageManager in package.json
FROM node:20-alpine AS base
RUN npm install -g pnpm@10.33.4
WORKDIR /app

# Install deps + copy source (shared by build and migrations)
FROM base AS source
COPY . .
RUN pnpm install --frozen-lockfile

# Production build -> .output
FROM source AS build
# Bake the redis cache driver into the build. nuxt.config picks the storage
# driver at build time via `process.env.REDIS_URL ? 'redis' : 'memory'`, so
# REDIS_URL must be present here or the prod bundle silently uses in-memory cache.
ENV REDIS_URL=redis://redis:6379
RUN pnpm build

# Minimal runtime image — only the built server output
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NITRO_HOST=0.0.0.0 \
    NITRO_PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]


