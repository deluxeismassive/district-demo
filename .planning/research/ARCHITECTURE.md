# Architecture Research

**Project:** District Demo Portal
**Researched:** 2026-05-13
**Confidence:** HIGH (Vue 3 / Vue Router 4 / Pinia 2 are stable, mature; patterns are well-established. External verification unavailable — based on training data through August 2025.)

---

## Recommended Structure

This is a multi-section admin portal SPA. The canonical pattern for this type of Vue 3 app is a shell layout with a persistent sidebar, a `<RouterView>` content area, and one view component per section. No nested routes needed at MVP — each section is a flat top-level route.

```
src/
├── main.js                    # Bootstrap: Vue app + Router + Pinia
├── App.vue                    # Root: mounts <AppShell> only
├── style.css                  # Global tokens, resets, layout utilities

├── router/
│   └── index.js               # Route definitions — one import per view

├── stores/
│   └── tags.js                # Pinia store: tag CRUD + localStorage persistence

├── data/                      # ALL mock data lives here — nothing else
│   ├── vendors.js             # Vendor/app master list with usage metrics
│   ├── dpa.js                 # DPA status records keyed by vendor
│   ├── oneEdtech.js           # 1EdTech certification records
│   └── tags.js                # Seed tag definitions (overridden by localStorage)

├── views/                     # One file per route/section
│   ├── DiscoveryView.vue
│   ├── DpaView.vue
│   ├── RiskView.vue
│   ├── OneEdtechView.vue
│   └── TagsView.vue

├── components/
│   ├── layout/
│   │   ├── AppShell.vue       # Outer shell: sidebar + <RouterView>
│   │   └── SidebarNav.vue     # Nav link list, driven by router meta
│   └── shared/
│       ├── DataTable.vue      # Reusable sortable/filterable table
│       ├── StatusBadge.vue    # Colored status pill (DPA status, risk level, etc.)
│       ├── TagChip.vue        # Individual tag display + remove
│       └── TagAssigner.vue    # Dropdown/modal for assigning tags to a row

└── assets/
    └── logo.svg               # District or product logo for sidebar header
```

**Rationale for this shape:**
- `views/` vs `components/` split is the Vue community standard: views are route-owned pages, components are reused pieces. Keeps `components/` free of routing concerns.
- `data/` as a flat sibling to `views/` and `stores/` makes it obvious to a sales-support developer exactly where to go to change what a demo shows. No hunting through component files.
- `router/index.js` as the single source of truth for what sections exist means adding or removing a section is a two-file change: add/remove the view file, add/remove the route. Everything else (sidebar nav) reads from the router.
- `stores/` is intentionally minimal — only one store for tags, since that is the only write operation in the portal.

---

## Mock Data Architecture

**Core principle:** Data files are configuration, not code. A developer with no Vue knowledge should be able to open a data file, change values, and see the change reflected immediately.

### File format: JS modules exporting arrays of plain objects

Prefer `.js` with `export default [...]` over raw `.json` for two reasons:
1. JS allows comments — essential for explaining field semantics to non-engineers
2. JS allows helper expressions (e.g., computed date offsets: `new Date(Date.now() - 30 * 86400000)`) that make fixture maintenance easier without changing logic

```js
// src/data/vendors.js
// Change any field here to update the demo — no component edits needed.

export default [
  {
    id: 'vendor-google-classroom',
    name: 'Google Classroom',
    domain: 'classroom.google.com',
    category: 'LMS',           // maps to a tag seed in tags.js
    usageFrequency: 'Daily',   // 'Daily' | 'Weekly' | 'Monthly' | 'Rare'
    lastSeen: '2026-05-10',    // ISO date string
    studentCount: 2840,
    teacherCount: 124,
  },
  // ...
]
```

```js
// src/data/dpa.js
// Each entry references a vendor by id from vendors.js

export default [
  {
    vendorId: 'vendor-google-classroom',
    status: 'Signed',          // 'Signed' | 'Pending' | 'Expired' | 'None'
    signedDate: '2024-03-15',
    expiryDate: '2026-03-15',
    isCurrent: true,           // true if DPA version matches current subscription version
    hasAddendum: true,
  },
  // ...
]
```

```js
// src/data/oneEdtech.js
export default [
  {
    vendorId: 'vendor-google-classroom',
    certificationLevel: 'TrustEd App',  // or 'Certified' | 'None' | 'In Progress'
    certifiedDate: '2023-11-01',
    productName: 'Google Classroom',
  },
  // ...
]
```

```js
// src/data/tags.js
// SEED DATA — these tags are created on first load if localStorage is empty.
// Tags created/edited by the user in-session override this via the Pinia store.

export default [
  { id: 'tag-lms', label: 'LMS', color: '#4A90D9' },
  { id: 'tag-assessment', label: 'Assessment', color: '#E67E22' },
  { id: 'tag-communication', label: 'Communication', color: '#27AE60' },
]
```

### How views consume data

Views import data files directly — no service layer needed for a mock-only portal:

```js
// src/views/DiscoveryView.vue
import vendors from '../data/vendors.js'
import dpaRecords from '../data/dpa.js'
import { useTagsStore } from '../stores/tags.js'
```

Views compute joined/derived data locally via `computed()`. If a view needs vendor + DPA data merged, it does that join inside the component. No shared "data service" layer — the mock data is simple enough that each view can do its own filtering without abstraction overhead.

**When a developer needs to change demo data:** open the relevant file in `src/data/`, edit the JS object, save. Hot module reload shows the change instantly in dev. No other file touched.

---

## Component Strategy

### Views (route-level components)

Each view owns its page layout, heading, and data joining logic. Views are intentionally "fat" for a demo portal — there is no business case for abstracting logic that only exists in one place.

Pattern per view:
```vue
<script setup>
import vendors from '../data/vendors.js'
import { useTagsStore } from '../stores/tags.js'
import DataTable from '../components/shared/DataTable.vue'
import StatusBadge from '../components/shared/StatusBadge.vue'

const tagsStore = useTagsStore()

const rows = computed(() => /* join + filter vendors with store tags */)
</script>

<template>
  <div class="view-discovery">
    <h1>Discovery</h1>
    <DataTable :rows="rows">
      <template #cell-status="{ value }">
        <StatusBadge :status="value" />
      </template>
    </DataTable>
  </div>
</template>
```

### Shared components

Keep the shared component surface small. Only extract to `components/shared/` when a UI element appears in two or more views OR when it has non-trivial internal state (e.g., TagAssigner dropdown).

| Component | Appears in | Key prop contract |
|-----------|-----------|-------------------|
| `DataTable.vue` | All section views | `:rows`, `:columns`, slot `#cell-{key}` for custom cell rendering |
| `StatusBadge.vue` | DPA, Risk, 1EdTech views | `:status` string, `:variant` (optional) |
| `TagChip.vue` | Discovery, TagsView | `:tag` object (`{id, label, color}`), emits `remove` |
| `TagAssigner.vue` | Discovery rows | `:vendorId`, reads/writes tags store directly |

### Layout components

`AppShell.vue` is the only persistent layout component. It renders the sidebar and the content slot. It does NOT know about section content — it just provides the chrome.

```vue
<!-- src/components/layout/AppShell.vue -->
<template>
  <div class="app-shell">
    <SidebarNav />
    <main class="app-shell__content">
      <RouterView />
    </main>
  </div>
</template>
```

`SidebarNav.vue` generates its link list from the router's route definitions (filtered by a `meta.nav: true` flag). This means adding a new section to the sidebar requires only adding a route — no changes to the nav component itself.

```js
// SidebarNav reads this at runtime:
const navRoutes = router.getRoutes().filter(r => r.meta?.nav)
```

### Composition API conventions

- Use `<script setup>` everywhere — no Options API
- Shared reactive logic that spans multiple views → `composables/` directory (only create if genuinely needed; defer until second occurrence)
- No mixin patterns

---

## Navigation Architecture

### Router setup

```js
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/discovery',
  },
  {
    path: '/discovery',
    name: 'discovery',
    component: () => import('../views/DiscoveryView.vue'),
    meta: { nav: true, label: 'Discovery', icon: 'search' },
  },
  {
    path: '/dpa',
    name: 'dpa',
    component: () => import('../views/DpaView.vue'),
    meta: { nav: true, label: 'DPA', icon: 'shield' },
  },
  {
    path: '/risk',
    name: 'risk',
    component: () => import('../views/RiskView.vue'),
    meta: { nav: true, label: 'Risk Position', icon: 'alert' },
  },
  {
    path: '/1edtech',
    name: 'oneEdtech',
    component: () => import('../views/OneEdtechView.vue'),
    meta: { nav: true, label: '1EdTech', icon: 'badge' },
  },
  {
    path: '/tags',
    name: 'tags',
    component: () => import('../views/TagsView.vue'),
    meta: { nav: true, label: 'Tags', icon: 'tag' },
  },
]

export default createRouter({
  history: createWebHashHistory('/district-demo/'),
  routes,
})
```

**`createWebHashHistory` not `createWebHistory`** — critical for GitHub Pages. Hash-based routing (`/#/discovery`) requires no server-side routing config. `createWebHistory` on GitHub Pages returns 404s on direct URL load or refresh because GitHub Pages has no fallback `index.html` redirect for arbitrary paths. The `/district-demo/` base is already configured in `vite.config.js`.

Confidence: HIGH — this is a known hard constraint with GitHub Pages static hosting.

**Lazy-loaded route components** (`() => import(...)`) — each view is a separate chunk. For a demo portal this is low-impact on performance but keeps the pattern clean and avoids a large initial bundle.

**Adding a section:** Add one route object to the `routes` array. The sidebar picks it up automatically. Remove the section: delete the route object and the view file.

### Sidebar active state

Use `RouterLink` with `activeClass` / `exactActiveClass` in `SidebarNav.vue`. Vue Router sets these classes automatically on active links — no manual state tracking needed.

---

## Tag State Management

Tags are the only write operation. The requirements are:
1. Create a tag (label + color)
2. Edit a tag's label or color
3. Delete a tag
4. Assign one or more tags to a vendor/domain row
5. Survive page navigation within the session (tag assignments must persist across route changes)
6. Optionally survive page refresh (nice-to-have for demo continuity)

**Recommendation: Pinia store with localStorage sync**

Use a single Pinia store (`src/stores/tags.js`) that:
- Initializes from `src/data/tags.js` (seed data) on first load
- Writes all mutations to `localStorage` immediately
- Reads from `localStorage` on store initialization if data exists there

This gives the demo a "stateful" feel — a sales rep can assign tags during a walkthrough, refresh the page, and the assignments survive. It also means the sales rep can reset the demo to a clean state by clearing localStorage (or you can provide a "Reset Demo" button).

```js
// src/stores/tags.js
import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import seedTags from '../data/tags.js'

const STORAGE_KEY = 'district-demo-tags'

export const useTagsStore = defineStore('tags', () => {
  // Tag definitions: { id, label, color }
  const tags = ref(loadFromStorage('definitions') ?? seedTags)

  // Vendor-tag assignments: { [vendorId]: string[] (tag ids) }
  const assignments = ref(loadFromStorage('assignments') ?? {})

  // Persist on every mutation
  watch(tags, v => saveToStorage('definitions', v), { deep: true })
  watch(assignments, v => saveToStorage('assignments', v), { deep: true })

  function addTag(label, color) {
    tags.value.push({ id: `tag-${Date.now()}`, label, color })
  }

  function updateTag(id, patch) {
    const t = tags.value.find(t => t.id === id)
    if (t) Object.assign(t, patch)
  }

  function deleteTag(id) {
    tags.value = tags.value.filter(t => t.id !== id)
    // Remove from all assignments
    for (const vendorId in assignments.value) {
      assignments.value[vendorId] = assignments.value[vendorId].filter(tid => tid !== id)
    }
  }

  function assignTag(vendorId, tagId) {
    if (!assignments.value[vendorId]) assignments.value[vendorId] = []
    if (!assignments.value[vendorId].includes(tagId)) {
      assignments.value[vendorId].push(tagId)
    }
  }

  function removeTagFromVendor(vendorId, tagId) {
    if (assignments.value[vendorId]) {
      assignments.value[vendorId] = assignments.value[vendorId].filter(id => id !== tagId)
    }
  }

  function tagsForVendor(vendorId) {
    return (assignments.value[vendorId] ?? [])
      .map(id => tags.value.find(t => t.id === id))
      .filter(Boolean)
  }

  return { tags, assignments, addTag, updateTag, deleteTag, assignTag, removeTagFromVendor, tagsForVendor }
})

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveToStorage(key, value) {
  localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value))
}
```

**Why Pinia over plain `reactive()`:** Pinia stores are globally accessible from any component without prop-drilling or provide/inject. Tag assignments need to be readable in DiscoveryView, writable from TagAssigner (a deeply nested component), and manageable from TagsView. A store is the right abstraction level.

**Why not Vuex:** Vuex is the previous-generation Vue state manager. Pinia is the official Vue 3 recommendation, has zero boilerplate compared to Vuex mutations/actions, and supports `<script setup>` composition naturally. Confidence: HIGH (Pinia is listed as the recommended state management solution in the official Vue docs as of 2024–2025).

**In-memory only alternative (simpler):** If localStorage persistence is not needed, skip the `watch()` + `loadFromStorage`/`saveToStorage` calls entirely. The store still works correctly — tags just reset on refresh. Decide based on demo workflow needs.

---

## Build Order

Recommended phase sequence, given the architectural dependencies above:

**Phase 1: Shell + Routing**
Build `AppShell.vue`, `SidebarNav.vue`, `router/index.js`, and stub view files (each renders just a heading). Install Vue Router and Pinia. Validate that navigation works and all routes resolve. This is the skeleton every other phase hangs off of.

Dependencies established here: router, layout, Pinia initialization in `main.js`.

**Phase 2: Mock Data Layer + Discovery View**
Create all `src/data/*.js` files with realistic fixture data. Build Discovery view against that data. Discovery is first because it is the broadest section (vendor list + usage + tag assignment) and exercises the most shared component patterns (DataTable, TagChip, TagAssigner). Proving out those shared components on Discovery makes DPA and 1EdTech views straightforward.

Dependencies established here: data file shape, DataTable contract, tag store + TagAssigner.

**Phase 3: DPA View + StatusBadge**
DPA view is structurally similar to Discovery (table of vendors with per-row status) but introduces StatusBadge and date-aware display logic. Builds on DataTable from Phase 2.

**Phase 4: 1EdTech View**
Structurally simplest section — a table with certification status. Reuses DataTable and StatusBadge from prior phases. Low effort.

**Phase 5: Risk Position View**
Intentionally last. The visualization approach is undefined per PROJECT.md. By Phase 5, you have all the underlying data (vendor + DPA + 1EdTech) available and can make an informed decision about the visualization (table with composite score, a matrix chart, a card grid, etc.) without blocking anything else. Risk also requires joining data from multiple sources — easier once those data shapes are proven.

**Phase 6: Tags Management View**
The TagsView (create/edit/delete tags) can be built any time after the Pinia store exists, but putting it last avoids the risk of building the management UI before the tag consumption UI (TagChip, TagAssigner) is validated. By Phase 6, tags are already working in Discovery, so the management view just needs to expose the store's existing functions.

---

## Confidence Notes

| Area | Confidence | Basis |
|------|------------|-------|
| `createWebHashHistory` for GitHub Pages | HIGH | Well-documented constraint; hash routing is the standard workaround for static hosts |
| Pinia as tag state layer | HIGH | Official Vue 3 recommendation; stable API since 2022 |
| `router.meta.nav` pattern for sidebar | HIGH | Standard Vue Router 4 pattern; used in countless Vue admin templates |
| Lazy-loaded route imports | HIGH | Standard Vite + Vue Router optimization, no caveats for this use case |
| Data files as JS modules (not JSON) | MEDIUM | Conventional wisdom — JSON is equally valid, JS adds comment capability at the cost of a tiny parse difference |
| localStorage watch persistence | HIGH | Standard Pinia pattern; no external library needed |

---

*Note: External verification tools (WebSearch, WebFetch) were unavailable during this research session. All findings are based on training data through August 2025 for Vue 3.5, Vue Router 4, and Pinia 2 — all stable, non-breaking releases.*
