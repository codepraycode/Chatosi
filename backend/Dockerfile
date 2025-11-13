
FROM node:20-alpine AS builder


WORKDIR /app


RUN corepack enable && corepack prepare pnpm@latest --activate


COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build in use of typescript
# RUN pnpm build

# ---- Production stage ----
FROM node:20-alpine AS runner
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy only built code and node_modules
COPY --from=builder /app /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the app port
EXPOSE 8080

# Start command
CMD ["pnpm", "start"]
