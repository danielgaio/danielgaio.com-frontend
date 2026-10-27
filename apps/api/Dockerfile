# Build from the repository root:
# docker build -f apps/api/Dockerfile -t danielgaio-api .
FROM node:24-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
RUN npm install --global pnpm@12.15.0

FROM base AS build
WORKDIR /workspace
COPY . .
RUN pnpm --filter @danielgaio/api... install --frozen-lockfile
RUN pnpm --filter @danielgaio/api build

FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3001
WORKDIR /workspace/apps/api
# Preserve pnpm's workspace-relative links, including the generated Prisma client.
COPY --from=build --chown=node:node /workspace/node_modules /workspace/node_modules
COPY --from=build --chown=node:node /workspace/apps/api /workspace/apps/api
USER node
EXPOSE 3001
CMD ["node", "dist/main.js"]
