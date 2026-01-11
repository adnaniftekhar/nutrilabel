# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy entire standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Find and copy the app directory contents to root
# In Cloud Build, structure is: standalone/app/
RUN if [ -d "./app" ] && [ -f "./app/server.js" ]; then \
      cp -r ./app/* . && \
      cp -r ./app/.next . 2>/dev/null || true; \
    else \
      find . -type d -name "app" -mindepth 1 | head -1 | xargs -I {} sh -c 'cp -r {}/* . 2>/dev/null || true'; \
    fi

# Copy static files and public directory
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Use shell form to read PORT env var
CMD ["sh", "-c", "node server.js -p ${PORT}"]
