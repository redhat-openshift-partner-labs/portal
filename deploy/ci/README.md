# CI/CD Authentication Setup

GitHub Actions needs to authenticate to OpenShift for deployments.

## Options

| Option | Complexity | Token Management | Security |
|--------|-----------|------------------|----------|
| [Keycloak Client Credentials](#option-1-keycloak-client-credentials) | Low | None (short-lived tokens) | High |
| [ServiceAccount + Expiry Alert](#option-2-serviceaccount-with-expiry-alert) | Low | Annual renewal | Medium |

---

## Option 1: Keycloak Client Credentials

Uses Keycloak client credentials to get short-lived tokens. No long-lived secrets to rotate.

### Keycloak Configuration

1. **Create Client**

   Clients → Create client:

   | Setting | Value |
   |---------|-------|
   | Client ID | `github-actions` |
   | Name | `GitHub Actions CI/CD` |

   Next page:
   
   | Setting | Value |
   |---------|-------|
   | Client authentication | On |
   | Authorization | Off |
   | Standard flow | Off |
   | Direct access grants | Off |
   | Service accounts roles | On |

2. **Get Client Secret**

   After creation: Clients → `github-actions` → Credentials → Copy **Client secret**

3. **Assign Roles**

   Clients → `github-actions` → Service account roles → Assign role:
   
   - Filter by clients → select roles that allow OpenShift access
   - Or assign a realm role that maps to OpenShift groups

4. **Configure OpenShift Group Mapping** (if using Keycloak for OpenShift auth)

   If OpenShift uses Keycloak for authentication, add a group mapper:
   
   Clients → `github-actions` → Client scopes → `github-actions-dedicated` → Add mapper:

   | Setting | Value |
   |---------|-------|
   | Mapper type | Hardcoded group |
   | Name | `deployer-group` |
   | Group | `/github-actions-deployers` |

### OpenShift Configuration

```bash
# If using Keycloak groups, create matching group and bind role
oc adm groups new github-actions-deployers
oc adm policy add-role-to-group edit github-actions-deployers -n staging
oc adm policy add-role-to-group edit github-actions-deployers -n portal

# Or apply the ServiceAccount RBAC (for token-based auth)
oc apply -f service-account.yaml
```

### GitHub Secrets

| Secret | Value |
|--------|-------|
| `KEYCLOAK_URL` | `https://your-keycloak.example.com` |
| `KEYCLOAK_REALM` | Your realm name (e.g., `openshift`) |
| `KEYCLOAK_CLIENT_ID` | `github-actions` |
| `KEYCLOAK_CLIENT_SECRET` | From step 2 |
| `OPENSHIFT_SERVER` | `https://api.cluster.example.com:6443` |

### How It Works

```
GitHub Actions                    Keycloak                      OpenShift
     |                               |                              |
     |-- client_credentials grant -->|                              |
     |<-- access_token --------------|                              |
     |                               |                              |
     |-- oc login --token=... ---------------------------------->  |
     |<-- authenticated session ----------------------------------|
```

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

### GitHub Secrets

| Secret | Value |
|--------|-------|
| `OPENSHIFT_SERVER` | `https://api.cluster.example.com:6443` |
| `OPENSHIFT_TOKEN` | Token from step above |
| `OPENSHIFT_TOKEN_EXPIRY` | ISO date (e.g., `2027-04-05`) |

---

## Recommendation

**Use Option 1 (Keycloak)** - simpler than token exchange, no tokens to rotate, works with existing Keycloak setup.
