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

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
# Next.js creates: .next/standalone/app/ (where app is the WORKDIR)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Find and move the app directory contents to root (if needed)
# Next.js standalone structure varies: sometimes ./app/, sometimes already in root
RUN if [ -f "./server.js" ]; then \
      echo "✅ server.js already in root, no move needed"; \
    elif [ -d "./app" ] && [ -f "./app/server.js" ]; then \
      echo "✅ Found ./app/server.js, moving to root"; \
      cp -r ./app/* . && \
      cp -r ./app/.next . 2>/dev/null || true; \
    else \
      APP_DIR=$(find . -type d -name "app" -mindepth 1 -maxdepth 3 | head -1); \
      if [ -n "$APP_DIR" ] && [ -f "$APP_DIR/server.js" ]; then \
        echo "✅ Found server.js in $APP_DIR, moving to root"; \
        cp -r "$APP_DIR"/* . && \
        cp -r "$APP_DIR"/.next . 2>/dev/null || true; \
      else \
        echo "ERROR: Could not find server.js"; \
        echo "Searching for server.js:"; \
        find . -name "server.js" -type f; \
        echo "Current directory contents:"; \
        ls -la; \
        exit 1; \
      fi; \
    fi

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "node server.js -p ${PORT}"]
