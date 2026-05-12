FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# Install dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# Build TypeScript
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:ts

# Production image
FROM base AS runner
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./
EXPOSE 5000
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "--import", "./dist/instrumentation.js", "./dist/server.js"]
