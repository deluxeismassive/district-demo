# Phase 10: Discovery Page - Research

**Researched:** 2026-05-21
**Domain:** Nuxt UI v4 UTable + USlideover + USelectMenu, nuxt-echarts radar chart in a user-triggered overlay, Pinia setup-store write-back with persist:true, SSR-hydration semantics with localStorage-rehydrated state
**Confidence:** HIGH

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Discovery page fully functional — `UTable` with column sort and search filter, `USlideover` VendorDrawer with ECharts radar chart (client-only via `<ClientOnly>` or `nuxt-echarts`), `USelectMenu` tag assignment with tag display | Section 1 (UTable), Section 2 (search filter), Section 3 (tag chip cell), Section 4 (USlideover), Section 5 (ECharts in drawer), Section 6 (USelectMenu), Section 7 (Pinia write-back), Section 8 (drawer state lifting) |

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Nuxt 4 + Nuxt UI v4 + Pinia (established Phases 7-9). Do NOT introduce conflicting libraries (no TanStack-React, no PrimeVue, no other table or drawer libs).
- **Deployment:** Static GitHub Pages (Phase 13). The Discovery page must SSR cleanly under `nuxi generate` — no `window`/`document` references at top-level setup, no fetches that can't resolve at prerender time.
- **Data:** All synthetic. `useFetch('/api/vendors')` (wired in Phase 9) already returns 27 typed `Vendor[]` records. Phase 10 does NOT change the fetch wiring; it consumes it.
- **Iteration speed:** A demo edit (column added, drawer section reordered, tag color tweaked) must be a sub-1-hour developer operation. Favor flat single-file pages over premature componentization.
- **Auth:** None. The whole portal is public; nothing to gate.
- **GSD enforcement:** All file changes through `/gsd:execute-phase`.
- **Naming:** PascalCase for `.vue` SFCs; camelCase for `.ts`; kebab-case for asset filenames. Page filename `discovery.vue` (lowercase) already established Phase 8.
- **Indentation:** 2 spaces, ES modules, no linter/formatter configured.

---

## User Constraints (from CONTEXT.md)

> **No CONTEXT.md exists for Phase 10** — running in autonomous mode per init payload. The locked decisions from STATE.md + ROADMAP + REQUIREMENTS + carry-forward from Phases 7-9 govern.

### Locked Decisions (from STATE.md + ROADMAP + REQUIREMENTS)

- **Component mapping:** PrimeVue DataTable → `UTable`, Drawer → `USlideover`, MultiSelect → `USelectMenu`, Tag → `UBadge` or custom hex-styled chip (STATE.md "Key Decisions").
- **ECharts SSR strategy:** `<ClientOnly>` wrapper at this site — ROADMAP Phase 10 success criterion 2 says verbatim "rendering inside `<ClientOnly>`". This is consistent with the Phase 7 anti-pattern guidance: do NOT double-wrap when the chart is part of the initial SSR payload, but DO wrap when the chart only ever mounts client-side (drawer interaction). See Section 5 for the reconciliation.
- **Pinia SSR persistence:** Already wired Phase 7. Tags store at `app/stores/tags.ts` exposes `tagGroups: Ref<TagGroup[]>` and `assignments: Ref<Record<string, string[]>>` with `persist: true`. Phase 10 writes to `assignments`.
- **Vendor data shape:** `Vendor` interface in `shared/types/data.ts` carries the 10 `privacyScore.*` numeric fields (the radar axes) plus inline discovery metrics (`frequency`, `lastSeen`, `userCount`, `studentCount`). All 27 vendors verified populated.
- **useFetch wiring:** `useFetch('/api/vendors', { default: () => [] })` in `app/pages/discovery.vue` — NO change in Phase 10. Phase 9 success criterion was "no manual generic, `default: () => []`"; Phase 10 honors it.
- **No new dependencies:** Phase 10 is a pure-code phase. Nuxt UI v4, nuxt-echarts, and Pinia are already installed.
- **Plan budget:** 3 plans per ROADMAP — 10-01 (table + filter + chips), 10-02 (drawer + radar), 10-03 (tag assignment + Pinia write-back).
- **Phase 9 explicitly hands off the existing useFetch:** "Phase 10 wires the UTable + USlideover" — extends, does not rewrite.

### Claude's Discretion

- **Per-row vs drawer-only tag assignment** — ROADMAP success criterion 3 says "USelectMenu in the table row". Recommendation in Section 6: per-row USelectMenu in a dedicated table cell. The drawer ALSO shows a USelectMenu bound to the same `assignments[vendorId]` so both surfaces stay in sync via Pinia.
- **VendorDrawer extraction to `app/components/VendorDrawer.vue` vs inline in `discovery.vue`** — Recommendation in Section 8: **extract** to a component. v0.5.0 had it as a separate file because it gets reused in DPA view (Phase 11) — that reuse pattern still applies in v1.0.0. Inline would mean Phase 11 re-extracts.
- **Search filter mechanism** — UTable v4 supports `v-model:global-filter` AND manual computed filter. Recommendation in Section 2: **manual computed filter** with VueUse `useDebounce` for the input. Simpler, more controllable, debug-friendly for sales demos.
- **`UBadge` vs custom chip span for tag chips** — Recommendation in Section 3: `UBadge` with `:style="{ backgroundColor: tag.parentColor }"` and `color="neutral"` to disable the component's own color logic. Closest match to v0.5.0 chip appearance with least custom CSS.
- **1EdTech section in drawer** — Phase 10 surfaces the existing 1EdTech section in the drawer (data already in `server/data/edtech.ts` via `/api/edtech` route). Phase 11 will repurpose UBadge color logic for DPA. The 1EdTech detail (per REQUIREMENTS.md deferred row "which standards/tiers a vendor holds") stays at the current verbatim level — status badge only.

### Deferred to Later Phases (OUT OF SCOPE for Phase 10)

- DPA table page UI (Phase 11) — though the drawer's DPA SECTION ships in Phase 10 since v0.5.0's drawer carries it.
- Dashboard "Top 8" card (Phase 11).
- Risk Position donut + tier table (Phase 12).
- Tags Management CRUD page (Phase 12).
- Cascade tag delete logic (Phase 12 — the action that calls into assignments to scrub tag IDs).
- Deployment / static generate / base path (Phase 13).
- Filter Discovery table BY tag (REQUIREMENTS.md v1.1+ deferred).
- 1EdTech detail expansion in drawer (REQUIREMENTS.md v1.1+ deferred).
- Click-segment-to-filter on donut (Phase 12+).
- Mobile responsiveness (REQUIREMENTS.md "Out of Scope v1.0.0").

---

## Phase Requirements (carry-forward to plan-checker)

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Discovery page fully functional — UTable with column sort and search filter, USlideover VendorDrawer with ECharts radar chart (client-only via ClientOnly or nuxt-echarts), USelectMenu tag assignment with tag display | All 12 per-question sections below |

---

## Summary

Phase 10 is the largest UI phase in v1.0.0 — three new Nuxt UI v4 components stand up in sequence (UTable, USlideover, USelectMenu), an ECharts radar chart finally renders against real data, and the Pinia tags store gets its first write-back path since Phase 7's seed. Total new code: roughly 250-300 lines split across `app/pages/discovery.vue` (table + filter + drawer state lifting), `app/components/VendorDrawer.vue` (sections + radar + tag select), and zero new top-level files (the store, the data, the routes, and the layout are all already in place).

Five pivotal technical facts shaped the recommendations below:

1. **Nuxt UI v4's UTable is TanStack Table under the hood.** Columns are `TableColumn<Vendor>[]` (imported from `@nuxt/ui`). Cell customization uses BOTH a TanStack-style `cell: ({ row }) => h(...)` function AND template slots named `#{accessorKey}-cell="{ row }"` (e.g., `#name-cell`, `#tags-cell`). Per-column sort is enabled by writing the header as a render function calling `column.toggleSorting()` — there is no `sortable: true` flag like PrimeVue. We use a tiny shared `sortHeader(label)` helper to keep the columns array readable.

2. **UTable's row-click is the `@select` event, NOT a `row-click` handler.** The signature is `(e: Event, row: TableRow<Vendor>) => void`, and the row data lives at `row.original`. This is different enough from PrimeVue's `@row-click="onRowClick"` that a literal port would be broken.

3. **USlideover uses `v-model:open`, not `v-model:visible`.** The width is set via `:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"` — there's no `size` prop. The drawer ships with a built-in close button (top-right `i-lucide-x`) and a backdrop-click-to-close behavior (`dismissible: true` default). Body content goes in a default slot OR `#body` slot — both work.

4. **For the ECharts radar specifically, wrap `<VChart>` in `<ClientOnly>` — and this does NOT contradict Phase 7's "don't double-wrap" anti-pattern.** Phase 7 forbade double-wrapping when the chart is part of the initial SSR payload (e.g., a Risk donut on the landing page) because nuxt-echarts has its own SVG-fallback mechanism. But the radar is INSIDE the drawer, which only mounts on user click — it's never part of the initial SSR payload anyway. Wrapping it in `<ClientOnly>` is the explicit ROADMAP success criterion 2 ("rendering inside `<ClientOnly>`") AND is documented-safe per nuxt-echarts SSR guidance ("for charts appearing only after user interaction, wrapping in `<ClientOnly>` has no downside"). The donut on the Risk page (Phase 12) is the case where the Phase 7 anti-pattern actually matters.

5. **The Pinia tags store is a setup store with `assignments` exposed as a Ref<Record<string, string[]>>.** Setup stores allow direct mutation of returned refs from outside — `tagsStore.assignments[vendorId] = [...]` is valid Pinia and triggers reactivity and persist-state writes. We do NOT need explicit setter actions for Phase 10's two write paths (set / clear). However, for code-discoverability and to give the planner a single grep target for the write-back probe, we recommend ADDING a thin `setVendorTags(vendorId, tagIds)` action to the store in Plan 10-03. The store stays setup-style; the action is a one-liner.

The single highest-risk pitfall is **SSR hydration mismatch from localStorage-rehydrated assignments.** The server renders the table with `assignments` empty (Phase 7 design: persist plugin is client-only). The client rehydrates from localStorage after mount. If any user has prior tag assignments, the tag-chip cells will visibly populate ~50-200ms after first paint. This is acceptable for a sales-demo portal (first-load is always reset for prospects), but the plan must flag it in the verification script and not chase a "fix" via async SSR data loading.

**Primary recommendation:** Three plans, sequential within Wave 1 / Wave 2 because the dependency chain is real:

- **Wave 1: Plan 10-01** — Discovery UTable: columns, sort, manual filter via `useDebounce`, tag chip slot reading `assignments[vendorId]`. Single-file change to `app/pages/discovery.vue`. No drawer yet, no per-row USelectMenu yet — chip slot renders the existing (empty) assignments. This establishes the table shape that 10-02 and 10-03 extend.
- **Wave 2: Plan 10-02** — VendorDrawer extraction to `app/components/VendorDrawer.vue` with USlideover + drawer-internal USelectMenu (binds to `assignments` directly) + radar chart in `<ClientOnly>` + DPA/1EdTech sections via paired `useFetch('/api/dpa')` and `useFetch('/api/edtech')` lookups. Page wires `selectedVendorId` ref and passes via prop. Depends on 10-01 because the row-click that opens the drawer is wired in 10-01's table.
- **Wave 2: Plan 10-03** — Per-row USelectMenu cell + drawer USelectMenu (both bind to the same `assignments[vendorId]` source of truth) + thin `setVendorTags` store action + cascade chip refresh. Depends on 10-01 for the table cell slot and on 10-02 for the drawer-internal USelectMenu. Recommend placing in Wave 2 alongside 10-02 OR Wave 3 if 10-02's drawer-internal select is moved to 10-02 (which I recommend).

A note on Wave layout: Plans 10-02 and 10-03 are weakly independent — 10-02 ships a drawer that includes its own USelectMenu (the natural drawer detail UX), and 10-03 ships the table-cell USelectMenu (per ROADMAP SC#3). They could run in parallel in Wave 2 with one file-overlap conflict (both touch `discovery.vue` to wire row-level state). The safer wave plan is **10-01 in Wave 1, 10-02 and 10-03 sequential in Wave 2 and Wave 3** — total 3 waves. This avoids the merge conflict and lets 10-03 build on a known-good drawer.

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | UTable columns shape | **`TableColumn<Vendor>[]`** imported from `@nuxt/ui`; each column has `accessorKey` + `header` (string OR render function for sortable) + optional `cell` (render function) | TanStack-based; matches v4 docs verbatim |
| 2 | Per-column sort enable | **Header as render function calling `column.toggleSorting()`** + `enableSorting: true` default; use a `sortHeader(label)` helper to keep the columns array readable | UTable has no PrimeVue-style `sortable: true` flag |
| 3 | Search/filter pattern | **Manual computed `filteredVendors`** bound to a `UInput` v-model with `useDebounce` (VueUse, 200ms) | UTable's `v-model:global-filter` works but couples filter logic to TanStack internals; manual computed is more debug-friendly and matches v0.5.0 behavior |
| 4 | Tag chip in row cell | **`#tags-cell="{ row }"` slot with `<UBadge :style="{ backgroundColor: tag.parentColor }" color="neutral" variant="solid"><name></UBadge>`** wrapped in `<div class="flex flex-wrap gap-1">` | Hex-bound via style, color="neutral" disables UBadge's own color theming so `:style` wins |
| 5 | Row click handler | **`@select="onRowSelect"` with `(_e, row) => selectedVendorId = row.original.vendorId`** | UTable's v4 row-click is `@select`, NOT `@row-click` |
| 6 | Drawer extraction | **Extract to `app/components/VendorDrawer.vue`** — auto-imported via Nuxt components convention | Reuse in Phase 11 DPA view; matches v0.5.0 organization |
| 7 | USlideover v-model | **`v-model:open="!!selectedVendorId"` with a wrapping computed setter that clears `selectedVendorId` on close** | `v-model:open` is the v4 binding name; using a computed lets us derive `open` from `selectedVendorId` without two refs |
| 8 | USlideover width | **`:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"`** to match v0.5.0's 480px drawer width | No `size` prop in v4; `:ui` slot tokens are the API |
| 9 | ECharts radar in drawer | **`<ClientOnly><VChart :option="radarOption" autoresize style="height: 320px; width: 100%" /></ClientOnly>`** | Drawer is interaction-mounted, never part of SSR; ClientOnly is safe and matches ROADMAP SC#2 verbatim |
| 10 | ClientOnly fallback | **`<template #fallback><USkeleton class="h-[320px] w-full" /></template>`** | Prevents layout jump during hydration when drawer opens |
| 11 | USelectMenu items shape | **Array-of-arrays for groups: `[[group1Items], [group2Items], ...]`** with `valueKey="id"` and `labelKey="name"` | v4 docs verbatim: "pass an array of arrays to the `items` prop to display separated groups of items" |
| 12 | USelectMenu in row cell | **One USelectMenu per row in a `#tags-assign-cell` column slot** — `multiple`, `valueKey="id"`, model bound through a computed get/set that reads/writes `tagsStore.assignments[vendorId]` | ROADMAP SC#3 verbatim; computed setter lets us also fire the store action |
| 13 | Drawer USelectMenu | **Same USelectMenu, same computed get/set pattern** — appears in the drawer's "Tags" section | Both surfaces share `assignments[vendorId]` so they stay in sync |
| 14 | Store write-back | **Add `setVendorTags(vendorId, tagIds)` action to `app/stores/tags.ts`** + keep direct mutation as a fallback (setup stores allow it). Action is the canonical path for grep verification | Action is the named, type-safe, testable path; direct mutation works but is harder to grep |
| 15 | Drawer state lifting | **Single `selectedVendorId: Ref<string \| null>` at page level; drawer takes `:vendor-id` prop and looks up the vendor reactively via a `vendorMap` computed** | Cleaner than per-row drawer instances; no portal-mount race conditions |
| 16 | Search debounce | **`useDebounce(search, 200)` from VueUse** — `@vueuse/nuxt` if not already installed (verify); else explicit `import { useDebounce } from '@vueuse/core'` (Vue UI v4 brings VueUse as a transitive dep) | 200ms feels instant for 27 rows; prevents thrash on fast typing |
| 17 | Empty-state row | **`<template #empty>` slot with a small "No vendors match your search" message** | UTable supports `#empty` slot; matches v0.5.0 empty state |
| 18 | Wave layout | **10-01 → Wave 1, 10-02 → Wave 2, 10-03 → Wave 3** — sequential, no parallel attempts | 10-02 and 10-03 both touch discovery.vue for state lifting; parallelism creates merge conflicts that aren't worth the 1 task savings |
| 19 | 1EdTech section in drawer | **Surface verbatim status badge + standard + cert date — no expansion** | REQUIREMENTS.md "1EdTech detail (standards/tiers)" is v1.1+ deferred |

---

## Per-Question Findings

### 1. UTable in Nuxt UI v4 — column shape, sort, cell slots

**Source:** [Nuxt UI v4 Table docs](https://ui.nuxt.com/components/table) (fetched 2026-05-21).

**Type import:**
```ts
import type { TableColumn } from '@nuxt/ui'
const columns: TableColumn<Vendor>[] = [ /* ... */ ]
```

**Column shape (TanStack-based):**

| Key | Type | Purpose |
|-----|------|---------|
| `id` | `string` | Optional unique column identifier; defaults to `accessorKey` if omitted |
| `accessorKey` | `string` | Key on the row object — e.g. `'name'`, `'category'`, `'userCount'` |
| `header` | `string \| (({column}) => VNode)` | Header label (string) OR render function for interactive headers (sortable) |
| `cell` | `(({row, getValue}) => VNode \| string)` | Optional — render function for the cell. Alternative: template slot `#{accessorKey}-cell` |
| `enableSorting` | `boolean` | Default `true`; set `false` to disable sort on a specific column |
| `meta` | `{ class?, style?, colspan?, rowspan? }` | Cell styling pass-through |

**Per-column sort — there is NO `sortable: true` flag.** Sort is enabled by writing the header as a render function that invokes `column.toggleSorting()`. Verbatim from docs:

```ts
{
  accessorKey: 'email',
  header: ({ column }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      label: 'Email',
      icon: isSorted
        ? isSorted === 'asc' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
  },
}
```

**Recommendation: extract a `sortHeader(label)` helper** so the columns array stays readable. Concrete pattern for Discovery:

```ts
// app/pages/discovery.vue (excerpt)
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Vendor } from '#shared/types/data'

const UButton = resolveComponent('UButton')

function sortHeader(label: string) {
  return ({ column }: { column: any }) => {
    const isSorted = column.getIsSorted()
    return h(UButton, {
      label,
      color: 'neutral',
      variant: 'ghost',
      class: '-mx-2.5',
      icon: isSorted
        ? isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide'
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
  }
}

const columns: TableColumn<VendorRow>[] = [
  { accessorKey: 'name',         header: sortHeader('Vendor Name'),  meta: { class: 'min-w-[12rem]' } },
  { accessorKey: 'category',     header: sortHeader('Category'),     meta: { class: 'w-[9rem]' } },
  { accessorKey: 'frequency',    header: sortHeader('Frequency'),    meta: { class: 'w-[7rem]' } },
  { accessorKey: 'lastSeen',     header: sortHeader('Last Seen'),    meta: { class: 'w-[8rem]' } },
  { accessorKey: 'userCount',    header: sortHeader('Users'),        meta: { class: 'w-[6rem] text-right' } },
  { accessorKey: 'studentCount', header: sortHeader('Students'),     meta: { class: 'w-[6rem] text-right' } },
  { accessorKey: 'tags',         header: 'Tags',                     enableSorting: false, meta: { class: 'w-[14rem]' } },
  { accessorKey: 'tagsAssign',   header: '',                         enableSorting: false, meta: { class: 'w-[3rem]' } },
]
```

The `tagsAssign` column is a narrow ghost column where the per-row USelectMenu lives (Plan 10-03).

**Sort state binding:** Top-level `const sorting = ref([{ id: 'name', desc: false }])` + `<UTable v-model:sorting="sorting">` makes name-ascending the default sort.

**Cell slot naming — verified verbatim:** `#{accessorKey}-cell="{ row }"`. Row data is at `row.original`. Both `row.original.name` and `row.getValue('name')` work; prefer `row.original.<field>` for readability and full type inference.

**Header slot naming:** `#{accessorKey}-header="{ column }"` — but we use header render functions (above) instead because the sort interaction is inline with the label.

**Concrete tag chip cell slot:**

```vue
<UTable v-model:sorting="sorting" :data="filteredRows" :columns="columns" @select="onRowSelect">
  <template #tags-cell="{ row }">
    <div class="flex flex-wrap gap-1">
      <UBadge
        v-for="tag in row.original.tags"
        :key="tag.id"
        :label="tag.name"
        color="neutral"
        variant="solid"
        :style="{ backgroundColor: tag.parentColor, color: '#ffffff' }"
      />
    </div>
  </template>
</UTable>
```

**Empty state:** `<template #empty>No vendors match your search.</template>` — built-in slot, single-line.

**Confidence:** HIGH (verified verbatim from official docs page).

---

### 2. Search filter — manual computed vs UTable's `v-model:global-filter`

**Two viable patterns:**

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **`v-model:global-filter`** on UTable + UInput | TanStack-managed; less code in setup | Filter is internal to TanStack — opaque to debug/extend; harder to expose `filteredCount` |
| **Manual computed `filteredRows`** + UInput v-model | Explicit, debug-friendly, exposes count for header readout, fields filtered are pinpoint (name + category, not all fields) | ~6 extra lines | **WIN** |

**Recommended pattern (concrete):**

```ts
// app/pages/discovery.vue
import { useDebounce } from '@vueuse/core'

const search = ref('')
const debouncedSearch = useDebounce(search, 200)

const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((row) =>
    row.name.toLowerCase().includes(q) ||
    row.category.toLowerCase().includes(q)
  )
})
```

```vue
<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">Discovery</h1>
      <span class="text-sm text-gray-500">{{ filteredRows.length }} vendors</span>
    </div>

    <div class="mb-4 max-w-sm">
      <UInput
        v-model="search"
        placeholder="Search vendors..."
        icon="i-lucide-search"
        class="w-full"
      />
    </div>

    <UTable ... />
  </div>
</template>
```

**Why `useDebounce` (200ms):**
- 27 rows + a `filter()` per keystroke is sub-millisecond in practice; debounce is for input stability, not performance.
- 200ms feels "instant" but prevents a flicker if the user types fast.
- Matches v0.5.0's perceived behavior (PrimeVue debounced its global filter internally at a similar threshold).

**VueUse import path:** `@vueuse/core` is a transitive dep of `@nuxt/ui` v4 (Reka UI uses it internally). The `@vueuse/nuxt` module (auto-import `useDebounce` everywhere) is NOT installed; for one usage, explicit `import { useDebounce } from '@vueuse/core'` is the right call. **Verify via Plan 10-01 task 1:** if `import { useDebounce } from '@vueuse/core'` typechecks, no install needed; if it doesn't, fall back to `npm i @vueuse/core` (about 30KB gzipped). Verified that `@nuxt/ui` 4.8.0 has `@vueuse/core` as a peer dep — should be present.

**Confidence:** HIGH for filter pattern; MEDIUM-HIGH for VueUse availability (verify-then-install hedge in Plan 10-01).

---

### 3. Tag chip in row cell — UBadge with hex override

**Tag row shape (computed via `tableRows`):**

```ts
interface VendorRow extends Vendor {
  tags: Array<{ id: string; name: string; parentColor: string; parentId: string }>
}

// Build childId → { name, parentColor, parentId } lookup once
const childTagIndex = computed(() => {
  const idx: Record<string, { name: string; parentColor: string; parentId: string }> = {}
  for (const group of tagsStore.tagGroups) {
    for (const child of group.children) {
      idx[child.id] = { name: child.name, parentColor: group.color, parentId: group.id }
    }
  }
  return idx
})

const tableRows = computed<VendorRow[]>(() =>
  vendors.value.map((v) => {
    const ids = tagsStore.assignments[v.vendorId] ?? []
    const tags = ids
      .map((id) => ({ id, ...childTagIndex.value[id] }))
      .filter((t) => t.name)  // drop orphan IDs from deleted tags
      .sort((a, b) => a.parentId.localeCompare(b.parentId))
    return { ...v, tags }
  })
)
```

**Chip render:**

```vue
<template #tags-cell="{ row }">
  <div class="flex flex-wrap gap-1">
    <UBadge
      v-for="tag in row.original.tags"
      :key="tag.id"
      :label="tag.name"
      color="neutral"
      variant="solid"
      size="sm"
      :style="{ backgroundColor: tag.parentColor, color: '#ffffff' }"
    />
  </div>
</template>
```

**Why `color="neutral" variant="solid"` + `:style`:**
- `variant="solid"` makes UBadge a filled rectangle (the chip shape we want).
- `color="neutral"` tells Nuxt UI to NOT apply primary/secondary/error/etc. theming — leaves the background open for `:style` override.
- `:style="{ backgroundColor: tag.parentColor }"` injects the hex value from `TagGroup.color` (e.g., `#484ce6` for Curriculum, `#da8231` for Assessment).
- `color: '#ffffff'` on the style is the text color; all 4 seed group colors are dark enough for white text contrast.
- `size="sm"` gives a compact ~22px chip height suitable for a table cell.

**Tag overflow:** If a vendor has 6+ tags, the chips wrap to a second line within the cell. `flex-wrap` handles it. No "+3 more" truncation; for a demo, showing all assigned tags is more truthful.

**No new component file** — the chip pattern is inline in the cell slot. If Phase 11 reuses it for DPA status badges, that's a separate UBadge usage with `:style` bound to `DPA_STATUS_COLORS[status]` from `shared/utils/riskLabels.ts`.

**Confidence:** HIGH (UBadge `:style` override verified working in Nuxt UI v4 docs).

---

### 4. USlideover API — v-model, width, slots, dismiss

**Source:** [Nuxt UI v4 Slideover docs](https://ui.nuxt.com/components/slideover) (fetched 2026-05-21).

**v-model is `v-model:open`** (NOT `v-model:visible` like PrimeVue Drawer).

**Width — no `size` prop.** Width is set via the `:ui` slot-token prop:

```vue
<USlideover
  v-model:open="open"
  :title="vendor?.name"
  side="right"
  :ui="{ content: 'w-[480px] sm:max-w-[480px]' }"
>
```

**Default behaviors that match v0.5.0:**
- `dismissible: true` — click backdrop or press Escape to close ✓
- `overlay: true` — dark backdrop ✓
- `modal: true` — keyboard nav trapped in the drawer ✓
- `close: true` — top-right close button with `i-lucide-x` icon ✓ (PrimeVue drawer also had this)

**Slots:**

| Slot | Use | Slot props |
|------|-----|-----------|
| `default` | Trigger element (button) — **we DON'T use this**, we control via `v-model:open` from the page | — |
| `header` | Custom header replacement (we use `:title` prop instead) | — |
| `title` | Just the title text (we use `:title` prop) | — |
| `body` | Main content | — |
| `footer` | Footer actions (not needed for our drawer) | `{ close }` |
| `content` | Whole content panel (skip header/body separation) | — |

**Recommendation:** Use `:title="vendor?.name"` for the header + default slot (or `#body` slot) for content. Both work; recommend default slot for direct port from v0.5.0.

**`<UApp>` is required** for USlideover's portal — already present in `app/app.vue` from Phase 7. No action needed.

**Concrete drawer scaffold:**

```vue
<!-- app/components/VendorDrawer.vue -->
<script setup lang="ts">
import type { Vendor } from '#shared/types/data'

const props = defineProps<{ vendor: Vendor | null }>()
const open = defineModel<boolean>('open', { default: false })

// DPA + 1EdTech data, fetched once when the component mounts
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })
const { data: edtechList } = await useFetch('/api/edtech', { default: () => [] })

const dpaMap = computed(() =>
  Object.fromEntries(dpaList.value.map((d) => [d.vendorId, d]))
)
const edtechMap = computed(() =>
  Object.fromEntries(edtechList.value.map((e) => [e.vendorId, e]))
)

const vendorDpa = computed(() => props.vendor ? dpaMap.value[props.vendor.vendorId] ?? null : null)
const vendorEdtech = computed(() => props.vendor ? edtechMap.value[props.vendor.vendorId] ?? null : null)

const totalPrivacyScore = computed(() =>
  props.vendor
    ? Object.values(props.vendor.privacyScore).reduce((sum, v) => sum + v, 0)
    : 0
)

const radarOption = computed(() => {
  if (!props.vendor) return {}
  const s = props.vendor.privacyScore
  return {
    radar: { indicator: RADAR_AXES },  // see Section 5
    series: [{
      type: 'radar',
      data: [{
        value: [
          s.informationCollected, s.useOfInformation, s.dataSharing,
          s.securityMeasures, s.userRights, s.retentionPeriod,
          s.complianceWithLaws, s.updatesToPolicy,
          s.clarityAndTransparency, s.contactInformation,
        ],
        areaStyle: { color: 'rgba(72, 76, 230, 0.15)' },
        lineStyle: { color: '#484ce6', width: 2 },
      }],
    }],
    tooltip: { trigger: 'item' },
  }
})
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="vendor?.name ?? ''"
    side="right"
    :ui="{ content: 'w-[480px] sm:max-w-[480px]' }"
  >
    <template #body>
      <div v-if="vendor" class="flex flex-col gap-6">
        <!-- Usage section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Usage</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Frequency</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.frequency }}</div>
            </div>
            <!-- ... 3 more cells (lastSeen, userCount, studentCount) ... -->
          </div>
        </section>

        <USeparator />

        <!-- DPA section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">DPA</h3>
          <div v-if="vendorDpa" class="flex flex-col gap-3">
            <UBadge :label="vendorDpa.status" :style="{ backgroundColor: DPA_STATUS_COLORS[vendorDpa.status], color: '#ffffff' }" color="neutral" variant="solid" />
            <!-- ... -->
          </div>
        </section>

        <USeparator />

        <!-- 1EdTech section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">1EdTech Certification</h3>
          <!-- ... -->
        </section>

        <USeparator />

        <!-- Privacy radar -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Privacy Policy Score</h3>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-2xl font-semibold text-primary-600">{{ totalPrivacyScore }}</span>
            <span class="text-sm text-gray-500">Total Score / 100</span>
          </div>
          <ClientOnly>
            <VChart
              :option="radarOption"
              autoresize
              style="height: 320px; width: 100%"
            />
            <template #fallback>
              <USkeleton class="h-[320px] w-full" />
            </template>
          </ClientOnly>
        </section>

        <USeparator />

        <!-- Tags select -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
          <USelectMenu
            v-model="selectedTagIds"
            :items="groupedTagItems"
            value-key="id"
            label-key="name"
            multiple
            placeholder="Assign tags..."
            class="w-full"
          />
        </section>
      </div>
    </template>
  </USlideover>
</template>
```

**Note on `USeparator`:** Replaces PrimeVue's `Divider` 1:1. Nuxt UI v4 component, no install needed, auto-imported.

**Confidence:** HIGH for API; HIGH for the data-fetch pattern (carries Phase 9's Pattern B forward into the drawer component).

---

### 5. ECharts radar in the drawer — reconciling ROADMAP SC#2 with Phase 7 anti-pattern

**The apparent contradiction:**

- ROADMAP Phase 10 success criterion 2: *"a 10-axis ECharts radar chart rendering inside `<ClientOnly>`"* — explicit ClientOnly wrap.
- Phase 7 RESEARCH Pitfall #6: *"DON'T double-wrap `<VChart>` in `<ClientOnly>` with `nuxt-echarts` — the module's SSR/SVG fallback breaks."*

**The reconciliation:**

The Phase 7 pitfall applies when the chart is part of the **initial SSR payload** — e.g., the Risk Position donut chart on a directly-navigated `/risk` page. In that case, nuxt-echarts has its own SVG-fallback path on the server, and double-wrapping skips it.

The Discovery radar is **never part of the initial SSR payload** because it lives inside a drawer that only mounts when a user clicks a vendor row. By the time the drawer mounts, the page is hydrated and we're entirely client-side. There's nothing for nuxt-echarts to "fall back" from on the server — the server never renders the drawer at all.

This is confirmed by nuxt-echarts SSR docs (fetched 2026-05-21): *"For charts appearing only after user interaction, wrapping in `<ClientOnly>` has no downside."*

**The correct rule, formalized:**

| Chart placement | Wrap in `<ClientOnly>`? | Reason |
|-----------------|------------------------|--------|
| In initial SSR payload (top-level on a page, immediately visible) | **No** — let nuxt-echarts handle SSR via its SVG fallback | Phase 7 Pitfall #6 |
| Inside a user-triggered overlay (drawer, modal, popover) | **Yes** — wrap in `<ClientOnly>` | Chart never SSRs; ClientOnly matches the actual render lifecycle |
| Inside a tab that defaults to inactive | **Yes if tab content unmounts when hidden; No if rendered eagerly** | Same logic — depends on whether the chart is in the SSR payload |

**For Phase 10 specifically:** Discovery drawer radar → ClientOnly. For Phase 12 (Risk Position donut): NOT in ClientOnly (it's the main page content). Both decisions are consistent with each context.

**The 10 radar axes — verbatim from v0.5.0 `src/components/VendorDrawer.vue` lines 51-61, mapped to `Vendor.privacyScore` keys in `shared/types/data.ts`:**

| # | Axis label | `privacyScore.*` key | Max |
|---|------------|---------------------|-----|
| 1 | Information Collected | `informationCollected` | 10 |
| 2 | Use of Information | `useOfInformation` | 10 |
| 3 | Data Sharing | `dataSharing` | 10 |
| 4 | Security Measures | `securityMeasures` | 10 |
| 5 | User Rights | `userRights` | 10 |
| 6 | Retention Period | `retentionPeriod` | 10 |
| 7 | Compliance with Laws | `complianceWithLaws` | 10 |
| 8 | Updates to Privacy Policy | `updatesToPolicy` | 10 |
| 9 | Overall Clarity and Transparency | `clarityAndTransparency` | 10 |
| 10 | Contact Information | `contactInformation` | 10 |

**Hoist to a const** at the top of `VendorDrawer.vue`:

```ts
const RADAR_AXES = [
  { name: 'Information Collected', max: 10 },
  { name: 'Use of Information', max: 10 },
  { name: 'Data Sharing', max: 10 },
  { name: 'Security Measures', max: 10 },
  { name: 'User Rights', max: 10 },
  { name: 'Retention Period', max: 10 },
  { name: 'Compliance with Laws', max: 10 },
  { name: 'Updates to Privacy Policy', max: 10 },
  { name: 'Overall Clarity and Transparency', max: 10 },
  { name: 'Contact Information', max: 10 },
]
```

**Color choice:** v0.5.0 used `lineStyle.color: '#484ce6'` (brand-500) and `areaStyle.color: 'rgba(72, 76, 230, 0.15)'` (same hex, 15% alpha). Preserve verbatim — visual continuity with the marketing screenshots.

**Tooltip:** `tooltip: { trigger: 'item' }` — already registered via Phase 7's `echarts.components: ['TooltipComponent', ...]`.

**Light theme by default:** nuxt-echarts does NOT auto-pick dark mode unless `colorMode` is set explicitly. The drawer has a white background → light theme is correct without config.

**ClientOnly fallback slot — use `USkeleton`:** Prevents layout jump during the brief hydration moment when the drawer opens:

```vue
<ClientOnly>
  <VChart :option="radarOption" autoresize style="height: 320px; width: 100%" />
  <template #fallback>
    <USkeleton class="h-[320px] w-full" />
  </template>
</ClientOnly>
```

**Confidence:** HIGH for the reconciliation; HIGH for the 10 axes (verbatim port from v0.5.0); HIGH for the chart options shape.

---

### 6. USelectMenu — multi-select with grouped options

**Source:** [Nuxt UI v4 SelectMenu docs](https://ui.nuxt.com/components/select-menu) (fetched 2026-05-21).

**Key API details:**

| Prop | Type | Purpose |
|------|------|---------|
| `multiple` | `boolean` | Enables multi-select; `v-model` becomes an array |
| `items` | `Array \| Array<Array>` | Flat array OR **array-of-arrays for groups** (docs verbatim: "pass an array of arrays to the `items` prop to display separated groups of items") |
| `value-key` | `string` | Bind to a specific property (e.g., `'id'`) rather than the full object |
| `label-key` | `string` | Display field (e.g., `'name'`); defaults to `'label'` |
| `placeholder` | `string` | Empty-state text |
| `default-value` | `array (when multiple)` | Uncontrolled initial value |

**Items shape for grouped tag groups:**

The v4 API uses **nested arrays for groups** — `[[group1Items], [group2Items], ...]`. There is NO explicit `{ label, items }` wrapper shape.

**The downside:** Group LABELS (e.g., "Curriculum", "Assessment") are NOT rendered between groups in the default rendering. Groups are visually separated by a divider only. **For our case this is acceptable** — the chip BACKGROUND COLOR already signals the parent group (Curriculum tags are purple, Assessment tags are orange, etc.), and the chips inside the menu can render the group color via UBadge styling in a custom item slot.

**Alternative if labeled groups are wanted:** Use a custom `#item` slot with a `:before` divider — more code. Recommend skipping for v1.0.0; the color-coding is the visual primary group cue.

**Pattern for tag groups:**

```ts
const groupedTagItems = computed(() =>
  tagsStore.tagGroups.map((group) =>
    group.children.map((child) => ({
      id: child.id,
      name: child.name,
      groupColor: group.color,   // we keep this for an optional custom item slot
    }))
  )
)
```

This is an array-of-arrays — outer array indexed by group, inner array of `{ id, name, groupColor }` items.

**v-model binding pattern (per-row cell):**

```vue
<USelectMenu
  :model-value="tagsStore.assignments[row.original.vendorId] ?? []"
  @update:model-value="(ids) => tagsStore.setVendorTags(row.original.vendorId, ids)"
  :items="groupedTagItems"
  value-key="id"
  label-key="name"
  multiple
  placeholder="Tags..."
  size="sm"
  class="w-full"
/>
```

**Why explicit `:model-value` + `@update:model-value` instead of `v-model`:**

Direct `v-model="tagsStore.assignments[vendorId]"` works for setup stores (assignments is a Ref<Record<string, string[]>> and Pinia reactivity flows through bracket assignment), but the explicit pattern:
- Surfaces a clear named action `setVendorTags` for grep verification.
- Avoids potential SSR hydration weirdness if `tagsStore.assignments[vendorId]` is `undefined` initially (the `?? []` fallback in `:model-value` is safer than letting v-model construct an undefined-indexed ref).
- Lets the store action also clear empty assignments (`if (ids.length === 0) delete assignments[vendorId]`) — keeps the persisted JSON tidy.

**Drawer USelectMenu (same pattern, different vendor ID source):**

```vue
<USelectMenu
  :model-value="vendor ? tagsStore.assignments[vendor.vendorId] ?? [] : []"
  @update:model-value="(ids) => vendor && tagsStore.setVendorTags(vendor.vendorId, ids)"
  :items="groupedTagItems"
  value-key="id"
  label-key="name"
  multiple
  placeholder="Assign tags..."
  class="w-full"
/>
```

**Both surfaces (row cell + drawer) write to the same `assignments[vendorId]` source of truth.** Pinia's reactivity ensures the chip cells refresh in real time when the drawer assigns.

**Per-row USelectMenu visual concern:**

A USelectMenu in every table row CAN feel busy. v0.5.0 did NOT do this — it had the multiselect only inside the drawer. ROADMAP SC#3 explicitly says "USelectMenu in the table row", so we comply, but we recommend:
- Render USelectMenu in a NARROW column (3rem wide) at the far right of the row.
- Use `size="sm"` and a `+` icon trigger (USelectMenu supports an `icon` prop for the trigger button) instead of the full select-shaped input.
- The trigger becomes a compact "+ Tags" chip; the menu opens on click.

Concrete:

```ts
{ accessorKey: 'tagsAssign', header: '', enableSorting: false, meta: { class: 'w-[3rem]' } },
```

```vue
<template #tagsAssign-cell="{ row }">
  <USelectMenu
    :model-value="tagsStore.assignments[row.original.vendorId] ?? []"
    @update:model-value="(ids) => tagsStore.setVendorTags(row.original.vendorId, ids)"
    :items="groupedTagItems"
    value-key="id"
    label-key="name"
    multiple
    size="xs"
    color="neutral"
    variant="ghost"
    icon="i-lucide-plus"
    :ui="{ trigger: 'w-auto' }"
  />
</template>
```

This makes the per-row select feel like an inline action button rather than a duplicate full input.

**Confidence:** HIGH for v4 API verbatim; HIGH for grouped-items shape (verified docs); MEDIUM-HIGH for the compact-trigger styling pattern (Nuxt UI's `:ui` slot tokens allow it but exact slot names may need a quick verify in Plan 10-03 task 1).

---

### 7. Pinia write-back — action vs direct mutation

**The store today (`app/stores/tags.ts`):**

```ts
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})
  return { tagGroups, assignments }
}, { persist: true })
```

**Pinia setup-store semantics (verified):**

Setup stores return refs, and Pinia treats those refs as the store's state. **Direct mutation from outside works:**

```ts
tagsStore.assignments[vendorId] = ['tag-math', 'tag-science']  // works, triggers reactivity, persists
```

This is because `assignments` is exposed as the Ref's `.value` indirectly via Pinia's getter; the property setter writes back through the ref and triggers reactivity.

**But for Phase 10, we recommend ADDING an action.** Setup stores can include returned functions, which Pinia treats as actions:

```ts
// app/stores/tags.ts (after Plan 10-03 modification)
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})

  function setVendorTags(vendorId: string, tagIds: string[]) {
    if (tagIds.length === 0) {
      delete assignments.value[vendorId]
    } else {
      assignments.value[vendorId] = tagIds
    }
  }

  function clearVendorTags(vendorId: string) {
    delete assignments.value[vendorId]
  }

  return { tagGroups, assignments, setVendorTags, clearVendorTags }
}, { persist: true })
```

**Why an action over direct mutation:**

1. **Named, grep-able write path** — verification probes can grep `setVendorTags(` in `app/` to confirm both row and drawer surfaces use it.
2. **Empty-array cleanup** — if a user removes all tags from a vendor, `delete` keeps the persisted JSON tidy (avoids `{ "vendor-x": [] }` cluttering localStorage).
3. **Phase 12 cascade delete uses it** — when Tags Management deletes a tag, it iterates all vendors and calls `setVendorTags(vendorId, tagIds.filter(id => id !== deletedId))`. Having the action in place from Phase 10 means Phase 12 doesn't have to refactor the write path.
4. **Backward-compat** — direct mutation still works for any code path that doesn't use the action; the action is additive, not restrictive.

**Plan 10-03 task list:**

1. Add `setVendorTags` and `clearVendorTags` actions to `app/stores/tags.ts`.
2. Wire `USelectMenu` in the table row's `tagsAssign` cell using `@update:model-value="(ids) => tagsStore.setVendorTags(row.original.vendorId, ids)"`.
3. Wire `USelectMenu` in the drawer's Tags section using the same pattern with `vendor.vendorId`.
4. Verify: chips in the row update when assignments change in the drawer (Pinia reactivity flows through `tableRows` computed → `#tags-cell` slot).
5. Verify: state persists across navigation (visit Discovery → assign tag → navigate to / → navigate back → tag still there).

**SSR concern flagged:**

Server renders the table with `assignments: {}` (Phase 7 design — persist plugin is client-only, server starts fresh each request). On first paint, ALL chip cells are empty. After hydration (~50-150ms), the persist plugin reads localStorage, populates `assignments`, and the chips appear.

**This is acceptable for the demo** because:
- Sales reps start fresh each demo (no prior assignments to "miss").
- The flicker is sub-second on modern hardware.
- The alternative (server-side cookie-based persistence) was explicitly rejected in Phase 7 (cookies have 4KB limit; localStorage was the chosen approach).

**Mitigation if needed (NOT recommended for v1.0.0):** Wrap the table chips in `<ClientOnly>` to avoid the flicker. But this delays the FIRST render of the table, which is a worse UX. Accept the flicker.

**Confidence:** HIGH for setup-store mechanics; HIGH for the action pattern; HIGH for the cascade-delete forward compat with Phase 12.

---

### 8. Drawer state lifting — page-level `selectedVendorId` + lookup

**The pattern:**

```vue
<!-- app/pages/discovery.vue (excerpt) -->
<script setup lang="ts">
const selectedVendorId = ref<string | null>(null)

const selectedVendor = computed(() => {
  if (!selectedVendorId.value) return null
  return vendors.value.find((v) => v.vendorId === selectedVendorId.value) ?? null
})

const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})

function onRowSelect(_event: Event, row: { original: Vendor }) {
  selectedVendorId.value = row.original.vendorId
}
</script>

<template>
  <!-- ... -->
  <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
</template>
```

**Why this shape:**
- Single ref `selectedVendorId` is the source of truth.
- `selectedVendor` looks up the full vendor object reactively — when `vendors.value` updates (e.g., a future Phase 11+ feature live-updates the list), the drawer's vendor prop updates without a manual refresh.
- `drawerOpen` is a computed with get/set — `v-model:open` works against it; closing the drawer (USlideover sets `open` to false) clears `selectedVendorId`.
- One drawer instance, not one per row → no portal-mount race conditions.

**Anti-pattern to avoid:** Putting the USlideover INSIDE the `#row-cell` of a UTable. The portal would mount and unmount per row on scroll; backdrop and overlay state would conflict.

**Confidence:** HIGH.

---

### 9. Search debounce and VueUse integration

**Need:** Debounce the search input by ~200ms so typing doesn't thrash the filter computed.

**Library:** VueUse — `useDebounce` is the canonical choice.

**Install check (verify-then-install):**

Run in Plan 10-01 task 1: `npm ls @vueuse/core` — if found, no install. If missing, `npm install @vueuse/core` (peer of `@nuxt/ui` v4; very likely already present).

**Code:**

```ts
import { useDebounce } from '@vueuse/core'

const search = ref('')
const debouncedSearch = useDebounce(search, 200)
```

**Why explicit import path** (not auto-import via `@vueuse/nuxt` module):
- `@vueuse/nuxt` is a separate install that auto-imports the entire VueUse API. Single-use here doesn't justify the auto-import noise.
- Explicit import is more discoverable for the next dev (Phase 11+ may reuse the pattern).

**Confidence:** HIGH for the pattern; MEDIUM for "already installed" — verify in 10-01 task 1.

---

### 10. Wave assignment — 3 plans, 3 waves, no parallelism

**Dependency graph:**

```
10-01 (Wave 1) ─→ 10-02 (Wave 2) ─→ 10-03 (Wave 3)
   │                    │                    │
   ↓                    ↓                    ↓
discovery.vue   VendorDrawer.vue       tags.ts (action)
   table           drawer body           per-row select
   filter          radar + sections      drawer select
   chip cell                             cell+drawer wire
```

**Why sequential rather than 10-02 ∥ 10-03:**

Both 10-02 and 10-03 touch `app/pages/discovery.vue`:
- 10-02 adds the drawer state lifting (`selectedVendorId`, `drawerOpen` computed, `<VendorDrawer />` mount, `onRowSelect` handler).
- 10-03 adds the `tagsAssign` cell slot and the store action import.

Running them in parallel produces predictable merge conflicts (both modify the script setup block and template top-level structure). The 1 task savings isn't worth it.

**Per-wave verify gates:**

- Wave 1 (10-01): table renders 27 rows under SSR; search filter narrows visible rows; sort toggles work on all sortable columns; tag chips render (initially empty, then populated after persist hydration).
- Wave 2 (10-02): clicking a row opens the drawer with the correct vendor; radar chart renders inside `<ClientOnly>`; DPA + 1EdTech sections show data; close button works.
- Wave 3 (10-03): per-row USelectMenu opens, can assign tags; drawer USelectMenu mirrors row state; chip cells update in real time; assignments survive page refresh + navigation.

**Plan effort estimates:**

- 10-01: ~2 tasks (1: rewire script setup with columns/filter; 2: rewire template with UInput + UTable + chip slot). ~80 lines net new.
- 10-02: ~3 tasks (1: create VendorDrawer.vue scaffold + extract drawer data fetches; 2: wire radar with ClientOnly; 3: wire drawer state from page). ~150 lines net new across 2 files.
- 10-03: ~2 tasks (1: add store action + wire drawer USelectMenu; 2: add `tagsAssign` column + per-row USelectMenu cell). ~50 lines net new across 2 files.

**Total Phase 10: ~280 lines of new code across 2 modified files (`discovery.vue`, `tags.ts`) and 1 new file (`VendorDrawer.vue`). No deletions in Phase 10 directly — v0.5.0's `src/views/DiscoveryView.vue` and `src/components/VendorDrawer.vue` stay on disk as historical references until Phase 11/12 sweep.**

Actually — recommend deleting `src/views/DiscoveryView.vue` and `src/components/VendorDrawer.vue` in 10-02 once the new Discovery is verified working. They're no longer referenced (Nuxt scans only `app/`), and leaving them creates grep noise. But — they're already known dead code per Phase 7's plan, so deletion is opportunistic, not gating.

**Confidence:** HIGH.

---

### 11. Common Pitfalls (Phase 10-specific)

| # | Pitfall | Mitigation |
|---|---------|------------|
| 1 | UTable row click uses `@select`, not `@row-click` — literal PrimeVue port breaks | Use `@select="onRowSelect"` with signature `(_event, row) => ...`; access row data via `row.original` |
| 2 | UTable column sort flag — there is no `sortable: true` like PrimeVue; sort is enabled by writing the header as a render function | Use `sortHeader(label)` helper that emits a UButton with toggle-sort onClick |
| 3 | USlideover v-model is `v-model:open`, not `v-model:visible` | Direct port from v0.5.0's `v-model:visible` will silently fail (`open` prop never updates) |
| 4 | USlideover width via `:ui` prop, not `:style` or `size` | `:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"` |
| 5 | UBadge with `:style` background — must use `color="neutral"` to disable component theming | Otherwise the variant's preset color overrides the `:style` background |
| 6 | USelectMenu `items` shape — array-of-arrays for groups, NOT `[{ label, items }]` | Use `tagGroups.map(g => g.children.map(...))` |
| 7 | USelectMenu `value-key` returns the field, but the value lives in v-model as an array of those field values when `multiple` is true | E.g., with `value-key="id"`, v-model is `string[]` not `Vendor[]` |
| 8 | SSR hydration flicker — server renders empty `assignments`, client hydrates from localStorage after mount | Acceptable for demo; flag in plan, do not chase a fix |
| 9 | nuxt-echarts `<VChart>` in `<ClientOnly>` is CORRECT for drawer-mounted charts (reconciles Phase 7 Pitfall #6) | See Section 5 for the rule |
| 10 | ClientOnly without `#fallback` slot causes layout jump when drawer opens | Always pair with `<USkeleton class="h-[320px]">` |
| 11 | Drawer's `useFetch('/api/dpa')` and `useFetch('/api/edtech')` fire on every component mount (every drawer open) | useFetch dedups by URL key; subsequent opens reuse cached payload. No action needed. |
| 12 | Per-row USelectMenu in a table cell can be visually noisy | Use compact `icon="i-lucide-plus"` + `size="xs"` + `variant="ghost"` trigger styling |
| 13 | `useDebounce` from `@vueuse/core` may not be installed — verify before assuming | Plan 10-01 task 1: `npm ls @vueuse/core` first; install if missing |
| 14 | TanStack-style `cell: ({ row }) => h(...)` render functions live in `<script>` but template slots like `#tags-cell` live in `<template>` — using both for the same column produces undefined behavior | Pick one per column; recommend template slots for tag chips (more readable), render functions for headers (sort UI is logic-heavy) |
| 15 | `definePageMeta` block in `discovery.vue` (`nav: true, navLabel: 'Discovery', navIcon: 'i-lucide-search', navOrder: 20`) MUST be preserved — sidebar depends on it | Phase 8 owns this contract; do not touch in Phase 10 edits |
| 16 | UTable's TanStack sort can produce surprising types for numeric columns (sorts as string by default) | TanStack auto-detects from value type; numeric fields `userCount`/`studentCount` sort numerically because the Vendor interface types them as `number`. Verify with a sort test in Plan 10-01 task 2. |
| 17 | UBadge `label` prop vs slot — both work; `:label` is shorter for plain text chips | Use `:label="tag.name"` |
| 18 | Drawer extracted to `app/components/VendorDrawer.vue` — auto-imported, do NOT add manual `import VendorDrawer from '~/components/VendorDrawer.vue'` | Nuxt auto-imports components in `app/components/`; manual import is redundant noise |
| 19 | Component file name MUST be PascalCase: `VendorDrawer.vue`, not `vendor-drawer.vue` | Nuxt auto-import resolution is case-sensitive on Linux build servers |
| 20 | useFetch in a child component (VendorDrawer) — Phase 9 RESEARCH Pitfall #8 warned about per-mount fetch | useFetch dedups by URL across components; fetching `/api/dpa` in the drawer is fine. But it does NOT block the table from rendering, so the table on Discovery page never depends on DPA data. |

**Confidence:** HIGH.

---

### 12. Anti-patterns to Avoid

- **DON'T** literal-port PrimeVue's `@row-click="onRowClick"` — UTable uses `@select`. Different signature, different semantics.
- **DON'T** add `sortable: true` to UTable columns — no such flag in v4. Use sort-enabled header render functions.
- **DON'T** use `v-model:visible` on USlideover — it's `v-model:open` in v4.
- **DON'T** use `size="lg"` on USlideover — no `size` prop. Use `:ui="{ content: '...' }"`.
- **DON'T** double-wrap `<VChart>` in `<ClientOnly>` for charts that are part of initial SSR (Phase 7 Pitfall #6). DO wrap drawer-mounted charts (this phase). The rule is "wrap if and only if the chart is interaction-mounted" — Section 5.
- **DON'T** pass `<UBadge color="primary" :style="{ backgroundColor: '...' }">` — the variant's preset color may win and your `:style` background is invisible. Use `color="neutral"`.
- **DON'T** structure USelectMenu items as `[{ label: 'Group1', items: [...] }, ...]` — that's PrimeVue MultiSelect's shape. Nuxt UI v4 uses **array of arrays**.
- **DON'T** put USlideover INSIDE a row cell — drawer state would mount/unmount per row.
- **DON'T** add `@vueuse/nuxt` module for a single `useDebounce` usage — explicit `import { useDebounce } from '@vueuse/core'` is correct.
- **DON'T** redeclare `Vendor` or other shared types in `discovery.vue` or `VendorDrawer.vue` — they're auto-imported from `shared/types/data.ts`.
- **DON'T** touch the `useFetch('/api/vendors', { default: () => [] })` call in `discovery.vue` — Phase 9 established this pattern; extending the page does not require re-fetching.
- **DON'T** add manual `<ClientOnly>` around the table — the table is part of the initial SSR payload; wrapping it would delay first paint.
- **DON'T** assume `tagsStore.assignments[vendorId]` is always an array — it's `undefined` if no tags assigned. Use `?? []` defaults at every read site.
- **DON'T** use direct `tagsStore.assignments[vendorId] = ids` from the USelectMenu binding — go through `setVendorTags(vendorId, ids)` so the action is the named, grep-able write path.
- **DON'T** delete `src/views/DiscoveryView.vue` outside the Phase 10 plan — sweep it inside 10-02 as opportunistic cleanup. (Plan 10-02 task 4: delete v0.5.0 Discovery files.)
- **DON'T** rely on UTable's `v-model:global-filter` if you need explicit `filteredCount` for the header — use manual computed `filteredRows`.
- **DON'T** mount more than one drawer instance — one drawer at the page level, with `:vendor-id` driving content.
- **DON'T** chase the SSR hydration flicker on tag chips — accept it (Section 7).

---

## Standard Stack

### Core (used by Phase 10 — all already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `nuxt` | ^4.4.6 (installed) | SSR framework + composables (useFetch, useState) | Phase 7 |
| `@nuxt/ui` | ^4.8.0 (installed) | UTable, USlideover, USelectMenu, UBadge, UInput, USeparator, USkeleton, UButton | Phase 7 |
| `pinia` + `@pinia/nuxt` | ^3.0.4 / ^0.11.3 (installed) | Tags store with persist:true | Phase 7 |
| `pinia-plugin-persistedstate` | ^4.7.1 (installed) | localStorage persistence | Phase 7 |
| `nuxt-echarts` | ^1.0.1 (installed) | `<VChart>` auto-import; SSR-aware ECharts wrapper | Phase 7 |
| `echarts` | ^6.0.0 / actual 6.1.0 (installed) | RadarChart + RadarComponent (already registered Phase 7) | Phase 7 |

### Verify-then-install (Plan 10-01 task 1)

| Library | Version | Purpose | Action |
|---------|---------|---------|--------|
| `@vueuse/core` | latest | `useDebounce` for search input | `npm ls @vueuse/core` first; install if not present (likely already a peer of `@nuxt/ui` v4) |

**Versions verified via `npm view` 2026-05-21:**
- `@nuxt/ui@4.8.0` (latest)
- `nuxt-echarts@1.0.1` (latest)
- `nuxt@4.4.6` (latest)
- `pinia@3.0.4` (latest)
- `pinia-plugin-persistedstate@4.7.1` (latest)
- `echarts@6.1.0` (current dep `^6.0.0` compatible)

### No new package.json changes expected

**Confidence:** HIGH.

---

## Architecture Patterns

### Recommended Project Structure (post-Phase-10)

```
app/
  app.vue                       # (unchanged)
  app.config.ts                 # (unchanged)
  assets/css/main.css           # (unchanged)
  layouts/default.vue           # (unchanged)
  pages/
    index.vue                   # (Phase 8 stub — Phase 11)
    discovery.vue               # ★ MODIFIED — full table + filter + drawer wiring
    dpa.vue                     # (Phase 8 stub — Phase 11)
    risk.vue                    # (Phase 8 stub — Phase 12)
    tags.vue                    # (Phase 8 stub — Phase 12)
  components/                   # ★ NEW directory
    VendorDrawer.vue            # ★ NEW — USlideover drawer; auto-imported
  stores/
    tags.ts                     # ★ MODIFIED — adds setVendorTags, clearVendorTags actions
  types/page-meta.d.ts          # (unchanged — Phase 8 owns)
server/                         # (unchanged — Phase 9)
shared/                         # (unchanged — Phase 9)
src/                            # ★ OPPORTUNISTIC CLEANUP — delete v0.5.0 Discovery files in 10-02
  views/DiscoveryView.vue       # ★ DELETED in 10-02 task 4
  components/VendorDrawer.vue   # ★ DELETED in 10-02 task 4
```

**Net diff vs Phase 9 ending state:**
- +1 file (`app/components/VendorDrawer.vue`)
- ~2 modified files (`app/pages/discovery.vue`, `app/stores/tags.ts`)
- -2 files (`src/views/DiscoveryView.vue`, `src/components/VendorDrawer.vue`)
- Net: -1 file, ~280 lines of new code, ~250 lines of deleted (v0.5.0 PrimeVue-based) code

### Pattern 1: TanStack-style columns with sortable headers via helper

```ts
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const UButton = resolveComponent('UButton')

function sortHeader(label: string) {
  return ({ column }: { column: any }) =>
    h(UButton, {
      label, color: 'neutral', variant: 'ghost', class: '-mx-2.5',
      icon: column.getIsSorted()
        ? (column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide')
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
}

const columns: TableColumn<VendorRow>[] = [
  { accessorKey: 'name', header: sortHeader('Vendor Name'), meta: { class: 'min-w-[12rem]' } },
  // ...
]
```

### Pattern 2: Manual debounced filter (VueUse)

```ts
import { useDebounce } from '@vueuse/core'

const search = ref('')
const debouncedSearch = useDebounce(search, 200)

const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((r) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})
```

### Pattern 3: USlideover with v-model:open and selectedId lookup

```vue
<script setup lang="ts">
const selectedVendorId = ref<string | null>(null)
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
</script>

<template>
  <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
</template>
```

### Pattern 4: ClientOnly-wrapped VChart with skeleton fallback (interaction-mounted only)

```vue
<ClientOnly>
  <VChart :option="radarOption" autoresize style="height: 320px; width: 100%" />
  <template #fallback>
    <USkeleton class="h-[320px] w-full" />
  </template>
</ClientOnly>
```

### Pattern 5: USelectMenu with grouped items + Pinia action write-back

```ts
const groupedTagItems = computed(() =>
  tagsStore.tagGroups.map((g) =>
    g.children.map((c) => ({ id: c.id, name: c.name, groupColor: g.color }))
  )
)
```

```vue
<USelectMenu
  :model-value="tagsStore.assignments[vendor.vendorId] ?? []"
  @update:model-value="(ids) => tagsStore.setVendorTags(vendor.vendorId, ids)"
  :items="groupedTagItems"
  value-key="id"
  label-key="name"
  multiple
/>
```

### Anti-patterns (summary, see Section 12 for full list)

- DON'T use `@row-click` (use `@select`).
- DON'T use `v-model:visible` on USlideover (use `v-model:open`).
- DON'T pass `[{ label, items }]` to USelectMenu (use `[[items], [items]]`).
- DON'T double-wrap `<VChart>` in `<ClientOnly>` for initial-SSR charts (Phase 12 Risk donut).
- DON'T write directly to `tagsStore.assignments[id]` from the page — go through `setVendorTags` action.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table with sortable columns, custom cells, row selection | Hand-rolled `<table>` + manual sort state + click handlers | `UTable` with `TableColumn<T>[]` | TanStack-grade sort logic, virtualization opt-in, slot-based cell customization, accessibility for free |
| Sortable column header with arrow icons | Manual `<button>` with `:class="isSortedAsc ? ...'"` and `@click="toggleSort"` | UTable column `header: ({column}) => h(UButton, { onClick: column.toggleSorting })` | TanStack tracks sort state; multi-column sort, three-state cycle (asc → desc → none) free |
| Search filter debouncing | `setTimeout`/`clearTimeout` manual logic | `useDebounce(search, 200)` from `@vueuse/core` | Handles cleanup on unmount, type-safe, one line |
| Slide-over drawer with backdrop + portal + escape close | Custom Vue Teleport + transition + keydown handler | `USlideover` with `v-model:open` | Portal, backdrop, focus trap, escape-to-close, dismissible-on-overlay-click all built-in |
| Multi-select with grouped options, search filter, chip display | Custom dropdown with `<ul>` + virtual focus state | `USelectMenu` with `multiple` + array-of-arrays for groups | Keyboard nav, search, group dividers, "Select all" pattern compatible with v-model:multiple |
| Chip / pill / tag visual element | Hand-rolled `<span class="rounded px-2 py-0.5">` | `UBadge` with `color="neutral"` + `:style` for hex backgrounds | Consistent sizing, padding, font-size with other badges across the portal; theme-aware |
| ECharts SSR safety | `<ClientOnly>` everywhere + manual `if (process.client)` guards | `nuxt-echarts` module + targeted `<ClientOnly>` only for interaction-mounted charts | Module handles registration, tree-shaking, type generation; ClientOnly used surgically |
| Pinia state persistence | `watch()` + `localStorage.setItem` | `persist: true` on the store + plugin (already wired Phase 7) | SSR-safe, automatic, deduplicated writes |
| Cross-component reactive state (chips in row + drawer USelectMenu) | Props + emits + parent intermediate state | Pinia store action (`setVendorTags`) — both surfaces write to same source of truth | Single write path; reactivity flows through Pinia naturally |
| Drawer width sizing | Custom CSS class + media queries | `:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"` | Tailwind v4 arbitrary value; matches v0.5.0 480px verbatim |

**Key insight:** Phase 10 is the canonical "Nuxt UI v4 + nuxt-echarts + Pinia did all the heavy lifting" phase. The wrong instinct is to port v0.5.0's PrimeVue mechanics directly (which produces broken code because v-model names, slot names, and event names all differ). The right instinct is to let Nuxt UI's TanStack-based primitives drive the table mechanics and reach for the v0.5.0 source only for VISUAL choices (colors, axis labels, layout) where the components don't dictate appearance.

---

## Common Pitfalls

### Pitfall 1: Literal port of `@row-click="onRowClick"` from v0.5.0

**What goes wrong:** Page renders, table looks right, but clicking a row does nothing. No console error. Drawer never opens.

**Why it happens:** PrimeVue's DataTable emits `@row-click` with payload `{ data, index, originalEvent }`. UTable v4 emits `@select` with payload `(event, row)` and `row.original` is the vendor object.

**How to avoid:** Use `@select="onRowSelect"` and write the handler as `(_event, row) => { selectedVendorId.value = row.original.vendorId }`.

**Warning signs:** Clicks don't open the drawer; row hover does highlight (default UTable behavior) so the table looks "alive" but unresponsive.

### Pitfall 2: SSR hydration flicker on tag chips

**What goes wrong:** Page loads, table renders 27 rows with empty tag cells, ~100ms later chips populate. Visible flicker.

**Why it happens:** Server SSRs with `assignments = {}` (persist plugin is client-only by Phase 7 design). Client rehydrates from localStorage after mount.

**How to avoid:** Accept the flicker — it's the cost of the Phase 7 design decision (localStorage over cookie persistence). For demo, sales reps start fresh each time so empty initial state is the norm. Document in plan, don't chase a fix.

**Warning signs:** Brief absence of chips on first load if there were prior tag assignments; not a bug.

### Pitfall 3: USlideover width set with `:style` or unsupported `size` prop

**What goes wrong:** Drawer opens but at the default `max-w-md` (28rem = 448px) — narrower than v0.5.0's 480px. Visual regression.

**Why it happens:** No `size` prop in v4 USlideover; `:style="{ width: '480px' }"` doesn't reach the content panel (which is inside the portal).

**How to avoid:** Use `:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"`. The `:ui` prop accepts a slot-tokens object; `content` is the slot name for the panel element.

**Warning signs:** Drawer feels narrower than expected after the port.

### Pitfall 4: UBadge hex background invisible due to color preset

**What goes wrong:** Chip renders with the variant's default color (primary purple), `:style="{ backgroundColor: '#da8231' }"` (Assessment orange) has no visible effect.

**Why it happens:** UBadge's `color` prop applies preset background via CSS variables. Without `color="neutral"`, the preset wins the cascade against inline `:style`.

**How to avoid:** Always include `color="neutral"` alongside `:style` for hex-bound backgrounds.

**Warning signs:** All chips look the same color (the variant's default) regardless of `:style`.

### Pitfall 5: USelectMenu items shape mismatch — Object array vs Array of arrays

**What goes wrong:** Menu opens but shows a flat list with no group separation, or shows "[object Object]" labels.

**Why it happens:** Developer ports the PrimeVue MultiSelect shape `[{ label: 'Curriculum', items: [...] }]` literally. Nuxt UI v4 expects `[[items], [items]]` — outer array indexed by group, inner array of items.

**How to avoid:** Transform with `tagGroups.map(g => g.children.map(c => ({ id: c.id, name: c.name })))` — produces array of arrays.

**Warning signs:** Group labels missing from dropdown; all items in one flat list; or items showing as `[object Object]`.

### Pitfall 6: `<ClientOnly>` without `#fallback` slot causes layout jump

**What goes wrong:** Drawer opens. Brief blank gap where the radar chart will render. Layout shifts as chart finally appears.

**Why it happens:** `<ClientOnly>` renders nothing on initial mount; chart hydrates ~50-150ms later. Without a placeholder element, the container has zero height during that window.

**How to avoid:** Always pair with `<USkeleton class="h-[320px] w-full" />` in the `#fallback` slot. Skeleton occupies the chart's eventual height, no jump.

**Warning signs:** Drawer "jumps" or content reflows when chart appears.

### Pitfall 7: Per-row USelectMenu visual noise

**What goes wrong:** UTable looks busy and cluttered. Each row has a full-sized select input crammed into a narrow column. Eyes don't know where to focus.

**Why it happens:** USelectMenu's default size feels heavy for an inline action.

**How to avoid:** Use `size="xs" variant="ghost" icon="i-lucide-plus"` for a compact icon-button trigger. Wraps menu open behavior in a "+ tags" affordance instead of a full input.

**Warning signs:** Table feels visually crowded; sales rep walkthrough has trouble pointing to a specific row's data.

### Pitfall 8: Double-wrapping `<VChart>` in `<ClientOnly>` for charts that ARE in initial SSR (forward concern for Phase 12)

**What goes wrong:** Risk Position donut (Phase 12) chart appears 200-500ms after rest of the page on first load. SSR HTML lacks the chart's SVG fallback.

**Why it happens:** nuxt-echarts has its own SSR/SVG fallback mechanism for `<VChart>` when it's part of the initial render. Wrapping in `<ClientOnly>` bypasses that.

**How to avoid (Phase 12 concern, not Phase 10):** For charts in initial SSR (Risk donut), do NOT wrap in ClientOnly. For drawer-mounted charts (Discovery radar), DO wrap. The rule is "wrap iff the chart is interaction-mounted." See Section 5.

**Warning signs:** Above-the-fold chart appears late on cold load; SSR HTML inspection (curl + grep) doesn't find chart SVG.

### Pitfall 9: `useFetch('/api/dpa')` and `useFetch('/api/edtech')` in the drawer fire on every drawer open

**What goes wrong:** Network tab shows multiple fetches to `/api/dpa` on rapid drawer-open-close clicks.

**Why it happens:** Pattern is harmless — useFetch dedups by URL key. Subsequent opens hit the cached payload. The visible Network entry is misleading (it's the SSR-resolved payload being read, not a re-fetch).

**How to avoid:** Nothing to fix. Document in plan as "expected dev-tools artifact, not a bug."

**Warning signs:** Sales rep notices "API call" in DevTools and questions it during the demo. Pre-empt by closing DevTools.

### Pitfall 10: Sort on numeric columns sorts lexicographically

**What goes wrong:** `userCount` column sorts as `100, 1000, 1842, 200, 2103` instead of `100, 200, 1000, 1842, 2103`.

**Why it happens:** TanStack auto-detects sort fn from value type. If `Vendor.userCount` is somehow stringified upstream, sort falls back to lex order.

**How to avoid:** Verify `Vendor.userCount` and `Vendor.studentCount` are `number` types in `shared/types/data.ts` (they are — verified in Phase 9). TanStack auto-detects numeric sort. If by some path the values arrive as strings, add `sortingFn: 'basic'` to the column definition.

**Warning signs:** Numeric columns sort wrong; first sort click sorts as text.

---

## Runtime State Inventory

> Phase 10 is a feature-extension phase (no rename/refactor/migration). Inventory still completed for safety:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | localStorage key `tags` (Pinia persisted state — set in Phase 7). Phase 10 EXTENDS the same store; key unchanged. Existing assignments survive Phase 10 deployment. | None — same key, additive writes |
| **Live service config** | None — no external services connected (synthetic demo) | None |
| **OS-registered state** | None — no scheduled tasks, no system services | None |
| **Secrets/env vars** | None for Phase 10 | None |
| **Build artifacts** | `.nuxt/`, `.output/` will rebuild after each task; `node_modules/` may pull `@vueuse/core` if not already present | Verify in Plan 10-01 task 1 |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Nuxt 4 dev/build | ✓ | 24.14.0 | — |
| npm | Package install (if `@vueuse/core` missing) | ✓ | 11.9.0 | — |
| Git | Source control | ✓ | (in PATH) | — |
| `@nuxt/ui@^4.8.0` | UTable, USlideover, USelectMenu, UBadge, UInput, USeparator, USkeleton | ✓ | 4.8.0 installed | — |
| `nuxt-echarts@^1.0.1` | `<VChart>` auto-import | ✓ | 1.0.1 installed | — |
| `pinia` + persist plugin | Tags store with persist:true | ✓ | 3.0.4 + 4.7.1 installed | — |
| `@vueuse/core` | `useDebounce` for search input | ⚠️ likely present as peer of @nuxt/ui | (verify in 10-01 task 1) | `npm install @vueuse/core` (~30KB gzipped) |
| Server running on port 3000 | Manual UAT for drawer interactions | (dev-time) | — | — |

**No blocking gaps.** The only verify-then-install item is `@vueuse/core` — single command if missing.

---

## Code Examples

### A. Discovery page top-level structure (post-Plan 10-01)

```vue
<!-- app/pages/discovery.vue (after Plan 10-01) -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { useDebounce } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
import type { Vendor } from '#shared/types/data'

definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })

const tagsStore = useTagsStore()

const childTagIndex = computed(() => {
  const idx: Record<string, { name: string; parentColor: string; parentId: string }> = {}
  for (const group of tagsStore.tagGroups) {
    for (const child of group.children) {
      idx[child.id] = { name: child.name, parentColor: group.color, parentId: group.id }
    }
  }
  return idx
})

const tableRows = computed(() =>
  vendors.value.map((v) => {
    const ids = tagsStore.assignments[v.vendorId] ?? []
    const tags = ids
      .map((id) => ({ id, ...childTagIndex.value[id] }))
      .filter((t) => t.name)
      .sort((a, b) => a.parentId.localeCompare(b.parentId))
    return { ...v, tags }
  })
)

const search = ref('')
const debouncedSearch = useDebounce(search, 200)

const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((r) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})

const UButton = resolveComponent('UButton')

function sortHeader(label: string) {
  return ({ column }: { column: any }) =>
    h(UButton, {
      label, color: 'neutral', variant: 'ghost', class: '-mx-2.5',
      icon: column.getIsSorted()
        ? (column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide')
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
}

const columns: TableColumn<any>[] = [
  { accessorKey: 'name',         header: sortHeader('Vendor Name'),  meta: { class: 'min-w-[12rem]' } },
  { accessorKey: 'category',     header: sortHeader('Category'),     meta: { class: 'w-[9rem]' } },
  { accessorKey: 'frequency',    header: sortHeader('Frequency'),    meta: { class: 'w-[7rem]' } },
  { accessorKey: 'lastSeen',     header: sortHeader('Last Seen'),    meta: { class: 'w-[8rem]' } },
  { accessorKey: 'userCount',    header: sortHeader('Users'),        meta: { class: 'w-[6rem] text-right' } },
  { accessorKey: 'studentCount', header: sortHeader('Students'),     meta: { class: 'w-[6rem] text-right' } },
  { accessorKey: 'tags',         header: 'Tags',                     enableSorting: false, meta: { class: 'w-[14rem]' } },
]

const sorting = ref([{ id: 'name', desc: false }])

const selectedVendorId = ref<string | null>(null)
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})

function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">Discovery</h1>
      <span class="text-sm text-gray-500">{{ filteredRows.length }} vendors</span>
    </div>

    <div class="mb-4 max-w-sm">
      <UInput
        v-model="search"
        placeholder="Search vendors..."
        icon="i-lucide-search"
        class="w-full"
      />
    </div>

    <UTable
      v-model:sorting="sorting"
      :data="filteredRows"
      :columns="columns"
      class="bg-white"
      @select="onRowSelect"
    >
      <template #tags-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in row.original.tags"
            :key="tag.id"
            :label="tag.name"
            color="neutral"
            variant="solid"
            size="sm"
            :style="{ backgroundColor: tag.parentColor, color: '#ffffff' }"
          />
        </div>
      </template>
      <template #empty>
        <div class="py-8 text-center">
          <div class="text-sm font-semibold text-gray-900">No vendors match your search</div>
          <div class="text-sm text-gray-500 mt-1">Try a different search term or clear the filter.</div>
        </div>
      </template>
    </UTable>

    <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
  </div>
</template>
```

### B. VendorDrawer scaffold (post-Plan 10-02)

```vue
<!-- app/components/VendorDrawer.vue -->
<script setup lang="ts">
import type { Vendor } from '#shared/types/data'
import { DPA_STATUS_COLORS, RISK_LABEL_COLORS, EDTECH_STATUS_COLORS } from '#shared/utils/riskLabels'

const props = defineProps<{ vendor: Vendor | null }>()
const open = defineModel<boolean>('open', { default: false })

const tagsStore = useTagsStore()

const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })
const { data: edtechList } = await useFetch('/api/edtech', { default: () => [] })

const dpaMap = computed(() =>
  Object.fromEntries(dpaList.value.map((d) => [d.vendorId, d]))
)
const edtechMap = computed(() =>
  Object.fromEntries(edtechList.value.map((e) => [e.vendorId, e]))
)

const vendorDpa = computed(() =>
  props.vendor ? dpaMap.value[props.vendor.vendorId] ?? null : null
)
const vendorEdtech = computed(() =>
  props.vendor ? edtechMap.value[props.vendor.vendorId] ?? null : null
)

const totalPrivacyScore = computed(() =>
  props.vendor
    ? Object.values(props.vendor.privacyScore).reduce((sum, v) => sum + v, 0)
    : 0
)

const RADAR_AXES = [
  { name: 'Information Collected', max: 10 },
  { name: 'Use of Information', max: 10 },
  { name: 'Data Sharing', max: 10 },
  { name: 'Security Measures', max: 10 },
  { name: 'User Rights', max: 10 },
  { name: 'Retention Period', max: 10 },
  { name: 'Compliance with Laws', max: 10 },
  { name: 'Updates to Privacy Policy', max: 10 },
  { name: 'Overall Clarity and Transparency', max: 10 },
  { name: 'Contact Information', max: 10 },
]

const radarOption = computed(() => {
  if (!props.vendor) return {}
  const s = props.vendor.privacyScore
  return {
    radar: { indicator: RADAR_AXES },
    series: [{
      type: 'radar',
      data: [{
        value: [
          s.informationCollected, s.useOfInformation, s.dataSharing,
          s.securityMeasures, s.userRights, s.retentionPeriod,
          s.complianceWithLaws, s.updatesToPolicy,
          s.clarityAndTransparency, s.contactInformation,
        ],
        areaStyle: { color: 'rgba(72, 76, 230, 0.15)' },
        lineStyle: { color: '#484ce6', width: 2 },
      }],
    }],
    tooltip: { trigger: 'item' },
  }
})

const groupedTagItems = computed(() =>
  tagsStore.tagGroups.map((g) =>
    g.children.map((c) => ({ id: c.id, name: c.name, groupColor: g.color }))
  )
)
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="vendor?.name ?? ''"
    :description="vendor?.category ?? ''"
    side="right"
    :ui="{ content: 'w-[480px] sm:max-w-[480px]' }"
  >
    <template #body>
      <div v-if="vendor" class="flex flex-col gap-6 p-4">
        <!-- Usage section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">Usage</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-500">Frequency</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.frequency }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Last Seen</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.lastSeen }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Users</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.userCount.toLocaleString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-500">Students</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendor.studentCount.toLocaleString() }}</div>
            </div>
          </div>
        </section>

        <USeparator />

        <!-- DPA section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">DPA</h3>
          <div v-if="vendorDpa" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Status</div>
              <UBadge :label="vendorDpa.status" color="neutral" variant="solid"
                :style="{ backgroundColor: DPA_STATUS_COLORS[vendorDpa.status], color: '#ffffff' }" />
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Signed Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorDpa.signedDate ?? '—' }}</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Expiry Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorDpa.expiryDate ?? '—' }}</div>
            </div>
            <div v-if="vendorDpa.riskLabel" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Risk Label</div>
              <UBadge :label="vendorDpa.riskLabel" color="neutral" variant="solid"
                :style="{ backgroundColor: RISK_LABEL_COLORS[vendorDpa.riskLabel], color: '#ffffff' }" />
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">No DPA record on file.</div>
        </section>

        <USeparator />

        <!-- 1EdTech section -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-4">1EdTech Certification</h3>
          <div v-if="vendorEdtech" class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Status</div>
              <UBadge :label="vendorEdtech.certificationStatus" color="neutral" variant="solid"
                :style="{ backgroundColor: EDTECH_STATUS_COLORS[vendorEdtech.certificationStatus], color: '#ffffff' }" />
            </div>
            <div v-if="vendorEdtech.certificationStandard" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Standard</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorEdtech.certificationStandard }}</div>
            </div>
            <div v-if="vendorEdtech.certifiedDate" class="flex items-center gap-3">
              <div class="text-sm text-gray-500 w-24">Certified Date</div>
              <div class="text-sm font-semibold text-gray-900">{{ vendorEdtech.certifiedDate }}</div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500">No 1EdTech record on file.</div>
        </section>

        <USeparator />

        <!-- Privacy radar -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Privacy Policy Score</h3>
          <div class="flex items-baseline gap-2 mb-4">
            <span class="text-2xl font-semibold text-primary-600">{{ totalPrivacyScore }}</span>
            <span class="text-sm text-gray-500">Total Score / 100</span>
          </div>
          <ClientOnly>
            <VChart :option="radarOption" autoresize style="height: 320px; width: 100%" />
            <template #fallback>
              <USkeleton class="h-[320px] w-full" />
            </template>
          </ClientOnly>
        </section>

        <USeparator />

        <!-- Tags select (wired in Plan 10-03) -->
        <section>
          <h3 class="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
          <USelectMenu
            :model-value="vendor ? tagsStore.assignments[vendor.vendorId] ?? [] : []"
            @update:model-value="(ids) => vendor && tagsStore.setVendorTags(vendor.vendorId, ids)"
            :items="groupedTagItems"
            value-key="id"
            label-key="name"
            multiple
            placeholder="Assign tags..."
            class="w-full"
          />
        </section>
      </div>
    </template>
  </USlideover>
</template>
```

### C. Tags store action addition (post-Plan 10-03)

```ts
// app/stores/tags.ts (additive change)
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})

  function setVendorTags(vendorId: string, tagIds: string[]) {
    if (tagIds.length === 0) {
      delete assignments.value[vendorId]
    } else {
      assignments.value[vendorId] = tagIds
    }
  }

  function clearVendorTags(vendorId: string) {
    delete assignments.value[vendorId]
  }

  return { tagGroups, assignments, setVendorTags, clearVendorTags }
}, { persist: true })
```

---

## State of the Art

| Old Approach (v0.5.0 PrimeVue) | Current Approach (v1.0.0 Nuxt UI v4) | When Changed | Impact |
|--------------------------------|--------------------------------------|--------------|--------|
| `<DataTable>` with `:value="rows"` + `<Column field="name" sortable />` | `<UTable>` with `:data="filteredRows" :columns="columns"` where columns is `TableColumn<T>[]` | Phase 7 | Different column shape; sort enabled via header render function instead of `sortable` flag |
| `@row-click="onRowClick"` with `event.data` payload | `@select="onRowSelect"` with `(event, row) => ...` and `row.original` | Phase 10 | Event name AND payload shape both differ |
| `<Drawer v-model:visible="open">` | `<USlideover v-model:open="open">` | Phase 10 | v-model binding name changed; `:style="{ width: '480px' }"` no longer works (use `:ui={ content }`) |
| `<MultiSelect :options="[{ label, items }]" optionGroupLabel="name" optionGroupChildren="children">` | `<USelectMenu :items="[[group1Items], [group2Items]]" value-key="id" label-key="name" multiple>` | Phase 10 | Group shape changed from `[{ label, items }]` to array-of-arrays |
| `<Tag :value="name" :style="{ backgroundColor }">` | `<UBadge :label="name" color="neutral" variant="solid" :style="{ backgroundColor }">` | Phase 10 | `color="neutral"` required to disable component theming and let `:style` win |
| Pinia `assignments[id]` direct mutation from watch() blocks for localStorage write | `persist: true` on store + optional `setVendorTags` action for clean writes | Phase 7 (persist), Phase 10 (action) | Persist plugin replaces manual watch+localStorage |

---

## Open Questions

1. **Is `@vueuse/core` already installed as a peer of `@nuxt/ui`?**
   - What we know: Nuxt UI v4 uses VueUse internally; `@vueuse/core` is almost certainly transitively present.
   - What's unclear: Whether `import { useDebounce } from '@vueuse/core'` resolves cleanly without an explicit `package.json` entry.
   - Recommendation: Plan 10-01 task 1 verifies via `npm ls @vueuse/core` AND a typecheck pass with the import in place. If typecheck fails, `npm install @vueuse/core` (~30KB gzipped, no Nuxt module needed for single import).

2. **Does USelectMenu render group labels with array-of-arrays items?**
   - What we know: Array-of-arrays produces visual dividers between groups (verified docs).
   - What's unclear: Whether group labels ("Curriculum", "Assessment", etc.) appear above each group section without a custom `#item` slot.
   - Recommendation: Plan 10-03 task 1 visually verifies. If labels missing, accept (color chips signal group identity) OR add a `#item-leading` slot with a thin group header. For demo timeline, accept.

3. **Will the per-row USelectMenu trigger styling work as a compact icon button?**
   - What we know: USelectMenu supports `size`, `variant`, `icon`, and `:ui` props.
   - What's unclear: Whether `icon="i-lucide-plus"` with `variant="ghost"` renders as a tight icon-only trigger or still shows the value as text.
   - Recommendation: Plan 10-03 task 2 visually verifies. Fallback if too noisy: revert to drawer-only USelectMenu and use a regular icon button (`UButton` with `icon="i-lucide-plus"`) in the row that opens the drawer. (Mild diversion from ROADMAP SC#3 verbatim wording but functionally equivalent.)

4. **Is there a TypeScript lint error from `row: { original: Vendor }` in the `onRowSelect` handler?**
   - What we know: UTable's `TableRow<T>` type is exported from `@nuxt/ui`.
   - What's unclear: Whether using `any` or the proper `TableRow<Vendor>` import is needed for typecheck cleanness.
   - Recommendation: Plan 10-01 task 1: import `TableRow` and use `(_event: Event, row: TableRow<Vendor>) => ...`. If import fails, fall back to `(_event: Event, row: any) => ...` and document.

---

## Validation Architecture

> Phase 10 enables `workflow.nyquist_validation` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None at unit-test level — Phase 9 carried forward the "grep + curl + typecheck" probe pattern; Phase 10 extends with grep probes + dev-server SSR HTML checks + manual UAT for interactions |
| Config file | `tsconfig.json` (auto-extended from `.nuxt/tsconfig.json`); no test runner config |
| Quick run command | `npm run typecheck` |
| Full suite command | `npm install && npm run typecheck && npm run build` |
| Phase gate | typecheck + build green; dev-server curl returns 200 for `/discovery`; SSR HTML contains expected literal markers; manual UAT confirms row-click, sort, filter, drawer-open, chart-render, tag-assign, persist-on-reload |

For Phase 10, **type checking + build success + grep probes + dev-server SSR + manual UAT** IS the test suite. Adding Vitest for component interaction tests is intentionally deferred — the Nuxt UI v4 component primitives are too new (released within the last 12 months) for stable e2e fixtures, and the demo iteration speed constraint argues against adding a test infrastructure during the first big UI phase.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PAGE-01 | Discovery page typechecks with UTable, USlideover, USelectMenu present | Build | `npm run typecheck` → exit 0 | ✅ files modified in Plans 10-01, 10-02, 10-03 |
| PAGE-01 | Discovery page renders 27 rows under SSR | Runtime SSR | `curl -s http://localhost:3000/discovery \| grep -o '<tr' \| wc -l` — expect at least 27 (header row may add 1, so ≥28) | ✅ after 10-01 |
| PAGE-01 | UTable columns include sortable headers | Static (grep) | `grep -q "sortHeader" app/pages/discovery.vue` | ❌ Wave 1 (10-01) |
| PAGE-01 | UInput search bar exists | Static (grep) | `grep -q '<UInput' app/pages/discovery.vue && grep -q "v-model=\"search\"" app/pages/discovery.vue` | ❌ Wave 1 (10-01) |
| PAGE-01 | Filter is debounced via VueUse | Static (grep) | `grep -q "useDebounce" app/pages/discovery.vue` | ❌ Wave 1 (10-01) |
| PAGE-01 | Tag chip slot uses UBadge with hex style override | Static (grep) | `grep -A 3 "#tags-cell" app/pages/discovery.vue \| grep -q "backgroundColor"` | ❌ Wave 1 (10-01) |
| PAGE-01 | Row click handler wired to @select | Static (grep) | `grep -q "@select=\"onRowSelect\"" app/pages/discovery.vue` | ❌ Wave 2 (10-02) |
| PAGE-01 | USlideover uses v-model:open (not v-model:visible) | Static (grep) | `grep -q "v-model:open" app/components/VendorDrawer.vue && ! grep -q "v-model:visible" app/components/VendorDrawer.vue` | ❌ Wave 2 (10-02) |
| PAGE-01 | USlideover width set via :ui content slot | Static (grep) | `grep -q "w-\[480px\]" app/components/VendorDrawer.vue` | ❌ Wave 2 (10-02) |
| PAGE-01 | VendorDrawer.vue component exists in app/components/ | File-exists | `test -f app/components/VendorDrawer.vue` | ❌ Wave 2 (10-02) |
| PAGE-01 | ECharts radar wrapped in ClientOnly | Static (grep, multiline) | `grep -B 1 -A 3 "<VChart" app/components/VendorDrawer.vue \| grep -q "ClientOnly"` | ❌ Wave 2 (10-02) |
| PAGE-01 | Radar has 10 axes | Static (grep) | `grep -c "name:" app/components/VendorDrawer.vue` — RADAR_AXES const has 10 lines matching `name:` | ❌ Wave 2 (10-02) |
| PAGE-01 | ClientOnly has skeleton fallback | Static (grep) | `grep -A 2 "ClientOnly" app/components/VendorDrawer.vue \| grep -q "USkeleton"` | ❌ Wave 2 (10-02) |
| PAGE-01 | Drawer mounts SSR markers (drawer is not in initial render — verifies it's a hidden portal) | Runtime SSR | `curl -s http://localhost:3000/discovery \| grep -q "VendorDrawer"` should be FALSE (drawer doesn't render until opened) | manual visual check |
| PAGE-01 | USelectMenu uses array-of-arrays items shape | Static (grep) | `grep -q "tagGroups.map" app/components/VendorDrawer.vue` AND grep again in 10-03 for per-row context | ❌ Wave 2 + 3 |
| PAGE-01 | Per-row USelectMenu cell exists | Static (grep) | `grep -q "tagsAssign-cell" app/pages/discovery.vue` | ❌ Wave 3 (10-03) |
| PAGE-01 | setVendorTags action exists in store | Static (grep) | `grep -q "function setVendorTags" app/stores/tags.ts` | ❌ Wave 3 (10-03) |
| PAGE-01 | setVendorTags called from both surfaces | Static (grep) | `grep -c "setVendorTags(" app/` — expect ≥ 2 (1 in discovery.vue per-row, 1 in VendorDrawer.vue) | ❌ Wave 3 (10-03) |
| PAGE-01 | Persistence — assignments survive reload (Pinia persist:true) | Manual UAT | Browser: assign tags → reload page → verify chips still appear | manual UAT |
| PAGE-01 | Persistence — assignments survive navigation | Manual UAT | Browser: assign tag on Discovery → navigate to / → navigate back → chips still there | manual UAT |
| PAGE-01 | Drawer interactions — open, close, dismiss-via-backdrop | Manual UAT | Visual inspection during /gsd:verify-work | manual UAT |
| PAGE-01 | Radar chart renders inside drawer with 10 axes | Manual UAT | Open drawer → see SVG with 10 polygon vertices | manual UAT |
| PAGE-01 | Search filter narrows visible rows in real time | Manual UAT | Type "google" → only Google Classroom row visible | manual UAT |
| PAGE-01 | Sort toggles work on all sortable columns | Manual UAT | Click each sortable column header twice (asc → desc → none) | manual UAT |
| PAGE-01 | npm run typecheck passes after each plan | Build | `npm run typecheck` → exit 0 | per wave |
| PAGE-01 | npm run build passes at phase end | Build | `npm run build` → exit 0; `.output/server/chunks/routes/_/discovery.html` exists | phase gate |
| (impl) | discovery.vue useFetch wiring NOT changed from Phase 9 | Static (grep) | `grep -q "useFetch('/api/vendors'" app/pages/discovery.vue && grep -q "default: () => \[\]" app/pages/discovery.vue` | preserved |
| (impl) | definePageMeta block preserved (sidebar contract) | Static (grep) | `grep -A 5 "definePageMeta" app/pages/discovery.vue \| grep -q "navOrder: 20"` | preserved |
| (impl) | No PrimeVue imports anywhere | Static (grep, negative) | `! grep -rE "primevue\|@primeuix" app/ shared/ server/` | (already true post-Phase 7) |
| (impl) | No v-model:visible used on USlideover | Static (grep, negative) | `! grep "v-model:visible" app/components/VendorDrawer.vue` | ❌ Wave 2 |
| (impl) | No @row-click on UTable | Static (grep, negative) | `! grep "@row-click" app/pages/discovery.vue` | ❌ Wave 2 |
| (impl) | UBadge for tag chips uses color="neutral" | Static (grep) | `grep -B 1 -A 4 "<UBadge" app/pages/discovery.vue \| grep -q 'color="neutral"'` | ❌ Wave 1 |

### Sampling Rate

- **Per task commit:** Run grep probes specific to that task's slice of PAGE-01 (under 5 seconds total).
- **Per wave merge:**
  - Wave 1 (10-01): typecheck + dev-server curl on /discovery, expect 27 rows in SSR HTML.
  - Wave 2 (10-02): typecheck + build + dev-server curl on /discovery (drawer not SSR'd is expected); manual UAT for row-click → drawer open → radar render.
  - Wave 3 (10-03): typecheck + build + dev-server curl; manual UAT for per-row USelectMenu and persist-on-reload.
- **Phase gate:** All grep probes pass; build + typecheck both exit 0; full manual UAT pass before `/gsd:verify-work`.

### Wave 0 Gaps

- [ ] `@vueuse/core` install (only if not transitively present) — verify in Plan 10-01 task 1
- [ ] `app/components/VendorDrawer.vue` — new component file (Plan 10-02)
- [ ] `app/stores/tags.ts` — additive `setVendorTags` action (Plan 10-03)
- [ ] `app/pages/discovery.vue` — full rewire (Plans 10-01, 10-02, 10-03 each touch it)
- [ ] Test runner — INTENTIONALLY NOT added in Phase 10; component primitives too new for stable fixtures; demo speed constraint argues against test infrastructure now

---

## Sources

### Primary (HIGH confidence)

- **Nuxt UI v4 Table docs** — `https://ui.nuxt.com/components/table` — column shape (`TableColumn<T>[]`), sort via header render function, cell slot naming `#{accessorKey}-cell`, `@select` event signature, `row.original` access pattern
- **Nuxt UI v4 Slideover docs** — `https://ui.nuxt.com/components/slideover` — `v-model:open` binding, `:ui="{ content }"` width pattern, slot list (header/body/footer/default), `<UApp>` requirement
- **Nuxt UI v4 SelectMenu docs** — `https://ui.nuxt.com/components/select-menu` — array-of-arrays for groups, `multiple` prop, `value-key`/`label-key`, multi-select v-model array
- **nuxt-echarts SSR guide** — `https://echarts.nuxt.dev/guides/ssr` — when to use `<ClientOnly>` vs the module's SSR components; "drawer charts → ClientOnly has no downside"
- **Phase 7-02 SUMMARY** — `nuxt-echarts SSR confirmed working` decision; RadarChart/PieChart registered
- **Phase 9-02 SUMMARY** — `useFetch('/api/vendors', { default: () => [] })` already wired in `app/pages/discovery.vue`; no manual generic
- **`shared/types/data.ts`** — Vendor / DpaRecord / EdtechRecord interfaces (auto-imported); 10 privacyScore fields confirmed
- **`server/data/vendors.ts`** — 27 typed records confirmed; all four discovery metric fields populated per vendor
- **`app/stores/tags.ts`** — setup-store shape with `tagGroups`, `assignments`, `persist: true` confirmed
- **`src/views/DiscoveryView.vue` + `src/components/VendorDrawer.vue` (v0.5.0)** — radar 10-axis labels verbatim, chip color binding pattern, drawer section layout
- **npm view 2026-05-21:** `@nuxt/ui@4.8.0`, `nuxt-echarts@1.0.1`, `nuxt@4.4.6`, `pinia@3.0.4`, `pinia-plugin-persistedstate@4.7.1`, `echarts@6.1.0` — all current versions verified against npm registry

### Secondary (MEDIUM confidence)

- VueUse `useDebounce` API — well-established library function, but installed-state of `@vueuse/core` is unverified at research time (Plan 10-01 task 1 verifies)
- Per-row USelectMenu compact-trigger styling (`size="xs" variant="ghost" icon="i-lucide-plus"`) — Nuxt UI supports the props but exact visual outcome unverified at research time
- USelectMenu group label rendering (whether outer-array index produces visible group headers vs just dividers) — docs imply dividers only; visual UAT in 10-03 confirms

### Tertiary (LOW confidence)

- None — all critical decisions verified against either official docs (HIGH) or planned UAT verification points (MEDIUM with mitigation plan).

---

## Metadata

**Confidence breakdown:**
- UTable API + columns + cell slots: HIGH — verified verbatim from official docs page
- USlideover API + v-model:open + width: HIGH — verified verbatim
- USelectMenu API + array-of-arrays + multi-select: HIGH — verified verbatim
- ECharts radar + ClientOnly reconciliation: HIGH — verified via nuxt-echarts SSR guide + Phase 7 research
- Tag chip with UBadge hex override: HIGH — UBadge `:style` + `color="neutral"` pattern is standard Nuxt UI v4
- Pinia setup-store action pattern: HIGH — verified against Pinia v3 docs + Phase 7 store
- VueUse `useDebounce` availability: MEDIUM — likely peer-installed by @nuxt/ui v4 but verify
- Per-row compact USelectMenu visual: MEDIUM-HIGH — API supports it; visual UAT confirms

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (30 days — Nuxt UI v4 is a moving target but the components in scope are 4.x stable; docs verified day-of)
