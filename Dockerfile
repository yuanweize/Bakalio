FROM node:24.22.1-bookworm-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY app/.wasp/out/src ./src
COPY app/.wasp/out/package*.json ./
COPY app/.wasp/out/tsconfig*.json ./
COPY app/.wasp/out/server .wasp/out/server
COPY app/.wasp/out/sdk .wasp/out/sdk
COPY app/.wasp/out/types .wasp/out/types
COPY app/.wasp/out/libs .wasp/out/libs
COPY app/.wasp/out/db .wasp/out/db
RUN npm ci
RUN cd .wasp/out/server && npx prisma generate --schema=../db/schema.prisma && npm run bundle
FROM node:24.22.1-bookworm-slim AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production PORT=4311
EXPOSE 4311
WORKDIR /app/.wasp/out/server
CMD ["npm","run","start-production"]
