FROM node:24-bookworm-slim AS builder
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm install --global pnpm@12.15.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/package.json
RUN pnpm --filter @danielgaio/web install --frozen-lockfile
COPY apps/web ./apps/web
COPY content ./content
ARG NEXT_PUBLIC_MEASUREMENT_ID
ENV NEXT_PUBLIC_MEASUREMENT_ID=$NEXT_PUBLIC_MEASUREMENT_ID
RUN pnpm --filter @danielgaio/web build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=node:node /workspace/apps/web/out ./out
COPY --chown=node:node apps/web/scripts/serve-static.mjs ./scripts/serve-static.mjs
USER node
EXPOSE 3000
CMD ["node", "scripts/serve-static.mjs"]
