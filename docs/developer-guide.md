# Developer Guide

> Complete guide for developers working on the OpenShift Partner Labs Dashboard

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Coding Conventions](#coding-conventions)
5. [Working with Composables](#working-with-composables)
6. [Creating Components](#creating-components)
7. [Server API Development](#server-api-development)
8. [Database Operations](#database-operations)
9. [Styling Guide](#styling-guide)
10. [Testing](#testing)
11. [Deployment](#deployment)

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd db4opl

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Secret for session signing
AUTH_SECRET=your-secure-random-string

# Application URL
APP_URL=http://localhost:3000
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Mapbox for maps
NUXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Generate static site
pnpm generate

# Run TypeScript type checker
pnpm typecheck

# Database commands
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed database
pnpm db:reset      # Reset database
pnpm db:studio     # Open Prisma Studio
```

## Project Structure

```mermaid
graph TB
    subgraph Root["Project Root"]
        App["app/"]
        Server["server/"]
        Layers["layers/"]
        I18n["i18n/"]
        Prisma["prisma/"]
        Public["public/"]
        Docs["docs/"]
    end

    subgraph AppDir["app/ Directory"]
        Pages["pages/"]
        Components["components/"]
        Composables["composables/"]
        Layouts["layouts/"]
        Middleware["middleware/"]
        Plugins["plugins/"]
        Assets["assets/"]
    end

    subgraph ServerDir["server/ Directory"]
        API["api/"]
        Utils["utils/"]
    end

    App --> AppDir
    Server --> ServerDir
```

### Directory Details

| Directory | Purpose |
|-----------|---------|
| `app/` | Main application code (pages, components, composables) |
| `app/pages/` | File-based routing - each file becomes a route |
| `app/components/` | Vue components (auto-imported) |
| `app/composables/` | Reusable stateful logic (auto-imported) |
| `app/layouts/` | Page layout wrappers |
| `app/middleware/` | Route guards and interceptors |
| `app/plugins/` | App initialization code |
| `app/assets/` | CSS, images processed at build time |
| `server/` | Server-side code (API routes, utilities) |
| `server/api/` | API endpoints (auto-registered routes) |
| `server/utils/` | Server-only utilities |
| `layers/tairo/` | Tairo UI layer (components, utilities) |
| `i18n/` | Translation files (YAML format) |
| `prisma/` | Database schema and migrations |
| `public/` | Static files served as-is |
| `docs/` | Project documentation |

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Browser"]
        Pages["Vue Pages"]
        Components["Components"]
        Composables["Composables"]
        Plugins["Plugins"]
        Middleware["Middleware"]
    end

    subgraph Server["Nitro Server"]
        API["API Routes"]
        ServerUtils["Server Utils"]
        Auth["Auth Layer"]
    end

    subgraph Data["Data Layer"]
        Prisma["Prisma ORM"]
        SQLite["SQLite/PostgreSQL"]
    end

    Pages --> Composables
    Composables --> API
    Middleware --> Auth
    API --> ServerUtils
    API --> Prisma
    Prisma --> SQLite
```

### Key Architectural Decisions

1. **Server-First Authentication**: JWT in HTTPOnly cookies
2. **State Management**: Nuxt `useState` (no Pinia)
3. **Composition API Only**: Options API disabled
4. **Auto-imports**: Components and composables auto-imported
5. **TypeScript**: Strict mode enabled

## Coding Conventions

### Vue Component Structure

```vue
<script setup lang="ts">
// 1. Imports (only non-auto-imported)
import { parseISO } from 'date-fns'

// 2. Props and emits
const props = defineProps<{
  requestId: number
  title?: string
}>()

const emit = defineEmits<{
  (e: 'updated'): void
  (e: 'close'): void
}>()

// 3. Composables
const { user } = useAuth()
const route = useRoute()

// 4. Reactive state
const isOpen = ref(false)
const formData = ref({ name: '' })

// 5. Computed properties
const displayName = computed(() => user.value?.name ?? 'Guest')

// 6. Methods
const handleSubmit = async () => {
  // implementation
}

// 7. Lifecycle hooks
onMounted(() => {
  // initialization
})

// 8. Watchers
watch(() => props.requestId, (newId) => {
  // react to changes
})
</script>

<template>
  <!-- Template content -->
</template>

<style scoped>
/* Scoped styles */
</style>
```

### File Naming

| Type | Convention | Example |
|------|------------|---------|
| Vue components | PascalCase | `RequestNoteModal.vue` |
| Pages | kebab-case | `requests/[id].vue` |
| Layouts | kebab-case | `default.vue` |
| Composables | camelCase with `use` prefix | `useRequests.ts` |
| API routes | kebab-case with method suffix | `me.get.ts` |
| Utilities | camelCase | `auth.ts` |

### Auto-imports

**DO NOT** explicitly import these (they're auto-imported):

```typescript
// Vue
ref, computed, watch, watchEffect, reactive, readonly

// Nuxt
useState, useRoute, useRouter, navigateTo, $fetch
useCookie, useRuntimeConfig, useHead, definePageMeta

// Components in app/components/ or layers/tairo/components/

// Composables in app/composables/
```

## Working with Composables

### Creating a Composable

```typescript
// app/composables/useExample.ts

interface ExampleData {
  id: number
  name: string
}

export const useExample = () => {
  // Shared state (singleton per app)
  const data = useState<ExampleData | null>('example_data', () => null)
  const pending = ref(false)
  const error = ref<Error | null>(null)

  // Fetch function
  const fetch = async () => {
    pending.value = true
    error.value = null

    try {
      data.value = await $fetch<ExampleData>('/api/example')
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  // Actions
  const update = async (id: number, updates: Partial<ExampleData>) => {
    await $fetch(`/api/example/${id}`, {
      method: 'PATCH',
      body: updates
    })
    await fetch() // Refresh data
  }

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    fetch,
    update
  }
}
```

### Existing Composables

```mermaid
graph LR
    subgraph Composables
        useAuth["useAuth<br/>Authentication"]
        useDashboard["useDashboard<br/>Dashboard data"]
        useRequests["useRequests<br/>Request list"]
        useArchive["useArchive<br/>Archived requests"]
        useCompanyRequests["useCompanyRequests<br/>Company requests"]
        useIdleTimeout["useIdleTimeout<br/>Session timeout"]
    end
```

| Composable | Purpose | State |
|------------|---------|-------|
| `useAuth` | Authentication state and methods | `user`, `canEdit` |
| `useDashboard` | Dashboard statistics and charts | `data`, `pending`, `error` |
| `useRequests` | Active requests list | `requests`, `pending`, `error` |
| `useRequestDetail` | Single request with full details | `request`, `pending`, `error` |
| `useArchive` | Archived requests | `requests`, `pending`, `error` |
| `useCompanyRequests` | Company-specific requests | `requests`, `pending`, `error` |
| `useIdleTimeout` | Idle session management | `isWarningVisible`, `secondsRemaining` |
| `useSessionData` | In-memory session data store | `data` |

## Creating Components

### Component Template

```vue
<!-- app/components/MyComponent.vue -->
<script setup lang="ts">
interface Props {
  value: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:value', value: string): void
}>()

const localValue = computed({
  get: () => props.value,
  set: (v) => emit('update:value', v)
})
</script>

<template>
  <div class="my-component">
    <input
      v-model="localValue"
      :disabled="disabled"
      class="border-muted-300 dark:border-muted-700 rounded-lg"
    >
  </div>
</template>
```

### Using Tairo/Shuriken Components

```vue
<template>
  <!-- Cards -->
  <BaseCard rounded="lg" class="p-5">
    Content here
  </BaseCard>

  <!-- Buttons -->
  <BaseButton variant="primary" rounded="lg" size="md">
    Click Me
  </BaseButton>

  <!-- Tags -->
  <BaseTag variant="solid" rounded="full" color="primary">
    Label
  </BaseTag>

  <!-- Tables -->
  <TairoTable rounded="lg">
    <template #header>
      <TairoTableHeading>Column</TairoTableHeading>
    </template>
    <TairoTableRow>
      <TairoTableCell>Data</TairoTableCell>
    </TairoTableRow>
  </TairoTable>

  <!-- Progress -->
  <BaseProgressCircle :model-value="75" :size="40" :thickness="3" />

  <!-- Icons -->
  <Icon name="ph:check-circle-duotone" class="size-5" />
</template>
```

## Server API Development

### Creating an API Route

```typescript
// server/api/example/index.get.ts
export default defineEventHandler(async (event) => {
  // Require authentication
  const session = requireAuth(event)

  // Get database instance (async)
  const db = await getDb()

  // Fetch data
  const data = await db.lab.findMany({
    where: { state: 'Running' }
  })

  return data
})
```

### API Route Patterns

```mermaid
flowchart TB
    subgraph Routes["API Route Patterns"]
        GET["index.get.ts<br/>GET /api/resource"]
        POST["index.post.ts<br/>POST /api/resource"]
        GETID["[id].get.ts<br/>GET /api/resource/:id"]
        PATCH["[id].patch.ts<br/>PATCH /api/resource/:id"]
        DELETE["[id].delete.ts<br/>DELETE /api/resource/:id"]
    end
```

### Request Handling

```typescript
// server/api/example/[id].patch.ts
import { z } from 'zod'

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive']).optional()
})

export default defineEventHandler(async (event) => {
  const session = requireAuth(event)

  // Get route parameter
  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid ID' })
  }

  // Parse and validate body
  const body = await readBody(event)
  const result = UpdateSchema.safeParse(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: result.error.flatten()
    })
  }

  // Update database (getDb is async)
  const db = await getDb()
  const updated = await db.lab.update({
    where: { id: Number(id) },
    data: result.data
  })

  return updated
})
```

### Authentication Utilities

```typescript
// Available in server/utils/auth.ts

// Create session (sets JWT cookie)
createSession(event, payload)

// Get session (returns null if invalid)
getAuthSession(event): SessionPayload | null

// Require auth (throws 401 if not authenticated)
requireAuth(event): SessionPayload
```

### Session Store Utilities

```typescript
// Available in server/utils/sessionStore.ts
// In-memory session data store for user-specific data

interface SessionData {
  sensitive: Record<string, unknown>  // Server-only, never sent to client
  client: Record<string, unknown>     // Sent to client
  createdAt: number
}

// Store session data (keyed by user's sub claim)
sessionStore.set(sessionId, { sensitive: {...}, client: {...} })

// Get full session data
sessionStore.get(sessionId): SessionData | undefined

// Get only client-safe data
sessionStore.getClient(sessionId): Record<string, unknown> | undefined

// Get only server-side sensitive data
sessionStore.getSensitive(sessionId): Record<string, unknown> | undefined

// Check if session exists
sessionStore.has(sessionId): boolean

// Delete session data
sessionStore.delete(sessionId): boolean
```

**Note:** Session data is stored in-memory and is lost on server restart. For persistent session data, use the database.

## Database Operations

### Prisma Schema Overview

```mermaid
erDiagram
    Company ||--o{ Lab : "has many"
    Lab ||--o{ Note : "has many"
    Lab ||--o{ Audit : "has many"
    Lab ||--o{ ExtensionRequest : "has many"

    Company {
        int id PK
        string companyName UK
        boolean curated
        string logoUrl
    }

    Lab {
        int id PK
        string generatedName UK
        string state
        string clusterName
        int companyId FK
        datetime startDate
        datetime endDate
    }

    Note {
        int id PK
        int labId FK
        string userId
        string note
        boolean immutable
    }

    ExtensionRequest {
        int id PK
        int labId FK
        string extension
        string status
    }

    Audit {
        int id PK
        string generatedName FK
        datetime accessTime
        string loginName
    }
```

### Common Queries

```typescript
const db = await getDb()

// Find all with relations
const labs = await db.lab.findMany({
  include: {
    company: true,
    noteRecords: true
  },
  where: {
    state: { in: ['Running', 'Hibernating'] }
  },
  orderBy: { createdAt: 'desc' }
})

// Find one with full details
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

// Create with relation
const note = await db.note.create({
  data: {
    labId,
    userId: session.email,
    note: content,
    immutable: false
  }
})

// Update
await db.lab.update({
  where: { id },
  data: { state: 'Completed' }
})
```

### Running Migrations

```bash
# Create and apply migration
pnpm db:migrate

# Reset database (WARNING: destroys all data)
pnpm db:reset

# View data in Prisma Studio
pnpm db:studio
```

## Styling Guide

### Tailwind CSS

The project uses Tailwind CSS with LightningCSS for fast processing.

### Color Conventions

```vue
<template>
  <!-- Primary colors -->
  <div class="text-primary-500 bg-primary-500/10">Primary</div>

  <!-- Muted colors (for text, borders) -->
  <div class="text-muted-500 dark:text-muted-400">Muted text</div>
  <div class="border-muted-300 dark:border-muted-700">Border</div>

  <!-- Status colors -->
  <div class="text-emerald-500">Success</div>
  <div class="text-amber-500">Warning</div>
  <div class="text-rose-500">Error</div>
  <div class="text-sky-500">Info</div>
</template>
```

### Dark Mode

Always include dark mode variants:

```vue
<template>
  <div class="bg-white dark:bg-muted-900">
    <p class="text-muted-800 dark:text-white">
      Dark mode supported text
    </p>
  </div>
</template>
```

### Responsive Design

Use responsive prefixes:

```vue
<template>
  <!-- Mobile-first approach -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
    <!-- 1 col mobile, 2 cols tablet, 4 cols desktop -->
  </div>

  <div class="flex flex-col sm:flex-row">
    <!-- Stack on mobile, row on tablet+ -->
  </div>
</template>
```

## Testing

### Recommended Test Structure

```
tests/
├── unit/
│   ├── composables/
│   │   └── useAuth.test.ts
│   └── utils/
│       └── auth.test.ts
├── integration/
│   └── api/
│       └── requests.test.ts
└── e2e/
    └── auth.spec.ts
```

### Unit Tests (Vitest)

```typescript
// tests/unit/composables/useAuth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from '~/composables/useAuth'

describe('useAuth', () => {
  it('should initialize with null user', () => {
    const { user } = useAuth()
    expect(user.value).toBeNull()
  })
})
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test('redirects to login when not authenticated', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/auth/)
})
```

## Deployment

### Production Build

```bash
# Build the application
pnpm build

# Preview locally
pnpm preview
```

### Environment Variables for Production

```env
# Required
GOOGLE_CLIENT_ID=production-client-id
GOOGLE_CLIENT_SECRET=production-client-secret
AUTH_SECRET=production-secure-secret
APP_URL=https://your-domain.com
NUXT_PUBLIC_SITE_URL=https://your-domain.com

# Database (if using PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Build Output

The build creates a `.output/` directory containing:
- `server/` - Node.js server bundle
- `public/` - Static assets

### Deployment Options

```mermaid
flowchart LR
    Build["pnpm build"] --> Output[".output/"]
    Output --> Node["Node.js Server"]
    Output --> Docker["Docker Container"]
    Output --> Vercel["Vercel/Netlify"]
    Output --> CloudRun["Cloud Run/ECS"]
```

---

**Related Documentation**:
- [Architecture](architecture.md) - System architecture details
- [Authentication](authentication.md) - Auth flow documentation
- [API Reference](api-reference.md) - API endpoint documentation
- [Database](database.md) - Database schema reference
