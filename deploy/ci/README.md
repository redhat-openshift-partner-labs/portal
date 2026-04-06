# CI/CD Authentication Setup

GitHub Actions needs to authenticate to OpenShift for deployments. This document covers the setup options.

## Options

| Option | Complexity | Token Management | Security |
|--------|-----------|------------------|----------|
| [Keycloak Token Exchange](#option-1-keycloak-token-exchange) | Medium | None (OIDC) | High |
| [ServiceAccount + Expiry Alert](#option-2-serviceaccount-with-expiry-alert) | Low | Annual renewal | Medium |

---

## Option 1: Keycloak Token Exchange

Uses Keycloak to exchange GitHub OIDC tokens for OpenShift-compatible tokens. No long-lived secrets to manage.

### Keycloak Configuration

1. **Create Identity Provider for GitHub Actions**

   In Keycloak Admin Console → Identity Providers → Add provider → OpenID Connect v1.0:

   | Setting | Value |
   |---------|-------|
   | Alias | `github-actions` |
   | Display Name | `GitHub Actions` |
   | Discovery URL | `https://token.actions.githubusercontent.com/.well-known/openid-configuration` |
   | Client ID | `keycloak` (or any identifier) |
   | Client Authentication | Off (GitHub OIDC is public) |
   | Validate Signatures | On |
   | Use JWKS URL | On |

2. **Create Client for Token Exchange**

   Clients → Create client:

   | Setting | Value |
   |---------|-------|
   | Client ID | `github-actions-openshift` |
   | Client Authentication | On |
   | Authentication flow | Service accounts roles, Standard flow (off) |

   After creation, go to Service Account Roles → Assign role → `token-exchange`

3. **Configure Token Exchange Permission**

   Clients → `github-actions-openshift` → Authorization → Policies:
   
   Create a client policy allowing token exchange from the GitHub Actions IdP.

4. **Create Mapper for OpenShift Groups**

   Identity Providers → `github-actions` → Mappers → Add mapper:

   | Setting | Value |
   |---------|-------|
   | Name | `github-repo-to-group` |
   | Mapper Type | Hardcoded Group |
   | Group | `github-actions-deployers` |

### OpenShift Configuration

```bash
# Create group that maps to Keycloak group
oc adm groups new github-actions-deployers

# Bind deployer role to the group
oc adm policy add-role-to-group github-actions-deployer github-actions-deployers -n staging
oc adm policy add-role-to-group github-actions-deployer github-actions-deployers -n portal
```

### Workflow Configuration

The workflows use a two-step auth process:
1. Get GitHub OIDC token
2. Exchange it via Keycloak for an OpenShift token

GitHub Secrets required:
- `KEYCLOAK_URL` - e.g., `https://keycloak.example.com`
- `KEYCLOAK_REALM` - e.g., `openshift`
- `KEYCLOAK_CLIENT_ID` - `github-actions-openshift`
- `KEYCLOAK_CLIENT_SECRET` - From Keycloak client credentials
- `OPENSHIFT_SERVER` - e.g., `https://api.cluster.example.com:6443`

---

## Option 2: ServiceAccount with Expiry Alert

Uses traditional ServiceAccount tokens with a workflow that alerts before expiry.

### Setup

```bash
# Apply RBAC
oc apply -f service-account.yaml

# Generate 1-year token
oc create token github-actions -n staging --duration=8760h > token.txt

# Add to GitHub Secrets as OPENSHIFT_TOKEN
```

### Expiry Monitoring

The `check-token-expiry.yml` workflow runs monthly and creates an issue 30 days before token expiration.

GitHub Secrets required:
- `OPENSHIFT_SERVER`
- `OPENSHIFT_TOKEN`
- `OPENSHIFT_TOKEN_EXPIRY` - ISO date when token expires (e.g., `2027-04-05`)

---

## Recommended Approach

**Use Option 1 (Keycloak)** if:
- You want zero token management
- You need audit trails for CI/CD authentication
- You want to restrict deployments to specific repos/branches

**Use Option 2 (ServiceAccount)** if:
- You want simpler setup
- Annual token rotation is acceptable
- Keycloak configuration access is limited
