# Database Schema

> Complete database schema documentation for the OpenShift Partner Labs Dashboard

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Models](#models)
4. [Relationships](#relationships)
5. [Prisma Usage](#prisma-usage)
6. [Migrations](#migrations)
7. [Seeding](#seeding)

## Overview

The application uses **Prisma ORM** with support for both SQLite (development) and PostgreSQL (production). The schema is designed to track OpenShift lab reservations, partner companies, user notes, and audit trails.

### Database Providers

| Environment | Provider | Configuration |
|-------------|----------|---------------|
| Development | SQLite | Local file-based |
| Production | PostgreSQL | Cloud-hosted |

### Configuration

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"  // or "postgresql" for production
}
```

## Entity Relationship Diagram

```mermaid
erDiagram
    Company ||--o{ Lab : "has many"
    Lab ||--o{ Note : "has many"
    Lab ||--o{ Audit : "has many"
    Lab ||--o{ ExtensionRequest : "has many"

    Company {
        int id PK
        string companyName UK "company_name"
        boolean curated
        string logoUrl "logo_url"
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    Lab {
        int id PK
        string clusterId "cluster_id"
        string generatedName UK "generated_name"
        string state
        string clusterName "cluster_name"
        string openshiftVersion "openshift_version"
        string clusterSize "cluster_size"
        string companyName "company_name"
        int companyId FK "company_id"
        string requestType "request_type"
        boolean partner
        string sponsor
        string cloudProvider "cloud_provider"
        string primaryFirst "primary_first"
        string primaryLast "primary_last"
        string primaryEmail "primary_email"
        string secondaryFirst "secondary_first"
        string secondaryLast "secondary_last"
        string secondaryEmail "secondary_email"
        string region
        boolean alwaysOn "always_on"
        string projectName "project_name"
        string leaseTime "lease_time"
        string description
        string notes
        datetime startDate "start_date"
        datetime endDate "end_date"
        boolean hold
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    User {
        int id PK
        string userId "user_id"
        string firstName "first_name"
        string lastName "last_name"
        string fullName "full_name"
        string email UK
        string picture
        boolean admin
        string group
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    Note {
        int id PK
        int labId FK "lab_id"
        string userId "user_id"
        string note
        boolean immutable
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    Audit {
        int id PK
        string generatedName FK "generated_name"
        datetime accessTime "access_time"
        string loginName "login_name"
        string loginType "login_type"
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    ExtensionRequest {
        int id PK
        int labId FK "lab_id"
        string extension
        string currentUser "current_user"
        datetime date
        string status
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    CloudCost {
        int id PK
        int month
        int year
        string provider
        float cost
        datetime createdAt "created_at"
        datetime updatedAt "updated_at"
    }

    OpenshiftVersionMapping {
        int id PK
        string name UK
        string location
        boolean rosa
        boolean aro
        boolean gro
        boolean roks
    }
```

## Models

### Lab

The main entity representing a cluster reservation request.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `cluster_id` | String | | Internal cluster identifier |
| `generated_name` | String | Unique | Auto-generated cluster name |
| `state` | String | | Current status |
| `cluster_name` | String | | Display name |
| `openshift_version` | String | | OCP version (e.g., "4.14") |
| `cluster_size` | String | | Size configuration |
| `company_name` | String | | Company name (denormalized) |
| `company_id` | Int? | FK → Company | Related company |
| `request_type` | String | | Type of request |
| `partner` | Boolean | Default: false | Partner flag |
| `sponsor` | String | | Internal sponsor |
| `cloud_provider` | String | | AWS, Azure, GCP, etc. |
| `primary_first` | String | | Primary contact first name |
| `primary_last` | String | | Primary contact last name |
| `primary_email` | String | | Primary contact email |
| `secondary_first` | String | | Secondary contact first name |
| `secondary_last` | String | | Secondary contact last name |
| `secondary_email` | String | | Secondary contact email |
| `region` | String | | Cloud region |
| `always_on` | Boolean | Default: false | 24/7 availability |
| `project_name` | String | | Project identifier |
| `lease_time` | String | | Lease duration (e.g., "30 days") |
| `description` | String | | Request description |
| `notes` | String | Default: "" | Internal notes field |
| `start_date` | DateTime | | Reservation start |
| `end_date` | DateTime | | Reservation end |
| `hold` | Boolean | Default: false | Hold flag |
| `created_at` | DateTime | Default: now() | Creation timestamp |
| `updated_at` | DateTime | Auto-update | Last update timestamp |

**State Values:**
- `Pending` - Awaiting approval
- `Approved` - Approved, being provisioned
- `Running` - Active and operational
- `Hibernating` - Suspended
- `Denied` - Request rejected
- `Completed` - Lifecycle finished

---

### Company

Partner organizations with lab requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `company_name` | String | Unique | Company name |
| `curated` | Boolean | Default: false | Curated partner flag |
| `logo_url` | String? | | Logo image URL |
| `created_at` | DateTime | Default: now() | Creation timestamp |
| `updated_at` | DateTime | Auto-update | Last update timestamp |

---

### User

System users (authenticated via Google OAuth).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `user_id` | String? | | External user ID |
| `first_name` | String? | | First name |
| `last_name` | String? | | Last name |
| `full_name` | String? | | Full display name |
| `email` | String | Unique | Email address |
| `picture` | String? | | Profile picture URL |
| `admin` | Boolean | Default: false | Admin flag |
| `group` | String? | | Group: oplmgr, opldev, null |
| `created_at` | DateTime | Default: now() | Creation timestamp |
| `updated_at` | DateTime | Auto-update | Last update timestamp |

**Group Values:**
- `oplmgr` - OPL Manager (full permissions)
- `opldev` - OPL Developer (limited permissions)
- `null` - Regular user

---

### Note

Comments/notes attached to lab requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `lab_id` | Int | FK → Lab | Related lab |
| `user_id` | String? | | Author identifier (email) |
| `note` | String | | Note content |
| `immutable` | Boolean | Default: false | Prevents editing |
| `created_at` | DateTime | Default: now() | Creation timestamp |
| `updated_at` | DateTime | Auto-update | Last update timestamp |

---

### ExtensionRequest

Requests to extend lab reservations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `lab_id` | Int? | FK → Lab | Related lab |
| `extension` | String? | | Duration (3d, 1w, 2w, 1mo) |
| `current_user` | String? | | Requester email |
| `date` | DateTime? | | Request date |
| `status` | String? | | Pending, Approved, Denied |
| `created_at` | DateTime? | | Creation timestamp |
| `updated_at` | DateTime? | | Last update timestamp |

---

### Audit

Cluster access audit trail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `generated_name` | String? | FK → Lab.generatedName | Related lab |
| `access_time` | DateTime? | | Access timestamp |
| `login_name` | String? | | Login username |
| `login_type` | String? | | Access method (ssh, web, etc.) |
| `created_at` | DateTime? | | Record creation |
| `updated_at` | DateTime? | | Last update |

---

### CloudCost

Monthly cloud cost tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `month` | Int | | Month (1-12) |
| `year` | Int | | Year |
| `provider` | String? | | Cloud provider |
| `cost` | Float | | Cost amount |
| `created_at` | DateTime | Default: now() | Creation timestamp |
| `updated_at` | DateTime | Auto-update | Last update timestamp |

---

### OpenshiftVersionMapping

OpenShift version compatibility matrix.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | Int | PK, Auto-increment | Unique identifier |
| `name` | String? | Unique | Version name |
| `location` | String? | | Location identifier |
| `rosa` | Boolean? | Default: false | ROSA compatible |
| `aro` | Boolean? | Default: false | ARO compatible |
| `gro` | Boolean? | Default: false | GRO compatible |
| `roks` | Boolean? | Default: false | ROKS compatible |

## Relationships

```mermaid
flowchart LR
    subgraph Parent["Parent Models"]
        Company
        Lab
    end

    subgraph Child["Child Models"]
        Note
        Audit
        ExtensionRequest
    end

    Company -->|"1:N"| Lab
    Lab -->|"1:N"| Note
    Lab -->|"1:N"| Audit
    Lab -->|"1:N"| ExtensionRequest
```

### Relationship Details

| Parent | Child | Type | Cascade |
|--------|-------|------|---------|
| Company | Lab | One-to-Many | No |
| Lab | Note | One-to-Many | Delete |
| Lab | Audit | One-to-Many | Delete |
| Lab | ExtensionRequest | One-to-Many | No |

## Prisma Usage

### Database Connection

```typescript
// server/utils/db.ts
import { PrismaClient } from '../generated/prisma'

declare global {
  var __prisma: PrismaClient | undefined
}

const prisma = globalThis.__prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export const getDb = () => prisma
```

### Common Queries

#### Find All Labs with Company

```typescript
const labs = await db.lab.findMany({
  include: {
    company: true
  },
  where: {
    state: { in: ['Running', 'Hibernating'] }
  },
  orderBy: { createdAt: 'desc' }
})
```

#### Find Lab with All Relations

```typescript
const lab = await db.lab.findUnique({
  where: { id: labId },
  include: {
    company: true,
    noteRecords: {
      orderBy: { createdAt: 'desc' }
    },
    extensionRequests: {
      orderBy: { createdAt: 'desc' }
    },
    audits: {
      orderBy: { accessTime: 'desc' },
      take: 10
    }
  }
})
```

#### Create Note

```typescript
const note = await db.note.create({
  data: {
    labId: request.id,
    userId: session.email,
    note: content,
    immutable: false
  }
})
```

#### Update Lab Status

```typescript
await db.lab.update({
  where: { id },
  data: {
    state: 'Completed',
    updatedAt: new Date()
  }
})
```

#### Aggregate Statistics

```typescript
const stats = await db.lab.groupBy({
  by: ['state'],
  _count: { id: true }
})

// Transform to object
const counts = stats.reduce((acc, stat) => {
  acc[stat.state] = stat._count.id
  return acc
}, {} as Record<string, number>)
```

#### Get Monthly Costs

```typescript
const costs = await db.cloudCost.findMany({
  where: {
    year: { in: [currentYear, lastYear] }
  },
  orderBy: [
    { year: 'asc' },
    { month: 'asc' }
  ]
})
```

## Migrations

### Creating a Migration

```bash
# Make schema changes in prisma/schema.prisma
# Then run:
pnpm db:migrate

# This will:
# 1. Generate migration SQL
# 2. Apply to database
# 3. Regenerate Prisma Client
```

### Migration Files

Migrations are stored in `prisma/migrations/`:

```
prisma/
├── migrations/
│   ├── 20240115_init/
│   │   └── migration.sql
│   ├── 20240120_add_notes/
│   │   └── migration.sql
│   └── migration_lock.toml
└── schema.prisma
```

### Reset Database

```bash
# WARNING: Destroys all data
pnpm db:reset
```

### View Data

```bash
# Open Prisma Studio
pnpm db:studio
```

## Seeding

### Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

async function main() {
  // Create companies
  const company = await prisma.company.create({
    data: {
      companyName: 'Acme Corporation',
      curated: true,
      logoUrl: 'https://example.com/logo.png'
    }
  })

  // Create labs
  await prisma.lab.create({
    data: {
      clusterId: 'cluster-001',
      generatedName: 'acme-lab-001',
      state: 'Running',
      clusterName: 'Acme Dev Lab',
      openshiftVersion: '4.14',
      clusterSize: 'medium',
      companyName: 'Acme Corporation',
      companyId: company.id,
      requestType: 'Partner Lab',
      sponsor: 'John Smith',
      cloudProvider: 'AWS',
      primaryFirst: 'Jane',
      primaryLast: 'Doe',
      primaryEmail: 'jane@acme.com',
      secondaryFirst: 'Bob',
      secondaryLast: 'Wilson',
      secondaryEmail: 'bob@acme.com',
      region: 'us-east-1',
      projectName: 'partner-project',
      leaseTime: '30 days',
      description: 'Development lab for partner integration',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Running Seeds

```bash
pnpm db:seed
```

---

## Indexes and Performance

### Recommended Indexes

```sql
-- Already created via unique constraints
CREATE UNIQUE INDEX "labs_generated_name_key" ON "labs"("generated_name");
CREATE UNIQUE INDEX "companies_company_name_key" ON "companies"("company_name");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Recommended additional indexes for query performance
CREATE INDEX "labs_state_idx" ON "labs"("state");
CREATE INDEX "labs_company_id_idx" ON "labs"("company_id");
CREATE INDEX "labs_start_date_idx" ON "labs"("start_date");
CREATE INDEX "notes_lab_id_idx" ON "notes"("lab_id");
CREATE INDEX "audits_generated_name_idx" ON "audits"("generated_name");
CREATE INDEX "extension_requests_lab_id_idx" ON "regexts"("lab_id");
```

---

**Related Documentation**:
- [Developer Guide](developer-guide.md) - Development setup
- [API Reference](api-reference.md) - API endpoints
- [Architecture](architecture.md) - System architecture
