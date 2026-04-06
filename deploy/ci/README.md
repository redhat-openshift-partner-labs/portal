# CI/CD Authentication Setup

GitHub Actions authenticates to OpenShift using ServiceAccount tokens.

## Setup

### 1. Create ServiceAccounts and RBAC

```bash
oc apply -f service-account.yaml
```

Or manually:

```bash
# Create ServiceAccounts
oc create sa github-actions -n staging
oc create sa github-actions -n portal

# Grant permissions
oc adm policy add-role-to-user edit -z github-actions -n staging
oc adm policy add-role-to-user edit -z github-actions -n portal
```

### 2. Generate Token (3-month expiry)

```bash
oc create token github-actions -n staging --duration=2190h
```

### 3. Configure GitHub Secrets

| Secret | Value |
|--------|-------|
| `OPENSHIFT_SERVER` | `https://api.prod.openshiftpartnerlabs.com:6443` |
| `OPENSHIFT_TOKEN` | Token from step 2 |
| `OPENSHIFT_TOKEN_EXPIRY` | ISO date when token expires (e.g., `2026-07-05`) |

### 4. Configure GitHub Environments (optional)

Settings → Environments:
- `staging` - optional protection rules
- `production` - add required reviewers for approval gate

## Token Expiry Monitoring

The `check-token-expiry.yml` workflow runs monthly and creates a GitHub issue 30 days before token expiration.

## Token Rotation

Every 3 months:

1. Generate new token:
   ```bash
   oc create token github-actions -n staging --duration=2190h
   ```

2. Update GitHub Secret `OPENSHIFT_TOKEN`

3. Update GitHub Secret `OPENSHIFT_TOKEN_EXPIRY` with new date
