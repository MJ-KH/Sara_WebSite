# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_CONFIG_PATH=src/payload.config.ts
# مقادیر ساختگی فقط برای عبور از مرحله build (به دیتابیس واقعی وصل نمی‌شود مگر در import سطح ماژول)
ENV DATABASE_URI=postgres://build:build@localhost:5432/build_only
ENV PAYLOAD_SECRET=build-time-placeholder-secret-not-used-at-runtime
ENV STUDENT_JWT_SECRET=build-time-placeholder-secret-not-used-at-runtime
# این‌ها در next.config.ts در زمان build خوانده می‌شوند (next/image remotePatterns) — برای
# استقرار واقعی حتماً به مقدار واقعی S3/CDN تولید ست شوند، نه مقدار پیش‌فرض MinIO محلی.
ARG NEXT_PUBLIC_SERVER_URL=http://localhost:3000
ARG S3_PUBLIC_URL_PROTOCOL=http
ARG S3_PUBLIC_URL_HOSTNAME=localhost
ARG S3_PUBLIC_URL_PORT=9000
ENV NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
ENV S3_PUBLIC_URL_PROTOCOL=${S3_PUBLIC_URL_PROTOCOL}
ENV S3_PUBLIC_URL_HOSTNAME=${S3_PUBLIC_URL_HOSTNAME}
ENV S3_PUBLIC_URL_PORT=${S3_PUBLIC_URL_PORT}
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PAYLOAD_CONFIG_PATH=src/payload.config.ts
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3000
CMD ["sh", "-c", "npx payload migrate && npm run start"]
