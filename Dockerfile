# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner - SIMPLIFIED - just copy everything to test
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy entire standalone directory to see what we get
COPY --from=builder /app/.next/standalone ./

# List what we have (for debugging)
RUN ls -la && echo "---" && find . -name "server.js" -type f

USER 1001
EXPOSE 8080
ENV PORT=8080
CMD ["sh", "-c", "SERVER_FILE=$(find . -name server.js -type f | head -1) && node $SERVER_FILE -p ${PORT}"]
