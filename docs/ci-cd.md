# CI/CD Pipeline

> Continuous integration and deployment workflows for the Portal application

## Table of Contents

1. [Overview](#overview)
2. [Workflows](#workflows)
3. [Pipeline Architecture](#pipeline-architecture)
4. [PR Checks](#pr-checks)
5. [Creating Releases](#creating-releases)
6. [Local Testing](#local-testing)
7. [Configuration](#configuration)

## Overview

The CI/CD pipeline uses GitHub Actions to automate testing, building, and deployment. Workflows are designed to be composable - the CI workflow can be called by other workflows to avoid duplication.

## Workflows

| Workflow | File | Trigger | Purpose |
|----------|------|---------|---------|
| CI | `ci.yml` | PR to main | Lint, typecheck, test, build |
| Main | `main.yml` | Push to main | Post-merge validation (calls CI) |
| Release | `release.yml` | Tag push (`v*`) | Generate changelog, create GitHub release |
| Build Image | `build-image.yml` | Tag push (`v*`) | Build and push to Quay.io |
| Deploy Staging | `deploy-staging.yml` | Build Image completes | Deploy database, run migrations, deploy app, smoke tests |
| Deploy Prod | `deploy-prod.yml` | Manual or staging success | Deploy to OpenShift production |

## Pipeline Architecture

```mermaid
flowchart TB
    subgraph PR["Pull Request Phase"]
        direction TB
        Lint[Lint]
        Type[Type Check]
        Test[Test]
        Build[Build]
    end

    subgraph Merge["Post-Merge Phase"]
        Validate[Validate]
    end

    subgraph Release["Release Phase (tag push)"]
        Tag[Create Release]
        Image[Build Container]
    end

    subgraph Staging["Staging Deployment"]
        DB[Deploy PostgreSQL]
        App[Deploy App]
        Migrate[Run Migrations]
        Smoke[Smoke Tests]
    end

    subgraph Prod["Production Deployment"]
        ProdApp[Deploy App]
        Verify[Verify Health]
    end

    PR -->|merged| Merge
    Merge -->|tag created| Release
    Tag & Image -->|parallel| Release
    Image -->|completes| Staging
    DB --> App --> Migrate --> Smoke
    Smoke -->|pass| Prod
    ProdApp --> Verify
```

## PR Checks

The CI workflow runs four parallel jobs on every pull request:

### Lint

Runs ESLint to check code style and catch potential issues.

```bash
pnpm lint
```

### Type Check

Runs TypeScript compiler to verify type safety.

```bash
pnpm typecheck
```

### Test

Runs the Vitest test suite.

```bash
pnpm test
```

### Build

Verifies the application builds successfully for production.

```bash
pnpm build
```

### Concurrency

The workflow uses concurrency groups to cancel outdated runs when new commits are pushed to a PR:

```yaml
concurrency:
  group: ci-${{ github.head_ref || github.ref }}
  cancel-in-progress: true
```

## Creating Releases

To create a release, push a version tag:

```bash
# Update version in package.json, then:
git tag v1.0.0
git push origin v1.0.0
```

The release workflow will:
1. Generate a changelog from conventional commits using [git-cliff](https://git-cliff.org)
2. Create a GitHub release with the changelog as the body

Changelog categories are derived from commit prefixes (`feat:`, `fix:`, `docs:`, etc.).

## Local Testing

Workflows can be tested locally using [nektos/act](https://github.com/nektos/act), which runs GitHub Actions in Docker/Podman containers.

### Installation

```bash
# Fedora/RHEL
sudo dnf install act

# macOS
brew install act

# Other platforms: https://nektosact.com/installation/
```

### Usage

```bash
# List jobs for an event
act pull_request --list

# Run all jobs for pull_request event
act pull_request

# Run a specific job
act pull_request -j lint
act pull_request -j typecheck
act pull_request -j test
act pull_request -j build

# Run with verbose output
act pull_request -j lint -v
```

### Podman Configuration

If using Podman instead of Docker, act auto-detects the Podman socket. Ensure the Podman socket is running:

```bash
systemctl --user start podman.socket
```

### Limitations

- Some GitHub Actions features may not work identically in act
- Secrets must be provided via `.secrets` file or `-s` flag
- Caching behavior differs from GitHub-hosted runners

## Pre-Deployment Setup

Before the first deployment, set up the OpenShift environments. All sensitive values
are injected from GitHub secrets at deploy time — no secrets are stored in version control.

### Staging Environment

```bash
# Create staging namespace
oc new-project staging

# Apply CI service accounts and RBAC
oc apply -f deploy/ci/service-account.yaml

# Generate token for github-actions-staging (3-month expiry)
oc create token github-actions-staging -n staging --duration=2190h
```

The staging workflow automatically:
1. Deploys PostgreSQL from `deploy/datastore/overlays/staging/`
2. Configures database credentials from GitHub secrets
3. Creates `portal-secrets` from GitHub secrets
4. Configures route and URLs from GitHub secrets

### Production Environment

```bash
# Create production namespace
oc new-project portal

# Apply CI service accounts and RBAC (if not already applied)
oc apply -f deploy/ci/service-account.yaml

# Generate token for github-actions-portal (3-month expiry)
oc create token github-actions-portal -n portal --duration=2190h
```

Production uses an external database, so only the application is deployed.
All secrets are injected from GitHub secrets at deploy time.

### OIDC Provider Configuration

Add these redirect URIs to your identity provider:
- Staging: `https://<STAGING_URL>/api/auth/callback`
- Production: `https://<PROD_URL>/api/auth/callback`

### Seeding Test Data (Staging Only)

After initial deployment, optionally seed the staging database:

```bash
POD=$(oc get pod -l app=portal -n staging -o jsonpath='{.items[0].metadata.name}')
oc exec -n staging "$POD" -- npx tsx prisma/seed.postgresql.ts
```

## Configuration

### Required Secrets

Configure these secrets in GitHub repository settings.

#### Build Secrets

| Secret | Purpose | Example |
|--------|---------|---------|
| `QUAY_USERNAME` | Quay.io registry username | `myorg+robot` |
| `QUAY_PASSWORD` | Quay.io registry password | Robot account token |

#### OpenShift Connection

| Secret | Purpose | Example |
|--------|---------|---------|
| `OPENSHIFT_SERVER` | OpenShift API server URL | `https://api.mycluster.com:6443` |
| `OPENSHIFT_TOKEN_STAGING` | Token for `github-actions-staging` SA | From `oc create token github-actions-staging -n staging` |
| `OPENSHIFT_TOKEN_STAGING_EXPIRY` | Expiry date for staging token | `2026-07-07` |
| `OPENSHIFT_TOKEN_PORTAL` | Token for `github-actions-portal` SA | From `oc create token github-actions-portal -n portal` |
| `OPENSHIFT_TOKEN_PORTAL_EXPIRY` | Expiry date for portal token | `2026-07-07` |

#### Staging Environment Secrets

| Secret | Purpose | Example |
|--------|---------|---------|
| `STAGING_URL` | Route hostname | `portal-staging.apps.mycluster.com` |
| `STAGING_DB_NAME` | Database name | `portal_staging` |
| `STAGING_DB_USER` | Database username | `portal` |
| `STAGING_DB_PASSWORD` | Database password | Secure random string |
| `STAGING_OAUTH_CLIENT_ID` | OIDC client ID | From identity provider |
| `STAGING_OAUTH_CLIENT_SECRET` | OIDC client secret | From identity provider |
| `STAGING_OAUTH_AUTH_URL` | OIDC authorization endpoint | `https://idp.example.com/auth` |
| `STAGING_OAUTH_TOKEN_URL` | OIDC token endpoint | `https://idp.example.com/token` |
| `STAGING_AUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |

#### Production Environment Secrets

| Secret | Purpose | Example |
|--------|---------|---------|
| `PROD_URL` | Route hostname | `portal.apps.mycluster.com` |
| `PROD_DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `PROD_OAUTH_CLIENT_ID` | OIDC client ID | From identity provider |
| `PROD_OAUTH_CLIENT_SECRET` | OIDC client secret | From identity provider |
| `PROD_OAUTH_AUTH_URL` | OIDC authorization endpoint | `https://idp.example.com/auth` |
| `PROD_OAUTH_TOKEN_URL` | OIDC token endpoint | `https://idp.example.com/token` |
| `PROD_AUTH_SECRET` | JWT signing secret | `openssl rand -base64 32` |

> **Note:** Production uses a full `DATABASE_URL` instead of separate components because
> the production database is typically managed externally (e.g., RDS, Cloud SQL, managed PostgreSQL).

### Node.js Version

The CI uses Node.js version specified in `.nvmrc` (currently Node 22 LTS).

### Branch Protection

Recommended branch protection rules for `main`:

- Require pull request reviews
- Require status checks to pass (lint, typecheck, test, build)
- Require branches to be up to date
- Do not allow bypassing the above settings
