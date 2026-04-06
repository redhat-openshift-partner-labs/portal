# Portal PostgreSQL Database

Kustomize-based PostgreSQL deployment for the Portal application, following the
same pattern as the shared datastore manifests.

## Directory Layout

```
datastore/
├── base/                       # Shared resource definitions
│   ├── kustomization.yaml
│   ├── secret.yaml
│   ├── pvc.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    └── staging/                # Staging database instance
        └── kustomization.yaml
```

## Usage

### Deploy Staging Database

```bash
# Preview
oc kustomize deploy/datastore/overlays/staging

# Deploy
oc apply -k deploy/datastore/overlays/staging

# Verify
oc get pods -n staging -l app.kubernetes.io/instance=portal-staging
```

### Connection String

From within the cluster, the database is accessible at:

```
postgresql://portal:PASSWORD@portal-postgresql.staging.svc:5432/portal_staging
```

The `portal-secrets` Secret should contain:
```
DATABASE_URL=postgresql://portal:PASSWORD@portal-postgresql.staging.svc:5432/portal_staging?schema=public
```

### Delete Database

```bash
oc delete -k deploy/datastore/overlays/staging
```

**Warning:** This deletes the PVC and all data.

## CI/CD Integration

The staging database is deployed once and persists across app deployments.
The deploy-staging workflow:

1. Ensures database deployment exists
2. Runs Prisma migrations
3. Deploys the portal application
4. Runs smoke tests

## Adding Production Database

For production, create a new overlay:

```bash
cp -r deploy/datastore/overlays/staging deploy/datastore/overlays/production
```

Then update the kustomization.yaml with:
- `namespace: portal`
- `namePrefix: portal-prod-`
- Production credentials
- Larger storage/memory limits
