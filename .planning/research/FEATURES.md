# Features Research: Nuxt 4 Migration Patterns

**Domain:** Vue 3 + Vite + PrimeVue SPA → Nuxt 4 SSR + Nuxt UI v3 + TypeScript
**Milestone:** v1.0.0 Nuxt Migration
**Researched:** 2026-05-21
**Overall confidence:** HIGH — verified against Nuxt 4 official docs, Nuxt UI v3 docs, Pinia docs

---

## Directory Structure Migration

### src/ → app/

Nuxt 4's `srcDir` defaults to `app/`. All application code moves into this directory. Server code stays at project root level under `server/`. This is the single biggest structural change.

```
v0.5.0 (src/)                    v1.0.0 (app/ + server/)
─────────────────────────────    ────────────────────────────────────
src/
  views/DashboardView.vue     →  app/pages/index.vue
  views/DiscoveryView.vue     →  app/pages/discovery.vue
  views/ReportsView.vue       →  app/pages/risk.vue
  views/SettingsView.vue      →  app/pages/tags.vue
  views/DpaView.vue           →  (DPA is a tab in discovery.vue, not a page)
  components/layout/
    AppShell.vue              →  app/layouts/default.vue
    SidebarNav.vue            →  app/components/layout/SidebarNav.vue
  components/
    VendorDrawer.vue          →  app/components/VendorDrawer.vue
    DpaGrid.vue               →  app/components/DpaGrid.vue
  stores/tags.js              →  app/stores/tags.ts
  data/vendors.js             →  server/data/vendors.ts
  data/discovery.js           →  server/data/discovery.ts
  data/dpa.js                 →  server/data/dpa.ts
  data/edtech.js              →  server/data/edtech.ts
  data/riskLabels.js          →  app/utils/riskLabels.ts  (or server/utils/)
  router/index.js             →  DELETED (replaced by file-based routing)
  main.js                     →  DELETED (replaced by nuxt.config.ts + app.vue)
  App.vue                     →  app/app.vue
  style.css                   →  app/assets/css/main.css
                                  server/
                                    api/
                                      vendors.get.ts
                                      discovery.get.ts
                                      dpa.get.ts
                                      edtech.get.ts
```

### nuxt.config.ts (project root)

Nuxt 4 requires a `nuxt.config.ts` at the root. The `app/` directory is the default `srcDir`. No custom `srcDir` config is needed.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  ssr: true,
  compatibilityDate: '2025-01-01',
})
```

**Note:** `compatibilityVersion: 4` in the `future` key was a Nuxt 3 migration flag. In a fresh Nuxt 4 install, the `app/` directory structure is the default — no flag needed.

---

## Routing Migration

### Vue Router config → file-based routing

**Remove:** `src/router/index.js` entirely. No `createRouter`, no `createWebHashHistory`, no manual route definitions.

**Replace with:** files in `app/pages/`. Each `.vue` file becomes a route automatically.

| v0.5.0 Route | v1.0.0 File | URL path |
|---|---|---|
| `path: '/', name: 'dashboard'` | `app/pages/index.vue` | `/` |
| `path: '/discovery', name: 'discovery'` | `app/pages/discovery.vue` | `/discovery` |
| `path: '/reports', name: 'reports'` | `app/pages/risk.vue` | `/risk` |
| `path: '/settings', name: 'settings'` | `app/pages/tags.vue` | `/tags` |

**Note on hash history:** v0.5.0 used `createWebHashHistory` for GitHub Pages. Nuxt 4 with SSR on AWS Amplify uses standard HTML5 history (`/path`). No hash needed.

### definePageMeta replaces router.meta

Each page file declares its own nav metadata using the `definePageMeta` compiler macro:

```ts
// app/pages/discovery.vue
definePageMeta({
  nav: true,
  label: 'Discovery',
  icon: 'i-heroicons-magnifying-glass'
})
```

### SidebarNav: router.getRoutes() still works

`useRouter().getRoutes()` is available in Nuxt 4 — same API as Vue Router. The existing pattern of filtering by `r.meta?.nav` works directly:

```ts
// app/components/layout/SidebarNav.vue
const router = useRouter()
const navRoutes = router.getRoutes().filter(r => r.meta?.nav)
```

**Caveat:** `getRoutes()` during SSR returns all routes. The filter by `meta.nav` still works; icon class strings change from PrimeIcons (`pi pi-home`) to Heroicons (`i-heroicons-home`) since Nuxt UI v3 uses `@nuxt/icon` with Heroicons by default.

### NuxtLink replaces RouterLink

```html
<!-- v0.5.0 -->
<RouterLink :to="route.path" active-class="bg-primary text-white">

<!-- v1.0.0 -->
<NuxtLink :to="route.path" active-class="bg-primary text-white">
```

`NuxtLink` is auto-imported. `RouterLink` also works but `NuxtLink` is the Nuxt convention.

---

## Layout Migration

### AppShell.vue + SidebarNav.vue → app/layouts/default.vue

In Nuxt 4, `app/layouts/default.vue` wraps all pages automatically. The `<slot />` renders the current page.

**v0.5.0 AppShell.vue pattern:**
```html
<div class="flex h-screen overflow-hidden">
  <SidebarNav />
  <div class="flex flex-col flex-1 overflow-hidden">
    <header>...</header>
    <main><RouterView /></main>
  </div>
</div>
```

**v1.0.0 app/layouts/default.vue pattern:**
```html
<template>
  <div class="flex h-screen overflow-hidden">
    <SidebarNav />
    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
        <span class="text-sm text-gray-700">Lakewood Unified School District</span>
      </header>
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <slot />  <!-- <-- replaces <RouterView /> -->
      </main>
    </div>
  </div>
</template>
```

**app/app.vue** wires layout + page together:
```html
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

`<UApp>` is required for Nuxt UI overlays (Toast, Tooltip) to work. `<NuxtLayout>` wraps `<NuxtPage />` so that `default.vue` wraps every page.

---

## Component Migration Map

### PrimeVue → Nuxt UI v3

| PrimeVue Component | Nuxt UI v3 Equivalent | Migration Notes |
|---|---|---|
| `DataTable` + `Column` | `UTable` | API is completely different — see detailed section below |
| `Dialog` (modal confirm) | `UModal` | `v-model:visible` → `v-model:open` |
| `Drawer` (slide-over) | `USlideover` | `position="right"` is default; `v-model:visible` → `v-model:open` |
| `MultiSelect` (grouped) | `USelectMenu multiple` | `optionGroupLabel/Children` → array-of-arrays structure; chips need custom slot |
| `Tag` (colored pill) | `UBadge` with inline `:style` | UBadge color prop only accepts design tokens; use `:style` for arbitrary hex |
| `Button` | `UButton` | `severity="danger"` → `color="error"`; `text` prop → `variant="ghost"` |
| `InputText` | `UInput` | `v-model` is identical; add `class="w-full"` manually (block layout removed in v3) |
| `IconField` / `InputIcon` | `UInput icon` prop | Use `icon="i-heroicons-magnifying-glass"` on `UInput` directly |
| `Divider` | `USeparator` | Divider renamed to Separator in v3 |
| `Skeleton` | `USkeleton` | Same concept, different prop names |
| `Tag` (status badge) | `UBadge :style` | No change in approach; must use `:style` for dynamic hex colors |

**Important — UBadge custom colors:**
UBadge's `color` prop is restricted to design system tokens (`primary`, `error`, `warning`, `success`, `neutral`). The existing pattern of binding hex values via `:style="{ backgroundColor: COLOR_MAP[status], color: '#ffffff' }"` still works because UBadge is a standard HTML element that accepts `:style`. This is the correct approach for dynamic semantic colors from `riskLabels.ts`.

### UTable detailed migration

UTable is built on TanStack Table. The API diverges significantly from PrimeVue DataTable.

**Column definition — before (PrimeVue):**
```html
<Column field="name" header="Vendor Name" sortable :style="{ minWidth: '12rem' }" />
<Column field="status" header="Status" sortable>
  <template #body="{ data }">
    <Tag :value="data.status" :style="{ backgroundColor: DPA_STATUS_COLORS[data.status] }" />
  </template>
</Column>
```

**Column definition — after (UTable):**
```ts
const columns: TableColumn<VendorRow>[] = [
  { accessorKey: 'name', header: 'Vendor Name', enableSorting: true },
  { accessorKey: 'status', header: 'Status', enableSorting: true },
]
```

**Custom cell rendering — after (UTable slots):**
```html
<UTable :data="tableRows" :columns="columns" @select="onRowSelect">
  <template #status-cell="{ row }">
    <UBadge
      :label="row.original.status"
      :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.status], color: '#ffffff' }"
    />
  </template>
</UTable>
```

**Slot naming:** `#<accessorKey>-cell` (not `-body` as in PrimeVue).

**Row click event:** `@select` fires with `(event, row)`. Access data as `row.original`.

**Global filter:** `v-model:global-filter="filterValue"` — pass a plain string ref.

**Sorting:** `v-model:sorting` — TanStack sorting array. Default sort set as initial value.

**DataTable props that map directly:**
- `:value` → `:data`
- `dataKey` → not needed (TanStack uses index by default; use `getRowId` for stable keys)
- `rowHover` → add `class="[&_tr:hover]:bg-gray-50"` via `ui` prop or Tailwind
- `removableSort` → no direct equivalent; omit sort state for same effect
- `#empty` slot → `empty` prop (string) or `#empty` slot

### USlideover detailed migration

**Before (PrimeVue Drawer):**
```html
<Drawer v-model:visible="drawerVisible" position="right" :style="{ width: '480px' }">
  <template v-if="vendor">...</template>
</Drawer>
```

**After (USlideover):**
```html
<USlideover v-model:open="drawerVisible" side="right" :ui="{ content: 'max-w-[480px]' }">
  <template #content>
    <template v-if="vendor">...</template>
  </template>
</USlideover>
```

Key differences:
- `v-model:visible` → `v-model:open`
- `position` → `side` (same values: `right`, `left`, `top`, `bottom`)
- `:style="{ width }"` → `:ui="{ content: 'max-w-[480px]' }"` (Tailwind class)
- Content goes in `#content` slot, not default slot

### UModal detailed migration

**Before (PrimeVue Dialog):**
```html
<Dialog v-model:visible="deleteDialogVisible" modal header="Confirm delete" :style="{ width: '24rem' }">
  <p>...</p>
  <template #footer>
    <Button label="Cancel" text @click="deleteDialogVisible = false" />
    <Button label="Delete" severity="danger" @click="confirmDelete" />
  </template>
</Dialog>
```

**After (UModal):**
```html
<UModal v-model:open="deleteDialogVisible" :ui="{ content: 'max-w-sm' }">
  <template #header>
    <h3>Confirm delete</h3>
  </template>
  <template #body>
    <p>...</p>
  </template>
  <template #footer>
    <div class="flex justify-end gap-2">
      <UButton label="Cancel" variant="ghost" @click="deleteDialogVisible = false" />
      <UButton label="Delete" color="error" @click="confirmDelete" />
    </div>
  </template>
</UModal>
```

Key differences:
- `v-model:visible` → `v-model:open`
- `header` prop → `#header` slot
- `#footer` slot → `#footer` slot (same name)
- `:style="{ width }"` → `:ui="{ content: 'max-w-sm' }"`
- `severity="danger"` → `color="error"`
- `text` prop → `variant="ghost"`
- `prevent-close` → `:dismissible="false"`

### USelectMenu grouped multi-select

PrimeVue MultiSelect had first-class support for `optionGroupLabel`/`optionGroupChildren`. USelectMenu uses an **array-of-arrays** structure where each sub-array is a group.

**Data transformation required.** The existing `tagGroups` structure (`[{ id, name, color, children: [{id, name}] }]`) must be flattened to nested arrays for USelectMenu:

```ts
// Transform tagGroups for USelectMenu items prop
const selectItems = computed(() =>
  tagsStore.tagGroups.map(group =>
    group.children.map(child => ({
      label: child.name,
      value: child.id,
      // USelectMenu uses 'label' for display and 'value' for v-model
    }))
  )
)
```

**Chip display:** USelectMenu does not render selected items as chips by default (comma-separated text). Custom `#leading` slot needed for chip display, or use the `trigger` slot to render selected items as UBadge elements. This is a **non-trivial difference** from PrimeVue's `display="chip"`.

**Alternative approach:** Render selected tags inline outside the USelectMenu (below the component) using `v-for` over `selectedTagIds`, displaying each as a `UBadge` with a remove button. This is simpler than overriding the USelectMenu trigger slot and more predictable.

### Icons migration

PrimeVue used PrimeIcons (`pi pi-search`, `pi pi-home`). Nuxt UI uses `@nuxt/icon` with Heroicons.

| PrimeIcons class | Heroicons equivalent (UIcon name) |
|---|---|
| `pi pi-home` | `i-heroicons-home` |
| `pi pi-search` | `i-heroicons-magnifying-glass` |
| `pi pi-chart-bar` | `i-heroicons-chart-bar` |
| `pi pi-cog` | `i-heroicons-cog-6-tooth` |
| `pi pi-plus` | `i-heroicons-plus` |
| `pi pi-pencil` | `i-heroicons-pencil` |
| `pi pi-trash` | `i-heroicons-trash` |

Use `<UIcon name="i-heroicons-magnifying-glass" />` or pass the name string to component `icon` props.

---

## Data Layer Migration

### src/data/*.js → server/data/ + server/api/

Mock data files move from `src/data/` to `server/data/`, and each gets a corresponding API handler in `server/api/`. This establishes the API contract that real backend calls will follow later.

**File structure:**
```
server/
  data/
    vendors.ts          # raw array (migrated from src/data/vendors.js)
    discovery.ts        # raw array
    dpa.ts              # raw array
    edtech.ts           # raw array
  api/
    vendors.get.ts      # GET /api/vendors → returns vendors array
    discovery.get.ts    # GET /api/discovery → returns discovery array
    dpa.get.ts          # GET /api/dpa → returns dpa array
    edtech.get.ts       # GET /api/edtech → returns edtech array
```

**Server route pattern:**
```ts
// server/api/vendors.get.ts
import vendorsData from '../data/vendors'

export default defineEventHandler(() => {
  return vendorsData
})
```

**Key convention:** `.get.ts` suffix makes the route respond to GET only. `defineEventHandler` is auto-imported in server routes — no explicit import needed.

### riskLabels.js → shared utility

`riskLabels.js` contains only constants (no Node-only APIs). It can live in `app/utils/riskLabels.ts` and be auto-imported into components. Alternatively, place in `shared/utils/riskLabels.ts` (Nuxt 4's `shared/` directory is accessible from both `app/` and `server/`).

**Recommendation:** `app/utils/riskLabels.ts` — constants are display-layer concerns, used only in components.

---

## State Migration

### src/stores/tags.js → app/stores/tags.ts with @pinia/nuxt

**Installation:**
```bash
npm install @pinia/nuxt pinia-plugin-persistedstate
```

**nuxt.config.ts:**
```ts
modules: [
  '@nuxt/ui',
  '@pinia/nuxt',
  'pinia-plugin-persistedstate/nuxt',
],
```

**Store migration — before (src/stores/tags.js):**
```js
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref(loadOrDefault(TAG_GROUPS_KEY, SEED_TAG_GROUPS))
  const assignments = ref(loadOrDefault(ASSIGNMENTS_KEY, {}))

  watch(tagGroups, (val) => localStorage.setItem(...), { deep: true })
  watch(assignments, (val) => localStorage.setItem(...), { deep: true })

  return { tagGroups, assignments }
})
```

**Store migration — after (app/stores/tags.ts):**
```ts
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<Record<string, string[]>>({})

  return { tagGroups, assignments }
}, {
  persist: [
    { key: 'schoolday-tag-groups', paths: ['tagGroups'], storage: piniaPluginPersistedstate.localStorage() },
    { key: 'schoolday-tag-assignments', paths: ['assignments'], storage: piniaPluginPersistedstate.localStorage() },
  ]
})
```

**SSR safety:** `pinia-plugin-persistedstate` with `localStorage()` storage is client-only. On the server, the store initializes from `SEED_TAG_GROUPS`. On client hydration, localStorage values overwrite the seed if present. The manual `loadOrDefault()` + `watch()` pattern from v0.5.0 is replaced entirely by the plugin.

**Critical:** The existing `watch()` + `localStorage.setItem()` pattern in `tags.js` will cause SSR errors (localStorage is undefined on the server). The plugin handles this safely — do not port the watch pattern directly.

**SEED_TAG_GROUPS export:** Still needed for the reset-to-defaults feature. Keep the export in `app/stores/tags.ts`.

**Auto-import behavior:** With `@pinia/nuxt`, `defineStore` is auto-imported. The store file does NOT need `import { defineStore } from 'pinia'`. Composables from `app/stores/` ARE auto-imported by Nuxt's scanner — `useTagsStore()` can be called in any component without a manual import.

---

## Auto-imports

Nuxt 4 auto-imports the following — no manual import statements needed:

| Category | What is auto-imported | Source |
|---|---|---|
| Vue APIs | `ref`, `computed`, `watch`, `shallowRef`, `nextTick`, `onMounted`, etc. | Vue 3 core |
| Nuxt composables | `useFetch`, `useAsyncData`, `useRoute`, `useRouter`, `navigateTo`, `useState`, `useNuxtApp` | Nuxt runtime |
| Nuxt utilities | `definePageMeta`, `defineNuxtConfig`, `defineEventHandler` | Nuxt compiler macros |
| Components in `app/components/` | All `.vue` files, recursively | Nuxt scanner |
| Composables in `app/composables/` | Top-level files only (not nested) | Nuxt scanner |
| Utils in `app/utils/` | Top-level files only (not nested) | Nuxt scanner |
| Stores in `app/stores/` | Composable functions matching `use*` naming | @pinia/nuxt + Nuxt scanner |
| Nuxt UI components | All `U*` components (`UTable`, `UModal`, etc.) | @nuxt/ui module |
| Pinia | `defineStore`, `storeToRefs` | @pinia/nuxt module |

**What is NOT auto-imported:**
- `FilterMatchMode` from `@primevue/core/api` (PrimeVue is gone — this import disappears entirely)
- Components imported from third-party packages (e.g., `VChart` from `vue-echarts` — must be registered manually or wrapped in a plugin)
- Named exports from files outside `composables/`, `utils/`, `components/`, `stores/`
- Deeply nested files (only top-level of each directory is scanned by default)

**Component auto-import naming:** `app/components/VendorDrawer.vue` → used as `<VendorDrawer>` with no import. `app/components/layout/SidebarNav.vue` → used as `<LayoutSidebarNav>` (directory prefix added) or rename the file.

**Recommendation:** Keep layout components in `app/components/` without a subdirectory to avoid the prefixed name (`SidebarNav.vue` → `<SidebarNav>`, not `<LayoutSidebarNav>`). Or place them in `app/layouts/` if they are layout-only.

---

## Data Fetching Pattern

### useFetch vs useAsyncData

Both are SSR-safe and prevent double-fetching (data from server render is passed to client in the Nuxt payload — no second HTTP request on hydration).

| | `useFetch` | `useAsyncData` |
|---|---|---|
| Use case | Single endpoint, straightforward GET | Multiple endpoints, custom logic, non-HTTP sources |
| Key generation | Automatic (from URL + options) | Manual key required |
| Type inference | Auto-infers from server route TypeScript types | Manual generic type annotation |
| Recommendation | Use this for all server route calls in this project | Use only if combining multiple data sources |

**For this project, use `useFetch` throughout.** All pages call single server routes. The server route types flow through automatically.

**Page data fetching pattern:**
```ts
// app/pages/discovery.vue
const { data: vendors } = await useFetch('/api/vendors')
const { data: discovery } = await useFetch('/api/discovery')
```

**`await` at top level:** In Nuxt 4 pages, `await useFetch()` is valid in `<script setup>`. Nuxt suspends rendering until data is ready (SSR) or shows the page shell while fetching (client nav).

**Do NOT import data files directly in components.** The v0.5.0 pattern of `import vendorsData from '../data/vendors.js'` worked in a SPA but bypasses the server route layer. In Nuxt 4, all data must flow through `server/api/` routes to establish the real API contract.

**Joins still happen at the page level.** The `Object.fromEntries(discoveryData.map(d => [d.vendorId, d]))` join pattern from v0.5.0 is preserved — it runs in a `computed()` after `useFetch` returns the arrays. No change to join logic.

---

## ECharts / ClientOnly Migration

### Problem

ECharts uses browser APIs (`canvas`, `ResizeObserver`) that are not available during SSR. `VChart` from `vue-echarts` will throw on the server without protection.

### Solution: wrap in `<ClientOnly>`

```html
<ClientOnly>
  <VChart :option="chartOption" autoresize style="height: 280px; width: 100%" />
</ClientOnly>
```

`<ClientOnly>` is a built-in Nuxt component (auto-imported). It renders nothing on the server and mounts the chart only in the browser. This is the standard Nuxt pattern — confirmed in official docs.

### Alternative: nuxt-echarts module

A `nuxt-echarts` community module exists (HIGH confidence — official Nuxt modules directory) that wraps VChart and handles SSR registration automatically. It adds `VChart`, `VChartServer`, and `VChartFull` components. However, it adds another dependency and indirection. For this project's two simple charts (donut + radar), wrapping `vue-echarts` in `<ClientOnly>` is simpler and sufficient.

**Recommendation:** Keep `vue-echarts` + manual `<ClientOnly>` wrapping. Register ECharts components in a Nuxt plugin (`app/plugins/echarts.client.ts`) — the `.client.ts` suffix ensures the plugin only runs in the browser.

```ts
// app/plugins/echarts.client.ts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, PieChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, RadarChart, PieChart, RadarComponent, TooltipComponent, LegendComponent])

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VChart', VChart)
})
```

The `.client.ts` suffix replaces the manual `import.meta.client` guard — Nuxt will not load this plugin during SSR.

---

## Nuxt UI Color Theme Migration

### PrimeVue SchoolDay Aura preset → Nuxt UI CSS variables

v0.5.0 defined a custom `SchoolDayPreset` using `definePreset(Aura, { semantic: { primary: { 500: '#484ce6' } } })`.

Nuxt UI v3 uses CSS custom properties for theming. Override the primary color in `app/assets/css/main.css`:

```css
@import "tailwindcss";
@import "@nuxt/ui";

:root {
  --ui-primary: var(--color-indigo-500);  /* or define custom hex */
}
```

For exact brand color `#484ce6`, define a custom Tailwind color and reference it. Alternatively, use `--ui-primary: 72 76 230` (RGB channel values that Tailwind's opacity modifiers expect).

**The `bg-primary` Tailwind class:** Used in `SidebarNav.vue` for active nav links. In Nuxt UI, `primary` is a CSS-variable-backed color. `bg-primary` still works if the CSS variable is set.

**`darkModeSelector: false`:** This v0.5.0 setting disabled system dark mode. In Nuxt UI, dark mode is controlled by `@nuxtjs/color-mode` (auto-installed by `@nuxt/ui`). Set `colorMode: { preference: 'light' }` in `nuxt.config.ts` to lock to light mode.

---

## Known Migration Challenges

### Challenge 1: USelectMenu chip display (HIGH effort)

PrimeVue MultiSelect's `display="chip"` showed selected tags as colored pills inside the input. USelectMenu in Nuxt UI v3 shows comma-separated text by default. Multi-chip display requires custom slot implementation.

**Mitigation:** Render selected tags as `UBadge` elements below the USelectMenu instead of inside it. This is a visual change but functionally equivalent and simpler to implement.

### Challenge 2: UBadge arbitrary colors (LOW effort)

UBadge `color` prop only accepts design tokens. The color maps in `riskLabels.ts` use hex values. Apply colors via `:style` attribute directly on UBadge — standard HTML attribute binding still works.

### Challenge 3: UTable column sorting defaults (MEDIUM effort)

PrimeVue DataTable accepted `sortField` and `:sortOrder` as props for default sort state. UTable uses `v-model:sorting` with a TanStack sorting array: `[{ id: 'name', desc: false }]`. Default sort must be set as the initial value of the sorting ref.

### Challenge 4: UTable row hover (LOW effort)

PrimeVue DataTable had a `rowHover` boolean prop. UTable needs a Tailwind hover class via the `ui` prop: `:ui="{ tr: 'cursor-pointer hover:bg-gray-50' }"`.

### Challenge 5: UTable getRowId (LOW effort)

PrimeVue's `dataKey="vendorId"` told the table which field is the stable row ID. UTable uses TanStack's `getRowId` option passed to `useVueTable`. For this project with 27 static rows, this is not critical but prevents React-key-style warnings.

---

## Confidence Assessment

| Area | Level | Source | Notes |
|---|---|---|---|
| Directory structure | HIGH | Nuxt 4 official docs | Verified at nuxt.com/docs/4.x/directory-structure |
| File-based routing | HIGH | Nuxt 4 official docs | definePageMeta, getRoutes confirmed |
| Layout system | HIGH | Nuxt 4 official docs | NuxtLayout + default.vue pattern confirmed |
| Auto-imports | HIGH | Nuxt 4 official docs | All categories verified |
| Server routes | HIGH | Nuxt 4 official docs | .get.ts pattern, defineEventHandler confirmed |
| useFetch pattern | HIGH | Nuxt 4 official docs | SSR payload behavior confirmed |
| @pinia/nuxt | HIGH | Pinia + @pinia/nuxt official docs | Module setup confirmed |
| pinia-plugin-persistedstate | HIGH | Official plugin docs | Nuxt module, localStorage storage confirmed |
| UTable API | HIGH | Nuxt UI v3 official docs | #<key>-cell slot, @select event confirmed |
| USlideover API | HIGH | Nuxt UI v3 official docs | v-model:open, side prop, #content slot confirmed |
| UModal API | HIGH | Nuxt UI v3 migration guide | v-model:open, slot names confirmed |
| USelectMenu grouped | MEDIUM | Nuxt UI v3 official docs | Array-of-arrays structure confirmed; chip display workaround not officially documented |
| UBadge :style custom colors | MEDIUM | Nuxt UI badge docs + GitHub issues | color prop limited to tokens; :style works but not officially recommended |
| ECharts ClientOnly | HIGH | Nuxt official docs + nuxt-echarts module page | `<ClientOnly>` pattern is standard Nuxt |
| .client.ts plugin pattern | HIGH | Nuxt 4 official docs | Plugin filename suffix confirmed |

---

## Sources

- Nuxt 4 directory structure: https://nuxt.com/docs/4.x/directory-structure
- Nuxt 4 routing: https://nuxt.com/docs/4.x/getting-started/routing
- Nuxt 4 layouts: https://nuxt.com/docs/4.x/directory-structure/app/layouts
- Nuxt 4 pages + definePageMeta: https://nuxt.com/docs/4.x/directory-structure/app/pages
- Nuxt 4 server routes: https://nuxt.com/docs/4.x/directory-structure/server
- Nuxt 4 auto-imports: https://nuxt.com/docs/4.x/guide/concepts/auto-imports
- Nuxt 4 data fetching: https://nuxt.com/docs/4.x/getting-started/data-fetching
- Nuxt 4 useRouter: https://nuxt.com/docs/4.x/api/composables/use-router
- Nuxt UI v3 installation: https://ui.nuxt.com/docs/getting-started/installation/nuxt
- Nuxt UI v3 migration guide (v2→v3): https://ui.nuxt.com/docs/getting-started/migration/v3
- Nuxt UI v3 UTable: https://ui.nuxt.com/docs/components/table
- Nuxt UI v3 USlideover: https://ui.nuxt.com/docs/components/slideover
- Nuxt UI v3 UModal: https://ui.nuxt.com/docs/components/modal
- Nuxt UI v3 USelectMenu: https://ui.nuxt.com/docs/components/select-menu
- Nuxt UI v3 UBadge: https://ui.nuxt.com/docs/components/badge
- Pinia + Nuxt: https://pinia.vuejs.org/ssr/nuxt.html
- pinia-plugin-persistedstate Nuxt: https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html
- nuxt-echarts module: https://echarts.nuxt.dev/
