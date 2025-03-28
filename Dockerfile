FROM node:20-alpine AS deps

WORKDIR /app
RUN corepack enable

COPY .npmrc package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

FROM deps AS build-stage

COPY . .

COPY --from=deps /app/node_modules /app/node_modules

RUN pnpm build

FROM deps AS development

COPY . .

EXPOSE 3000

CMD pnpm dev

# SSR
FROM node:20-alpine AS production-stage

WORKDIR /app

COPY --from=build-stage /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]

