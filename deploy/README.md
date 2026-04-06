# OpenShift Deployment

Kustomize-based deployment manifests for the Portal application.

## Structure

```
deploy/
├── base/                    # Base manifests
│   ├── deployment.yaml      # Deployment with probes and security context
│   ├── service.yaml         # ClusterIP service
│   ├── route.yaml           # OpenShift route with TLS
│   ├── configmap.yaml       # Non-sensitive configuration
│   ├── secret.yaml          # Secret template (not deployed via kustomize)
│   └── kustomization.yaml
└── overlays/
    ├── dev/                 # Development environment
    │   ├── kustomization.yaml
    │   ├── deployment-patch.yaml
    │   ├── configmap-patch.yaml
    │   └── route-patch.yaml
    └── prod/                # Production environment
        ├── kustomization.yaml
        ├── deployment-patch.yaml
        ├── configmap-patch.yaml
        └── route-patch.yaml
```

## Prerequisites

1. OpenShift cluster access with `oc` CLI
2. Container image built and pushed to registry
3. PostgreSQL database provisioned
4. OIDC provider credentials configured

## Build and Push Image

```bash
# Build the image
podman build -t quay.io/rhopl/portal:latest -f Containerfile .

# Push to registry
podman push quay.io/rhopl/portal:latest
```

## Deploy

### 1. Create Secrets

Secrets are not included in kustomization to prevent accidental commits.
Create them manually or use External Secrets Operator:

```bash
# Create namespace first
oc new-project opl-prod

# Create secret from literal values
oc create secret generic portal-secrets \
  --from-literal=DATABASE_URL='postgresql://user:pass@db-host:5432/dbname?schema=public' \
  --from-literal=OAUTH_CLIENT_ID='your-client-id' \
  --from-literal=OAUTH_CLIENT_SECRET='your-client-secret' \
  --from-literal=OAUTH_AUTH_URL='https://your-provider.com/auth' \
  --from-literal=OAUTH_TOKEN_URL='https://your-provider.com/token' \
  --from-literal=AUTH_SECRET="$(openssl rand -base64 32)"

# Or from a file
oc create secret generic portal-secrets --from-env-file=.env.production
```

### 2. Deploy with Kustomize

```bash
# Preview what will be deployed
oc kustomize deploy/overlays/prod

# Deploy to production
oc apply -k deploy/overlays/prod

# Deploy to development
oc apply -k deploy/overlays/dev
```

### 3. Verify Deployment

```bash
# Check rollout status
oc rollout status deployment/portal -n opl-prod

# Get route URL
oc get route portal -n opl-prod -o jsonpath='{.spec.host}'

# View logs
oc logs -f deployment/portal -n opl-prod

# Check health
curl https://$(oc get route portal -n opl-prod -o jsonpath='{.spec.host}')/api/health
```

## Configuration

### Environment Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Secret | PostgreSQL connection string |
| `OAUTH_CLIENT_ID` | Secret | OIDC client ID |
| `OAUTH_CLIENT_SECRET` | Secret | OIDC client secret |
| `OAUTH_AUTH_URL` | Secret | OIDC authorization endpoint |
| `OAUTH_TOKEN_URL` | Secret | OIDC token endpoint |
| `AUTH_SECRET` | Secret | JWT signing secret |
| `NUXT_PUBLIC_SITE_URL` | ConfigMap | Public URL for the site |
| `APP_URL` | ConfigMap | Application URL |
| `NUXT_PUBLIC_MAPBOX_TOKEN` | ConfigMap | Mapbox API token (optional) |

### Customizing for Your Cluster

1. Update image registry in overlay `kustomization.yaml`:
   ```yaml
   images:
     - name: portal
       newName: your-registry.com/your-org/portal
       newTag: v1.0.0
   ```

2. Update route hostname in `route-patch.yaml`:
   ```yaml
   spec:
     host: portal.apps.your-cluster.com
   ```

3. Update site URLs in `configmap-patch.yaml`

## Database Migrations

Run migrations as a one-time job or init container:

```bash
# Connect to running pod and run migrations
oc exec -it deployment/portal -- npx prisma migrate deploy --config=prisma.config.postgresql.ts
```

## Troubleshooting

### Pod not starting
```bash
oc describe pod -l app=portal
oc logs -l app=portal --previous
```

### Database connection issues
```bash
# Test from within the cluster
oc debug deployment/portal -- node -e "
  const { Client } = require('pg');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  client.connect().then(() => console.log('Connected!')).catch(console.error);
"
```

### Route not accessible
```bash
oc get route portal -o yaml
oc get endpoints portal
```
