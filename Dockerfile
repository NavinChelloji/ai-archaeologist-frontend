# Built from the repository root: `docker build -f apps/ai-archaeologist-frontend/Dockerfile .`
# Same turbo prune pattern as the backend services
# (WORKSPACE_AND_PACKAGE_STRATEGY.md). This is CODEBASE.md's `web`
# deployable. The runtime stage serves the built SPA with server.mjs,
# which also answers /health/live and /health/ready.

FROM node:20-slim AS base
RUN corepack enable && npm install -g turbo@^2.3.3
WORKDIR /repo

FROM base AS pruner
COPY . .
RUN turbo prune @aca/ai-archaeologist-frontend --docker

FROM base AS installer
COPY --from=pruner /repo/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /repo/out/full/ .
RUN pnpm turbo run build --filter=@aca/ai-archaeologist-frontend

FROM node:20-slim AS runner
WORKDIR /repo
RUN groupadd --system --gid 1001 aca && useradd --system --uid 1001 --gid aca aca
COPY --from=installer /repo/apps/ai-archaeologist-frontend/dist ./apps/ai-archaeologist-frontend/dist
COPY --from=installer /repo/apps/ai-archaeologist-frontend/server.mjs ./apps/ai-archaeologist-frontend/server.mjs
USER aca
ENV NODE_ENV=production
EXPOSE 5173
CMD ["node", "apps/ai-archaeologist-frontend/server.mjs"]
