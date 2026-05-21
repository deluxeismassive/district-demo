# Phase 9: Server Data Layer - Research

**Researched:** 2026-05-21
**Domain:** Nuxt 4 server/api/ event handlers, typed useFetch, shared/ vs server-only TypeScript interfaces, Nitro prerendering of API routes for static deployment
**Confidence:** HIGH

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | All mock data served through Nuxt server API routes (`server/api/vendors.get.ts`, `server/api/dpa.get.ts`, `server/api/edtech.get.ts`); source data in `server/data/*.ts` | Section 1 (route file naming), Section 2 (data file split), Section 4 (migration mapping) |
| DATA-02 | Pages and components use `useFetch('/api/...')` exclusively to load data; no direct imports of data files from client-side code | Section 3 (useFetch typing), Section 7 (server/client boundary), Section 9 (wiring scope) |

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Vue 3 + Vite (Phase 7 swapped to Nuxt 4). No conflicting frameworks.
- **Deployment:** Static GitHub Pages — no server runtime in deploy. Phase 13 will switch on `nitro.prerender` + base path. Phase 9 MUST preserve the static-output property, which means every `/api/*` route Phase 9 introduces must be prerenderable.
- **Data:** All synthetic, no backend calls. Source data moves from `src/data/*.js` to `server/data/*.ts` — same content, typed.
- **Iteration speed:** A developer must be able to change a vendor's DPA status in `server/data/dpa.ts`, reload, and see the change in under an hour. This is Phase 9 success criterion 3 verbatim.
- **Auth:** None — routes are public.
- **GSD enforcement:** All file changes through `/gsd:execute-phase`.
- **Naming:** PascalCase for `.vue` SFCs; camelCase for `.ts` modules; kebab-case for filenames in `pages/`. `server/api/` filenames are lowercase with `.{method}.ts` suffix.
- **Indentation:** 2 spaces, ES modules, no linter/formatter configured.

---

## User Constraints (from CONTEXT.md)

> **No CONTEXT.md exists for Phase 9** — running in autonomous mode per init payload. Locked decisions from STATE.md + ROADMAP + REQUIREMENTS + carry-forward from Phases 7-8 govern.

### Locked Decisions (from STATE.md + ROADMAP)

- **`server/api/` route naming:** `vendors.get.ts`, `dpa.get.ts`, `edtech.get.ts` — REST-style, Nuxt file-based naming (STATE.md "Key Decisions v1.0.0").
- **Source data location:** `server/data/*.ts` — typed interfaces (DATA-01 explicit).
- **Client-side data access:** `useFetch('/api/...')` ONLY — no direct imports of data files from `app/` (DATA-02 explicit).
- **Plan budget:** 2 plans (ROADMAP) — `09-01` data migration (server/data/*.ts + shared types), `09-02` routes + useFetch integration.
- **Risk labels stay client-side:** `src/data/riskLabels.js` is tier-label config consumed by client UBadge styling in Phases 11-12. Migrates to `app/utils/riskLabels.ts` (or `shared/utils/riskLabels.ts` — see Section 6), NOT `server/data/`.
- **Discovery usage metrics:** Merge into `Vendor` interface — Phase 10 reads `useFetch('/api/vendors')` to populate the Discovery table including frequency/lastSeen/userCount/studentCount. (See Section 4 for rationale.)
- **PageMeta type augmentation is owned by Phase 8** — Phase 9 MUST NOT redeclare nav/navLabel/navIcon/navOrder.

### Claude's Discretion

- **Shared types location:** `shared/types/*.ts` (auto-imported by both client and server since Nuxt v3.14+) vs. `server/utils/types.ts` (server-only, client repeats type). Recommendation in Section 6: **`shared/types/data.ts`** for the data interfaces — this lets future Phase 10+ code optionally annotate `useFetch` result types if Nitro's auto-inference proves insufficient.
- **Discovery metrics — separate route or merged?** Recommendation in Section 4: **merge into `Vendor`** — eliminates Phase 10 client-side join overhead, matches the existing v0.5.0 view-level join pattern (`Object.fromEntries(...).map(...)`), and reduces network round-trips for the Discovery page from 2 to 1.
- **Phase 9 useFetch wiring scope:** Recommendation in Section 9: **wire ONE page (discovery)** to prove the typing + payload + hot-swap properties. The other 4 pages keep their stubs untouched and inherit the data layer in Phases 10-12.
- **Pre-render configuration for /api/ routes:** Recommendation in Section 5: **defer to Phase 13** — Phase 9 routes work at dev time via Nitro's dev server; static prerendering wiring belongs to deployment phase. Surface this as a known handoff issue in Phase 9 deliverables.

### Deferred to Later Phases (OUT OF SCOPE for Phase 9)

- Real UI for Discovery table — UTable, USlideover, ECharts radar (Phase 10).
- VendorDrawer drill-down (Phase 10).
- DPA table + UBadge color statuses + Dashboard "Top 8" card (Phase 11).
- Risk Position donut + tier table + Tags Management CRUD (Phase 12).
- Pinia store mutations against vendor data (Phase 12 if at all — current Pinia store is for tags only).
- `nitro.prerender.routes` / base path / gh-pages deploy wiring (Phase 13).
- Vitest / Playwright integration tests — Phase 9 introduces curl + grep probes against a live dev server; deeper test infrastructure deferred to a future v1.1+ if API surface grows.

---

## Summary

Phase 9 is a clean two-task split: (1) move three JS data files into three TypeScript data files plus a shared types file, (2) create three Nitro event handlers that import and return the data and probe-verify one page wires `useFetch` cleanly.

The pivotal technical fact: **Nuxt 4 / Nitro infers the return type of a `defineEventHandler(...)` callback and propagates that type to `useFetch('/api/route')` calls in pages — fully automatic, no manual type annotation needed.** This is verified via Nuxt 4 docs (useFetch composable, server directory structure). If our handler returns `Vendor[]`, then `const { data } = await useFetch('/api/vendors')` types `data` as `Ref<Vendor[] | null>` with zero ceremony. The only failure mode is when the handler returns `new Response(...)` (the raw Web Response constructor) — that breaks type inference. We return plain objects/arrays, so we're safe.

The second pivotal fact: **static deployment "just works" for our case.** When `nuxi generate` prerenders a page that calls `useFetch('/api/vendors')`, Nitro serializes the response into the page's `__NUXT__` payload — the API response is baked into the HTML/JSON payload of that page, not a separate file. Client-side navigation between prerendered pages then loads `_payload.json` which already contains the data. No live server needed. **However**, Phase 13 will need `nitro.prerender.routes: ['/api/vendors', '/api/dpa', '/api/edtech']` if we want the `/api/X` routes to ALSO be reachable as standalone JSON files (e.g., if a future feature wants to fetch from outside Nuxt). Phase 9 does NOT need this — page-level useFetch payload inlining is sufficient for current scope.

The third pivotal fact: **`shared/` directory is available in Nuxt 4 (added in v3.14+, present in v4 by default).** Files in `shared/types/` and `shared/utils/` are auto-imported on BOTH server and client. This is the right home for `Vendor`, `DpaRecord`, `EdtechRecord` interfaces — both `server/data/vendors.ts` AND any client page can `Vendor[]` reference without explicit imports. The hard restriction: `shared/` code cannot import any Vue or Nitro code (so we can't put runtime helpers there that touch composables). Pure types and pure utility functions only.

The fourth fact: **the source data is 100% migration-ready.** All 27 vendors in `src/data/vendors.js` match all 27 in `src/data/discovery.js` (verified by node script: 0 missing, 0 extra). The DPA file has 27 entries; the edtech file has 28 entries (28 vs 27 — needs reconciliation, see Section 4). Discovery usage data merges cleanly into a single `Vendor` interface.

**Primary recommendation:** Two-plan execution exactly as ROADMAP specifies. Plan 09-01 creates `shared/types/data.ts`, `server/data/{vendors,dpa,edtech}.ts`, and (if discovery merges into vendors per recommendation) writes the merged data inline in `vendors.ts`. Plan 09-02 creates `server/api/{vendors,dpa,edtech}.get.ts`, wires `useFetch('/api/vendors')` into `app/pages/discovery.vue` as the proof-of-typing demo, and proves all 4 success criteria via curl + grep + typecheck probes.

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Route file naming | **`server/api/vendors.get.ts`, `dpa.get.ts`, `edtech.get.ts`** | STATE.md locked; Nuxt convention; `.get.ts` suffix scopes handler to GET method |
| 2 | Handler signature | **`export default defineEventHandler(() => { ... })`** returning plain object/array | Auto-imported in Nuxt 4; no `import { defineEventHandler } from 'h3'` needed |
| 3 | Where do shared types live | **`shared/types/data.ts`** (`Vendor`, `DpaRecord`, `EdtechRecord`, `Frequency`, `DpaStatus`, `EdtechCertStatus`, `RiskLabel`) | Auto-imported on both server and client (Nuxt v3.14+); single source of truth; types work in both `server/data/vendors.ts` and any future `app/pages/*.vue` that needs explicit annotation |
| 4 | Discovery metrics — merge or separate? | **Merge into `Vendor` interface** (add `frequency`, `lastSeen`, `userCount`, `studentCount` fields per vendor) | Phase 10 success criterion: "27 rows via useFetch('/api/vendors')"; merging eliminates client-side join; matches v0.5.0 view-level join pattern; reduces Discovery page fetches from 2 to 1 |
| 5 | edtech 28 vs 27 — extra record? | **Reconcile during migration** — find the orphan record, decide drop or fix | Verified via node script at research time (see Section 4); needs eyeballed reconciliation in 09-01 |
| 6 | `useFetch` typing strategy | **Trust Nitro's inference** — no manual generic `<Vendor[]>` annotation | Nuxt 4's typed-routes feature auto-types the data ref from the handler's return type; manual annotation duplicates and can drift |
| 7 | `useFetch` options for static demo | **`{ default: () => [] }`** to avoid `null` data on first render; let `lazy` default to `false`; let `server` default to `true` (SSR-fetch + payload to client) | Avoids `data.value === null` checks at template-level; preserves SSR rendering so curl probes can verify content |
| 8 | Static generate behavior | **Trust page-level payload inlining; defer explicit `nitro.prerender.routes` to Phase 13** | When `nuxi generate` prerenders `discovery.vue` (which uses `useFetch`), the response is baked into the page's payload — no separate JSON file needed for our scope |
| 9 | Phase 9 page wiring scope | **Wire ONE page: `app/pages/discovery.vue` with `useFetch('/api/vendors')` + render the count** — leaves Pages 10-12 to wire the others | Proof-of-typing demo. ROADMAP success criterion 4 says "useFetch('/api/vendors') in a page component returns typed vendor data" — one page satisfies this. Phase 10 wires the rest. |
| 10 | `riskLabels.js` migration | **`shared/utils/riskLabels.ts`** with `RISK_LABEL_COLORS`, `DPA_STATUS_COLORS`, `EDTECH_STATUS_COLORS`, `RISK_TIER_COLORS` consts | Pure constants; needed by client (UBadge styling in Phase 11-12) — shared/ is correct home since both server and client may reference (e.g., a future API filter route). Phase 9 only needs to move the file; phases 11-12 consume. |
| 11 | DELETE `src/data/*.js` after migration | **YES — delete in 09-01** after the new `server/data/*.ts` files compile and Phase 9 probes pass | Otherwise the v0.5.0 graveyard files linger and a future grep can find them. The `src/views/*.vue` files still reference them but those views are dead code (not in Nuxt's scan path); they're scheduled for deletion in Phases 10-12 as each view is rewritten. |
| 12 | Negative probe — no client-side data imports | **`! grep -rE "from ['\"].*src/data/" app/` AND `! grep -rE "from ['\"].*server/data/" app/`** | DATA-02 requires no static data imports from app/ |

---

## Per-Question Findings

### 1. Nuxt 4 server/api/ route file naming and event handler patterns

**File naming conventions (verified Nuxt 4 docs):**

| File | Endpoint | Methods matched |
|------|----------|-----------------|
| `server/api/vendors.get.ts` | `GET /api/vendors` | GET only — `.get.ts` suffix scopes to GET |
| `server/api/vendors.post.ts` | `POST /api/vendors` | POST only |
| `server/api/vendors.ts` (no suffix) | `/api/vendors` | All HTTP methods |
| `server/api/users/[id].get.ts` | `GET /api/users/:id` | GET with dynamic param |

**Per Phase 9 needs:** all three handlers are GET-only — use `.get.ts` suffix.

**Canonical handler signature (Nuxt 4, 2026):**

```ts
// server/api/vendors.get.ts
import vendors from '~~/server/data/vendors'

export default defineEventHandler(() => {
  return vendors  // type: Vendor[]
})
```

Key points:

- **`defineEventHandler` is auto-imported** — do NOT add `import { defineEventHandler } from 'h3'`. Nuxt 4's Nitro layer auto-imports it.
- **Return value is the response body** — Nitro auto-serializes to JSON with `Content-Type: application/json` (verified via Nuxt docs).
- **Return TYPE propagates to client** — when `useFetch('/api/vendors')` runs, TypeScript infers `data: Ref<Vendor[] | null>` from the handler's return type. This is Nuxt 4's "typed API routes" feature, working out of the box (verified via Nuxt 4 useFetch composable docs).
- **Async handlers supported** — `defineEventHandler(async (event) => { ... })`. We don't need async for static data.
- **`event` argument is optional** — for our case (no query params, no body, no headers needed) just omit it.

**The data import path:**

`~~/server/data/vendors` — the `~~` alias points to the project root (Nuxt 4 alias). Alternatively, the handler can use a relative import `../data/vendors`. Recommend the alias form for clarity and refactor-safety.

**What NOT to do:**

```ts
// WRONG — breaks type inference
export default defineEventHandler((event) => {
  return new Response(JSON.stringify(vendors), {  // Web Response constructor
    headers: { 'Content-Type': 'application/json' }
  })
})
```

Using `new Response(...)` returns an opaque type to Nitro; the inferred response type for `useFetch` becomes `Response` instead of `Vendor[]`. Always return plain objects/arrays.

```ts
// WRONG — runtime error
export default function vendors() {  // missing defineEventHandler wrapper
  return vendors
}
```

Nitro REQUIRES the handler to be wrapped in `defineEventHandler` (or its alias `eventHandler`). A bare function will not be registered.

**Sources:**

- [Nuxt 4 Server Directory docs](https://nuxt.com/docs/4.x/guide/directory-structure/server) — file naming, method suffixes
- [Nuxt useFetch v4 docs](https://nuxt.com/docs/api/composables/use-fetch) — "infers API response type", "provides type hints for request url based on server routes"
- [Nuxt typed routes discussion #17243](https://github.com/nuxt/nuxt/discussions/17243) — typed defineEventHandler patterns

**Confidence:** HIGH.

---

### 2. server/api/ vs server/data/ discipline

**The split:**

```
server/
├── api/             ← Nitro auto-scans; .get.ts/.post.ts/etc create HTTP routes
│   ├── vendors.get.ts
│   ├── dpa.get.ts
│   └── edtech.get.ts
├── data/            ← NOT auto-scanned; pure data exports, imported by api handlers
│   ├── vendors.ts
│   ├── dpa.ts
│   └── edtech.ts
└── utils/           ← NOT auto-scanned; server-only helpers (not needed in Phase 9)
```

**Critical:** `server/data/` has **no special meaning to Nitro** — it's just a folder under `server/` where we choose to put data exports. Nitro only auto-creates routes from `server/api/`, `server/routes/`, `server/middleware/`, and `server/plugins/`. (Verified: Nuxt 4 server directory docs.)

**Why split data from handlers:**

1. **Hot-swap property** (Phase 9 success criterion 3) — editing `server/data/dpa.ts` triggers Nitro HMR for the data file, which transitively reloads the handler that imports it. Edit data → save → reload page → see change. Tested mental model: Nitro watches all files under `server/`, including `server/data/`, by default.
2. **Single-source-of-truth** — multiple handlers can share data (e.g., a future `/api/vendors/[id].get.ts` would import the same `vendors` array).
3. **Server-only enforcement** — files under `server/` are bundled ONLY into the Nitro server build, not the client bundle. This is what makes DATA-02 enforceable: a client file that imports from `~~/server/data/*` will fail to build (Nitro raises an error).

**Equivalent pattern observed in Nuxt community:** `server/utils/` for pure helpers, `server/db/` for ORM models, `server/data/` for static data. Our project's "all data is synthetic" makes `server/data/` the precise fit.

**Confidence:** HIGH.

---

### 3. `useFetch` typing in Nuxt 4

**Auto-typing mechanism (verified):**

Nuxt 4's Nitro generates an `InternalApi` map from all `server/api/*` handlers at build time. `useFetch('/api/X')` looks up `'/api/X'` in this map and returns `Ref<{ResponseType} | null>`. **No manual generic annotation needed.**

**Concrete example (the Phase 9 demo wiring):**

```vue
<!-- app/pages/discovery.vue (Phase 9 minimal wiring) -->
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

// Type inference: data is Ref<Vendor[] | null> — NO explicit <Vendor[]> generic
const { data: vendors, pending, error } = await useFetch('/api/vendors', {
  default: () => [],  // avoids null on first render; data: Ref<Vendor[]>
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">
      Loaded {{ vendors?.length ?? 0 }} vendors via useFetch.
      (Phase 10 wires the full UTable.)
    </p>
  </div>
</template>
```

The `data` ref is typed `Ref<Vendor[]>` because of the `default: () => []` factory (without `default`, it would be `Ref<Vendor[] | null>`). Hovering `vendors[0].name` in an editor will autocomplete `name`, `category`, `privacyScore`, `frequency`, `lastSeen`, etc. — all auto-inferred.

**Critical: when does type inference break?**

| Pattern | Inference | Notes |
|---------|-----------|-------|
| `return vendors` (plain array) | ✅ Works | Returns `Vendor[]` |
| `return { data: vendors, total: 27 }` | ✅ Works | Returns the object literal type |
| `return useStorage().getItem('vendors')` | ⚠️ Returns `unknown` | Storage API is untyped at handler boundary |
| `return new Response(JSON.stringify(vendors))` | ❌ Breaks — returns `Response` | Don't use Web Response constructor |
| `setResponseStatus(event, 200); return vendors` | ✅ Works | Setting status via h3 helpers doesn't affect return type |

**`useFetch` vs `$fetch` vs `useAsyncData`:**

| Composable | Use when | SSR-safe | Auto-keyed | Notes |
|------------|----------|----------|------------|-------|
| `useFetch(url)` | Page or component setup, initial data | ✅ Yes | ✅ Yes (URL+options) | **Recommended for Phase 9** |
| `$fetch(url)` | Imperative client-side action (button click, refresh) | ⚠️ Double-fetches if used in setup | No | Use in event handlers, not setup |
| `useAsyncData(key, () => ...)` | When you can't use useFetch (custom client like a CMS, GraphQL, etc.) | ✅ Yes | Manual key | Overkill for our REST routes |
| `useLazyFetch(url)` | Same as useFetch but non-blocking navigation | ✅ Yes | ✅ Yes | Use if a slow fetch shouldn't block route transition; not needed for our static data |

**Sources:**

- [Nuxt useFetch v4 docs](https://nuxt.com/docs/api/composables/use-fetch) — "infers API response type"
- [Nuxt Data Fetching v4 docs](https://nuxt.com/docs/4.x/getting-started/data-fetching) — `$fetch` vs `useFetch`: "If the `$fetch` function is used to perform data fetching in the setup function of a Vue component, this may cause data to be fetched twice, once on the server (to render the HTML) and once again on the client."

**Confidence:** HIGH.

---

### 4. Data migration plan from JS → TS

**Files to migrate (verified inventory):**

| Source (v0.5.0) | Destination (v1.0.0) | Record count | Action |
|-----------------|----------------------|--------------|--------|
| `src/data/vendors.js` | `server/data/vendors.ts` | 27 | Migrate + merge discovery fields |
| `src/data/discovery.js` | **merged into `vendors.ts`** (not a separate file) | 27 | Merge by `vendorId` |
| `src/data/dpa.js` | `server/data/dpa.ts` | 27 | Migrate verbatim |
| `src/data/edtech.js` | `server/data/edtech.ts` | **28** | Reconcile during migration (28 records but only 27 vendors — find orphan) |
| `src/data/riskLabels.js` | `shared/utils/riskLabels.ts` | n/a (consts) | Migrate as shared util (not server data) |

**edtech 28 vs 27 — the orphan:**

The verification script during research (`vendors.length === 27`, `discovery.length === 27`, `dpa.length === 27`, but `edtech.length === 28`) reveals one of two scenarios:

1. **Duplicate vendorId** in `edtech.js` (one vendor has two certification records).
2. **Stray record** with a vendorId not in `vendors.js` (a leftover from v0.5.0 iteration).

The plan-checker should diff `edtech` vendorIds against `vendors` vendorIds during Plan 09-01 implementation and either drop the orphan or, if it's a duplicate, keep the most-recent one. Either choice is defensible for a synthetic-data demo; document the choice in the plan.

**Field inventory (per file):**

```ts
// shared/types/data.ts (proposed)

// --- Vendor ---
export interface PrivacyScore {
  informationCollected: number
  useOfInformation: number
  dataSharing: number
  securityMeasures: number
  userRights: number
  retentionPeriod: number
  complianceWithLaws: number
  updatesToPolicy: number
  clarityAndTransparency: number
  contactInformation: number
}

export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely'

export interface Vendor {
  vendorId: string             // stable join key, e.g. 'vendor-google-classroom'
  name: string
  category: string             // 'LMS' | 'SSO / Identity' | ... — keep string for now; could narrow later
  privacyScore: PrivacyScore
  // Merged from discovery.js (one record per vendor, see note below)
  frequency: Frequency
  lastSeen: string             // ISO date string YYYY-MM-DD
  userCount: number
  studentCount: number
}

// --- DPA ---
export type DpaStatus = 'Signed' | 'Unsigned' | 'Expired' | 'Pending'
export type RiskLabel = 'High Usage / No DPA' | 'No DPA' | 'High Risk Score'

export interface DpaRecord {
  vendorId: string
  status: DpaStatus
  signedDate: string | null    // ISO date YYYY-MM-DD or null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}

// --- 1EdTech ---
export type EdtechCertStatus = 'Certified' | 'Not Certified' | 'In Review' | 'Expired'

export interface EdtechRecord {
  vendorId: string
  certificationStatus: EdtechCertStatus
  certificationStandard: string | null     // 'OneRoster 2.0' | 'LTI 1.3' | 'Caliper 1.2' | 'CASE 1.0' | 'QTI 3.0' | null
  certifiedDate: string | null
}
```

**Note on merging discovery → Vendor:**

Discovery metrics (frequency, lastSeen, userCount, studentCount) are 1:1 with vendors. There is no scenario where the discovery data exists without a vendor or vice versa. The v0.5.0 Discovery view used a runtime join (`Object.fromEntries(discoveryData.map(d => [d.vendorId, d]))`); merging the data at-rest eliminates that join, simplifies the Vendor type, and matches "the data the page actually needs" exactly.

**Counter-argument considered:** Keeping discovery as a separate `/api/discovery` route preserves separation of concerns and matches the Discovery page's mental model. **Rejected because:** (a) it doubles the API surface area, (b) it forces Phase 10 to do a client-side join, (c) the v0.5.0 view-level join was already a workaround for the data being separated in source files — moving to v1.0.0 is the natural moment to denormalize.

**Vendor file shape (final):**

```ts
// server/data/vendors.ts
import type { Vendor } from '#shared/types/data'  // auto-imported but explicit for clarity

const vendors: Vendor[] = [
  {
    vendorId: 'vendor-google-classroom',
    name: 'Google Classroom',
    category: 'LMS',
    privacyScore: {
      informationCollected: 7, useOfInformation: 6, dataSharing: 5,
      securityMeasures: 9, userRights: 7, retentionPeriod: 6,
      complianceWithLaws: 8, updatesToPolicy: 7, clarityAndTransparency: 8,
      contactInformation: 9,
    },
    frequency: 'Daily',
    lastSeen: '2026-05-13',
    userCount: 1842,
    studentCount: 14230,
  },
  // ... 26 more
]

export default vendors
```

**riskLabels migration:**

```ts
// shared/utils/riskLabels.ts
export const RISK_LABELS = {
  HIGH_USAGE_NO_DPA: 'High Usage / No DPA',
  NO_DPA: 'No DPA',
  HIGH_RISK_SCORE: 'High Risk Score',
} as const

export const RISK_LABEL_COLORS: Record<string, string> = {
  'High Usage / No DPA': '#b91c1c',
  'No DPA': '#ef4444',
  'High Risk Score': '#d97706',
}

export const DPA_STATUS_COLORS: Record<string, string> = {
  Signed: '#16a34a',
  Expired: '#dc2626',
  Pending: '#f59e0b',
  Unsigned: '#6b7280',
}

export const EDTECH_STATUS_COLORS: Record<string, string> = {
  Certified: '#16a34a',
  'Not Certified': '#6b7280',
  'In Review': '#f59e0b',
  Expired: '#dc2626',
}

export const RISK_TIER_COLORS: Record<string, string> = {
  High: '#dc2626',
  Medium: '#f59e0b',
  Low: '#16a34a',
}
```

Phase 11-12 consume these via auto-import (since `shared/utils/` is auto-imported on both server and client per Nuxt 4 docs). Phase 9 just moves the file; no consumers in Phase 9 itself.

**Confidence:** HIGH for migration mechanics; MEDIUM-HIGH for the edtech 28-vs-27 reconciliation (need eyeball check during 09-01).

---

### 5. Static generate behavior (Phase 13 implications)

**Phase 9 ships dev-server-tested routes. What happens at `nuxi generate` (Phase 13)?**

**The mechanism (verified Nuxt 4 + Nitro docs):**

1. `nuxi generate` is shorthand for `nuxi build --prerender` — Nitro starts a temporary in-process server, hits each prerendered route via `$fetch`, and writes the response to `.output/public/`.
2. Pages are prerendered to `.output/public/<path>.html` + `.output/public/<path>/_payload.json`.
3. **The page's payload (`_payload.json`) contains the serialized result of every `useFetch` call made during SSR.** So when `discovery.vue` calls `useFetch('/api/vendors')` during prerender, the response is baked into `_payload.json` for the `/discovery` route.
4. At runtime on the client, when the user lands on `/discovery`, the page HTML is served from `.output/public/discovery.html`, with the `vendors` data inlined in the `__NUXT__` global. Client-side navigation later (e.g., back to `/`) loads the next page's `_payload.json`, which similarly contains its useFetch results.

**Critical implication for Phase 9 success criterion 2** ("Network tab on any page shows XHR/fetch calls to /api/..."):

In **dev mode** (`npm run dev`, the mode used during Phase 9), useFetch makes real XHR calls to `/api/vendors` because the dev server runs a live Nitro instance — Network tab WILL show `/api/vendors` requests. Success criterion 2 is verifiable in dev.

In **prerendered production mode** (Phase 13), useFetch results are inlined into payloads — Network tab will show `_payload.json` requests for navigations but NOT `/api/vendors` directly. **This is fine and intentional** — the success criterion is about the architectural property ("data goes through API routes, not direct imports"), which is verified by the SOURCE CODE not containing `from '~/server/data/'` in client files. The Network tab is a dev-time verification artifact.

**Does Phase 9 need to configure `nitro.prerender.routes`?**

**No, for Phase 9 scope.** Phase 9 routes are exercised via dev-server probes. Phase 13 will (when it sets `nitro.preset: 'github_pages'` and configures prerendering) need to ensure all 5 pages are crawled. Since the sidebar has `<NuxtLink>` to all 5 routes from every page, `nitro.prerender.crawlLinks: true` (the default for `nuxi generate`) will discover them automatically.

**Phase 13 MAY explicitly add `/api/vendors`, `/api/dpa`, `/api/edtech` to `nitro.prerender.routes`** if they want the JSON to be reachable as standalone files at `.output/public/api/vendors`, `.output/public/api/dpa`, `.output/public/api/edtech` (no extension by default — Nitro writes the raw response with the original URL path). This is OPTIONAL for our scope but useful as a hedge — Phase 9's RESEARCH should surface this as a known Phase 13 todo.

**Sources:**

- [Nuxt 4 prerendering docs](https://nuxt.com/docs/4.x/getting-started/prerendering) — "You can even prerender API routes which is particularly useful for full statically generated sites (SSG) because you can then $fetch data as if you have an available server"
- [Nitro Config docs](https://nitro.build/config) — "`crawlLinks: true` enables the Nitro crawler"; "Any route specified will be fetched during the build and copied to the .output/public directory as a static asset"
- [NuxtHub pre-rendering guide](https://hub.nuxt.com/docs/guides/pre-rendering) — "Payloads contain serialized data from useAsyncData and useFetch, and client-side navigation loads these cached payloads instead of re-fetching data"

**Confidence:** HIGH for the architectural understanding. MEDIUM for the exact file-naming under `.output/public/api/` (some sources say `/api/vendors` with no extension, others mention `.json` — and behavior may vary by Nitro version). **Phase 13 will discover the exact format empirically**; not a Phase 9 blocker.

---

### 6. Shared types — `shared/types/` vs `server/utils/types.ts`

**The `shared/` directory (verified Nuxt 4 docs):**

> "The `shared/` directory is available in Nuxt v3.14+."

Since Nuxt 4 is built on top of Nuxt 3.x's later features (Nuxt 4 docs cross-reference 3.x extensively), `shared/` is fully supported in Nuxt 4. **No nuxt.config.ts change needed** — auto-imports are enabled by default.

**Auto-import scope:**

- `shared/types/*.ts` — types auto-imported on BOTH server and client
- `shared/utils/*.ts` — pure utilities auto-imported on BOTH server and client
- `shared/<other>/*` — NOT auto-imported by default (would require manual `imports.dirs` config)

**Restrictions:**

> "Code in the `shared/` directory cannot import any Vue or Nitro code."

So `shared/utils/riskLabels.ts` (pure consts) is fine. A `shared/utils/fetchVendor.ts` that wraps `useFetch` would NOT be (it imports a Vue composable). Composables stay in `app/composables/` or `server/utils/`.

**Why `shared/types/` over `server/utils/types.ts`:**

If types live in `server/utils/`, they're auto-imported on the server side only — client code that wants to type-annotate a `useFetch` response would need an explicit `import type { Vendor } from '~/server/utils/types'`, which (a) is awkward and (b) creates a soft dependency on server code from client code.

`shared/types/` resolves this cleanly:
- `server/data/vendors.ts` references `Vendor` without import (auto-imported)
- Any future `app/pages/discovery.vue` that wants `const vendor: Vendor = ...` works without import
- `useFetch('/api/vendors')` inference works regardless — both rely on the same `Vendor` interface

**Decision:** `shared/types/data.ts` (one file containing all four data interfaces — Vendor, DpaRecord, EdtechRecord, plus enums/aliases).

**Source:** [Nuxt 4 shared directory docs](https://nuxt.com/docs/4.x/guide/directory-structure/shared)

**Confidence:** HIGH.

---

### 7. Cache, hydration, and the SSR double-fetch problem

**The problem (verified Nuxt 4 docs):**

> "If the `$fetch` function is used to perform data fetching in the setup function of a Vue component, this may cause data to be fetched twice, once on the server (to render the HTML) and once again on the client."

**The solution (built into useFetch):**

- Server runs `useFetch('/api/vendors')` during SSR → data fetched, response saved to `__NUXT__` payload.
- Client hydrates → useFetch detects payload exists → uses it directly, no re-fetch.

**Default behavior is correct for our scope.** We do NOT need to override `key`, `server`, `lazy`, or other options for the basic case.

**Recommended options for Phase 9 discovery wiring:**

```ts
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],  // ensures data is Vendor[], never null
})
```

- **`default: () => []`** — provides initial empty array before fetch resolves, eliminates `vendors === null` template guards
- **`lazy` (default `false`)** — keep default. We WANT SSR to block on the fetch so the rendered HTML contains the data (Phase 9 probe: `curl /discovery | grep -q "27 vendors"`).
- **`server` (default `true`)** — keep default. We WANT SSR fetching.
- **`key`** — let Nuxt auto-generate from URL+options. Manual keys are only needed for deduplication in advanced cases.

**The classic double-fetch pitfall — only relevant if someone uses `$fetch` in setup:**

```vue
<!-- WRONG — double-fetches -->
<script setup lang="ts">
const vendors = await $fetch('/api/vendors')  // server fetches; then client fetches again
</script>

<!-- RIGHT -->
<script setup lang="ts">
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })
</script>
```

Phase 9 plan-check should grep for `\$fetch\(['"]\/api` in `app/` and fail if any matches outside of event handlers.

**Confidence:** HIGH.

---

### 8. Common Pitfalls (Phase 9-specific)

| # | Pitfall | Mitigation |
|---|---------|------------|
| 1 | Client file imports `~/server/data/vendors` — succeeds in dev (Nitro is lenient), fails in prod build | Lint rule: no imports from `**/server/**` in any `app/` file. Probe: `! grep -rE "from ['\"].*server/data" app/`. |
| 2 | Client file imports `~/src/data/...` (forgot the migration was done) | Probe: `! grep -rE "from ['\"].*src/data" app/` |
| 3 | Handler returns `new Response(...)` instead of plain object → useFetch types collapse to `Response` | Lint: `! grep -rE "new Response\(" server/api/` |
| 4 | Forgetting `.get.ts` suffix → handler responds to ALL methods (works fine but not REST-correct) | Convention: always use `.get.ts` for read routes |
| 5 | Hot-swap doesn't trigger reload because the dev server cached the data | Nitro should auto-reload on file change. If a stale fetch happens, hard-refresh the browser (Ctrl+Shift+R). Document this in Plan 09-02 verify steps. |
| 6 | edtech.ts has 28 records but vendors.ts has 27 → client-side joins produce undefined | Reconcile in Plan 09-01; verify `every edtech.vendorId in vendorIds`. |
| 7 | `Vendor` interface drift — server returns more fields than the interface declares | TypeScript only catches MISSING fields, not extra ones. Probe in Plan 09-01: `npm run typecheck` must pass with the interface declared and the data file annotated `Vendor[]`. |
| 8 | `useFetch` inside a non-page component fires on every mount → multiple fetches for the same data | Use `useFetch` in pages only; pass data to child components as props. Phase 9 only wires one page, so not yet an issue, but worth flagging for Phases 10-12. |
| 9 | `shared/types/data.ts` imports Vue or Nitro → broken at build time | Pure types only — no `import { Ref } from 'vue'`, no `import { H3Event } from 'h3'`. Probe: `! grep -E "from ['\"](vue\|h3\|#imports)" shared/` |
| 10 | Discovery merge corrupts existing privacyScore radar chart | Phase 10 reads `vendor.privacyScore.*` for the radar; merging discovery fields adds peer fields, doesn't touch the nested object. Verify in 09-01 by spot-checking 3 records. |
| 11 | Type augmentation in `shared/types/data.ts` clashes with existing `app/types/page-meta.d.ts` | They augment different modules (`#app` vs no module — just exports). No conflict. |
| 12 | Phase 9 deletes `src/data/*.js`, but `src/views/*.vue` files still import them, breaking build | `src/views/*.vue` are NOT in Nuxt's scan path (app/ only). Deleting `src/data/*.js` makes them dead code; Phases 10-12 delete the views as they rewrite. Verified Phase 8 anti-pattern note: "src/ files remain dead until their phase deletes them." |
| 13 | `useFetch` infers `Vendor[] \| null` not `Vendor[]` → template needs `vendors?.length` instead of `vendors.length` | Use `default: () => []` option to force non-null inference |
| 14 | `nuxi prepare` not run after adding server/api/* → TypeScript can't find typed routes | `npm install` triggers postinstall → `nuxi prepare`. Or manually run `npx nuxi prepare`. |
| 15 | Adding 28th vendor to `vendors.ts` to match edtech count, but discovery has no record for it → client join breaks | Reconcile from edtech side: drop the orphan edtech record. Do NOT add phantom vendor data. |

**Confidence:** HIGH for items 1-9, 11-14; MEDIUM for items 10 (depends on shape, but inspecting 3 records is fast); MEDIUM for item 15 (depends on which orphan exists).

---

### 9. Phase 9 wiring scope — proof-of-typing demo

ROADMAP Phase 9 success criterion 4: "`useFetch('/api/vendors')` in a page component returns typed vendor data with no TypeScript errors."

**The smallest viable demo:** wire ONE page that calls `useFetch('/api/vendors')` and renders ONE typed property (the count). Leave the other 4 pages as Phase 8 stubs — they get their data in their owning phases.

**Recommended target: `app/pages/discovery.vue`** — because:

1. Phase 10 will fully implement Discovery (UTable, USlideover, radar) and is next after Phase 9.
2. Discovery is the canonical "data-rich" page, so it's where the typing pattern matters most.
3. Phase 10 plan can take this Phase 9 hand-off (a working `useFetch` + count display) and extend it incrementally.

**The wiring (concrete):**

```vue
<!-- app/pages/discovery.vue (post-Phase-9) -->
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

// Phase 9: minimal useFetch demo. Phase 10 expands into UTable.
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">
      Loaded {{ vendors.length }} vendors from <code>/api/vendors</code>.
      (Phase 10 wires the UTable + USlideover.)
    </p>
  </div>
</template>
```

That's it — six lines of script setup, one Tailwind paragraph.

**Why NOT wire all 5 pages in Phase 9:**

- Pages 10-12 are designed to OWN their page implementations end-to-end. Wiring a `useFetch` in Phase 9 for the DPA page would create awkward partial state that Phase 11 has to navigate around.
- The success criterion is satisfied by ONE wiring. More is gold-plating.
- Phase 9's deliverable is "data layer works"; Phases 10-12's deliverables are "page X works." Keep the contract clean.

**Other 4 pages stay as Phase 8 stubs:**
- `index.vue` — Dashboard. Phase 11 wires Top 8.
- `dpa.vue` — Phase 11.
- `risk.vue` — Phase 12.
- `tags.vue` — Phase 12 (and it doesn't even use server data — only the Pinia store).

**Confidence:** HIGH.

---

### 10. Anti-patterns to Avoid

- **DON'T** import `src/data/*.js` from any file under `app/` after migration — the v0.5.0 files are deleted in 09-01. Any lingering reference is a regression.
- **DON'T** import `server/data/*.ts` from any file under `app/` — that bypasses the API layer and violates DATA-02. Nitro will likely error at build time, but lint/grep should catch first.
- **DON'T** import `defineEventHandler` from `'h3'` — Nuxt auto-imports it. Explicit imports are redundant and add noise.
- **DON'T** wrap handlers in `new Response(...)` — breaks type inference.
- **DON'T** use `$fetch('/api/...')` in `<script setup>` — causes double-fetch under SSR. Use `useFetch` instead.
- **DON'T** add manual `<Vendor[]>` generic to `useFetch` — duplicates the handler's return type, creates drift risk. Trust auto-inference.
- **DON'T** put `riskLabels.ts` under `server/data/` — it's UI styling config consumed by client components, belongs in `shared/utils/`.
- **DON'T** keep discovery as a separate `/api/discovery` route — merge into `Vendor` and eliminate the client-side join.
- **DON'T** add `nitro.prerender.routes` config in Phase 9 — defer to Phase 13.
- **DON'T** create a Vitest config in Phase 9 — curl + grep probes against the dev server are sufficient for the 4 success criteria. Defer test infrastructure to a future need.
- **DON'T** add `lazy: true` to useFetch — SSR-render needs the data so curl probes can verify content.
- **DON'T** call `useFetch` in `app/components/*` files (none exist yet, but Phase 10+ may add them) — fetch in pages, pass data as props.
- **DON'T** redeclare PageMeta interface keys (`nav`, `navLabel`, `navIcon`, `navOrder`) in any `.d.ts` file — Phase 8 owns that augmentation.

---

## Standard Stack

### Core (used by Phase 9)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `nuxt` | ^4.4.6 (installed) | Nitro server engine + useFetch composable + type inference | Required by NUXT-01; provides everything Phase 9 needs |
| TypeScript (via Nuxt) | bundled | Type inference for server handlers → useFetch | Required by NUXT-01 |
| `h3` (transitive) | bundled by Nuxt | `defineEventHandler` auto-import target | Internal — auto-imported, do not add as explicit dep |

**No new dependencies added in Phase 9.** Phase 9 is purely additive code (server/api, server/data, shared/types) plus one page edit (discovery.vue). No `npm install` needed.

**Verified versions (via `npm view`, 2026-05-21):**
- `nuxt@4.4.6` — latest, already in package.json (from Phase 7)
- All other deps unchanged from Phase 7-8

### Supporting (already installed, Phase 9 leverages)

| Library | Version | Purpose |
|---------|---------|---------|
| `@nuxt/ui` | ^4.8.0 | (no Phase 9 usage; Phases 10-12 consume data via UTable etc.) |

**Confidence:** HIGH.

---

## Architecture Patterns

### Recommended Project Structure (post-Phase-9)

```
app/
  app.vue                       # (unchanged from Phase 8)
  app.config.ts                 # (unchanged)
  assets/css/main.css           # (unchanged)
  layouts/default.vue           # (unchanged)
  pages/
    index.vue                   # (unchanged — Phase 8 stub)
    discovery.vue               # ★ MODIFIED — adds useFetch('/api/vendors')
    dpa.vue                     # (unchanged — Phase 8 stub)
    risk.vue                    # (unchanged — Phase 8 stub)
    tags.vue                    # (unchanged — Phase 8 stub)
  stores/tags.ts                # (unchanged)
  types/page-meta.d.ts          # (unchanged — Phase 8 owns)
server/                         # ★ NEW directory
  api/
    vendors.get.ts              # ★ NEW — returns Vendor[]
    dpa.get.ts                  # ★ NEW — returns DpaRecord[]
    edtech.get.ts               # ★ NEW — returns EdtechRecord[]
  data/
    vendors.ts                  # ★ NEW — 27 vendors with merged discovery fields
    dpa.ts                      # ★ NEW — 27 DPA records
    edtech.ts                   # ★ NEW — 27 edtech records (after orphan reconciliation)
shared/                         # ★ NEW directory
  types/
    data.ts                     # ★ NEW — Vendor, DpaRecord, EdtechRecord, enums
  utils/
    riskLabels.ts               # ★ NEW — migrated from src/data/riskLabels.js
src/                            # ★ data/*.js DELETED
  data/                         # ★ DELETED — vendors.js, discovery.js, dpa.js, edtech.js, riskLabels.js
  views/                        # (untouched — deferred to Phases 10-12 deletion)
  components/                   # (untouched)
  stores/                       # (already empty since Phase 7)
public/                         # (unchanged)
nuxt.config.ts                  # (unchanged)
tsconfig.json                   # (unchanged)
package.json                    # (unchanged — no new deps)
```

**Net diff vs Phase 8 ending state:**
- +9 files (3 server/api, 3 server/data, 1 shared/types, 1 shared/utils, plus the +modifications to discovery.vue)
- -5 files (src/data/{vendors,discovery,dpa,edtech,riskLabels}.js)
- Net: +4 files

### Pattern 1: Server data + handler split

```ts
// server/data/vendors.ts
import type { Vendor } from '#shared/types/data'

const vendors: Vendor[] = [ /* 27 records */ ]
export default vendors
```

```ts
// server/api/vendors.get.ts
import vendors from '~~/server/data/vendors'

export default defineEventHandler(() => vendors)
```

**Why this is the right pattern:** Data is hot-swappable (edit `server/data/vendors.ts`, Nitro HMRs the import chain), handler is trivial (one line + auto-import), types flow from the data file's annotated type through the handler's inferred return type into the client's useFetch.

### Pattern 2: Shared types via `shared/types/`

```ts
// shared/types/data.ts
export interface Vendor { /* ... */ }
export interface DpaRecord { /* ... */ }
export interface EdtechRecord { /* ... */ }
```

**Why:** Auto-imported on both server and client. Single source of truth for the data shape. No `import type { Vendor } from '~/server/data/types'` (which would create a server→client dependency).

### Pattern 3: Typed useFetch with `default` factory

```ts
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
// Type: vendors: Ref<Vendor[]>  (NOT Ref<Vendor[] | null>)
```

**Why:** `default` factory eliminates null-checking ceremony in templates. The type inference flows from `server/api/vendors.get.ts`'s return → useFetch's response type, with `default`'s return type providing the non-null guarantee.

### Anti-patterns to Avoid (summary)

- **DON'T** create `server/api/discovery.get.ts` — merge into vendors.
- **DON'T** use `$fetch` in setup — use `useFetch`.
- **DON'T** import server/data from app/.
- **DON'T** return `new Response(...)` from handlers.
- **DON'T** add `<Vendor[]>` generic to useFetch — trust inference.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP routing for /api endpoints | Custom Express/Fastify app | Nuxt server/api/ file convention | Zero config, automatic method matching via `.get.ts` suffix, auto JSON serialization, auto type inference |
| Request handler type signatures | Manual `(req, res) => ...` Express style | `defineEventHandler((event) => ...)` | h3 unified handler shape; integrates with Nitro's type system; cross-runtime compatible (Node, Bun, Cloudflare, Lambda) |
| Shared types between client and server | Duplicated interfaces in two files | `shared/types/*.ts` | Auto-imported, no drift, framework-enforced server/client boundary |
| Client API wrapper layer | `api.ts` with `axios.get('/api/vendors')` etc. | `useFetch` composable | SSR-safe, payload-aware (no double-fetch), auto-typed, integrates with Nuxt's suspension and error handling |
| API response caching | Custom localStorage cache + invalidation | useFetch's built-in `key` + payload hydration | Server payload travels to client during SSR; client navigations reuse payloads automatically |
| Static JSON file generation | `node build-static-json.js` script | `nitro.prerender` (Phase 13) | Built-in to Nuxt's generate command; integrates with link crawling; no separate build step |
| Server/client boundary enforcement | Custom ESLint plugin | Nuxt's `server/` directory convention | Files under `server/` are physically excluded from client bundle by Nitro; build error catches violations |
| HTTP method dispatch | `if (req.method === 'GET') { ... }` in single handler | `vendors.get.ts` / `vendors.post.ts` / `vendors.put.ts` file split | File-based dispatch is faster (no runtime branching), more discoverable, and matches REST conventions |

**Key insight:** Phase 9 is the canonical "let Nitro do its thing" phase. The wrong instinct is to architect a service layer (DataService class, repository pattern, response wrapper objects); the right instinct is to write three 2-line files under `server/api/` and three data-array files under `server/data/`, and let Nitro + useFetch handle wiring, typing, serialization, payload management, and prerendering. **Total handler code in Phase 9: about 9 lines** (3 files × 3 lines each).

---

## Common Pitfalls

### Pitfall 1: Client-side import of `~/server/data/*` succeeds in dev, fails in prod

**What goes wrong:** A page or component file accidentally does `import vendors from '~/server/data/vendors'` to "avoid the round trip." It works in `npm run dev` (Nitro is lenient about cross-boundary imports), but `npm run build` fails OR (worse) succeeds but leaks server-only code into the client bundle.

**Why it happens:** The mental model "server/data is just a folder" doesn't account for Nitro's server-only build target.

**How to avoid:** Add a build-time probe: `! grep -rE "from ['\"].*server/data" app/`. Fail Phase 9 verification if any matches.

**Warning signs:** `npm run build` warnings about server code in client bundle; bundle size larger than expected; SSR fetch firing for data that should be inlined.

### Pitfall 2: Handler returns `new Response(...)` instead of plain object → useFetch typing collapses

**What goes wrong:** A handler uses `new Response(JSON.stringify(vendors), { headers: { 'Content-Type': 'application/json' } })` to "be explicit about JSON." The resulting useFetch response type becomes `Response` (the Web API) instead of `Vendor[]`. Editor autocomplete breaks, typecheck doesn't catch broken consumers.

**Why it happens:** Developer instinct from raw Express/Fastify code where you manually set response headers.

**How to avoid:** Just `return vendors` — Nitro auto-serializes and auto-sets `Content-Type: application/json`. Probe: `! grep -rE "new Response\(" server/api/`.

**Warning signs:** `useFetch` data property has no autocomplete for vendor fields; typecheck silent where it should catch typos.

### Pitfall 3: edtech.js has 28 records but only 27 vendors → silent client-side join failures

**What goes wrong:** The DPA page (Phase 11) does `vendorsMap[edtechRecord.vendorId]` and gets `undefined` for the orphan record. Page renders one row with "—" everywhere; user wonders what's broken.

**Why it happens:** Stray record in v0.5.0 source data — likely a vendor that was removed from vendors.js but not edtech.js, or a duplicate.

**How to avoid:** In Plan 09-01, after writing `server/data/edtech.ts`, run a probe: `node -e "const v=require('./server/data/vendors.ts').default; const e=require('./server/data/edtech.ts').default; console.log('orphan edtech:', e.filter(x => !v.some(y => y.vendorId === x.vendorId)))"`. If non-empty, decide drop or rename, then re-verify.

**Warning signs:** Phase 11 client-side join shows "—" or "null" cells; record count mismatch in Discovery vs DPA tabs.

### Pitfall 4: `useFetch` data is `Ref<Vendor[] | null>`, template uses `vendors.length` → SSR error

**What goes wrong:** Without `default: () => []`, `vendors.value` is `null` until fetch resolves. Template using `{{ vendors.length }}` throws "Cannot read property length of null."

**Why it happens:** Forgetting the `default` option; assuming SSR awaits the fetch (it does, but `data.value` is `null` BEFORE the await resolves, and template watchers can fire before then).

**How to avoid:** Always set `default: () => []` (or `() => null` if null is the expected initial state with explicit `?.` guards in template).

**Warning signs:** Console errors mentioning "Cannot read property X of null" during SSR or hydration.

### Pitfall 5: Hot-swap doesn't trigger reload — browser shows old data after editing `server/data/dpa.ts`

**What goes wrong:** Editor saves the file; dev server doesn't pick up the change; browser refresh still shows old data.

**Why it happens:** Nitro HMR usually works, but Windows file watchers occasionally miss events (especially through editors that write atomically). Or browser cache.

**How to avoid:** First, hard-refresh (Ctrl+Shift+R / Cmd+Shift+R). If still stale, restart dev server. Document this in Plan 09-02's hot-swap verification probe so it doesn't become a "Phase 9 success criterion 3 doesn't work!" false alarm.

**Warning signs:** Editing server/data/* doesn't reflect in browser even after refresh; restart dev server fixes it.

### Pitfall 6: `app/pages/discovery.vue` calls `useFetch` but the fetch happens BEFORE the page is set up

**What goes wrong:** Combining `useFetch` with `await` at the top of `<script setup>` is correct — Vue's Suspense handles this. But if developer writes `const vendors = await $fetch('/api/vendors')` instead, the fetch happens during component setup synchronously, bypassing useFetch's caching.

**How to avoid:** Use `useFetch`, not `$fetch`, in setup. The await applies to the useFetch call itself, NOT to a `.value` access.

```ts
// RIGHT
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })

// WRONG
const vendors = await $fetch<Vendor[]>('/api/vendors')
```

**Warning signs:** Double-fetch in Network tab (one from server, one from client immediately after hydration).

---

## Code Examples

### `server/data/vendors.ts` (excerpt, first record + structure)

```ts
// Source: aggregated from v0.5.0 src/data/vendors.js + src/data/discovery.js,
// re-typed against shared/types/data.ts
import type { Vendor } from '#shared/types/data'

const vendors: Vendor[] = [
  {
    vendorId: 'vendor-google-classroom',
    name: 'Google Classroom',
    category: 'LMS',
    privacyScore: {
      informationCollected: 7,
      useOfInformation: 6,
      dataSharing: 5,
      securityMeasures: 9,
      userRights: 7,
      retentionPeriod: 6,
      complianceWithLaws: 8,
      updatesToPolicy: 7,
      clarityAndTransparency: 8,
      contactInformation: 9,
    },
    // Merged from src/data/discovery.js
    frequency: 'Daily',
    lastSeen: '2026-05-13',
    userCount: 1842,
    studentCount: 14230,
  },
  // ... 26 more records
]

export default vendors
```

### `server/api/vendors.get.ts`

```ts
// Source: Nuxt 4 server directory docs
import vendors from '~~/server/data/vendors'

export default defineEventHandler(() => {
  return vendors
})
```

### `server/api/dpa.get.ts`

```ts
import dpa from '~~/server/data/dpa'

export default defineEventHandler(() => {
  return dpa
})
```

### `server/api/edtech.get.ts`

```ts
import edtech from '~~/server/data/edtech'

export default defineEventHandler(() => {
  return edtech
})
```

### `shared/types/data.ts`

```ts
// Auto-imported on both server and client (Nuxt v3.14+ shared/ convention).
// NO imports of Vue, h3, or Nitro code in this file.

export interface PrivacyScore {
  informationCollected: number
  useOfInformation: number
  dataSharing: number
  securityMeasures: number
  userRights: number
  retentionPeriod: number
  complianceWithLaws: number
  updatesToPolicy: number
  clarityAndTransparency: number
  contactInformation: number
}

export type Frequency = 'Daily' | 'Weekly' | 'Monthly' | 'Rarely'

export interface Vendor {
  vendorId: string
  name: string
  category: string
  privacyScore: PrivacyScore
  frequency: Frequency
  lastSeen: string
  userCount: number
  studentCount: number
}

export type DpaStatus = 'Signed' | 'Unsigned' | 'Expired' | 'Pending'
export type RiskLabel = 'High Usage / No DPA' | 'No DPA' | 'High Risk Score'

export interface DpaRecord {
  vendorId: string
  status: DpaStatus
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}

export type EdtechCertStatus = 'Certified' | 'Not Certified' | 'In Review' | 'Expired'

export interface EdtechRecord {
  vendorId: string
  certificationStatus: EdtechCertStatus
  certificationStandard: string | null
  certifiedDate: string | null
}
```

### `app/pages/discovery.vue` (Phase 9 wiring)

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

// Phase 9: minimal useFetch demo. Phase 10 wires the full UTable + USlideover.
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">
      Loaded {{ vendors.length }} vendors from <code>/api/vendors</code>.
      (Phase 10 wires the UTable + USlideover.)
    </p>
  </div>
</template>
```

---

## State of the Art

| Old Approach (v0.5.0) | Current Approach (v1.0.0) | When Changed | Impact |
|----------------------|---------------------------|--------------|--------|
| `import vendors from '../data/vendors.js'` (client) | `useFetch('/api/vendors')` (server-served) | Phase 9 | Client bundle smaller, data hot-swappable, future API integration ready |
| Plain JS data objects | TS interfaces in `shared/types/data.ts` | Phase 9 | Typecheck catches data shape mismatches at build time |
| `Object.fromEntries(discoveryData.map(d => [d.vendorId, d]))` view-level join | `Vendor` has discovery fields inline | Phase 9 | Eliminates Phase 10 client-side join; one less round-trip |
| `vue-router` SPA imports | Nuxt file-based routes + `useFetch` | Phase 7-8 | Already complete; Phase 9 completes the data side |

**Deprecated/outdated:**

- `src/data/*.js` — replaced by `server/data/*.ts`. DELETE in Plan 09-01 after verification.
- Direct data imports from any `app/` file — replaced by `useFetch`. Probe in Plan 09-02.

---

## Open Questions

1. **edtech 28 vs 27 — which record is the orphan?**
   - What we know: vendors=27, discovery=27, dpa=27, edtech=28. Diffing edtech vendorIds against vendors vendorIds will identify the extra.
   - What's unclear: whether it's a duplicate vendorId or a phantom vendor.
   - Recommendation: Plan 09-01 implementer runs the diff probe, decides drop-vs-rename in the moment (synthetic data, either is defensible), documents the call.

2. **Should we add `nitro.prerender.routes: ['/api/vendors', '/api/dpa', '/api/edtech']` in Phase 13?**
   - What we know: useFetch payload inlining at the page level is sufficient for our scope.
   - What's unclear: whether future v1.1+ might want direct JSON access to `/api/X` (e.g., for an external embed widget or curl-based diagnostic).
   - Recommendation: Phase 13 adds the prerender config defensively — it costs nothing at build time and makes the routes externally accessible. NOT a Phase 9 concern.

3. **Will `useFetch('/api/vendors')` work identically in dev (live Nitro) and prod (prerendered)?**
   - What we know: Yes — Nuxt's payload inlining makes the client experience identical (data is available synchronously after navigation).
   - What's unclear: Edge cases with `nitro.preset: 'github_pages'` (Phase 13) — base-path handling for `useFetch` URLs.
   - Recommendation: Phase 13 verifies; if `useFetch('/api/vendors')` needs to resolve to `/district-demo/api/vendors` under the base path, the `app.baseURL` config should auto-handle it. (Nuxt's useFetch prepends `useRuntimeConfig().app.baseURL` automatically.) Not a Phase 9 concern.

4. **Should the Vendor interface have a `category` union type or stay `string`?**
   - What we know: v0.5.0 has 14 distinct category values across the 27 vendors. Narrowing to a union enables exhaustive switch statements.
   - What's unclear: Whether v1.1+ might add new categories (likely yes for a sales demo).
   - Recommendation: Keep `string` for v1.0.0 to avoid friction adding new categories. Phase 10+ can narrow if it becomes useful.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Nuxt 4 dev server | ✓ | 24.14.0 | — |
| npm | (no installs Phase 9) | ✓ | 11.9.0 | — |
| Git | Source control (commits per task) | ✓ | in PATH | — |
| Nuxt 4 + Nitro | Server route hosting | ✓ (Phase 7 installed) | 4.4.6 | — |
| `curl` (for probes) | Runtime verification | ✓ on Windows 10+ | — | `Invoke-WebRequest` if curl missing |

**No blocking gaps.** Phase 9 adds no new external dependencies.

---

## Validation Architecture

> Phase 9 enables `workflow.nyquist_validation` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — Nuxt 4's `nuxi typecheck` (vue-tsc) + dev-server curl probes + grep static analysis (same approach as Phases 7-8) |
| Config file | `tsconfig.json` (extends auto-generated `.nuxt/tsconfig.json`); no test config |
| Quick run command | `npm run typecheck` + targeted grep probes |
| Full suite command | `npm install && npm run typecheck && npm run build` + dev-server curl panel |
| Phase gate | All grep probes pass; typecheck + build exit 0; live dev server curl probes confirm 3 routes serve correct JSON; hot-swap probe succeeds |

For Phase 9, **typecheck + build + live dev-server curl panel + grep static analysis** IS the test suite. The same pragmatic approach used in Phases 7-8. Vitest/Playwright deferred — would be overkill for 9 lines of handler code.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | `GET /api/vendors` returns JSON with 27 records | Runtime curl | `curl -s http://localhost:3000/api/vendors \| node -e "let d=''; process.stdin.on('data',c=>d+=c).on('end',()=>{ const a=JSON.parse(d); if(a.length!==27) process.exit(1) })"` | ❌ Wave 0 |
| DATA-01 | `GET /api/dpa` returns JSON with 27 records | Runtime curl | Same pattern, length===27 | ❌ Wave 0 |
| DATA-01 | `GET /api/edtech` returns JSON with 27 records (post-reconciliation) | Runtime curl | Same pattern, length===27 | ❌ Wave 0 |
| DATA-01 | Each /api/X returns `Content-Type: application/json` | Runtime curl | `curl -sI http://localhost:3000/api/vendors \| grep -qi "content-type: application/json"` | ❌ Wave 0 |
| DATA-01 | Each /api/X returns HTTP 200 | Runtime curl | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/vendors` → `200` | ❌ Wave 0 |
| DATA-01 | `server/data/vendors.ts` exists and exports `Vendor[]` | Static (file+grep) | `test -f server/data/vendors.ts && grep -q "Vendor\[\]" server/data/vendors.ts` | ❌ Wave 0 |
| DATA-01 | `server/data/dpa.ts` exists with `DpaRecord[]` annotation | Static | Same pattern | ❌ Wave 0 |
| DATA-01 | `server/data/edtech.ts` exists with `EdtechRecord[]` annotation | Static | Same pattern | ❌ Wave 0 |
| DATA-01 | `shared/types/data.ts` exports Vendor, DpaRecord, EdtechRecord | Static (grep) | `grep -E "export interface (Vendor\|DpaRecord\|EdtechRecord)" shared/types/data.ts \| wc -l` → `3` | ❌ Wave 0 |
| DATA-01 | Hot-swap: edit `server/data/dpa.ts` → reload → see change (Phase 9 SC 3) | Runtime — checksum diff | (1) `curl -s /api/dpa \| md5sum` capture, (2) edit one status field, (3) recurl, (4) compare md5 — should differ | ❌ Wave 0 (manual step + scripted probe) |
| DATA-02 | No `app/` file imports from `src/data/` | Static (negative grep) | `! grep -rE "from ['\"].*src/data" app/` | ❌ Wave 0 |
| DATA-02 | No `app/` file imports from `server/data/` | Static (negative grep) | `! grep -rE "from ['\"].*server/data" app/` | ❌ Wave 0 |
| DATA-02 | No `app/` file imports from `server/api/` | Static (negative grep) | `! grep -rE "from ['\"].*server/api" app/` | ❌ Wave 0 |
| DATA-02 | `app/pages/discovery.vue` uses `useFetch('/api/vendors')` | Static (grep) | `grep -q "useFetch('/api/vendors')" app/pages/discovery.vue` | ❌ Wave 0 |
| DATA-02 | discovery.vue does NOT use `$fetch` in setup | Static (negative grep) | `! grep -E "\\\$fetch\\(['\"]\/api" app/pages/discovery.vue` | ❌ Wave 0 |
| DATA-02 | `npm run typecheck` exit 0 — useFetch types inferred correctly | Build | `npm run typecheck` → exit 0 | ❌ Wave 0 |
| DATA-02 | `npm run build` exit 0 — full build success | Build | `npm run build` → exit 0 | ❌ Wave 0 |
| (SC 4) | discovery.vue HTML contains "27 vendors" rendered server-side | Runtime curl + grep | `curl -s http://localhost:3000/discovery \| grep -q "Loaded 27 vendors"` | ❌ Wave 0 |
| (cleanup) | `src/data/*.js` files deleted | Static (file-not-exists) | `! test -f src/data/vendors.js && ! test -f src/data/discovery.js && ! test -f src/data/dpa.js && ! test -f src/data/edtech.js && ! test -f src/data/riskLabels.js` | ❌ Wave 0 |
| (orphan) | edtech.ts has same 27 vendorIds as vendors.ts | Runtime — diff probe | `node -e "..."` cross-check (see Pitfall 3) → empty orphan set | ❌ Wave 0 |
| (boundary) | `shared/types/data.ts` does NOT import Vue or h3 | Static (negative grep) | `! grep -E "from ['\"](vue\|h3\|#imports)" shared/types/data.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** Run grep + file-exists probes for that task's DATA-XX criteria (under 5 seconds total)
- **Per wave merge:** `npm install && npm run typecheck && npm run build && npm run dev` — start dev server in background, run curl probe panel against it (under 30 seconds), kill dev server
- **Phase gate:** All ~20 probes pass on a clean checkout; hot-swap manual probe verified before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `shared/types/data.ts` — Vendor, DpaRecord, EdtechRecord, enums
- [ ] `shared/utils/riskLabels.ts` — migrated from src/data/riskLabels.js
- [ ] `server/data/vendors.ts` — 27 vendors with merged discovery fields, typed
- [ ] `server/data/dpa.ts` — 27 DPA records, typed
- [ ] `server/data/edtech.ts` — 27 records (after orphan reconciliation), typed
- [ ] `server/api/vendors.get.ts` — 3-line handler
- [ ] `server/api/dpa.get.ts` — 3-line handler
- [ ] `server/api/edtech.get.ts` — 3-line handler
- [ ] `app/pages/discovery.vue` — modified to add useFetch demo
- [ ] Delete: `src/data/{vendors,discovery,dpa,edtech,riskLabels}.js` (5 files)
- [ ] Test runner — INTENTIONALLY NOT added in Phase 9; curl + grep + typecheck cover the 4 success criteria

### Runtime State Inventory

This is a data migration phase. Inventory:

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| **Stored data** | localStorage keys from Phase 7 (`tags` from Pinia persist). Phase 9 does NOT touch tags — vendor/dpa/edtech data is read-only and not persisted. | None — tags untouched. New API responses are not persisted; they're re-fetched per session. |
| **Live service config** | None — no external services in v1.0.0 milestone (synthetic data only). | None. |
| **OS-registered state** | None — no scheduled tasks, no system services. | None. |
| **Secrets / env vars** | None currently. Future Amplify SSR (Phase 13+) will use `NUXT_*` prefix for API keys; not relevant in Phase 9. | None for Phase 9. |
| **Build artifacts** | `.output/` from any prior `npm run build`; `.nuxt/` regenerated on `nuxi prepare`. After Phase 9 adds new files under `server/` and `shared/`, run `npx nuxi prepare` to regenerate `.nuxt/tsconfig.json` so typed routes pick up `/api/*` paths. | Plan 09-01 includes `npx nuxi prepare` as a verification step. |

---

## Sources

### Primary (HIGH confidence)

- [Nuxt 4 Server Directory docs](https://nuxt.com/docs/4.x/guide/directory-structure/server) — file naming, method suffixes, defineEventHandler signature, server/data/ folder is convention not magic
- [Nuxt 4 useFetch composable docs](https://nuxt.com/docs/api/composables/use-fetch) — "infers API response type", "provides type hints for request url based on server routes"
- [Nuxt 4 Data Fetching docs](https://nuxt.com/docs/4.x/getting-started/data-fetching) — `$fetch` vs `useFetch` vs `useAsyncData`; double-fetch warning; `default` option
- [Nuxt 4 Shared Directory docs](https://nuxt.com/docs/4.x/guide/directory-structure/shared) — "available in Nuxt v3.14+"; auto-import on both server and client; restriction "cannot import any Vue or Nitro code"
- [Nuxt 4 Prerendering docs](https://nuxt.com/docs/4.x/getting-started/prerendering) — "You can even prerender API routes which is particularly useful for full statically generated sites (SSG)"; `crawlLinks` behavior
- Phase 7 RESEARCH.md — carry-forward facts about Nuxt 4 / Nitro setup, ECharts module, Pinia store
- Phase 8 RESEARCH.md + 08-01-SUMMARY.md — carry-forward facts about file-based routing, NuxtLayout, PageMeta augmentation, useFetch not yet wired

### Secondary (MEDIUM confidence — WebSearch verified with official sources)

- [Nuxt typed routes discussion #17243](https://github.com/nuxt/nuxt/discussions/17243) — typed defineEventHandler patterns; confirmed via WebSearch
- [Nitro Config docs](https://nitro.build/config) — `crawlLinks`, `routes` array, `.output/public` static asset output
- [NuxtHub Pre-rendering guide](https://hub.nuxt.com/docs/guides/pre-rendering) — payload-based useFetch result caching during prerender
- [Nitro GitHub Pages provider docs](https://nitro.build/deploy/providers/github-pages) — `NITRO_PRESET: github_pages`, `.output/public/` deployment

### Tertiary (LOW confidence — verify in Plan 09-02 implementation)

- Exact file-naming for prerendered /api/ routes under `.output/public/api/` — sources differ on `.json` extension vs no extension. **Phase 13 will discover empirically** when `nuxi generate` runs; Phase 9 not affected.
- Hot-swap behavior on Windows file-watching (Pitfall 5) — Nitro HMR usually works but Windows quirks possible.

### v0.5.0 source verification (HIGH confidence — direct file reads)

- `src/data/vendors.js` — 27 records, all with vendorId, name, category, privacyScore (10 sub-fields)
- `src/data/discovery.js` — 27 records, all with vendorId, frequency, lastSeen, userCount, studentCount — vendorIds match vendors.js 1:1 (verified via node script)
- `src/data/dpa.js` — 27 records, all with vendorId, status, signedDate, expiryDate, riskLabel
- `src/data/edtech.js` — **28 records** — reconcile during Plan 09-01
- `src/data/riskLabels.js` — 5 named exports of color/label constants

---

## Metadata

**Confidence breakdown:**
- Standard stack (Nuxt 4 server/api/, useFetch, shared/): HIGH — verified against Nuxt 4 docs + Nitro docs + Phase 7-8 carry-forward
- Architecture (server/data/ + server/api/ + shared/types/ split): HIGH — verified against Nuxt docs + community patterns
- Discovery merge into Vendor: HIGH — verified data is 1:1 with vendors via node script
- edtech 28-vs-27 reconciliation: MEDIUM-HIGH — definite mismatch, exact orphan identification deferred to Plan 09-01 implementer
- Static generate behavior for Phase 13: HIGH for architectural understanding, MEDIUM for exact file-naming under `.output/public/api/` (Phase 13 verifies empirically)
- Pitfalls: HIGH — all 15 verified against either docs, source code, or v0.5.0 behavior

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (30 days — Nuxt 4 server API is stable, shared/ semantics fixed since v3.14)
