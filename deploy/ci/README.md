# CI/CD Authentication Setup

GitHub Actions authenticates to OpenShift using dedicated ServiceAccount tokens, one per namespace:

| Service Account | Namespace | Used By |
|----------------|-----------|---------|
| `github-actions-staging` | `staging` | Deploy: Staging |
| `github-actions-portal` | `portal` | Deploy: Production |

## Setup

### 1. Create ServiceAccounts and RBAC

```bash
oc apply -f deploy/ci/service-account.yaml
```

This creates:
- `github-actions-staging` ServiceAccount in `staging` namespace
- `github-actions-portal` ServiceAccount in `portal` namespace
- `github-actions-deploy` ClusterRole with deploy permissions
- RoleBindings scoping each SA to its own namespace

### 2. Generate Tokens (3-month expiry)

```bash
# Staging token
oc create token github-actions-staging -n staging --duration=2190h

# Production token
oc create token github-actions-portal -n portal --duration=2190h
```

### 3. Configure GitHub Secrets

| Secret | Value |
|--------|-------|
| `OPENSHIFT_SERVER` | `https://api.prod.openshiftpartnerlabs.com:6443` |
| `OPENSHIFT_TOKEN_STAGING` | Token for `github-actions-staging` |
| `OPENSHIFT_TOKEN_STAGING_EXPIRY` | ISO date when staging token expires (e.g., `2026-07-07`) |
| `OPENSHIFT_TOKEN_PORTAL` | Token for `github-actions-portal` |
| `OPENSHIFT_TOKEN_PORTAL_EXPIRY` | ISO date when portal token expires (e.g., `2026-07-07`) |

### 4. Configure GitHub Environments

Settings → Environments:
- `staging` — optional protection rules
- `production` — add required reviewers for approval gate

## Token Expiry Monitoring

The `check-token-expiry.yml` workflow runs monthly and creates a GitHub issue (labelled
`token-expiry-staging` or `token-expiry-portal`) 30 days before either token expires.

## Token Rotation

Every 3 months, rotate each token:

```bash
# Rotate staging token
oc create token github-actions-staging -n staging --duration=2190h
# → update OPENSHIFT_TOKEN_STAGING and OPENSHIFT_TOKEN_STAGING_EXPIRY in GitHub

# Rotate portal token
oc create token github-actions-portal -n portal --duration=2190h
# → update OPENSHIFT_TOKEN_PORTAL and OPENSHIFT_TOKEN_PORTAL_EXPIRY in GitHub
```
