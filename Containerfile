# syntax=docker/dockerfile:1
# Multi-stage Containerfile for Nuxt 4 application on Red Hat UBI
#
# Build:
#   podman build -t portal:latest -f Containerfile .
#
# NOTE: On Fedora 42+ (kernel 6.19+), you may need additional security options
# due to glibc memory protection features:
#   podman build --security-opt seccomp=unconfined --security-opt label=disable \
#     -t portal:latest -f Containerfile .
#
# Run:
#   podman run -p 3000:3000 --env-file .env.production portal:latest

# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS deps

USER 0

# Install build tools for native modules (better-sqlite3)
RUN dnf install -y gcc-c++ make python3 && dnf clean all

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including devDependencies for build)
# Rebuild native modules for this platform
RUN pnpm install --frozen-lockfile

# =============================================================================
# Stage 2: Builder
# =============================================================================
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS builder

USER 0

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set dummy DATABASE_URL for build (PostgreSQL adapter selection)
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Generate Prisma client for PostgreSQL production
RUN pnpm db:pg:generate

# Build the Nuxt application
RUN pnpm build

# Deploy production dependencies to a clean flat node_modules (resolves pnpm symlinks)
# This ensures all transitive deps (e.g. @prisma/engines) are present without pnpm store tricks
RUN pnpm deploy --filter portal --prod /app/deploy

# =============================================================================
# Stage 3: Production
# =============================================================================
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest AS production

# Labels for OpenShift/Kubernetes
LABEL name="portal" \
      vendor="redhat" \
      version="1.0.0" \
      summary="UI Portal for OpenShift Partner Labs" \
      description="Nuxt 4 application with PostgreSQL backend" \
      io.k8s.display-name="portal" \
      io.k8s.description="Nuxt 4 application with PostgreSQL backend" \
      io.openshift.tags="nodejs,nuxt,vue"

# Run as non-root user (default UID 1001 in UBI Node images)
USER 1001

WORKDIR /app

# Copy the built application from builder stage
# Nuxt outputs a standalone server in .output
COPY --from=builder --chown=1001:0 /app/.output ./.output

# Copy Prisma schema files (needed for runtime client)
COPY --from=builder --chown=1001:0 /app/prisma/schema.postgresql.prisma ./prisma/
COPY --from=builder --chown=1001:0 /app/prisma/migrations-pg ./prisma/migrations-pg
COPY --from=builder --chown=1001:0 /app/prisma/seed.postgresql.ts ./prisma/

# Copy prisma config for potential runtime migrations
COPY --from=builder --chown=1001:0 /app/prisma.config.postgresql.ts ./

# Copy flat node_modules from pnpm deploy (includes prisma CLI + all transitive deps)
COPY --from=builder --chown=1001:0 /app/deploy/node_modules ./node_modules

# Environment variables
ENV NODE_ENV=production \
    NUXT_HOST=0.0.0.0 \
    NUXT_PORT=3000

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
