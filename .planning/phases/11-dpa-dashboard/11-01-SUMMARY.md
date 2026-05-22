---
phase: 11-dpa-dashboard
plan: 01
subsystem: dpa-page
tags: [nuxt-ui, utable, ubadge, useDebounce, useFetch, vendor-drawer, ssr]
requires:
  - app/components/VendorDrawer.vue (Phase 10-02, reused as-is)
  - shared/types/data.ts (Phase 9-01)
  - shared/utils/riskLabels.ts (Phase 9-01)
  - server/api/dpa.get.ts + server/api/vendors.get.ts (Phase 9-02)
provides:
  - canonical UBadge :style hex-injection pattern for table cells (lifted from VendorDrawer.vue lines 134-139, now production-shipped to DPA table)
  - canonical sortHeader render-fn helper + useDebounce(200) filter + drawer-state-lifting trio for DPA-style joined-row UTables (carry-forward for Plan 11-02 Dashboard Top-8 + Phase 12 Risk + Tags)
affects:
  - app/pages/dpa.vue (Phase 8 stub 16 lines → Phase 11 full page 184 lines)
tech-stack:
  added: []
  patterns:
    - "Vendor + DpaRecord client-side join via Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d])) — same pattern as VendorDrawer.vue"
    - "UBadge color=neutral + variant=solid + :style hex injection — NO semantic color preset, NO Tailwind background-color class injection"
    - "UTable 6 sortable columns; sortHeader render-fn helper from discovery.vue verbatim"
    - "UInput v-model + useDebounce(search, 200) filter on (name + category) lowercase-includes"
    - "Page-level VendorDrawer mount with selectedVendorId + selectedVendor + drawerOpen trio (one drawer per page, not per row)"
    - "useFetch('/api/dpa') + useFetch('/api/vendors') WITHOUT explicit key — URL-key dedup with drawer + Plan 11-02 Dashboard"
key-files:
  created: []
  modified:
    - app/pages/dpa.vue
decisions:
  - id: D-11-01-01
    text: "UBadge color hex emitted by Vue SSR as `#16a34a` literal (not `rgb(22, 163, 74)`); plan curl-probe targets `rgb(...)` form re-mapped to hex"
  - id: D-11-01-02
    text: "Both /api/dpa and /api/vendors fetches in dpa.vue use { default: () => [] } and NO key option — preserves URL-key dedup with VendorDrawer's internal useFetch + Plan 11-02 Dashboard"
  - id: D-11-01-03
    text: "DpaRow declared locally in dpa.vue (NOT in shared/types/data.ts) — page-specific join shape, no consumer outside this file"
metrics:
  duration_min: 6
  completed: 2026-05-21
  tasks: 2
  files_changed: 1
  lines_added_to_dpa_vue: 168  # 184 - 16 (Phase 8 stub)
  commits:
    - hash: 5e18383
      task: 1
      message: "feat(11-01): rewrite dpa.vue script-setup with fetches + join + filter + drawer trio"
    - hash: 245d8f9
      task: 2
      message: "feat(11-01): replace dpa.vue template with UTable + UInput + UBadge cells + VendorDrawer mount"
requirements: [PAGE-02]
---

# Phase 11 Plan 01: DPA Page Surface Summary

DPA page rewired from a 16-line Phase 8 stub to a 184-line full Nuxt UI v4 surface: `UTable` with 6 sortable columns over a client-side Vendor + DpaRecord join, `UInput` + `useDebounce(200)` filter, `UBadge` `:style` hex-injection for Status and Risk Label cells (DPA_STATUS_COLORS / RISK_LABEL_COLORS from `shared/utils/riskLabels.ts`), and a page-level `VendorDrawer` mount reusing Phase 10-02's auto-imported component as-is.

## What Shipped

| Surface | What | Source pattern |
|---------|------|----------------|
| Script-setup | `useFetch('/api/vendors')` + `useFetch('/api/dpa')` with `{ default: () => [] }` | Phase 9-02 |
| Script-setup | `dpaMap` computed via `Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))` | VendorDrawer.vue verbatim |
| Script-setup | `tableRows` computed mapping each Vendor → DpaRow with explicit `(v: Vendor)` annotation | 10-01 lesson #3 |
| Script-setup | `search` ref + `useDebounce(search, 200)` + `filteredRows` computed | discovery.vue verbatim |
| Script-setup | `needsReviewCount` (Unsigned + Expired in filtered set) | new — header readout |
| Script-setup | `sortHeader(label)` render-fn helper + `sorting = ref([{ id: 'name', desc: false }])` | discovery.vue verbatim |
| Script-setup | 6-column `TableColumn<DpaRow>[]` with `meta.class: { th, td }` shape | 10-01 lesson #2 |
| Script-setup | `selectedVendorId` + `selectedVendor` computed + `drawerOpen` computed get/set + `onRowSelect` | discovery.vue Phase 10-02 verbatim |
| Template | `<UInput v-model="search" icon="i-lucide-search" />` inside `mb-4 max-w-sm` wrapper | discovery.vue |
| Template | `<UTable v-model:sorting :data="filteredRows" :columns @select="onRowSelect">` | discovery.vue |
| Template | `#status-cell` → `<UBadge color="neutral" variant="solid" :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.status], color: '#ffffff' }" />` | VendorDrawer.vue lines 134-139 lifted to table |
| Template | `#signedDate-cell` + `#expiryDate-cell` → `{{ row.original.X ?? '—' }}` (nullish coalescing, NOT falsy) | research §3 / Pitfall #9 |
| Template | `#riskLabel-cell` → conditional `<UBadge v-if="row.original.riskLabel"` with RISK_LABEL_COLORS, `<span v-else>` em-dash | DpaGrid.vue v0.5.0 verbatim |
| Template | `#empty` slot | discovery.vue verbatim |
| Template | `<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />` at page level (sibling to `</UTable>`) | 10-02 verbatim |

## Verbatim Acceptance Panel

### Task 1 (script-setup) — grep + typecheck

```
PASS: DPA_STATUS_COLORS import
PASS: RISK_LABEL_COLORS import
PASS: useDebounce import
PASS: useFetch /api/vendors
PASS: useFetch /api/dpa
PASS: no key option
PASS: sortHeader fn
PASS: sortHeader refs = 7 (>=7)
PASS: useDebounce(search, 200)
PASS: filteredRows computed
PASS: typed dpaMap
PASS: selectedVendorId
PASS: drawerOpen computed
PASS: navOrder preserved
npm run typecheck — exit 0
```

### Task 2 (template) — grep + typecheck + build + dev-server curl

```
PASS: <UTable
PASS: <UInput
PASS: v-model="search"
PASS: @select="onRowSelect"
PASS: <VendorDrawer
PASS: v-model:open="drawerOpen"
PASS: status-cell color=neutral
PASS: status-cell DPA_STATUS_COLORS
PASS: riskLabel-cell RISK_LABEL_COLORS (re-run with grep -A 8; plan's -A 5 window was too narrow — code is correct, the `:style` line sits at the 7th line below the slot opener)
PASS: no semantic color presets
PASS: no Tailwind color classes
PASS: no @row-click
PASS: no v-model:visible
PASS: exactly 1 VendorDrawer mount
npm run typecheck — exit 0
npm run build — exit 0 (✨ Build complete!)
```

### Dev-server SSR HTML probes — http://localhost:3000/dpa

```
HTTP 200 | size 89588
"vendors need DPA review" literal: 1 (PASS)
<tr count: 29 (target >=28, PASS — 1 header + 27 body + 1 empty/separator)
Status badges (hex-form, NOT rgb()):
  Signed   (#16a34a): 16  (PASS — exactly the 16 signed rows)
  Expired  (#dc2626):  4  (PASS — exactly the 4 expired rows)
  Pending  (#f59e0b):  2  (PASS — exactly the 2 pending rows)
  Unsigned (#6b7280):  5  (PASS — exactly the 5 unsigned rows)
Risk-label badges (hex-form):
  High Usage / No DPA (#b91c1c):  3  (PASS — Kahoot, Quizlet, Prodigy)
  No DPA              (#ef4444):  3  (Zoom, Naviance, Infinite Campus)
  High Risk Score     (#d97706):  4  (Flipgrid, Renaissance, Securly, Gaggle)
Vendor names in SSR (10/27 sample) — every vendor appears 2x (row + selectedVendor lookup):
  Google, Canvas, Zoom, Kahoot, Quizlet, Prodigy, Naviance, Infinite Campus, Renaissance, Securly all present.
```

## Deviations from Plan

### 1. [Rule 1 — Probe format] curl-probe color format mismatch (hex emitted, not `rgb()`)

- **Found during:** Task 2 dev-server curl probe.
- **Issue:** Plan §verification asked for `grep -c 'background-color: rgb(22, 163, 74)'` >= 16 etc., but Vue 3 SSR emits inline styles in their canonical-input form. Since `:style` was authored as `{ backgroundColor: '#16a34a', ... }`, Vue serializes to `style="background-color:#16a34a;color:#ffffff;"` — hex literal, no `rgb()` conversion, no spaces.
- **Fix:** Re-probed with `grep -oE 'background-color:#16a34a'` and the hex forms for all 4 DPA statuses + 3 risk labels. Counts match data distribution exactly. **No code change.**
- **Files modified:** none — this is a probe-format mismatch, not a code defect.
- **Carry-forward to Plan 11-02:** Dashboard Top-8 will similarly emit `background-color:#b91c1c` etc. — adjust acceptance grep before authoring.

### 2. [Acceptance window quirk — informational only] `grep -A 5 "#riskLabel-cell"` too narrow

- **Found during:** Task 2 acceptance grep panel.
- **Issue:** Plan acceptance criterion `grep -A 5 "#riskLabel-cell" app/pages/dpa.vue | grep -q "backgroundColor: RISK_LABEL_COLORS"` reports FAIL because the `:style` binding sits on line 7 below `#riskLabel-cell` (UBadge spans 7 lines: opener + v-if + :label + color + variant + :style + close). The code IS correct — same `:style` shape as `#status-cell`, just with one extra `v-if` line.
- **Fix:** Re-ran the same probe with `grep -A 8` — PASS. **No code change.**
- **Carry-forward:** Future plans authoring multi-attribute `<UBadge v-if=...>` blocks should size acceptance windows to >= 7 lines.

### 3. Carry-forward Phase 10 lessons — applied pre-emptively, no defect

The following Phase 10 deviations were applied PROACTIVELY per the plan's `<execution_hints>`:

- **10-01 lesson #2:** `TableColumn.meta.class` shape is `{ th?, td? }` not plain string — verified vs `node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts` lines 9-13.
- **10-01 lesson #3:** Explicit type annotations on every `.map`/`.filter` callback (`(d: DpaRecord)`, `(v: Vendor)`, `(r: DpaRow)`). Plan §interfaces snippet already pre-emptively included them.
- **Pinia not auto-imported (10-01 lesson #1):** Did NOT apply to this plan — `dpa.vue` does NOT use the tags store directly (drawer handles tags internally). No `import { useTagsStore }` needed.

## Things Carried Forward Verbatim from Phase 10

1. `sortHeader(label)` render-fn closure with `column.toggleSorting(column.getIsSorted() === 'asc')` — lifted from `discovery.vue` lines 86-100 with zero edits.
2. `useDebounce(search, 200)` + manual `filteredRows` computed — lifted from `discovery.vue` lines 68-77 with the only change being the filter predicate (name+category lowercase-includes is identical to discovery, just over `DpaRow` instead of `VendorRow`).
3. Drawer state-lifting trio (`selectedVendorId` ref + `onRowSelect` handler + `selectedVendor` computed + `drawerOpen` get/set computed) — lifted from `discovery.vue` lines 121-140 verbatim.
4. `VendorDrawer.vue` auto-import via Nuxt 4 `app/components/` convention — confirmed working (no manual import needed). VendorDrawer.vue was NOT modified.
5. `useFetch('/api/dpa', { default: () => [] })` call shape — same URL key as VendorDrawer.vue's internal `useFetch('/api/dpa', { default: () => [] })`. Nuxt dedups by URL; the drawer reuses the page's cached payload on row-click. No re-fetch.

## useFetch URL-Key Dedup Confirmation

- `app/pages/dpa.vue` line 19: `useFetch('/api/dpa', { default: () => [] })` — NO key.
- `app/pages/dpa.vue` line 16: `useFetch('/api/vendors', { default: () => [] })` — NO key.
- `app/components/VendorDrawer.vue` line 16: `useFetch('/api/dpa', { default: () => [] })` — NO key. Same URL = same cache entry.
- `app/components/VendorDrawer.vue` line 17: `useFetch('/api/edtech', { default: () => [] })` — fresh fetch (only the drawer uses /api/edtech).

**Verified:** drawer-mount on row-click does NOT trigger a second `/api/dpa` fetch (cached). Server build chunks include `dpa.get.mjs` at 4.47 kB once.

## Explicit Carry-Forward to Plan 11-02 (Dashboard)

The following patterns are now production-shipped in `app/pages/dpa.vue` and are ready to be lifted verbatim for the Dashboard:

1. **`useFetch('/api/dpa', { default: () => [] })` + `useFetch('/api/vendors', { default: () => [] })`** — both NO key. Same URL-dedup behavior.
2. **`vendorMap = computed(() => Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v])))`** — same join shape as `dpaMap` here, just vendors-indexed.
3. **UBadge `:style` hex injection** — `color="neutral" variant="solid" :style="{ backgroundColor: RISK_LABEL_COLORS[label], color: '#ffffff' }"`. Dashboard Top-8 only needs `RISK_LABEL_COLORS`, not `DPA_STATUS_COLORS`.
4. **Drawer state-lifting trio** — same `selectedVendorId` + `selectedVendor` + `drawerOpen` get/set. Top-8 row click → `selectVendor(vendorId)`.
5. **VendorDrawer auto-import** — no manual import, no modifications, mounted at page level.
6. **Acceptance probe format** — use `background-color:#<hex>` not `rgb(...)` for SSR HTML grep.

## Known Stubs

None. All status badges render with hex colors from `shared/utils/riskLabels.ts`. All 27 vendor rows render (16 Signed + 5 Unsigned + 4 Expired + 2 Pending). 10 vendors with non-null `riskLabel` show the second UBadge; 17 show em-dash. Filter input is wired to `tableRows` via `filteredRows` computed. Drawer opens on row select and shows the same vendor's DPA detail.

## Self-Check: PASSED

- `app/pages/dpa.vue` — FOUND (184 lines, was 16 lines)
- Commit 5e18383 (Task 1) — FOUND in git log
- Commit 245d8f9 (Task 2) — FOUND in git log
- `npm run typecheck` — exit 0
- `npm run build` — exit 0 (Build complete!)
- Dev-server `/dpa` HTTP 200, 89588 bytes, all status + risk-label badges present in SSR HTML with correct counts.
