# syntax=docker/dockerfile:1

# Builds the NestJS API out of the pnpm workspace. Run from the repo root:
#   docker build -f apps/api/Dockerfile -t long-run-api .

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- deps: full workspace deps, needed to build ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

# ---- build: compile shared first, then the api (which depends on it) ----
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @long-run/shared build && pnpm --filter api build

# ---- prod-deps: production-only deps, same workspace shape ----
FROM base AS prod-deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile --prod

# ---- runtime ----
FROM base AS runtime
ENV NODE_ENV=production

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=prod-deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY package.json pnpm-workspace.yaml ./

EXPOSE 3000
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
