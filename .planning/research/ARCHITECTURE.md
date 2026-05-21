# Architecture Research: Nuxt 4 Migration

**Project:** District Demo Portal — v1.0.0 Nuxt Migration
**Researched:** 2026-05-21
**Confidence:** HIGH (Nuxt 4.0 shipped; official docs verified via nuxt.com/docs/4.x)

---

## New Architecture Layers

### Complete Directory Structure

The Nuxt 4 `app/` directory structure is the primary change from the current `src/` layout. All client-side code moves into `app/`; the `server/` directory is a sibling at the project root alongside `nuxt.config.ts`.

```
district-demo/
├── app/                          # All client-side application code
│   ├── assets/                   # Build-processed assets (images, fonts)
│   ├── components/               # Reusable Vue components
│   │   ├── layout/               # AppShell equivalent → replaced by layouts/
│   │   ├── shared/               # StatusBadge, TagChip, etc.
│   │   └── vendor/               # VendorDrawer, VendorTable
│   ├── composables/              # Shared composition functions (auto-imported)
│   ├── layouts/
│   │   └── default.vue           # Persistent sidebar + <slot /> for page content
│   ├── pages/                    # File-based routing (replaces src/router/ + src/views/)
│   │   ├── index.vue             # Redirects to /discovery
│   │   ├── dashboard.vue
│   │   ├── discovery.vue
│   │   ├── dpa.vue
│   │   ├── risk.vue
│   │   └── tags.vue
│   ├── plugins/                  # Vue plugins registered at startup
│   ├── stores/
│   │   └── tags.ts               # Pinia tags store (migrated from src/stores/tags.js)
│   ├── utils/                    # Client-side utility functions (auto-imported)
│   ├── app.vue                   # Root: <NuxtLayout><NuxtPage /></NuxtLayout>
│   └── error.vue                 # Error page
│
├── server/                       # Nitro server (runs Node.js on Amplify)
│   ├── api/                      # HTTP endpoints at /api/*
│   │   ├── vendors.get.ts        # GET /api/vendors → returns vendors array
│   │   ├── dpa.get.ts            # GET /api/dpa → returns DPA records
│   │   ├── edtech.get.ts         # GET /api/edtech → returns 1EdTech records
│   │   └── risk-labels.get.ts    # GET /api/risk-labels → returns risk label config
│   └── data/                     # Raw mock data — NOT exposed as routes
│       ├── vendors.ts            # Migrated from src/data/vendors.js
│       ├── dpa.ts                # Migrated from src/data/dpa.js
│       ├── edtech.ts             # Migrated from src/data/edtech.js
│       └── risk-labels.ts        # Migrated from src/data/riskLabels.js
│
├── shared/                       # Code usable by BOTH app/ and server/
│   └── types/                    # TypeScript interfaces for Vendor, DPA, Tag, etc.
│
├── public/                       # Static files (unprocessed, served at root)
│
├── nuxt.config.ts                # Nuxt configuration
└── amplify.yml                   # AWS Amplify build/deploy config
```

### Layer Responsibilities

| Layer | Location | What it owns | What it does NOT own |
|-------|----------|--------------|---------------------|
| Pages | `app/pages/` | Route components, page-level data fetching via `useFetch` | Raw data, business logic |
| Layout | `app/layouts/default.vue` | Sidebar nav, header chrome, `<slot />` for page content | Any page-specific UI |
| Components | `app/components/` | Reusable UI — VendorDrawer, StatusBadge, TagChip | Routing, data fetching |
| Stores | `app/stores/tags.ts` | Client-writable state (tag CRUD, assignments) | Read-only vendor/DPA data |
| Composables | `app/composables/` | Shared reactive logic extracted from pages | Data fetching (that lives in pages) |
| Server API | `server/api/` | HTTP route handlers, data assembly | Storage, SSR rendering |
| Server Data | `server/data/` | Mock data as TypeScript modules | HTTP handling |
| Shared Types | `shared/types/` | TypeScript interfaces used by both sides | Implementation |

### Routing: File-based Replaces Manual Router Config

The existing `src/router/index.js` with `createWebHashHistory` is removed entirely. Nuxt 4 file-based routing reads `app/pages/` and generates routes automatically. Hash routing is no longer needed because AWS Amplify serves a Node.js process (Nitro) that can handle HTML5 pushstate routing with proper fallbacks.

Sidebar nav links no longer read from `router.getRoutes()`. In Nuxt 4, define the nav list explicitly in `default.vue` or a composable — this is more predictable than runtime router introspection and avoids coupling the sidebar to routing internals.

---

## Data Flow

### Current Flow (SPA)

```
src/data/vendors.js  →  import in DiscoveryView.vue  →  computed()  →  template
```

All data is bundled into the client JS. No network boundary. Changing data requires a rebuild (or HMR in dev).

### New Flow (SSR)

```
server/data/vendors.ts
    ↓  imported by
server/api/vendors.get.ts  (defineEventHandler → returns JSON)
    ↓  HTTP GET /api/vendors  (server-to-self in SSR; real HTTP in client nav)
app/pages/discovery.vue  useFetch('/api/vendors')
    ↓  { data, status, error }
    ↓  passed as props or used directly in template
<VendorTable :vendors="data" />
```

### SSR Execution Sequence (first page load)

1. Browser requests `/discovery`
2. Nitro server receives request, executes `app/pages/discovery.vue` server-side
3. During server render, `useFetch('/api/vendors')` executes — Nitro calls its own `/api/vendors` handler directly (no network hop)
4. `server/api/vendors.get.ts` reads `server/data/vendors.ts` and returns the array
5. `useFetch` receives data; page renders to HTML with vendor data already inline
6. Nuxt serializes the fetched data into the page payload (`__NUXT_DATA__`)
7. HTML + payload sent to browser
8. Browser renders HTML immediately (no blank flash)
9. Vue hydrates — reads payload, does NOT re-fetch `/api/vendors` (data already in payload)
10. Page is interactive

### Client Navigation Sequence (subsequent route changes)

1. User clicks a sidebar link (e.g., `/dpa`)
2. Nuxt client-side router intercepts — no full page reload
3. `app/pages/dpa.vue` mounts; `useFetch('/api/dpa')` executes client-side
4. Real HTTP GET to `/api/dpa` on the Nitro server
5. Response received, `data` ref updates, table renders

### useFetch Pattern for Pages

```typescript
// app/pages/discovery.vue
<script setup lang="ts">
import type { Vendor } from '~/shared/types'

const { data: vendors, status, error } = await useFetch<Vendor[]>('/api/vendors')
// 'await' inside <script setup> uses Vue Suspense automatically
// useFetch returns shallowRef in Nuxt 4 — do not mutate nested properties directly
</script>
```

**Key behaviors of `useFetch` in Nuxt 4:**
- Returns `shallowRef` by default (Nuxt 4 change) — faster for large arrays, but requires replacing the full array rather than mutating elements
- Data is deduplicated: if two components `useFetch('/api/vendors')` with the same key, they share one request
- Payload transfer prevents double-fetch: server result is embedded in page HTML; client reads it directly without HTTP
- The `status` ref tracks `'idle' | 'pending' | 'success' | 'error'` — use for loading states

### Data Isolation Principle (preserved)

`server/data/` files remain plain TS modules exporting typed arrays — same structure as the current `src/data/` files. A developer changes `server/data/vendors.ts`, and the `/api/vendors` route immediately returns updated data on next request. No component changes needed. Same-day iteration requirement is satisfied.

---

## SSR Considerations

### What Runs Server-Side

| Code location | Runs on server | Runs on client |
|---------------|---------------|----------------|
| `server/api/*.ts` | Always | Never |
| `app/pages/*.vue` `<script setup>` top-level | Yes (first render) | Yes (hydration + navigation) |
| `useFetch`, `useAsyncData` | Yes (first render) | Yes (client nav) |
| `onMounted()` hooks | Never | Yes |
| `window`, `document`, `localStorage` | Never | Yes |
| `<ClientOnly>` wrapped content | Never | Yes |
| Pinia store actions called in `setup()` | Yes | Yes |

### Hydration

Hydration is the process where Vue's client-side runtime "takes over" server-rendered HTML. A hydration mismatch occurs when the DOM Vue generates client-side differs from what the server sent. Mismatches trigger a full re-render, causing content flash and breaking interactivity.

**Causes to avoid in this codebase:**

1. `localStorage` access at the top level of `<script setup>` — localStorage does not exist server-side. Move all localStorage access inside `onMounted()` or behind `if (process.client)`.

2. `new Date()` or `Math.random()` rendered directly in templates — server and client will produce different values. For demo data with dates, use static ISO strings from the data files, not `new Date()`.

3. ECharts and any canvas/WebGL API — these are browser-only. Must be wrapped in `<ClientOnly>` (see ECharts section).

4. The existing Pinia tags store reads `localStorage` at initialization. This code path runs server-side in Nuxt SSR and will throw. Requires refactoring (see Pinia section).

### Nuxt 4 Best Practice: Fetch at Page Level

Fetch data in `app/pages/` and pass it as props to child components. Do not call `useFetch` inside `<VendorTable>` or `<VendorDrawer>`. This prevents components from independently re-fetching after hydration.

```typescript
// app/pages/discovery.vue — CORRECT
const { data: vendors } = await useFetch('/api/vendors')
// pass down:
<VendorTable :vendors="vendors" />
```

```typescript
// app/components/vendor/VendorTable.vue — WRONG
const { data } = await useFetch('/api/vendors') // do not do this in a component
```

---

## ECharts SSR Pattern

### The Problem

ECharts (and vue-echarts) use canvas rendering and browser APIs. They cannot run server-side. Attempting to render a chart during SSR will throw `ReferenceError: window is not defined` or `ReferenceError: document is not defined`.

### Recommended Approach: `<ClientOnly>` wrapper

Use Nuxt's built-in `<ClientOnly>` component to defer chart rendering to the client exclusively.

```vue
<!-- app/pages/risk.vue -->
<template>
  <div>
    <h1>Risk Position</h1>

    <!-- Chart only renders client-side; server sends nothing in this slot -->
    <ClientOnly>
      <VendorRiskDonut :data="riskData" />
      <template #fallback>
        <!-- Server renders this; replaced by chart after hydration -->
        <div class="chart-placeholder" style="height: 300px;" />
      </template>
    </ClientOnly>

    <!-- Table renders on server and client normally -->
    <VendorRiskTable :vendors="vendors" />
  </div>
</template>
```

```vue
<!-- app/components/vendor/VendorRiskDonut.vue -->
<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
// Register only what is used — tree-shaking
use([PieChart, CanvasRenderer, /* ... */])
</script>
```

### Why `<ClientOnly>` Over nuxt-echarts Module

The `nuxt-echarts` module provides `VChartFull`, `VChartIsland`, and `VChartLight` components with server-side SVG rendering options. For this demo portal, `<ClientOnly>` wrapping `vue-echarts` directly is the right choice because:

1. The existing codebase already uses `vue-echarts` — lower migration cost
2. Full ECharts functionality (tooltips, legend interactions, animations) is required for demo impact
3. The `#fallback` slot provides a placeholder during SSR/hydration — avoids layout shift
4. nuxt-echarts SSR modes sacrifice client-side interactivity for FCP improvement, which is not a demo priority

**Confidence:** HIGH — `<ClientOnly>` is the documented Nuxt pattern for browser-only libraries. Verified via nuxt.com/docs/4.x/guide/best-practices/hydration.

### Chart Components Location

Chart components go in `app/components/` and are wrapped in `<ClientOnly>` at the page level (not inside the component itself). This keeps the component pure and makes the SSR boundary explicit in the page template.

---

## Pinia SSR Pattern

### The Problem

The existing `src/stores/tags.js` reads from and writes to `localStorage` at the top level of the store definition. In SSR, this code runs server-side where `localStorage` does not exist — it will throw.

Additionally, the store initializes from seed data in `src/data/tags.js` which was imported directly. In the Nuxt 4 architecture, the seed tags come from the `/api/tags` server route (or a dedicated defaults endpoint), not from a client-side import.

### Recommended Pattern: `@pinia/nuxt` with `callOnce`

Install `@pinia/nuxt` module. Pinia stores work with SSR when `useStore()` is called inside `setup()` — `@pinia/nuxt` handles the state serialization into the page payload and hydration on the client automatically.

```typescript
// app/stores/tags.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Tag, TagAssignments } from '~/shared/types'

const STORAGE_KEY = 'district-demo-tags'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([])
  const assignments = ref<TagAssignments>({})

  // Initialize only client-side — localStorage does not exist server-side
  function initFromStorage(seedTags: Tag[]) {
    if (!process.client) return
    try {
      const storedTags = localStorage.getItem(`${STORAGE_KEY}-definitions`)
      const storedAssignments = localStorage.getItem(`${STORAGE_KEY}-assignments`)
      tags.value = storedTags ? JSON.parse(storedTags) : seedTags
      assignments.value = storedAssignments ? JSON.parse(storedAssignments) : {}
    } catch {
      tags.value = seedTags
    }
  }

  // Persist on mutation — only runs client-side since watch callbacks run in the same context
  if (process.client) {
    watch(tags, v => localStorage.setItem(`${STORAGE_KEY}-definitions`, JSON.stringify(v)), { deep: true })
    watch(assignments, v => localStorage.setItem(`${STORAGE_KEY}-assignments`, JSON.stringify(v)), { deep: true })
  }

  // ... addTag, updateTag, deleteTag, assignTag, removeTagFromVendor, tagsForVendor
  return { tags, assignments, initFromStorage, /* ... */ }
})
```

```typescript
// app/pages/tags.vue — call initFromStorage after mounting
<script setup lang="ts">
const tagsStore = useTagsStore()
const { data: seedTags } = await useFetch('/api/tags/defaults')

// callOnce prevents double-execution during SSR + hydration
await callOnce(async () => {
  // This runs once — on server it's a no-op (process.client guard inside);
  // on client it loads from localStorage or falls back to seed
  tagsStore.initFromStorage(seedTags.value ?? [])
})
</script>
```

### useState vs Pinia for Tags

Use Pinia, not `useState`, for the tags store. Rationale:

- Tags require complex mutations (cascade delete, color update, assign/unassign) — Pinia's action pattern is cleaner than exposing all mutation logic from a composable wrapping `useState`
- The store already has a tested shape from v0.5.0 — migrating it to Pinia SSR-safe patterns is lower risk than rewriting to `useState`
- `useState` is ideal for simple shared state (a boolean, a selected item ID); tags with assignments is sufficiently complex to warrant a store

**The key SSR rule for Pinia:** Never access `localStorage`, `window`, or `document` at store definition scope. Guard all browser-API calls with `if (process.client)` or move them to `onMounted()` in the component that calls `initFromStorage`.

### How @pinia/nuxt Handles Hydration

`@pinia/nuxt` automatically serializes the Pinia state tree into the Nuxt payload on server render. On the client, it restores that state before Vue hydrates the DOM. This means any store state set during SSR (e.g., from a `callOnce` fetch) is available to components without a second round-trip.

For the tags store, the SSR render will see empty `tags` and `assignments` (since we defer to client-side localStorage). This is intentional — the tags state is client-local demo state, not data that needs to be part of the server-rendered HTML. The page will render correctly server-side showing "no tags assigned" and then immediately update on client hydration when `initFromStorage` populates the store.

---

## Future API Integration

### How server/api/ Routes Enable the Swap

The key architectural decision is that `app/pages/` components call `/api/vendors`, `/api/dpa`, etc. — not import paths. This creates a clean seam.

**Current (mock):**
```typescript
// server/api/vendors.get.ts
import vendors from '../data/vendors'  // reads mock TS module

export default defineEventHandler(() => {
  return vendors  // returns mock array
})
```

**Future (real API):**
```typescript
// server/api/vendors.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  // API key is server-side only — never exposed to client
  const response = await $fetch(`${config.appCatalogUrl}/vendors`, {
    headers: { Authorization: `Bearer ${config.appCatalogApiKey}` }
  })
  return response.vendors
})
```

The `app/pages/discovery.vue` component calls `useFetch('/api/vendors')` and is completely unchanged between mock and real API. Only the handler implementation changes.

### server/data/ Convention

`server/data/` is a Nitro convention for data files that are imported by server routes but are NOT themselves HTTP routes. Files placed here are not auto-exposed — only `server/api/` and `server/routes/` files become HTTP endpoints.

This is important: `server/data/vendors.ts` contains the mock array, imported by `server/api/vendors.get.ts`. When the real API is wired up, `server/data/vendors.ts` is deleted (or kept as a fallback), and the handler points to the real source. No other files change.

### Environment Variables for Future API Keys

Nuxt runtime config separates server-only secrets from public config:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only (never sent to client)
    appCatalogApiKey: '',       // override with NUXT_APP_CATALOG_API_KEY env var
    appCatalogUrl: '',          // override with NUXT_APP_CATALOG_URL env var
    // Public (available client-side)
    public: {
      appName: 'District Demo'
    }
  }
})
```

On AWS Amplify, set `NUXT_APP_CATALOG_API_KEY` and `NUXT_APP_CATALOG_URL` as environment variables in the console. They are injected at runtime by Nitro — never bundled into client JS.

### Response Shaping in Server Routes

Server routes are the right place to shape API responses for the frontend. If the future app-catalog API returns a different schema than what the components expect, the transformation happens in `server/api/vendors.get.ts` — the component contract (`Vendor[]` from `shared/types/`) stays stable.

---

## Recommended Build Order

Phase ordering is driven by hard dependencies. Each phase must be completable and demonstrable before the next begins.

### Phase 1: Nuxt 4 Scaffold + TypeScript + Nuxt UI

**Why first:** Every subsequent phase depends on the project being a working Nuxt 4 app. This phase establishes the build system, TypeScript config, `nuxt.config.ts`, and `app/` directory structure.

Deliverables:
- `nuxt.config.ts` with `compatibilityVersion: 4`, `@pinia/nuxt`, `@nuxt/ui`
- `app/app.vue` with `<NuxtLayout><NuxtPage /></NuxtLayout>`
- `app/layouts/default.vue` shell (sidebar nav + slot) — static link list, no routing logic yet
- `app/pages/index.vue` stub rendering "Hello Nuxt 4"
- `shared/types/index.ts` with Vendor, DPA, Tag, TagAssignment interfaces
- `npm run dev` starts; `npm run build` succeeds

Dependency unlocked: TypeScript types, Nuxt UI component library, layout system.

### Phase 2: Server Data Layer + API Routes

**Why second:** Pages cannot be built until the data contract exists. The mock API routes establish the shape that all pages will depend on.

Deliverables:
- `server/data/vendors.ts`, `dpa.ts`, `edtech.ts`, `risk-labels.ts` (migrated from `src/data/`)
- `server/api/vendors.get.ts`, `dpa.get.ts`, `edtech.get.ts`, `risk-labels.get.ts`
- All routes return correctly typed arrays matching `shared/types/`
- Verified via `curl http://localhost:3000/api/vendors` (or browser)

Dependency unlocked: All pages can now call `useFetch('/api/*')`.

### Phase 3: Layout + Navigation + Pinia Store

**Why third:** Layout and navigation need a working Nuxt app (Phase 1) but do not depend on data routes (Phase 2). However, placing it after Phase 2 means the sidebar can link to real page routes validated in Phase 4+.

Deliverables:
- `app/layouts/default.vue` with dark sidebar, nav links, active state via `useRoute()`
- `app/stores/tags.ts` migrated with SSR-safe `process.client` guards
- File-based routes confirmed for: `/`, `/dashboard`, `/discovery`, `/dpa`, `/risk`, `/tags`
- Pinia store accessible from a stub page without hydration errors

Dependency unlocked: All pages can use the tags store. Layout renders correctly.

### Phase 4: Discovery Page

**Why fourth:** Discovery exercises the broadest set of patterns — data fetching, table rendering, VendorDrawer, tag assignment, ECharts radar chart inside `<ClientOnly>`. Proving these patterns here means DPA and Risk pages are straightforward.

Deliverables:
- `app/pages/discovery.vue` with `useFetch('/api/vendors')` + `useFetch('/api/dpa')`
- `app/components/vendor/VendorTable.vue` (Nuxt UI UTable replacing PrimeVue DataTable)
- `app/components/vendor/VendorDrawer.vue` with `<ClientOnly>` ECharts radar chart
- Tag assignment working via Pinia store + Nuxt UI USelectMenu

Dependency unlocked: Table + Drawer pattern reused in DPA and Risk pages.

### Phase 5: DPA Page + Dashboard

**Why fifth:** DPA page reuses VendorTable. Dashboard "Vendors Needing Attention" card uses DPA data already fetched and typed from Phase 2.

Deliverables:
- `app/pages/dpa.vue` with sortable/filterable table, color-coded status badges
- `app/pages/dashboard.vue` with "Top 8 Vendors Needing Attention" card
- `app/components/shared/StatusBadge.vue` using Nuxt UI UBadge

### Phase 6: Risk Position Page

**Why sixth:** Risk requires joined data (vendors + DPA + risk labels). The join logic is straightforward once all server routes are proven. ECharts donut chart is the second `<ClientOnly>` usage — pattern already established in Phase 4.

Deliverables:
- `app/pages/risk.vue` with `<ClientOnly>` donut chart + risk tier table
- Risk tier computed from vendor + DPA data in the server route or page composable

### Phase 7: Tags Management Page

**Why last:** Tags management is only meaningful when tag consumption (assignment in Discovery) is working. Putting it last ensures the full CRUD round-trip (create tag → assign in Discovery → manage in Tags) can be validated end-to-end.

Deliverables:
- `app/pages/tags.vue` with full CRUD — inline rename, 8-color palette, cascade delete, reset-to-defaults
- `initFromStorage` flow validated — tags persist across page refresh

### Phase 8: AWS Amplify Deployment

**Why last:** Deployment config can only be finalized once the build is confirmed working. This phase should be attempted with a working app, not a stub.

Deliverables:
- `amplify.yml` with correct build commands and `.amplify-hosting` output directory
- `nuxt.config.ts` Nitro preset set to `aws_amplify` (or auto-detected)
- Environment variable pattern documented for the team
- Successful deployment to dev environment on Amplify

---

## AWS Amplify Architecture

### How Nitro + Amplify Works

AWS Amplify Hosting has native support for SSR applications. When Nuxt builds with the `aws_amplify` Nitro preset, the output is placed in `.amplify-hosting/` (not `dist/`). Amplify's build system detects this directory and deploys:

- Static assets → Amplify CDN (S3 + CloudFront)
- Nitro server function → AWS Lambda or a managed Node.js compute layer
- Server routes (`/api/*`) → proxied through the Node.js function

Nitro auto-detects the Amplify CI/CD environment and selects the `aws_amplify` preset without explicit configuration. You can also set it explicitly:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'aws_amplify'
  }
})
```

### amplify.yml Configuration

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22 && node --version
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

**Key points:**
- `baseDirectory: .amplify-hosting` — not `dist/` or `.output/`. This is the Amplify-specific output Nitro produces.
- Node 20 is Amplify's default runtime. Specify `nvm use 22` if Node 22 features are needed.
- `npm ci` is preferred over `npm install` for reproducible builds.

### Environment Variables

Nuxt `runtimeConfig` maps environment variable names automatically: `NUXT_` prefix + uppercase config key name.

| Config key | Environment variable | Set in |
|------------|---------------------|--------|
| `runtimeConfig.appCatalogApiKey` | `NUXT_APP_CATALOG_API_KEY` | Amplify console → Environment variables |
| `runtimeConfig.appCatalogUrl` | `NUXT_APP_CATALOG_URL` | Amplify console → Environment variables |

During the mock-data phase (v1.0.0), no environment variables are required — all data comes from `server/data/` files. Environment variable infrastructure is worth documenting now so the pattern is ready for v1.1.0+ real API integration.

### Multi-Environment Setup (dev / staging / prod)

Amplify branch-based deployments map naturally to Nuxt environments:

- `main` branch → prod environment (Amplify default branch)
- `staging` branch → staging environment (Amplify branch deployment)
- `develop` branch → dev environment (Amplify branch deployment)

Each branch can have its own environment variables in the Amplify console. No changes to `amplify.yml` needed — same build commands for all environments. Environment-specific API keys and URLs are injected via the console.

### SSR Logging

Amplify supports CloudWatch integration for Nitro server logs. Enable "SSR logging" in the Amplify Hosting console to capture server-side errors from API routes. Useful for the future real API integration phase when debugging server route errors.

### Build Output Size

The Nitro server bundle for mock data should be small (< 10MB). When real API integration begins, `node_modules` included in the server bundle will grow. The `aws_amplify` preset optimizes for Lambda constraints but this is not a concern at v1.0.0 mock data scale.

---

## Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Nuxt 4 directory structure (`app/`, `server/`) | HIGH | Verified nuxt.com/docs/4.x/directory-structure |
| `useFetch` SSR payload behavior | HIGH | Verified nuxt.com/docs/getting-started/data-fetching |
| `<ClientOnly>` for ECharts | HIGH | Verified nuxt.com/docs/4.x/guide/best-practices/hydration |
| Pinia `@pinia/nuxt` SSR hydration | HIGH | Verified pinia.vuejs.org/ssr + nuxt.com/docs/getting-started/state-management |
| `server/data/` convention (not auto-exposed) | HIGH | Verified nuxt.com/docs/4.x/directory-structure/server |
| `amplify.yml` with `.amplify-hosting` baseDirectory | HIGH | Verified nitro.build/deploy/providers/aws-amplify |
| Nitro auto-detects Amplify CI/CD | MEDIUM | Documented in Nitro provider docs; behavior confirmed in community reports |
| Phase build order | HIGH | Follows hard dependency graph (scaffold → types → data → pages) |

---

*Sources:*
- *Nuxt 4 Directory Structure: https://nuxt.com/docs/4.x/directory-structure*
- *Nuxt 4 Server Directory: https://nuxt.com/docs/4.x/directory-structure/server*
- *Nuxt 4 Data Fetching: https://nuxt.com/docs/getting-started/data-fetching*
- *Nuxt 4 State Management: https://nuxt.com/docs/getting-started/state-management*
- *Nuxt 4 Hydration Best Practices: https://nuxt.com/docs/4.x/guide/best-practices/hydration*
- *Nuxt 4 Layouts: https://nuxt.com/docs/4.x/directory-structure/app/layouts*
- *Pinia SSR: https://pinia.vuejs.org/ssr/*
- *Nitro AWS Amplify: https://nitro.build/deploy/providers/aws-amplify*
- *Nuxt Deploy AWS Amplify: https://nuxt.com/deploy/aws-amplify*
- *Nuxt 4 Announcement: https://nuxt.com/blog/v4*
- *nuxt-echarts Module: https://echarts.nuxt.dev/guides/ssr*
