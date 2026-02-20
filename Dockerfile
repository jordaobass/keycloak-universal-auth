# Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY tsconfig.json vite.config.ts vitest.config.ts ./
COPY src/ src/
COPY tests/ tests/

RUN npm run build

# Testes
FROM build AS test

RUN npm run test

# Artefatos de produção
FROM node:22-alpine AS production

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json .
COPY --from=build /app/README.md* .
COPY --from=build /app/LICENSE .

RUN test -f package.json || exit 1
RUN test -d dist || exit 1
