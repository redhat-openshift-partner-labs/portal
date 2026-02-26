# CLAUDE.md

This file provides context for AI assistants.

## Git Policy
- **NEVER push to remote repository** - User handles all pushes manually
- **DO make frequent incremental commits** - Small, focused commits for easy rollback
- **Commit after completing logical units of work** - Don't wait to be asked; commit when a feature, fix, or refactor is complete
- **Ask if uncertain** - If unclear whether work is "complete enough" to commit, ask first
- Use conventional commit messages (feat:, fix:, test:, docs:, refactor:, chore:)

## Role Context
- Expert JavaScript developer
- Expert NuxtJS developer
- Expert UX designer
- Expert Vue developer
- Expert TypeScript developer
- Expert NodeJS developer

## Development Approach
- TDD: Write tests first
- BDD: Use Gherkin feature files
- Use mermaid for documentation diagrams
- Use pnpm for dependency management

## Project Overview

**Tech Stack:**
- **Framework**: Nuxt 4.3.1 (Vue 3.5.28)
- **Language**: TypeScript 5.9.2
- **UI Components**: Shuriken UI 4.0.0 + Tairo layer + Reka UI
- **Styling**: Tailwind CSS 4.2.0 with LightningCSS transformer
- **Options API**: Disabled for smaller bundles

## Quick Reference

### Commands

```bash
pnpm run dev       # Start dev server (http://localhost:3000)
pnpm run build     # Production build
pnpm run preview   # Preview production build
pnpm run generate  # Static site generation
pnpm run typecheck # Run TypeScript type checker
```

### Database Commands

**First-time local setup:**
```bash
pnpm prisma generate  # Generate Prisma client for SQLite
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
```

**Local development (SQLite):**
```bash
pnpm prisma generate  # Generate client for SQLite (required!)
pnpm db:migrate       # Run SQLite migrations
pnpm db:seed          # Seed local database
pnpm db:studio        # Open Prisma Studio (SQLite)
```

**Production (PostgreSQL):**
```bash
pnpm db:pg:generate   # Generate client for PostgreSQL (required!)
pnpm db:pg:push       # Push schema to PostgreSQL
pnpm db:pg:push:sql   # Generate SQL for manual apply (workaround for connection issues)
pnpm db:pg:migrate    # Create PostgreSQL migration
pnpm db:pg:deploy     # Deploy migrations to production
pnpm db:pg:studio     # Open Prisma Studio (PostgreSQL)
```

**Validation:**
```bash
pnpm db:validate      # Verify schemas are in sync
```

> **Critical:** The Prisma client is tied to a specific database provider. If you see "Driver Adapter not compatible with provider" error, regenerate the client:
> - For SQLite: `pnpm prisma generate`
> - For PostgreSQL: `pnpm db:pg:generate`
>
> See `docs/database.md` for the full dual-schema workflow.

### Key Directories

```
app/                    # Main application code
├── assets/            # CSS files (main.css, vcalendar.css, apexcharts.css)
├── composables/       # Composables (useAuth.ts)
├── layouts/           # Layout components (8 layouts)
├── middleware/        # Route middleware (auth.global.ts)
├── pages/             # Page components
├── plugins/           # Client plugins (auth.client.ts)
layers/tairo/          # Tairo layer (UI components, composables, utils)
i18n/                  # Internationalization YAML files (6 languages)
server/                # Server-side code
├── api/auth/          # Google OAuth endpoints
├── api/company/       # Company API
├── utils/             # Server utilities
public/                # Static assets
docs/                  # Documentation
tairo-component-meta/  # Component metadata workspace
```

## Architecture Decisions

### State Management
- **useState** (Nuxt built-in) for reactive state
- No Pinia - use `useState` composable for shared state

### Component Patterns
- Components access composables directly via auto-import
- Use Tairo/Shuriken UI components when available

### Tairo Layer
- Extended from `layers/tairo`
- Provides UI components beyond Shuriken UI base
- Custom layouts: default, topnav, topnav-slim, sidenav, collapse, landing, empty, content-docs

### Authentication
- Google OAuth integration
- Server endpoints in `server/api/auth/`
- Client-side state via `useAuth` composable
- JWT tokens for session management

### Styling
- Tailwind CSS via Tairo layer
- LightningCSS for faster CSS processing
- Main CSS entry: `app/assets/main.css`

### Internationalization
- 6 locales: en, fr, es, de, ar (RTL), ja
- Strategy: `no_prefix` (no locale in URL)
- Translation files: `/i18n/*.yaml`
- Use `$t()` function for translations

## Code Conventions

### Vue Components
- Use `<script setup lang="ts">` syntax
- Props defined with `defineProps<{...}>()`
- Emits defined with `defineEmits<{...}>()`
- Composables accessed via auto-import (no explicit imports needed)
- **Options API is disabled** - only Composition API

### File Naming
- Vue components: PascalCase (e.g., `MyComponent.vue`)
- Pages: kebab-case or index.vue
- Layouts: kebab-case (e.g., `topnav.vue`)
- Composables: camelCase with `use` prefix (e.g., `useAuth.ts`)

## Gotchas

### Auto-imports
Nuxt auto-imports components, composables, and utilities. Don't add explicit imports for:
- `ref`, `computed`, `watch`, `useState` (Vue/Nuxt)
- `useRoute`, `useRouter`, `navigateTo`, `$fetch` (Nuxt)
- Any component in `app/components/` or `layers/tairo/components/`
- Any composable in `app/composables/`
- Runtime config via `useRuntimeConfig()`

### Reactivity
- `useState` returns reactive state - don't wrap in `ref()`
- Use `readonly()` for exposing refs that shouldn't be mutated externally

### Options API Disabled
Vue Options API is disabled (`__VUE_OPTIONS_API__: false`). Only use Composition API with `<script setup>`.

### View Transitions
Experimental view transitions are enabled. Use `ViewTransitions` component for page transitions.

## Testing Approach

Currently no test suite. If adding tests:
- Use Vitest for unit tests
- Test composables in isolation
- Use Playwright for E2E tests

## Dependencies

| Package | Purpose |
|---------|---------|
| `nuxt` | Framework (v4.3.1) |
| `@shuriken-ui/nuxt` | Base UI components (v4.0.0) |
| `layers/tairo` | Extended UI layer (local) |
| `reka-ui` | Headless UI primitives (via Tairo) |
| `@vueuse/nuxt` | Vue composables |
| `@nuxtjs/i18n` | Internationalization (6 languages) |
| `@nuxt/content` | Markdown content management |
| `@nuxt/image` | Image optimization |
| `@nuxt/fonts` | Font loading (Inter, Karla, Fira Code) |
| `zod` | Schema validation |
| `vue3-apexcharts` | Charts |
| `date-fns` | Date utilities |
| `better-sqlite3` | SQLite database (dev) |
| `pg` | PostgreSQL database (prod) |
| `@prisma/adapter-*` | Prisma driver adapters |
| `jsonwebtoken` | JWT for auth |
| `@iconify-json/*` | Various icon sets |

## Environment Variables

Required environment variables (see `.env`):
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `AUTH_SECRET` - Secret for JWT signing
- `NUXT_PUBLIC_MAPBOX_TOKEN` - Mapbox API token (optional)
- `NUXT_PUBLIC_SITE_URL` - Site URL for production
- `APP_URL` - App URL (defaults to http://localhost:3000)
