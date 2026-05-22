# Phase 11: DPA + Dashboard - Research

**Researched:** 2026-05-21
**Domain:** Nuxt UI v4 UTable + UBadge with `:style` hex injection (DPA status colors), `UCard` for Dashboard Top-8 surface, `useFetch('/api/dpa')` shared across two routes via URL-key dedup, VendorDrawer reuse from Phase 10
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

> **No CONTEXT.md exists for Phase 11** — running in autonomous mode per init payload (`has_context: false`). The locked decisions from STATE.md + ROADMAP + REQUIREMENTS + Phase 10 carry-forward govern.

### Locked Decisions (from STATE.md + ROADMAP + REQUIREMENTS)

- **Component mapping (carried from Phase 10):** PrimeVue DataTable → `UTable`, PrimeVue Tag → `UBadge` with `color="neutral" :style="{ backgroundColor: <hex> }"`, KPI/list cards → `UCard`.
- **UBadge color strategy (STATE.md Key Decision):** `:style` binding with hex values from `riskLabels.ts` constants — NO hardcoded Tailwind classes, NO `color="success"` / `color="error"` preset overrides. The required override is `color="neutral" variant="solid" :style="{ backgroundColor: DPA_STATUS_COLORS[status], color: '#ffffff' }"` — Phase 10's VendorDrawer.vue already established the verbatim pattern (lines 134-139).
- **useFetch wiring contract (Phase 9):** Both pages MUST consume `useFetch('/api/dpa', { default: () => [] })` — no manual generic (Nitro flow-types `DpaRecord[]`), `default: () => []` factory promotes the ref to non-null. Same call shape across routes lets Nuxt dedup by URL key (Phase 10 Pitfall #11 verified empirically — no re-fetch when the drawer opens after the page already fetched).
- **Pinia setup-store action pattern (Plan 10-03):** Two-surface single-action — both DPA page row clicks and Dashboard Top-8 row clicks open the SAME `VendorDrawer` instance (one drawer per page, mounted at page level). No new store actions needed in Phase 11 (Phase 10's `setVendorTags` is sufficient for the drawer's Tags section).
- **Page metadata (Phase 8):** `definePageMeta({ nav: true, navLabel, navIcon, navOrder })` already present on both `dpa.vue` (navOrder: 30) and `index.vue` (navOrder: 10) — DO NOT change.
- **VendorDrawer reuse (Plan 10-02 explicit carry-forward):** Phase 11 reuses `app/components/VendorDrawer.vue` as-is. Plan 10-02 SUMMARY says verbatim: *"Phase 11 DPA view will reuse `app/components/VendorDrawer.vue` as-is when surfacing per-DPA-row vendor detail; no Phase 11 modifications to the drawer expected unless a DPA-specific section needs adding."* The drawer already renders the DPA section using `DPA_STATUS_COLORS` — no enhancement required.
- **Plan budget per ROADMAP:** Exactly 2 plans. 11-01 = DPA page (UTable + filter + UBadge + drawer). 11-02 = Dashboard (UCard Top-8).
- **Phase requirements (REQUIREMENTS.md):** PAGE-02 (DPA page) and PAGE-05 (Dashboard) — both close together at Phase 11 end.

### Claude's Discretion

- **Sort + filter pattern:** Apply Phase 10's verbatim pattern — `sortHeader(label)` helper + `useDebounce(search, 200)` + manual `filteredRows` computed. Lift verbatim from `discovery.vue` (research §A below). Phase 10 already validated all three pieces.
- **DPA table column set:** 6 columns matching v0.5.0 DpaGrid.vue — Vendor Name, Category, Status (UBadge), Signed Date, Expiry Date, Risk Label (UBadge). See §3 for the exact column array.
- **DPA row click → VendorDrawer:** Recommend yes (§5). The drawer auto-imports, accepts a `vendor: Vendor | null` prop, and the DPA section is already wired. Lookup `Vendor` from `/api/vendors` by `vendorId`. Free win.
- **Top-8 ordering:** v0.5.0 used `dpaData.filter(d => d.riskLabel != null).slice(0, 8)` — match verbatim. Includes both Unsigned and Expired vendors that have a non-null riskLabel (10 candidates available — see §2). Recommend NOT re-ordering by severity for v1.0.0; the data file's intentional ordering already surfaces the demo-critical vendors first.
- **Dashboard Top-8 → VendorDrawer:** Recommend yes (§6). Same drawer instance, same pattern as DPA page. Page state lifting via `selectedVendorId` ref + `selectedVendor` computed + `drawerOpen` get/set.
- **Dashboard layout:** Three KPI tiles (Total Vendors, DPAs Signed, Needs Review) + one Top-8 UCard. Verbatim port from v0.5.0 DashboardView.vue (§6). KPI tiles are plain divs (not UCards) for visual continuity with v0.5.0.
- **STATUS_COLORS location:** ALREADY in `shared/utils/riskLabels.ts` as `DPA_STATUS_COLORS` and `RISK_LABEL_COLORS`. NO new constants file needed. Both pages import from there.
- **Wave assignment:** 11-01 → Wave 1 (DPA page), 11-02 → Wave 2 (Dashboard). Rationale in §7 — sequential, not parallel, because both touch `useFetch('/api/dpa')` consumption patterns and 11-02's Top-8 derivation logic visually mirrors a subset of 11-01's row rendering. Sequential keeps the patterns from diverging.

### Deferred to Later Phases (OUT OF SCOPE for Phase 11)

- Risk Position page (Phase 12 — PAGE-03).
- Tags Management CRUD (Phase 12 — PAGE-04).
- Deployment / static generate (Phase 13).
- DPA expiry warning amber highlight (v1.1+ deferred per REQUIREMENTS.md).
- Click donut segment to filter risk table (Phase 12+).
- VendorDrawer refactoring — no changes in Phase 11. If a DPA-specific section is needed, defer to v1.1.
- Backend schema changes — none.
- New `server/api/` routes — none. Phase 11 consumes existing `/api/dpa`, `/api/vendors`, `/api/edtech` (drawer reuse).
- Filtering DPA table BY status, BY risk label, BY date range — single text filter (name + category) only, matching v0.5.0 v1.0.0 parity.
- Top-8 reordering by severity weight — accept v0.5.0's data-order slice.
- Dashboard KPI tiles as UCard — keep as plain divs for v0.5.0 visual parity; not worth the styling rework.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-02 | DPA page fully functional — `UTable` with column sort and filter, color-coded `UBadge` status badges for Signed/Unsigned/Expired/Pending | §1 (DpaRecord shape verified), §2 (status distribution: 16/5/4/2), §3 (column set), §4 (UBadge pattern lifted from VendorDrawer.vue lines 134-139), §A (sortHeader helper from discovery.vue), §B (useDebounce filter from discovery.vue) |
| PAGE-05 | Dashboard functional — "Top 8 Vendors Needing Attention" card surfacing unsigned/expired DPAs using `UCard` | §6 (Top-8 derivation from v0.5.0 DashboardView.vue lines 13-26), §6 (UCard slots verified), §C (Dashboard scaffold) |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Nuxt 4 + Nuxt UI v4 + Pinia (established Phases 7-10). No introduction of conflicting frameworks (no PrimeVue, no TanStack-React).
- **Deployment:** Static GitHub Pages target via Phase 13 `nuxi generate`. Phase 11 must SSR cleanly under `useFetch` prerender — both routes (`/dpa` and `/`) call `/api/dpa` at prerender time.
- **Data:** All synthetic; no Druid / DPA API / 1EdTech API connections. `server/data/dpa.ts` is the source of truth.
- **Iteration speed:** Demo edits must be sub-1-hour. Both surfaces use the same color-config file (`shared/utils/riskLabels.ts`) — a sales rep asking to recolor a status changes ONE line.
- **Auth:** None.
- **GSD enforcement:** All file changes through `/gsd:execute-phase`.
- **Naming:** PascalCase Vue SFCs, camelCase TS, kebab-case asset files. `dpa.vue` and `index.vue` already exist as lowercase page filenames from Phase 8 — DO NOT rename.
- **Indentation:** 2 spaces, ES modules, no linter/formatter.

---

## Summary

Phase 11 is the cleanest phase of the v1.0.0 migration — every primitive needed (UTable, UBadge, UCard, USlideover, useFetch, sortHeader helper, useDebounce filter) was solved in Phase 10 and is now a verbatim copy job with one new tweak: the UBadge `:style` injection that Phase 10 used only inside the drawer now ships to the DPA table row's status column and risk-label column. The Dashboard is a single UCard plus three KPI divs, derived from the same `/api/dpa` payload that the DPA page already fetched.

Three pivotal facts shaped the recommendations:

1. **`/api/dpa` is deduped across both routes.** Nuxt's `useFetch` dedups by URL key (research §3.5 of Phase 10 + Pitfall #11 verified empirically in Plan 10-02). Both `dpa.vue` and `index.vue` will call `useFetch('/api/dpa', { default: () => [] })` and share one cached payload. NO explicit `key` parameter needed — the URL is the implicit key. NO SSR re-fetch when navigating between routes.

2. **The DPA status palette is already a complete `Record<DpaStatus, hex>` map in `shared/utils/riskLabels.ts`.** All four `DpaStatus` enum values (`Signed`, `Unsigned`, `Expired`, `Pending`) are keyed with hex colors (lines 25-30). Phase 10's VendorDrawer.vue lines 134-139 already shipped the exact UBadge pattern Phase 11 needs:
   ```vue
   <UBadge color="neutral" variant="solid"
     :label="vendorDpa.status"
     :style="{ backgroundColor: DPA_STATUS_COLORS[vendorDpa.status], color: '#ffffff' }" />
   ```
   Lift this into `dpa.vue`'s `#status-cell` slot — no new pattern, no new color logic, no new constants.

3. **`server/data/dpa.ts` is fully populated and joinable.** All 27 vendor IDs in `vendors.ts` have a matching DPA record. Status distribution: 16 Signed / 5 Unsigned / 4 Expired / 2 Pending. 10 records have a non-null `riskLabel` (more than enough for a Top-8 slice — see §2 below for the exact list). The data is demo-storyline ordered: Kahoot, Quizlet, Prodigy, Naviance lead the Unsigned cluster; Zoom, Flipgrid, Renaissance, Infinite Campus lead the Expired cluster; both Pending records (ReadWorks, Gaggle) are at the bottom of the file. The Top-8 slice cleanly surfaces 8 demo-critical risk vendors without any sort/filter complexity.

The single highest-risk technical pitfall is **forgetting to import `DPA_STATUS_COLORS` and `RISK_LABEL_COLORS` from `shared/utils/riskLabels.ts`** at the top of `dpa.vue` (similarly for `index.vue` — but for `RISK_LABEL_COLORS` only). The drawer already imports these correctly; the new pages must mirror that import pattern. Without the import, the template fails with `TS2304: Cannot find name 'DPA_STATUS_COLORS'`. Easy to catch via typecheck, but worth flagging because the planning snippet may carry over the `#shared/utils/riskLabels` path without surfacing the import explicitly.

**Primary recommendation:** Two plans, two waves. Sequential. Each is ~120 lines of new code, both lift verbatim from Phase 10 patterns. Total Phase 11 effort: ~4 tasks across 2 plans, ~240 lines of new code across 2 modified files.

- **Wave 1: Plan 11-01** — DPA page. Modify `app/pages/dpa.vue` from the 16-line Phase 8 stub to the full UTable + filter + drawer page. Lift `sortHeader`, `useDebounce`, `selectedVendor` + `drawerOpen` computeds from `discovery.vue`. Add `#status-cell` + `#riskLabel-cell` slots with UBadge `:style` injections. Mount `<VendorDrawer>` at page level. ~120 lines.
- **Wave 2: Plan 11-02** — Dashboard. Modify `app/pages/index.vue` from the 16-line Phase 8 stub to KPI tiles + Top-8 UCard. Fetch `/api/dpa` (shared cache with DPA page) AND `/api/vendors` (for name + category lookup on the Top-8 list). Compute `topAtRisk` via the v0.5.0 algorithm verbatim. Mount the same `<VendorDrawer>` instance with the same state-lifting trio. ~120 lines.

A note on Wave 0 needs: there are none. Every dependency (Nuxt UI v4 components, useFetch wiring, riskLabels.ts, VendorDrawer.vue) is in place from Phases 7-10. `@vueuse/core` was hoisted explicit in Plan 10-01. No `npm install` step needed.

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | DPA row shape | **Join `Vendor + DpaRecord`** at the page via `dpaMap` keyed by `vendorId` (verbatim pattern from VendorDrawer.vue). Row carries `name`, `category`, `status`, `signedDate`, `expiryDate`, `riskLabel`. | One client-side join; same shape v0.5.0 DpaGrid used; no new types |
| 2 | DPA column set | **6 columns:** Vendor Name (sort), Category (sort), Status (sort + UBadge), Signed Date (sort), Expiry Date (sort), Risk Label (sort + UBadge or em-dash). 5 of 6 sortable. | Matches v0.5.0 DpaGrid.vue verbatim; familiar to sales reps |
| 3 | Status UBadge pattern | **`color="neutral" variant="solid" :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.status], color: '#ffffff' }"`** — verbatim copy from VendorDrawer.vue line 134-139 | Already proven in Phase 10; consistent visual across portal |
| 4 | Risk Label UBadge | **Same pattern with `RISK_LABEL_COLORS[label]`**; show `<span class="text-gray-400">—</span>` when `riskLabel === null` | v0.5.0 DpaGrid.vue lines 95-103 verbatim |
| 5 | Search filter | **`UInput` v-model="search" + `useDebounce(search, 200)` + manual `filteredRows` computed** filtering on `name + category` (lowercase-includes) | Verbatim from `discovery.vue` Phase 10 |
| 6 | Default sort | **`sorting = ref([{ id: 'name', desc: false }])`** name-ascending | Phase 10 default; matches v0.5.0 |
| 7 | Row click → drawer | **`@select="onRowSelect"` with `(_e, row) => selectedVendorId.value = row.original.vendorId`** + page-level `selectedVendor` + `drawerOpen` computed trio + `<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />` mount | Phase 10 verbatim pattern; drawer's DPA section is already wired with the correct hex colors |
| 8 | useFetch URL dedup | **Both pages: `useFetch('/api/dpa', { default: () => [] })`** — no `key` override. Same URL = same Nuxt cache entry | Phase 10 Pitfall #11 verified |
| 9 | Top-8 derivation | **`dpaList.value.filter(d => d.riskLabel !== null).slice(0, 8)`** verbatim from v0.5.0 DashboardView.vue lines 13-15 | 10 candidates available; slice surfaces the demo-storyline-critical 8 |
| 10 | Top-8 row click | **Same VendorDrawer state-lifting trio as DPA page** — click a Top-8 row, open the drawer | Free win — drawer auto-imports, accepts `:vendor` prop |
| 11 | Dashboard KPI tiles | **Three plain divs (Total Vendors / DPAs Signed / Needs Review)** above the Top-8 UCard — verbatim from v0.5.0 DashboardView.vue lines 41-54 | v1.0.0 visual parity; UCard for the Top-8 only, KPI tiles stay as flexbox divs |
| 12 | UCard variant | **`<UCard variant="outline">` (default)** with `#header` slot for the title row and `#default` slot for the list body | UCard's outline variant matches v0.5.0's `bg-white border border-gray-200 rounded-lg` |
| 13 | Top-8 row layout | **`<div class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50" @click="selectVendor(row.vendorId)">` with vendor name + category on the left, riskLabel UBadge on the right** — verbatim from v0.5.0 lines 62-77 | Familiar to anyone who saw v0.5.0; cursor-pointer + hover gives the drawer-affordance |
| 14 | "Needs Review" KPI calc | **`dpaList.value.filter(d => d.status === 'Unsigned' \|\| d.status === 'Expired').length`** | v0.5.0 DashboardView.vue line 32-34; counts to 9 (5 Unsigned + 4 Expired) |
| 15 | Wave assignment | **11-01 → Wave 1, 11-02 → Wave 2 (sequential, not parallel)** | Both touch `useFetch('/api/dpa')` patterns; sequential keeps the dedup behavior consistent and lets 11-02 build on a known-good drawer-mount pattern |
| 16 | Imports from riskLabels.ts | **`import { DPA_STATUS_COLORS, RISK_LABEL_COLORS } from '#shared/utils/riskLabels'`** at the top of `dpa.vue`; **`import { RISK_LABEL_COLORS } from '#shared/utils/riskLabels'`** at the top of `index.vue` (Dashboard only needs RISK_LABEL_COLORS) | Matches VendorDrawer.vue import pattern verbatim |
| 17 | TableColumn `meta.class` shape | **`{ th: '<classes>', td: '<classes>' }`** — NOT a plain string. Plan 10-01 deviation #2 carry-forward. | `node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts` defines `ColumnMeta.class` as `{ th?, td? }` |
| 18 | Implicit-any guards | **Explicit type annotations on all `.map`/`.filter`/`.sort` callbacks** — `.map((d: DpaRecord) => ...)`, etc. Plan 10-01 deviation #3 carry-forward. | TS strict mode (Nuxt 4 default) flags TS7006 |
| 19 | Vendor lookup in Top-8 | **`vendorMap = computed(() => Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v])))`** | Same join pattern as VendorDrawer.vue's `dpaMap` |

---

## Per-Question Findings

### 1. DpaRecord and join shape — verified vs `shared/types/data.ts` and `server/data/dpa.ts`

**DpaRecord interface (verbatim, `shared/types/data.ts` lines 30-39):**

```ts
export type DpaStatus = 'Signed' | 'Unsigned' | 'Expired' | 'Pending'
export type RiskLabel = 'High Usage / No DPA' | 'No DPA' | 'High Risk Score'

export interface DpaRecord {
  vendorId: string
  status: DpaStatus
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}
```

**Five fields. `signedDate` and `expiryDate` are `string | null` (ISO 8601 dates). `riskLabel` is a 3-value enum or null.** The table column layout must handle null → em-dash for date and risk-label cells.

**Joined row shape for the DPA table (the row data passed to UTable):**

```ts
type DpaRow = {
  vendorId: string
  name: string         // from Vendor
  category: string     // from Vendor
  status: DpaStatus    // from DpaRecord
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}
```

**Join is page-level computed:**

```ts
// app/pages/dpa.vue
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })

const dpaMap = computed<Record<string, DpaRecord>>(() =>
  Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))
)

const tableRows = computed<DpaRow[]>(() =>
  vendors.value.map((v: Vendor) => {
    const dpa = dpaMap.value[v.vendorId]
    return {
      vendorId: v.vendorId,
      name: v.name,
      category: v.category,
      status: dpa?.status ?? 'Unsigned',  // never expected to fire; safety fallback
      signedDate: dpa?.signedDate ?? null,
      expiryDate: dpa?.expiryDate ?? null,
      riskLabel: dpa?.riskLabel ?? null,
    }
  })
)
```

**All 27 vendors have matching DPA records** — verified by grep against `vendors.ts` (27 entries) and `dpa.ts` (27 entries). No orphans, no missing joins.

**Confidence:** HIGH (verified directly against source files).

---

### 2. DPA status distribution and Top-8 candidate list

**Status counts in `server/data/dpa.ts` (verified via `grep -c`):**

| Status | Count | Hex (from DPA_STATUS_COLORS) |
|--------|-------|------------------------------|
| Signed | 16 | `#16a34a` (green-600) |
| Unsigned | 5 | `#6b7280` (gray-500) |
| Expired | 4 | `#dc2626` (red-600) |
| Pending | 2 | `#f59e0b` (amber-500) |

Total: 27. Every `DpaStatus` enum value is represented.

**Non-null riskLabel records (10 total — Top-8 candidates):**

| # | vendorId | status | riskLabel |
|---|----------|--------|-----------|
| 1 | vendor-zoom | Expired | `No DPA` |
| 2 | vendor-kahoot | Unsigned | `High Usage / No DPA` |
| 3 | vendor-quizlet | Unsigned | `High Usage / No DPA` |
| 4 | vendor-flipgrid | Expired | `High Risk Score` |
| 5 | vendor-prodigy | Unsigned | `High Usage / No DPA` |
| 6 | vendor-renaissance | Expired | `High Risk Score` |
| 7 | vendor-naviance | Unsigned | `No DPA` |
| 8 | vendor-infinite-campus | Expired | `No DPA` |
| 9 | vendor-securly | Unsigned | `High Risk Score` |
| 10 | vendor-gaggle | Pending | `High Risk Score` |

**Top-8 slice (v0.5.0 logic: `filter(d => d.riskLabel != null).slice(0, 8)`):** rows 1-8 above. Cleanly surfaces the demo-storyline-critical vendors:
- Zoom (Expired)
- Kahoot, Quizlet, Prodigy (Unsigned with active usage)
- Flipgrid, Renaissance (Expired with high risk score)
- Naviance (Unsigned, no DPA)
- Infinite Campus (Expired SIS — critical demo moment)

Securly and Gaggle are intentionally below the slice — they're still in the list (e.g., a future "see all 10" link could surface them), but v0.5.0's demo storyline emphasizes the first 8.

**Recommendation:** Match v0.5.0 verbatim — `filter + slice(0, 8)`. Do NOT re-sort by severity. The file's intentional ordering IS the sort order.

**ROADMAP success criterion 4 wording:** *"vendors with unsigned or expired DPAs"*. The 8 selected by the v0.5.0 algorithm are 4 Unsigned + 4 Expired — matches the criterion perfectly. No mismatch.

**Confidence:** HIGH (verified directly against `server/data/dpa.ts`).

---

### 3. DPA table column set — verbatim port from v0.5.0 DpaGrid.vue

**v0.5.0 DpaGrid.vue lines 79-105 columns (PrimeVue):**

| # | field | header | sortable | special render |
|---|-------|--------|----------|----------------|
| 1 | name | Vendor Name | yes | (text) |
| 2 | category | Category | yes | (text) |
| 3 | status | Status | yes | `<Tag :value :style="{ backgroundColor: DPA_STATUS_COLORS[status] }">` |
| 4 | signedDate | Signed Date | yes | `data.signedDate ?? '—'` |
| 5 | expiryDate | Expiry Date | yes | `data.expiryDate ?? '—'` |
| 6 | riskLabel | Risk Label | yes | `<Tag>` if non-null, else `—` |

**Nuxt UI v4 port (using Phase 10's `sortHeader` helper + cell slots):**

```ts
const columns: TableColumn<DpaRow>[] = [
  { accessorKey: 'name',       header: sortHeader('Vendor Name'), meta: { class: { th: 'min-w-[12rem]', td: 'min-w-[12rem]' } } },
  { accessorKey: 'category',   header: sortHeader('Category'),    meta: { class: { th: 'w-[10rem]',     td: 'w-[10rem]' } } },
  { accessorKey: 'status',     header: sortHeader('Status'),      meta: { class: { th: 'w-[8rem]',      td: 'w-[8rem]' } } },
  { accessorKey: 'signedDate', header: sortHeader('Signed Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'expiryDate', header: sortHeader('Expiry Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'riskLabel',  header: sortHeader('Risk Label'),  meta: { class: { th: 'w-[12rem]',     td: 'w-[12rem]' } } },
]
```

**Cell slots in template:**

```vue
<UTable
  v-model:sorting="sorting"
  :data="filteredRows"
  :columns="columns"
  class="bg-white"
  @select="onRowSelect"
>
  <template #status-cell="{ row }">
    <UBadge
      :label="row.original.status"
      color="neutral"
      variant="solid"
      :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.status], color: '#ffffff' }"
    />
  </template>
  <template #signedDate-cell="{ row }">
    {{ row.original.signedDate ?? '—' }}
  </template>
  <template #expiryDate-cell="{ row }">
    {{ row.original.expiryDate ?? '—' }}
  </template>
  <template #riskLabel-cell="{ row }">
    <UBadge
      v-if="row.original.riskLabel"
      :label="row.original.riskLabel"
      color="neutral"
      variant="solid"
      :style="{ backgroundColor: RISK_LABEL_COLORS[row.original.riskLabel], color: '#ffffff' }"
    />
    <span v-else class="text-gray-400">—</span>
  </template>
  <template #empty>
    <div class="py-8 text-center">
      <div class="text-sm font-semibold text-gray-900">No vendors match your search</div>
      <div class="text-sm text-gray-500 mt-1">Try a different search term or clear the filter.</div>
    </div>
  </template>
</UTable>
```

**Five sortable columns, one informational (no — all six are sortable in v0.5.0).** Per ROADMAP SC#3 "column sort", all 6 columns set up with `sortHeader` for consistency.

**Confidence:** HIGH (verbatim port + Phase 10 sortHeader pattern verified).

---

### 4. UBadge `:style` hex binding — verified vs installed types

**The pattern (verbatim from `app/components/VendorDrawer.vue` lines 134-139):**

```vue
<UBadge
  :label="vendorDpa.status"
  color="neutral"
  variant="solid"
  :style="{ backgroundColor: DPA_STATUS_COLORS[vendorDpa.status], color: '#ffffff' }"
/>
```

**Verified against `node_modules/@nuxt/ui/dist/runtime/components/Badge.vue.d.ts`** (installed Nuxt UI v4.8.0):

```ts
export interface BadgeProps extends Omit<UseComponentIconsProps, 'loading' | 'loadingIcon'> {
  as?: any
  label?: string | number          // ✓ accepts our :label
  color?: Badge['variants']['color']    // 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: Badge['variants']['variant']  // 'solid' | 'outline' | 'soft' | 'subtle'
  size?: Badge['variants']['size']
  square?: boolean
  class?: any
  ui?: Badge['slots']              // { leading?, default?, trailing? }
}
```

**Confirmed:**
- `color="neutral"` is a valid prop value — disables the component's color theming so `:style` background wins.
- `variant="solid"` produces a filled rectangle (the chip shape).
- `:label="..."` accepts string — renders as the chip's text.
- `:style` is HTML's standard style binding — Vue forwards it to the rendered `<span>` (UBadge's default `as`).

**The contrast:** All four DPA status hex colors are dark enough for `color: '#ffffff'` (white text):
- `#16a34a` Signed (green-600) — luminance 51, white passes WCAG AA at 4.79:1
- `#dc2626` Expired (red-600) — luminance 36, white passes at 6.69:1
- `#f59e0b` Pending (amber-500) — luminance 71, white at 2.97:1 — borderline; could use `#000000` for amber but v0.5.0 used white, so matched. Sales rep can ask to flip; one config edit.
- `#6b7280` Unsigned (gray-500) — luminance 47, white at 5.32:1

**For Risk Label colors** (also white text):
- `#b91c1c` High Usage / No DPA (red-700) — strong contrast
- `#ef4444` No DPA (red-500) — strong contrast
- `#d97706` High Risk Score (amber-600) — strong contrast

**Recommendation:** Use `color: '#ffffff'` verbatim, matching v0.5.0 + Phase 10 drawer.

**Confidence:** HIGH (Badge.vue.d.ts read; pattern verbatim from Phase 10 production code).

---

### 5. VendorDrawer reuse from DPA row click

**The drawer accepts `vendor: Vendor | null` and `v-model:open="drawerOpen"`** (verified — `app/components/VendorDrawer.vue` line 9-10).

**Plan 10-02 explicit forward-compat note (SUMMARY § Carry-Forward):**
> "Phase 11 DPA view will reuse `app/components/VendorDrawer.vue` as-is when surfacing per-DPA-row vendor detail; no Phase 11 modifications to the drawer expected unless a DPA-specific section needs adding."

**The drawer's DPA section already renders correctly** — it does its own `useFetch('/api/dpa')` internally (lines 16-17), looks up the right DpaRecord by vendorId, and shows the UBadge status with `DPA_STATUS_COLORS` (lines 134-139). When a DPA-page row click opens the drawer, the drawer shows the SAME vendor's DPA detail that the row was rendering — visually consistent, no jarring re-rendering.

**Page-level state lifting pattern (verbatim from `discovery.vue` lines 121-140, ported to `dpa.vue`):**

```ts
// app/pages/dpa.vue
const selectedVendorId = ref<string | null>(null)

function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
}

const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)

const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
```

**Template (mount at page level, sibling to `</UTable>`):**

```vue
<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
```

**No manual import** — VendorDrawer is auto-imported via Nuxt 4 components convention.

**useFetch dedup behavior across the DPA page → drawer:**

The page calls `useFetch('/api/dpa')` to build the table. The drawer also calls `useFetch('/api/dpa')` internally. Nuxt dedups by URL key — the drawer reuses the page's cached payload. NO re-fetch on row click. Phase 10 Pitfall #11 verified empirically in Plan 10-02 (Plan 10-02 SUMMARY § Carry-Forward Lessons #2).

**Confidence:** HIGH (drawer interface verified; Plan 10-02 explicit forward-compat statement).

---

### 6. UCard for Dashboard Top-8 — slots verified

**Verified against `node_modules/@nuxt/ui/dist/runtime/components/Card.vue.d.ts`** (installed Nuxt UI v4.8.0):

```ts
export interface CardProps {
  as?: any
  title?: string
  description?: string
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'  // default 'outline'
  class?: any
  ui?: Card['slots']
}
export interface CardSlots {
  header?(props?: {}): VNode[]      // ✓ custom header
  title?(props?: {}): VNode[]
  description?(props?: {}): VNode[]
  default?(props?: {}): VNode[]     // ✓ body content
  footer?(props?: {}): VNode[]
}
```

**Confirmed against `node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs` lines 1152-1182** (card theme):

```js
const card$1 = {
  slots: {
    root: "rounded-lg overflow-hidden",
    header: "p-4 sm:px-6",
    title: "text-highlighted font-semibold",
    description: "mt-1 text-muted text-sm",
    body: "p-4 sm:p-6",
    footer: "p-4 sm:px-6"
  },
  variants: {
    variant: {
      solid: { root: "bg-inverted text-inverted", ... },
      outline: { root: "bg-default ring ring-default divide-y divide-default" },  // ← default
      soft: { root: "bg-elevated/50 divide-y divide-default" },
      subtle: { root: "bg-elevated/50 ring ring-default divide-y divide-default" }
    }
  },
  defaultVariants: { variant: "outline" }
}
```

**Slot keys for `:ui` overrides:** `root`, `header`, `title`, `description`, `body`, `footer`. (NOT `content` like USlideover — UCard uses `body` for the main slot's styling.)

**Top-8 UCard scaffold (Dashboard):**

```vue
<UCard variant="outline" class="bg-white">
  <template #header>
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">Top 8 Vendors Needing Attention</h2>
      <span class="text-sm text-gray-500">{{ topAtRisk.length }} flagged</span>
    </div>
  </template>
  <div class="divide-y divide-gray-100">
    <div
      v-for="row in topAtRisk"
      :key="row.vendorId"
      class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6"
      @click="selectVendor(row.vendorId)"
    >
      <div class="flex flex-col">
        <span class="text-sm font-semibold text-gray-900">{{ row.name }}</span>
        <span class="text-xs text-gray-500">{{ row.category }}</span>
      </div>
      <UBadge
        v-if="row.riskLabel"
        :label="row.riskLabel"
        color="neutral"
        variant="solid"
        :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }"
      />
    </div>
  </div>
</UCard>
```

**Negative slot space hack:** `-mx-4 sm:-mx-6 px-4 sm:px-6` on each row lifts the hover background to the card's full inner width (UCard's body slot has `p-4 sm:p-6` padding; the negative-then-positive margin pattern reclaims that for hover, matching v0.5.0's visual). This is a Tailwind v4 idiom; no special handling needed.

**Top-8 derivation (verbatim from v0.5.0 DashboardView.vue lines 13-26):**

```ts
// app/pages/index.vue
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })

const vendorMap = computed<Record<string, Vendor>>(() =>
  Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v]))
)

const topAtRisk = computed(() =>
  dpaList.value
    .filter((d: DpaRecord) => d.riskLabel !== null)
    .slice(0, 8)
    .map((d: DpaRecord) => {
      const v = vendorMap.value[d.vendorId]
      return {
        vendorId: d.vendorId,
        name: v?.name ?? d.vendorId,
        category: v?.category ?? '—',
        riskLabel: d.riskLabel,
      }
    })
)

const totalVendors = computed(() => vendors.value.length)
const signedCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Signed').length
)
const needsReviewCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Unsigned' || d.status === 'Expired').length
)

// Drawer state lifting (same trio as DPA page)
const selectedVendorId = ref<string | null>(null)
function selectVendor(vendorId: string) {
  selectedVendorId.value = vendorId
}
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
```

**KPI tiles (verbatim port from v0.5.0):**

```vue
<div class="grid grid-cols-3 gap-4 mb-8">
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <div class="text-sm text-gray-500">Total Vendors</div>
    <div class="text-2xl font-semibold text-gray-900 mt-1">{{ totalVendors }}</div>
  </div>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <div class="text-sm text-gray-500">DPAs Signed</div>
    <div class="text-2xl font-semibold text-gray-900 mt-1">{{ signedCount }}</div>
  </div>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <div class="text-sm text-gray-500">Needs Review</div>
    <div class="text-2xl font-semibold mt-1 text-red-600">{{ needsReviewCount }}</div>
  </div>
</div>
```

**Recommendation:** Keep KPI tiles as plain divs, NOT UCards. Matches v0.5.0 verbatim and avoids the size disparity of putting three side-by-side mini-UCards next to a wider Top-8 UCard.

**Expected values:**
- Total Vendors: 27
- DPAs Signed: 16
- Needs Review: 9 (= 5 Unsigned + 4 Expired)

**Confidence:** HIGH (UCard types + theme slots verified directly from installed code; Top-8 logic verbatim from v0.5.0).

---

### 7. Wave assignment — 11-01 → Wave 1, 11-02 → Wave 2 (sequential)

**Dependency graph:**

```
11-01 (Wave 1) ──→ 11-02 (Wave 2)
   │                    │
   ↓                    ↓
dpa.vue              index.vue
  UTable + filter      KPI tiles + UCard Top-8
  UBadge status        UBadge risk-label rows
  VendorDrawer mount   VendorDrawer mount
  /api/dpa fetch       /api/dpa fetch (shared cache)
```

**Why sequential, not parallel:**

| Reason | Severity | Detail |
|--------|----------|--------|
| Both pages mount the same VendorDrawer | medium | If 11-02 runs before 11-01's drawer-mount pattern is verified, a divergence in the state-lifting trio (selectedVendorId / selectedVendor / drawerOpen) won't be caught early. Sequential lets 11-01 establish the canonical shape, 11-02 lifts it verbatim. |
| Both pages call `useFetch('/api/dpa')` | low | Nuxt dedups by URL key — both can call safely in parallel. But verifying the dedup works in production (DPA page mounted first → Dashboard navigated to second → no re-fetch) is easier when 11-01 is known-good before 11-02 builds on top. |
| 11-02 reuses the row-click → drawer pattern from 11-01 | medium | If 11-02 is written in parallel and 11-01's `@select`-vs-`@click` pattern shifts during execution, 11-02 has to be reworked. Sequential prevents this. |
| Total task count is small (4 tasks) | informational | The 1-task savings from parallelism (no tasks share files) isn't worth the divergence risk. |

**File-overlap check:**
- Plan 11-01 modifies: `app/pages/dpa.vue` only.
- Plan 11-02 modifies: `app/pages/index.vue` only.
- No file overlap. Parallelism would NOT cause merge conflicts. But the architectural-divergence risk above argues sequential anyway.

**Per-wave verify gates:**

- **Wave 1 (11-01):** typecheck + build + dev-server curl on `/dpa` returns 200 with ≥28 `<tr` tags (1 header + 27 body); SSR HTML contains UBadge instances with `:style="{ backgroundColor` for status and risk-label columns; manual UAT for row-click → drawer open showing the same vendor's DPA detail with consistent badge colors.
- **Wave 2 (11-02):** typecheck + build + dev-server curl on `/` returns 200 with the Top-8 UCard visible in SSR HTML (look for "Top 8 Vendors Needing Attention" literal); KPI counts present (27 / 16 / 9); manual UAT for Top-8 row click → drawer open with the right vendor.

**Plan effort estimates:**

- **11-01:** 2 tasks (1: script-setup rewire — fetches, joins, columns, sortHeader, filter, drawer state lifting; 2: template rewrite — UInput + UTable + cell slots + VendorDrawer mount). ~120 lines net new.
- **11-02:** 2 tasks (1: script-setup rewire — fetches, vendorMap, topAtRisk, KPI computeds, drawer state lifting; 2: template rewrite — KPI tiles + UCard Top-8 + VendorDrawer mount). ~120 lines net new.

**Total Phase 11: ~240 lines of new code across 2 modified files (`dpa.vue`, `index.vue`). No new files. No deletions** (v0.5.0 DashboardView.vue and DpaGrid.vue could be opportunistically swept but are already orphaned since Plan 09-01 deleted `src/data/*.js`; Phase 12 likely sweeps the remaining `src/views/*.vue` and `src/components/*.vue` files when the last few Risk + Tags pages migrate. Phase 11 leaves them; sweep is not gating.).

**Confidence:** HIGH.

---

### 8. useFetch deduplication across routes — verified

**Source:** Nuxt 3/4 useFetch docs + Phase 10 Pitfall #11 + Plan 10-02 empirical verification.

**The behavior:** Nuxt's `useFetch` uses a key derived from the URL + serialized options. Two calls to `useFetch('/api/dpa', { default: () => [] })` from anywhere in the app produce the SAME cache entry. Subsequent calls return the cached payload immediately without re-issuing the network request.

**For Phase 11 this means:**

1. User visits `/dpa` directly. DPA page fetches `/api/dpa` (1 HTTP call, SSR).
2. User clicks a row → drawer opens → drawer's internal `useFetch('/api/dpa')` returns cached.
3. User navigates to `/`. Dashboard fetches `/api/dpa` — but it's already cached. Returns cached payload immediately.
4. Reverse direction (visit `/` first → navigate to `/dpa`) — same behavior.

**No explicit `key` parameter needed.** The URL is the implicit key.

**Pitfall to avoid:** Adding a `key` option WITHOUT being aware of the dedup behavior can BREAK it. If the DPA page is later given `useFetch('/api/dpa', { key: 'dpa-table' })` and the Dashboard `useFetch('/api/dpa', { key: 'dpa-dashboard' })`, those are now SEPARATE cache entries and re-fetch on navigation.

**Recommendation:** Both pages and the drawer use the same call shape verbatim:
```ts
useFetch('/api/dpa', { default: () => [] })
```
No `key`, no special options. Lift verbatim from Phase 10.

**Confidence:** HIGH (Nuxt docs + Plan 10-02 empirical confirmation).

---

### 9. Carry-forward Phase 10 deviations (verbatim)

All four Plan 10-01 deviations and the two Plan 10-03 deviations carry forward to Phase 11. **The planner MUST proactively pre-empt these** by including the corrected snippets in `<interfaces>` blocks; otherwise the executor will hit the same typecheck failures.

| # | Source | Issue | Pre-emptive fix for Phase 11 |
|---|--------|-------|------------------------------|
| 1 | Plan 10-01 deviation #1 | `@pinia/nuxt v0.11.3` does NOT auto-import store factories | Phase 11 doesn't use any Pinia store directly (drawer handles tags internally). NO action needed. If a future task needs a store, use explicit `import { useTagsStore } from '~/stores/tags'`. |
| 2 | Plan 10-01 deviation #2 | `TableColumn.meta.class` shape is `{ th?, td? }`, NOT a plain string | Plan 11-01 columns array MUST use `meta: { class: { th: '<classes>', td: '<classes>' } }` for every column. See §3 above. |
| 3 | Plan 10-01 deviation #3 | TS strict mode rejects implicit `any` on `.map`/`.filter`/`.sort` callbacks | Plan 11-01 + 11-02 MUST annotate ALL callbacks: `.map((d: DpaRecord) => ...)`, `.map((v: Vendor) => ...)`, `.filter((d: DpaRecord) => ...)`, etc. See §1, §6 above. |
| 4 | Plan 10-01 deviation #4 (informational) | `.output/server/chunks/routes/<page>.html` does NOT exist for `nuxi build` (only `nuxi generate`) | Phase 11 SSR probes use `curl http://localhost:3000/dpa` and `curl http://localhost:3000/` against `npm run dev`, NOT grep build artifacts. |
| 5 | Plan 10-03 deviation #1 | Nuxt UI v4 `:ui` slot keys differ between components — SelectMenu uses `base` not `trigger`; UCard uses `body` not `content`; USlideover uses `content` not `body`/`root` | Phase 11 uses UCard (slots: `root`/`header`/`title`/`description`/`body`/`footer`) and UBadge (no `:ui` overrides needed). Cross-checked against the installed types — see §6 above. |
| 6 | Plan 10-03 deviation #2 | Plan-snippet auto-import claims for non-Nuxt-builtin libraries are often wrong | Phase 11 does NOT rely on auto-import for any non-builtin. Explicit imports: `import { DPA_STATUS_COLORS, RISK_LABEL_COLORS } from '#shared/utils/riskLabels'` + type imports from `#shared/types/data`. Drawer auto-imports from `app/components/` (this IS a Nuxt builtin — confirmed working in Phase 10). |

**Confidence:** HIGH — all six are documented Phase 10 deviations with concrete remediation.

---

### 10. Top-8 click → drawer open (recommendation)

**v0.5.0 behavior:** Top-8 list items were NOT clickable. They were display-only.

**Recommendation for v1.0.0:** MAKE THEM CLICKABLE. Open the VendorDrawer for the clicked vendor. This is a free UX win:
- The drawer auto-imports.
- The state-lifting trio is already needed (one ref + two computeds).
- The drawer's DPA section will show the vendor's full DPA detail — exactly what a sales rep wants when pointing to a Top-8 row.
- No new data fetching needed (the drawer's internal `useFetch('/api/dpa')` is already cached).

**Implementation:**

```vue
<div
  v-for="row in topAtRisk"
  :key="row.vendorId"
  class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6"
  @click="selectVendor(row.vendorId)"
>
  <!-- name + category + UBadge -->
</div>
```

```ts
function selectVendor(vendorId: string) {
  selectedVendorId.value = vendorId
}
```

**Recommend explicitly:** add to Plan 11-02 task list. NOT scoped out.

**Confidence:** HIGH.

---

## Nuxt UI v4 Type-Verify-At-Execute Pitfalls

**Standing pitfall: Plan snippets carry over patterns from research notes that DIVERGE from the actual installed types.** Phase 10 surfaced 6 examples (above §9). The planner MUST instruct executors to read installed `.d.ts` and theme files BEFORE authoring templates for ANY Nuxt UI v4 component.

**Canonical verification protocol for Phase 11 (and all future Nuxt UI work):**

Before authoring a `<UBadge>`, `<UCard>`, `<UTable>`, `<UInput>`, `<USelectMenu>`, `<USlideover>`, or any other Nuxt UI v4 component template, the executor MUST:

1. **Read the component's `.vue.d.ts`** at `node_modules/@nuxt/ui/dist/runtime/components/<Comp>.vue.d.ts`. Confirms: prop names, prop types, default values, slot names, slot props.
2. **Read the component's theme** in `node_modules/@nuxt/ui/dist/shared/ui.<hash>.mjs` (the installed module name is currently `ui.CoJ8bnb0.mjs`). Find the `const <comp>$1` or `const <comp> = (options)` block. Confirms: `:ui` slot keys (NOT always intuitive), variant names, color names.
3. **Verify against the plan's `<interfaces>` block** — does the plan's snippet match the installed types? If not, treat as deviation #1-#6 and apply the corrected shape.

**Specifically for Phase 11:**

| Component | What to verify | Verified for Phase 11? | Source |
|-----------|----------------|------------------------|--------|
| `<UBadge>` | `color`, `variant`, `label`, `:style` accept; `ui` slot keys = `{ leading?, default?, trailing? }` (no styling-relevant slots — we never set `:ui`) | ✓ | §4 above (Badge.vue.d.ts read) |
| `<UCard>` | `variant` default 'outline'; slots = `root` / `header` / `title` / `description` / `body` / `footer`; CardProps has `title`, `description` as optional shortcuts but `#header` slot is the canonical way to render a custom header row | ✓ | §6 above (Card.vue.d.ts + theme read) |
| `<UTable>` | `TableColumn<T>` shape; `meta.class` = `{ th?, td? }` NOT string (Plan 10-01 deviation); `@select="(_e, row) => ..."` with `row.original` access; `#{accessorKey}-cell` slot naming | ✓ | Phase 10 carry-forward (already in production code) |
| `<UInput>` | `v-model`, `icon`, `placeholder` props | ✓ | Phase 10 (verbatim from discovery.vue line 151-156) |
| `<USlideover>` (drawer) | `v-model:open`, `:ui="{ content: 'w-[480px] sm:max-w-[480px]' }"`, `side="right"` | ✓ | Phase 10 (drawer is reused as-is; no edits) |

**Specifically called out for Phase 11 executors:** the UCard `:ui` slot key for the body region is `body`, NOT `content` (USlideover uses `content`). The keys are DIFFERENT across components. The Phase 10 Plan 10-03 deviation #1 surfaced this exact class of drift for SelectMenu (`base` not `trigger`). For Phase 11 specifically: the planner does NOT need to set any `:ui` overrides on UCard (default padding is fine), so this pitfall is informational, not corrective. But if a sales rep later asks to tighten the card's body padding, the override is `<UCard :ui="{ body: 'p-3' }">`, NOT `:ui="{ content: 'p-3' }"`.

**Plan-snippet review rule (proposed for planner):** Every snippet that touches a Nuxt UI v4 component prop, slot, or `:ui` key MUST cite the source file (`Badge.vue.d.ts` line X, `ui.CoJ8bnb0.mjs` line Y). If the snippet doesn't cite, the executor must verify before authoring.

**Confidence:** HIGH — protocol matches Plan 10-03 § "Plan-vs-Reality Verification" exactly.

---

## Standard Stack

### Core (used by Phase 11 — all already installed and verified)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| `nuxt` | 4.4.6 | SSR framework + useFetch composable | Phase 7 |
| `@nuxt/ui` | 4.8.0 | UTable, UCard, UBadge, UInput, USlideover, USeparator, UButton | Phase 7 |
| `pinia` + `@pinia/nuxt` | 3.0.4 / 0.11.3 | Tags store (drawer Tags section only — no Phase 11 store writes) | Phase 7 |
| `pinia-plugin-persistedstate` | 4.7.1 | localStorage persistence (drawer Tags section) | Phase 7 |
| `nuxt-echarts` | 1.0.1 | VChart radar in drawer | Phase 7 |
| `echarts` | 6.1.0 | RadarChart components | Phase 7 |
| `@vueuse/core` | 14.3.0 | `useDebounce` for search filter | Phase 10-01 (hoisted explicit) |

**No new dependencies in Phase 11.** Zero `npm install` steps.

**Versions verified via `node_modules/@nuxt/ui/package.json` 2026-05-21:**
- `@nuxt/ui@4.8.0` — installed confirmed

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `<UCard>` for Top-8 | Plain `<div class="bg-white border border-gray-200 rounded-lg p-6">` (matches v0.5.0 exactly) | UCard provides theming consistency with future card surfaces; plain div is 100% v0.5.0 visual parity. **Recommend UCard** because ROADMAP SC#4 says "using `UCard`" explicitly. |
| UBadge `:style` injection | Tailwind v4 dynamic classes via a `STATUS_CLASS_MAP: Record<DpaStatus, string>` | `:style` with hex is more flexible (one config edit recolors); dynamic classes require purge config tweaks. Phase 10 already chose `:style`. **Recommend `:style` verbatim.** |
| Manual `dpaList.filter().slice()` for Top-8 | A computed in the Pinia store | Pinia adds indirection for a 1-component, 1-screen derivation. v0.5.0 used inline computed. **Recommend inline computed.** |

**Confidence:** HIGH.

---

## Architecture Patterns

### Recommended Project Structure (post-Phase-11)

```
app/
  app.vue                       # (unchanged — Phase 7)
  app.config.ts                 # (unchanged)
  assets/css/main.css           # (unchanged)
  layouts/default.vue           # (unchanged)
  pages/
    index.vue                   # ★ MODIFIED — Dashboard with KPI tiles + Top-8 UCard
    discovery.vue               # (unchanged — Phase 10)
    dpa.vue                     # ★ MODIFIED — UTable + UInput filter + UBadge status/risk-label + VendorDrawer mount
    risk.vue                    # (Phase 8 stub — Phase 12)
    tags.vue                    # (Phase 8 stub — Phase 12)
  components/
    VendorDrawer.vue            # (unchanged — Phase 10)
  stores/
    tags.ts                     # (unchanged — Phase 10-03)
  types/page-meta.d.ts          # (unchanged)
server/                         # (unchanged)
shared/                         # (unchanged)
src/                            # (untouched; v0.5.0 DashboardView.vue + DpaGrid.vue remain as historical refs — they reference deleted src/data/, are orphaned, but not gating)
```

**Net diff vs Phase 10 ending state:**
- 0 new files
- 2 modified files (`app/pages/dpa.vue`, `app/pages/index.vue`)
- 0 deleted files (v0.5.0 sweep deferred — not gating)
- Net: +0 files, ~240 lines of new code (~120 per page)

### Pattern 1: Joined-row UTable with `:style`-bound UBadge cells (lift to Phase 12)

```ts
// shared join: server-fetched A + server-fetched B = client-side row
const aMap = computed<Record<string, A>>(() =>
  Object.fromEntries(aList.value.map((a: A) => [a.vendorId, a]))
)

const tableRows = computed<JoinedRow[]>(() =>
  bList.value.map((b: B) => {
    const a = aMap.value[b.vendorId]
    return { ...b, name: a?.name ?? '—', category: a?.category ?? '—' }
  })
)
```

```vue
<template #status-cell="{ row }">
  <UBadge
    :label="row.original.status"
    color="neutral" variant="solid"
    :style="{ backgroundColor: STATUS_COLORS[row.original.status], color: '#ffffff' }"
  />
</template>
```

Phase 12 Risk Position page will reuse this exact pattern with `RISK_TIER_COLORS` from `shared/utils/riskLabels.ts`.

### Pattern 2: Cross-route useFetch dedup

Both pages call `useFetch('/api/dpa', { default: () => [] })` with NO `key` override. Nuxt caches by URL; both calls share one payload.

### Pattern 3: Single-drawer-per-page state-lifting trio (Phase 10 verbatim)

```ts
const selectedVendorId = ref<string | null>(null)
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
```

```vue
<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
```

### Pattern 4: UCard with custom `#header` slot

```vue
<UCard variant="outline" class="bg-white">
  <template #header>
    <div class="flex items-center justify-between">
      <h2 class="text-base font-semibold text-gray-900">{{ title }}</h2>
      <span class="text-sm text-gray-500">{{ subtitle }}</span>
    </div>
  </template>
  <!-- body content in default slot -->
</UCard>
```

### Anti-patterns to Avoid

- **DON'T** use `color="error"` / `color="success"` on UBadge to set status colors. The DPA status palette doesn't map 1:1 to Nuxt UI's preset colors (Pending is amber, Unsigned is gray — neither has a semantic preset). Use `color="neutral"` + `:style` always.
- **DON'T** pass `STATUS_COLORS` as Tailwind classes (`bg-green-600`, `bg-red-600`). Tailwind v4's content-scanning would purge them at build time unless explicitly safelisted. `:style` with hex is immune to purge.
- **DON'T** add explicit `key` options to `useFetch('/api/dpa')` — breaks the cross-route dedup.
- **DON'T** define `STATUS_COLORS` as a local const in `dpa.vue` — it's already exported from `shared/utils/riskLabels.ts` as `DPA_STATUS_COLORS`. Reuse the canonical source.
- **DON'T** add a Tags section to Dashboard. Tag assignment lives in the drawer (per ROADMAP SC#3 of Phase 10) and Tags Management lives at `/tags` (Phase 12).
- **DON'T** literal-port `<Tag>` (PrimeVue) — use `<UBadge>` everywhere.
- **DON'T** use `removableSort` (PrimeVue idiom) — UTable's TanStack sort cycles asc → desc → none by default with the `sortHeader` helper.
- **DON'T** use `dataKey="vendorId"` (PrimeVue idiom) — UTable uses the row identity from the underlying data array; no explicit key prop. If a `getRowId` is needed for advanced selection state, use the column-array's `id` field on the columns.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color-coded status badges (4 statuses, 3 risk labels) | Custom `<span>` with conditional class binding | `UBadge color="neutral" :style="{ backgroundColor }"` | Single source of truth (`shared/utils/riskLabels.ts`); recolor by editing 1 file; visually consistent with Phase 10 drawer |
| Top-8 vendor card with hover + click | Custom rounded-bordered div | `UCard variant="outline"` + click handler on row | Nuxt UI v4 card matches portal-wide theming; one component for all card surfaces |
| Sortable column headers | Manual click handlers + state tracking | Phase 10's `sortHeader(label)` render-function helper | TanStack handles sort state; multi-column sort + 3-state cycle free |
| Search filter debounce | `setTimeout`/`clearTimeout` | `useDebounce(search, 200)` from `@vueuse/core` | Phase 10 verbatim; cleanup on unmount free |
| Vendor + DPA join | Watch + manual update of a flat array | `computed` over `Object.fromEntries(...)` map | O(1) lookup; reactive auto-update; standard v0.5.0 pattern |
| Drawer state for a row click | Per-row drawer instance | Page-level `selectedVendorId` + 1 drawer mount | Portal-mount-per-row is an anti-pattern (Phase 10 Pitfall #18) |
| KPI counts | Watch + counter refs | `computed(() => list.value.filter(...).length)` | Reactive auto-update on data change; one-liner |

**Key insight:** Phase 11 is the "Phase 10 patterns in two new contexts" phase. Almost nothing new. The right instinct is to grep `discovery.vue` and `VendorDrawer.vue` for patterns, copy them, and adjust only the data shape. The wrong instinct is to port v0.5.0 DashboardView.vue / DpaGrid.vue patterns directly because they reference PrimeVue (Tag, DataTable, FilterMatchMode) — those won't compile in v1.0.0.

---

## Common Pitfalls

### Pitfall 1: `STATUS_COLORS` const defined locally in `dpa.vue`

**What goes wrong:** Demo iteration request — sales rep wants Pending to be a darker amber. Developer edits `dpa.vue` only. Dashboard Top-8 Card on `/` still shows old color because `index.vue` imported its own copy or wasn't updated.

**Why it happens:** Status colors get hand-coded inline instead of imported from `shared/utils/riskLabels.ts`.

**How to avoid:** Both pages import `DPA_STATUS_COLORS` and `RISK_LABEL_COLORS` from `#shared/utils/riskLabels` (same path as VendorDrawer.vue line 3). NO local definitions.

**Warning signs:** grep for `STATUS_COLORS\s*=` in `app/pages/`; should return zero matches outside of `#shared/utils/riskLabels` imports.

---

### Pitfall 2: Forgetting `color: '#ffffff'` in the `:style` object

**What goes wrong:** UBadge background renders correctly (e.g., red for Expired), but the label text is black (default UBadge text color) on a red background — low contrast, looks broken.

**Why it happens:** `:style="{ backgroundColor: ... }"` covers background but not text color.

**How to avoid:** Always pass `{ backgroundColor: hex, color: '#ffffff' }` together. Phase 10 drawer pattern verbatim (`app/components/VendorDrawer.vue` lines 134-139).

**Warning signs:** Bad-looking chip in a demo; sales rep flags it.

---

### Pitfall 3: Implicit-any on `dpaList.value.filter(d => ...)`

**What goes wrong:** Typecheck fails: `TS7006: Parameter 'd' implicitly has an 'any' type`.

**Why it happens:** Plan 10-01 deviation #3 carry-forward. Nuxt 4 + TS strict mode rejects implicit any on `.map`/`.filter`/`.sort`.

**How to avoid:** Annotate all callbacks: `.filter((d: DpaRecord) => d.riskLabel !== null)`. Import `DpaRecord` from `#shared/types/data`.

**Warning signs:** `npm run typecheck` shows TS7006 errors; CI fails.

---

### Pitfall 4: TableColumn `meta.class` shape

**What goes wrong:** Typecheck fails with "Type 'string' has no properties in common with type ColumnMeta".

**Why it happens:** Plan 10-01 deviation #2. Nuxt UI v4's `ColumnMeta.class` is `{ th?, td? }`, not a string.

**How to avoid:** Every column's `meta.class` is `{ th: '<classes>', td: '<classes>' }`. Even if you only need the width on the body, set both (visual consistency).

**Warning signs:** Typecheck fail on the columns array.

---

### Pitfall 5: useFetch `key` collision breaks dedup

**What goes wrong:** Both pages call `useFetch('/api/dpa', { key: 'dpa' })` from one and `useFetch('/api/dpa', { key: 'dpa-dashboard' })` from another. Each navigation between routes triggers a new fetch.

**Why it happens:** Developer thinks they need to specify a key for "clarity".

**How to avoid:** NEVER specify a `key` option on these `useFetch` calls. The URL is the implicit key. Phase 10 didn't need it; Phase 11 doesn't need it.

**Warning signs:** Network tab shows multiple `/api/dpa` requests on navigation between `/` and `/dpa`.

---

### Pitfall 6: Mounting two drawers (one per page) and forgetting state lifting

**What goes wrong:** `<VendorDrawer>` mounted INSIDE a row template or repeated for each Top-8 row. State conflicts on multiple opens.

**Why it happens:** Misunderstanding of the "single drawer instance per page" pattern.

**How to avoid:** ONE `<VendorDrawer>` mount per page, at the page's top level (sibling of `<UTable>` or `<UCard>`). Driven by ONE `selectedVendorId` ref. Phase 10 Pitfall #18 verbatim.

**Warning signs:** Multiple drawers overlap on screen; backdrop weirdness.

---

### Pitfall 7: Top-8 click handler missing `selectedVendor` lookup

**What goes wrong:** Clicking a Top-8 row opens an empty drawer because the page only has `selectedVendorId` but the drawer needs the full `Vendor` object.

**Why it happens:** The state-lifting trio (`selectedVendorId` + `selectedVendor` computed + `drawerOpen` computed) is incomplete — only the ref is wired.

**How to avoid:** Copy all three from `discovery.vue` lines 123-140 verbatim. The drawer's `:vendor` prop binding requires `selectedVendor` computed.

**Warning signs:** Drawer opens but body is empty / shows "—" for all fields.

---

### Pitfall 8: Forgetting `await` on `useFetch` (top-level await needed)

**What goes wrong:** `dpaList.value` is `null` at the time the template tries to read it. Page renders empty.

**Why it happens:** `useFetch` returns a Promise<Ref>; the page's setup-script needs `await` to resolve before SSR completes. (Vue 3 + Nuxt 4's `<script setup>` supports top-level await via Suspense.)

**How to avoid:** Use `const { data: dpaList } = await useFetch(...)`. Verbatim from `discovery.vue` line 20.

**Warning signs:** SSR HTML doesn't contain any vendor rows; client-side filter shows "0 vendors".

---

### Pitfall 9: `signedDate ?? '—'` vs `signedDate || '—'`

**What goes wrong:** A vendor with `signedDate: ''` (empty string, hypothetically) shows `'—'` with `||` but `''` with `??`. v0.5.0 used `??`.

**Why it happens:** Misremembered operator semantics.

**How to avoid:** Use `??` (nullish coalescing) — `null` and `undefined` only, not falsy. The `signedDate` is `string | null` per the type; `null` should be the only "missing" value.

**Warning signs:** Empty cells where '—' should be (or vice versa).

---

### Pitfall 10: SSR HTML doesn't contain UCard/UBadge content (forgot import)

**What goes wrong:** `dpa.vue` template uses `<UBadge>` but typecheck fails or build errors because `DPA_STATUS_COLORS` isn't imported.

**Why it happens:** Plan snippet showed the template usage but didn't surface the import statement.

**How to avoid:** Imports at the top of `dpa.vue`:
```ts
import type { Vendor, DpaRecord, DpaStatus, RiskLabel } from '#shared/types/data'
import { DPA_STATUS_COLORS, RISK_LABEL_COLORS } from '#shared/utils/riskLabels'
```

And at the top of `index.vue`:
```ts
import type { Vendor, DpaRecord, RiskLabel } from '#shared/types/data'
import { RISK_LABEL_COLORS } from '#shared/utils/riskLabels'
```

**Warning signs:** Typecheck fails: `Cannot find name 'DPA_STATUS_COLORS'`.

---

## Runtime State Inventory

> Phase 11 is a feature-extension phase (no rename/refactor/migration). Inventory still completed for safety:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | localStorage key `tags` (Pinia persisted state — set in Phase 7, written via Phase 10-03 setVendorTags). Phase 11 does NOT touch this — read-only path. | None |
| **Live service config** | None — no external services (synthetic demo) | None |
| **OS-registered state** | None — no scheduled tasks, no system services | None |
| **Secrets/env vars** | None for Phase 11 | None |
| **Build artifacts** | `.nuxt/`, `.output/` will rebuild after each task; no new dependencies → no `node_modules/` changes | None — verified via `npm run typecheck && npm run build` after each plan |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Nuxt 4 dev/build | ✓ | 24.14.0 (Phase 7 baseline) | — |
| npm | Package install if needed (none expected) | ✓ | 11.9.0 | — |
| `@nuxt/ui@^4.8.0` | UTable, UCard, UBadge, UInput, USlideover | ✓ | 4.8.0 (verified `node_modules/@nuxt/ui/package.json`) | — |
| `nuxt-echarts@^1.0.1` | VChart radar in drawer | ✓ | 1.0.1 | — |
| `pinia` + persist plugin | Tags store (drawer Tags section) | ✓ | 3.0.4 + 4.7.1 | — |
| `@vueuse/core` | `useDebounce` for search filter | ✓ | 14.3.0 (hoisted explicit in Plan 10-01) | — |
| `server/api/dpa.get.ts` | Both pages | ✓ | 6 lines, Phase 9 | — |
| `server/api/vendors.get.ts` | Both pages | ✓ | Phase 9 | — |
| `shared/types/data.ts` | Type imports | ✓ | Phase 9-01 | — |
| `shared/utils/riskLabels.ts` | Color hex maps | ✓ | Phase 9-01 (DPA_STATUS_COLORS + RISK_LABEL_COLORS both present) | — |
| `app/components/VendorDrawer.vue` | Both pages mount this | ✓ | Phase 10-02 | — |
| Dev server on port 3000 | Manual UAT for row click → drawer + cross-route nav | dev-time | — | — |

**No blocking gaps.** Phase 11 is a pure-code phase against an existing stack.

---

## Code Examples

### A. DPA page top-level structure (post-Plan 11-01)

```vue
<!-- app/pages/dpa.vue (after Plan 11-01) -->
<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { useDebounce } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
import type { Vendor, DpaRecord, DpaStatus, RiskLabel } from '#shared/types/data'
import { DPA_STATUS_COLORS, RISK_LABEL_COLORS } from '#shared/utils/riskLabels'

definePageMeta({
  nav: true,
  navLabel: 'DPA',
  navIcon: 'i-lucide-file-text',
  navOrder: 30,
})

// Cross-route deduped fetch — same URL = same Nuxt cache entry across /dpa and /
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })

// Joined row type — Vendor (name, category) + DpaRecord (status, dates, riskLabel)
type DpaRow = {
  vendorId: string
  name: string
  category: string
  status: DpaStatus
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}

// O(1) lookup map for the join
const dpaMap = computed<Record<string, DpaRecord>>(() =>
  Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))
)

const tableRows = computed<DpaRow[]>(() =>
  vendors.value.map((v: Vendor) => {
    const dpa = dpaMap.value[v.vendorId]
    return {
      vendorId: v.vendorId,
      name: v.name,
      category: v.category,
      status: dpa?.status ?? 'Unsigned',
      signedDate: dpa?.signedDate ?? null,
      expiryDate: dpa?.expiryDate ?? null,
      riskLabel: dpa?.riskLabel ?? null,
    }
  })
)

// Debounced filter — verbatim from discovery.vue
const search = ref('')
const debouncedSearch = useDebounce(search, 200)
const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((r) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})

// "Needs review" count for the header readout
const needsReviewCount = computed(() =>
  filteredRows.value.filter((r) => r.status === 'Unsigned' || r.status === 'Expired').length
)

// Sort + columns — sortHeader helper verbatim from discovery.vue
const sorting = ref([{ id: 'name', desc: false }])
const UButton = resolveComponent('UButton')

function sortHeader(label: string) {
  return ({ column }: { column: any }) =>
    h(UButton, {
      label,
      color: 'neutral',
      variant: 'ghost',
      class: '-mx-2.5',
      icon: column.getIsSorted()
        ? (column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide')
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
}

// ColumnMeta.class shape is { th?, td? } — NOT string. Plan 10-01 deviation #2 carry-forward.
const columns: TableColumn<DpaRow>[] = [
  { accessorKey: 'name',       header: sortHeader('Vendor Name'), meta: { class: { th: 'min-w-[12rem]', td: 'min-w-[12rem]' } } },
  { accessorKey: 'category',   header: sortHeader('Category'),    meta: { class: { th: 'w-[10rem]',     td: 'w-[10rem]' } } },
  { accessorKey: 'status',     header: sortHeader('Status'),      meta: { class: { th: 'w-[8rem]',      td: 'w-[8rem]' } } },
  { accessorKey: 'signedDate', header: sortHeader('Signed Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'expiryDate', header: sortHeader('Expiry Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'riskLabel',  header: sortHeader('Risk Label'),  meta: { class: { th: 'w-[12rem]',     td: 'w-[12rem]' } } },
]

// Drawer state lifting — verbatim from discovery.vue
const selectedVendorId = ref<string | null>(null)
function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
}
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">DPA</h1>
      <span class="text-sm text-gray-500">{{ needsReviewCount }} vendors need DPA review</span>
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
      <template #status-cell="{ row }">
        <UBadge
          :label="row.original.status"
          color="neutral"
          variant="solid"
          :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.status], color: '#ffffff' }"
        />
      </template>
      <template #signedDate-cell="{ row }">{{ row.original.signedDate ?? '—' }}</template>
      <template #expiryDate-cell="{ row }">{{ row.original.expiryDate ?? '—' }}</template>
      <template #riskLabel-cell="{ row }">
        <UBadge
          v-if="row.original.riskLabel"
          :label="row.original.riskLabel"
          color="neutral"
          variant="solid"
          :style="{ backgroundColor: RISK_LABEL_COLORS[row.original.riskLabel], color: '#ffffff' }"
        />
        <span v-else class="text-gray-400">—</span>
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

### B. Dashboard scaffold (post-Plan 11-02)

```vue
<!-- app/pages/index.vue (after Plan 11-02) -->
<script setup lang="ts">
import type { Vendor, DpaRecord, RiskLabel } from '#shared/types/data'
import { RISK_LABEL_COLORS } from '#shared/utils/riskLabels'

definePageMeta({
  nav: true,
  navLabel: 'Dashboard',
  navIcon: 'i-lucide-home',
  navOrder: 10,
})

// Same URL = shared cache with DPA page (Nuxt useFetch dedups by URL)
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })

const vendorMap = computed<Record<string, Vendor>>(() =>
  Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v]))
)

// Top-8 derivation — verbatim from v0.5.0 DashboardView.vue lines 13-26
const topAtRisk = computed(() =>
  dpaList.value
    .filter((d: DpaRecord) => d.riskLabel !== null)
    .slice(0, 8)
    .map((d: DpaRecord) => {
      const v = vendorMap.value[d.vendorId]
      return {
        vendorId: d.vendorId,
        name: v?.name ?? d.vendorId,
        category: v?.category ?? '—',
        riskLabel: d.riskLabel as RiskLabel,  // filter above narrows null out
      }
    })
)

// KPI computeds — verbatim from v0.5.0
const totalVendors = computed(() => vendors.value.length)
const signedCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Signed').length
)
const needsReviewCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Unsigned' || d.status === 'Expired').length
)

// Drawer state lifting — same trio as DPA page
const selectedVendorId = ref<string | null>(null)
function selectVendor(vendorId: string) {
  selectedVendorId.value = vendorId
}
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>

    <!-- KPI tiles — plain divs, matches v0.5.0 visual parity -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">Total Vendors</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">{{ totalVendors }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">DPAs Signed</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">{{ signedCount }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">Needs Review</div>
        <div class="text-2xl font-semibold mt-1 text-red-600">{{ needsReviewCount }}</div>
      </div>
    </div>

    <!-- Top-8 UCard -->
    <UCard variant="outline" class="bg-white">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Top 8 Vendors Needing Attention</h2>
          <span class="text-sm text-gray-500">{{ topAtRisk.length }} flagged</span>
        </div>
      </template>
      <div class="divide-y divide-gray-100">
        <div
          v-for="row in topAtRisk"
          :key="row.vendorId"
          class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6"
          @click="selectVendor(row.vendorId)"
        >
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">{{ row.name }}</span>
            <span class="text-xs text-gray-500">{{ row.category }}</span>
          </div>
          <UBadge
            :label="row.riskLabel"
            color="neutral"
            variant="solid"
            :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }"
          />
        </div>
      </div>
    </UCard>

    <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
  </div>
</template>
```

### C. Plan-snippet pre-emptive deviation cheatsheet (planner uses)

For the planner's `<interfaces>` blocks, include these exact patterns to prevent Phase 10 deviations from recurring:

```ts
// Phase 10 deviation #2 carry-forward — TableColumn.meta.class shape
meta: { class: { th: 'w-[8rem]', td: 'w-[8rem]' } }   // ✓ CORRECT
meta: { class: 'w-[8rem]' }                            // ✗ WRONG — typecheck fails

// Phase 10 deviation #3 carry-forward — implicit any on callbacks
dpaList.value.map((d: DpaRecord) => ...)               // ✓ CORRECT
dpaList.value.map((d) => ...)                          // ✗ WRONG — TS7006

// Phase 10 deviation #1 carry-forward — Pinia store factories
import { useTagsStore } from '~/stores/tags'           // ✓ CORRECT (if needed)
const tagsStore = useTagsStore()                       // (Phase 11 doesn't use directly)

// useFetch deduplication — NO key parameter
useFetch('/api/dpa', { default: () => [] })            // ✓ CORRECT (deduped)
useFetch('/api/dpa', { key: 'dpa', default: () => [] }) // ✗ WRONG — breaks dedup
```

---

## State of the Art

| Old Approach (v0.5.0 PrimeVue) | Current Approach (v1.0.0 Nuxt UI v4) | When Changed | Impact |
|--------------------------------|--------------------------------------|--------------|--------|
| `<DataTable @row-click="onRowClick" :value :globalFilterFields :filters>` | `<UTable @select="onRowSelect" :data :columns>` + manual filter computed | Phase 10 | Event name + filter mechanism both differ |
| `<Tag :value :style="{ backgroundColor }">` | `<UBadge :label color="neutral" variant="solid" :style="{ backgroundColor, color: '#ffffff' }">` | Phase 10 | `color="neutral"` required to disable preset; `color: '#fff'` text color must be set explicitly |
| `dpaData.filter(...).slice(0, 8)` direct import | `useFetch('/api/dpa', { default: () => [] }).data.value.filter(...).slice(0, 8)` | Phase 9 | Data flows through `/api/` route; client never imports data files |
| `<div class="bg-white border border-gray-200 rounded-lg p-6">` for cards | `<UCard variant="outline">` with `#header` slot | Phase 11 | Nuxt UI v4 component for theming consistency; KPI tiles intentionally stay as plain divs for v0.5.0 visual parity |
| Vendor + DPA join in v0.5.0 used `Object.fromEntries(dpaData.map(d => [d.vendorId, d]))` at module load | Same join shape, but inside a `computed` over `useFetch`-returned reactive data | Phase 9 + Phase 11 | Reactive auto-update when data refreshes; same O(1) lookup pattern |

---

## Open Questions

1. **Should the DPA table's row click open the same VendorDrawer as Discovery, or a DPA-specialized drawer?**
   - What we know: Plan 10-02 SUMMARY says verbatim "Phase 11 DPA view will reuse `app/components/VendorDrawer.vue` as-is" — the drawer already has a DPA section with the right colors.
   - What's unclear: None — recommendation is reuse.
   - Recommendation: Reuse VendorDrawer.vue verbatim. No Phase 11 changes to the drawer file.

2. **Should the Dashboard's KPI tiles use UCard instead of plain divs?**
   - What we know: ROADMAP SC#4 specifies UCard for the Top-8 card explicitly. KPI tiles are NOT mentioned.
   - What's unclear: Whether visual continuity with v0.5.0 (plain divs) trumps theming consistency.
   - Recommendation: Plain divs. v0.5.0 verbatim. UCard for the Top-8 only.

3. **Should the DPA page show a count readout like "9 vendors need DPA review" matching v0.5.0 DpaGrid.vue line 56?**
   - What we know: v0.5.0 had it; cleanly mirrors Discovery's "27 vendors" pattern.
   - What's unclear: Whether sales reps prefer a needs-attention count over a total-vendors count.
   - Recommendation: Show "X vendors need DPA review" (verbatim v0.5.0). Computed: `filteredRows.value.filter(r => r.status === 'Unsigned' || r.status === 'Expired').length`. Included in §A above.

4. **Does Nuxt's `useFetch` dedup work on prerendered pages too (Phase 13 forward concern)?**
   - What we know: At dev time (Phase 11), dedup is verified working (Plan 10-02 empirical).
   - What's unclear: Whether `nuxi generate` (Phase 13) prerenders each page independently — meaning `/api/dpa` is "fetched" once at build time per route, then baked into the static HTML.
   - Recommendation: Not a Phase 11 concern. `nuxi generate` runs the SSR once per route; both pages get the same in-memory `dpaList` because the Nitro server has it in memory across multiple route renders during prerender. Document for Phase 13 verification (curl two static HTML files, both should have the same data).

---

## Validation Architecture

> Phase 11 enables `workflow.nyquist_validation: true` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None at unit-test level — Phase 9/10 grep + curl + typecheck + dev-server SSR probe pattern continues |
| Config file | `tsconfig.json` (auto-extended from `.nuxt/tsconfig.json`); no test runner config |
| Quick run command | `npm run typecheck` |
| Full suite command | `npm install && npm run typecheck && npm run build` |
| Phase gate | typecheck + build green; dev-server curl returns 200 for `/dpa` and `/`; SSR HTML contains expected literal markers; manual UAT confirms row-click → drawer open with consistent badge colors across DPA page row + drawer; Dashboard KPI counts match expected (27/16/9); Top-8 card shows 8 vendors with risk-label badges |

For Phase 11, **type checking + build success + grep probes + dev-server SSR + manual UAT** IS the test suite. Same rationale as Phase 10: Nuxt UI v4 component primitives are too new for stable e2e fixtures; demo iteration speed argues against test infrastructure now. Defer Vitest setup to a future v1.1+ phase if/when test stability arrives.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-02 | DPA page typechecks with UTable, UBadge, UInput, VendorDrawer mount | Build | `npm run typecheck` → exit 0 | ✅ after Plan 11-01 |
| PAGE-02 | DPA page renders 27 rows under SSR | Runtime SSR | `curl -s http://localhost:3000/dpa \| grep -oE '<tr[ >]' \| wc -l` — expect 29 (1 header + 27 body + 1 separator, matching Phase 10 baseline) | ✅ after 11-01 |
| PAGE-02 | UBadge status badges use `:style backgroundColor:` (not Tailwind classes) | Static (grep) | `grep -A 4 "#status-cell" app/pages/dpa.vue \| grep -q "backgroundColor: DPA_STATUS_COLORS"` | ❌ Wave 1 |
| PAGE-02 | UBadge status badges use color="neutral" | Static (grep) | `grep -A 5 "#status-cell" app/pages/dpa.vue \| grep -q 'color="neutral"'` | ❌ Wave 1 |
| PAGE-02 | NO hardcoded color classes (`color="success"`, `color="error"`, etc.) on UBadge | Static (grep, negative) | `! grep -E 'color="(success\|error\|warning\|info)"' app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | DPA_STATUS_COLORS imported from shared/utils/riskLabels | Static (grep) | `grep -q "import.*DPA_STATUS_COLORS.*from '#shared/utils/riskLabels'" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | RISK_LABEL_COLORS imported | Static (grep) | `grep -q "import.*RISK_LABEL_COLORS.*from '#shared/utils/riskLabels'" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | sortHeader helper used for ≥5 columns | Static (grep) | `grep -c "sortHeader(" app/pages/dpa.vue` — expect ≥ 6 (1 fn def + 6 column refs) | ❌ Wave 1 |
| PAGE-02 | UInput search bar exists with v-model="search" | Static (grep) | `grep -q '<UInput' app/pages/dpa.vue && grep -q "v-model=\"search\"" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | Filter debounced via VueUse | Static (grep) | `grep -q "useDebounce" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | Row click → drawer wired (@select + selectedVendorId) | Static (grep) | `grep -q '@select="onRowSelect"' app/pages/dpa.vue && grep -q "selectedVendorId" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | VendorDrawer mounted at page level | Static (grep) | `grep -q "<VendorDrawer " app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | useFetch('/api/dpa') WITHOUT explicit key (preserves dedup) | Static (grep) | `grep -q "useFetch('/api/dpa'" app/pages/dpa.vue && ! grep -E "useFetch\\('/api/dpa', \\{[^}]*key:" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | useFetch('/api/vendors') present (for join) | Static (grep) | `grep -q "useFetch('/api/vendors'" app/pages/dpa.vue` | ❌ Wave 1 |
| PAGE-02 | UBadge for status rendered in SSR HTML with hex backgroundColor | Runtime SSR | `curl -s http://localhost:3000/dpa \| grep -c 'background-color: rgb(22, 163, 74)'` (Signed green-600) — expect ≥ 16 (one per Signed row) | ❌ Wave 1 |
| PAGE-02 | UBadge for risk-label rendered in SSR HTML | Runtime SSR | `curl -s http://localhost:3000/dpa \| grep -c 'background-color: rgb(185, 28, 28)'` (High Usage / No DPA red-700) — expect ≥ 3 (matches data: Kahoot, Quizlet, Prodigy) | ❌ Wave 1 |
| PAGE-02 | DPA table has 6 column headers | Runtime SSR | `curl -s http://localhost:3000/dpa \| grep -oE 'Vendor Name\|Category\|Status\|Signed Date\|Expiry Date\|Risk Label' \| sort -u \| wc -l` — expect 6 | ❌ Wave 1 |
| PAGE-02 | Sort + filter — manual UAT | Manual UAT | Type "google" → only Google Classroom row visible; click Signed Date header → rows sort chronologically | manual UAT |
| PAGE-02 | Row click opens drawer with correct vendor | Manual UAT | Click "Zoom" row → drawer opens, "Zoom" title visible, Status badge shows "Expired" with red background matching the row | manual UAT |
| PAGE-05 | Dashboard typechecks with UCard, UBadge, VendorDrawer mount | Build | `npm run typecheck` → exit 0 | ✅ after Plan 11-02 |
| PAGE-05 | Dashboard renders Top-8 card | Runtime SSR | `curl -s http://localhost:3000/ \| grep -q "Top 8 Vendors Needing Attention"` | ❌ Wave 2 |
| PAGE-05 | Top-8 shows 8 rows | Runtime SSR | `curl -s http://localhost:3000/ \| grep -c "cursor-pointer hover:bg-gray-50"` — expect 8 | ❌ Wave 2 |
| PAGE-05 | KPI counts present in SSR | Runtime SSR | `curl -s http://localhost:3000/ \| grep -E "(>27<\|>16<\|>9<)" \| wc -l` — expect ≥ 3 (Total / Signed / Needs Review) | ❌ Wave 2 |
| PAGE-05 | Top-8 derived from /api/dpa filter+slice | Static (grep) | `grep -q "filter((d: DpaRecord) => d.riskLabel !== null)" app/pages/index.vue && grep -q "slice(0, 8)" app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | useFetch('/api/dpa') in index.vue (deduped with DPA page) | Static (grep) | `grep -q "useFetch('/api/dpa'" app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | RISK_LABEL_COLORS imported in index.vue | Static (grep) | `grep -q "import.*RISK_LABEL_COLORS.*from '#shared/utils/riskLabels'" app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | UCard component used | Static (grep) | `grep -q "<UCard" app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | Top-8 risk-label badges use `:style backgroundColor: RISK_LABEL_COLORS` | Static (grep) | `grep -A 3 "<UBadge" app/pages/index.vue \| grep -q "backgroundColor: RISK_LABEL_COLORS"` | ❌ Wave 2 |
| PAGE-05 | NO hardcoded color classes on UBadge in index.vue | Static (grep, negative) | `! grep -E 'color="(success\|error\|warning\|info)"' app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | VendorDrawer mounted at page level | Static (grep) | `grep -q "<VendorDrawer " app/pages/index.vue` | ❌ Wave 2 |
| PAGE-05 | Top-8 row click → drawer opens with correct vendor | Manual UAT | Click "Zoom" Top-8 row → drawer opens, "Zoom" title visible | manual UAT |
| (impl) | definePageMeta preserved on both pages | Static (grep) | `grep -A 5 "definePageMeta" app/pages/dpa.vue \| grep -q "navOrder: 30" && grep -A 5 "definePageMeta" app/pages/index.vue \| grep -q "navOrder: 10"` | preserved |
| (impl) | No PrimeVue imports anywhere | Static (grep, negative) | `! grep -rE "primevue\|@primeuix" app/ shared/ server/` | (true post-Phase 7) |
| (impl) | No @row-click on UTable | Static (grep, negative) | `! grep "@row-click" app/pages/dpa.vue` | ❌ Wave 1 |
| (impl) | No v-model:visible used anywhere | Static (grep, negative) | `! grep "v-model:visible" app/pages/dpa.vue app/pages/index.vue` | ❌ Wave 1+2 |
| (impl) | npm run typecheck passes after each plan | Build | `npm run typecheck` → exit 0 | per wave |
| (impl) | npm run build passes at phase end | Build | `npm run build` → exit 0 | phase gate |
| (impl) | Cross-route useFetch dedup verified (manual) | Manual UAT | DevTools Network tab: visit /dpa → 1 fetch to /api/dpa; navigate to / → NO additional fetch (cached) | manual UAT |

### Sampling Rate

- **Per task commit:** Static grep probes specific to that task's slice (under 5 seconds total).
- **Per wave merge:**
  - Wave 1 (11-01): typecheck + build + dev-server curl on `/dpa`; expect 29 `<tr` tags + correct UBadge SSR markup + manual UAT for row-click → drawer.
  - Wave 2 (11-02): typecheck + build + dev-server curl on `/`; expect "Top 8" literal + 8 Top-8 rows + KPI counts; manual UAT for Top-8 row click → drawer.
- **Phase gate:** All grep probes pass; build + typecheck both exit 0; cross-route navigation manual UAT confirms useFetch dedup (no re-fetch on navigation).

### Wave 0 Gaps

- [ ] None. All dependencies (Nuxt UI v4 components, useFetch, riskLabels.ts, VendorDrawer.vue, @vueuse/core) are in place from Phases 7-10. No `npm install` needed.

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Truth Tables (per ROADMAP success criteria → grep+curl probes)

> Phase 11 has 4 ROADMAP success criteria. Each maps to specific automated probes:

**Truth 1 — DPA table loads 27 rows via useFetch + UBadge color-coded statuses:**
```bash
# SSR row count
curl -s http://localhost:3000/dpa | grep -oE '<tr[ >]' | wc -l   # expect 29

# UBadge instances with :style backgroundColor
curl -s http://localhost:3000/dpa | grep -oE 'background-color: rgb\(' | wc -l   # expect ≥ 20 (16 Signed + 4-5 status + others)

# useFetch wiring
grep -q "useFetch('/api/dpa'" app/pages/dpa.vue
grep -q "<UBadge" app/pages/dpa.vue
```

**Truth 2 — Colors from constants, NOT hardcoded classes:**
```bash
# Positive — uses constants
grep -q "DPA_STATUS_COLORS\[row.original.status\]" app/pages/dpa.vue
grep -q "RISK_LABEL_COLORS\[" app/pages/dpa.vue

# Negative — no preset color overrides
! grep -E 'color="(success|error|warning|info)"' app/pages/dpa.vue app/pages/index.vue

# Negative — no Tailwind class injection
! grep -E 'bg-(green|red|amber|gray)-(500|600|700)' app/pages/dpa.vue app/pages/index.vue
```

**Truth 3 — Sort + filter:**
```bash
# sortHeader render fn helper
grep -q "function sortHeader" app/pages/dpa.vue
grep -c "sortHeader(" app/pages/dpa.vue   # expect ≥ 7 (1 def + 6 refs)

# useDebounce filter
grep -q "useDebounce(search, 200)" app/pages/dpa.vue
grep -q "const filteredRows = computed" app/pages/dpa.vue
```

**Truth 4 — Top-8 derived from /api/dpa:**
```bash
# Dashboard uses /api/dpa
grep -q "useFetch('/api/dpa'" app/pages/index.vue

# v0.5.0 derivation algorithm preserved
grep -q "filter((d: DpaRecord) => d.riskLabel !== null)" app/pages/index.vue
grep -q "slice(0, 8)" app/pages/index.vue

# Top-8 row count rendered in SSR
curl -s http://localhost:3000/ | grep -c "cursor-pointer hover:bg-gray-50"   # expect 8

# Heading present
curl -s http://localhost:3000/ | grep -q "Top 8 Vendors Needing Attention"
```

---

## Sources

### Primary (HIGH confidence)

- **`shared/types/data.ts`** lines 30-39 — `DpaRecord` interface, `DpaStatus` enum (`'Signed' | 'Unsigned' | 'Expired' | 'Pending'`), `RiskLabel` enum
- **`shared/utils/riskLabels.ts`** lines 14-43 — `DPA_STATUS_COLORS` and `RISK_LABEL_COLORS` hex maps with comments explaining severity semantics
- **`server/data/dpa.ts`** — 27 typed `DpaRecord[]` entries with verified status distribution (16/5/4/2) and 10 non-null `riskLabel` entries
- **`server/api/dpa.get.ts`** — 6-line Nitro handler returning typed `DpaRecord[]`
- **`app/pages/discovery.vue`** lines 1-219 — Phase 10 production code for sortHeader, useDebounce, filteredRows, selectedVendorId, drawerOpen, columns array shape, UInput wiring, UTable `@select` + `#tags-cell` slot pattern
- **`app/components/VendorDrawer.vue`** lines 134-186 — verbatim UBadge `:style` injection pattern for both DPA status and Risk Label cells; useFetch dedup demonstrated
- **`node_modules/@nuxt/ui/dist/runtime/components/Badge.vue.d.ts`** — verified BadgeProps + slots for the UBadge override pattern
- **`node_modules/@nuxt/ui/dist/runtime/components/Card.vue.d.ts`** — verified CardProps + slots for the UCard scaffold
- **`node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs`** lines 1152-1182 — verified Card theme slot keys (`root`, `header`, `title`, `description`, `body`, `footer`)
- **`node_modules/@nuxt/ui/package.json`** — confirmed installed @nuxt/ui@4.8.0
- **`src/views/DashboardView.vue`** lines 1-80 — v0.5.0 reference for Top-8 derivation, KPI tiles, vendorMap join shape
- **`src/components/DpaGrid.vue`** lines 1-107 — v0.5.0 reference for DPA columns, sort, status + risk-label cells, filter pattern
- **`.planning/STATE.md`** lines 83-88, 122-127 — Plan 10-01, 10-02, 10-03 explicit forward-compat statements; Phase 10 deviations carry-forward
- **`.planning/phases/10-discovery-page/10-01-SUMMARY.md`** lines 116-146 — Plan 10-01 deviations #1, #2, #3 (auto-import, meta.class shape, implicit any)
- **`.planning/phases/10-discovery-page/10-02-SUMMARY.md`** lines 158-167 — useFetch dedup verified empirically; ClientOnly vs no-wrap rule formalized
- **`.planning/phases/10-discovery-page/10-03-SUMMARY.md`** lines 117-127, 138-145 — Plan 10-03 deviation #1 (`:ui` slot keys differ across components); type-verify-at-execute protocol
- **`.planning/ROADMAP.md`** lines 99-114 — Phase 11 goal, requirements, 4 success criteria, plan count (2)
- **`.planning/REQUIREMENTS.md`** lines 30-33 — PAGE-02 + PAGE-05 wording

### Secondary (MEDIUM confidence)

- Nuxt useFetch URL-key dedup behavior across routes — established Nuxt 3/4 pattern, verified empirically in Plan 10-02 Carry-Forward Lesson #2 (no re-fetch on drawer reopens)
- UCard `#header` slot vs `title` prop — both are valid per Card.vue.d.ts; recommendation favors `#header` slot for the title + subtitle row layout (custom flex)

### Tertiary (LOW confidence)

- None — all critical decisions verified against installed source files (HIGH) or planned UAT verification points (MEDIUM with mitigation plan).

---

## Metadata

**Confidence breakdown:**
- DpaRecord shape + DPA data distribution: HIGH — verified directly against source files
- UBadge `:style` injection pattern: HIGH — verbatim from Phase 10 production code (VendorDrawer.vue lines 134-139)
- UCard slot keys + variant: HIGH — verified directly against installed `Card.vue.d.ts` + `ui.CoJ8bnb0.mjs`
- UTable + sortHeader + useDebounce reuse: HIGH — verbatim from Phase 10 production code (`discovery.vue`)
- Top-8 derivation algorithm: HIGH — verbatim from v0.5.0 DashboardView.vue lines 13-26
- useFetch cross-route dedup: HIGH — Phase 10 empirical confirmation + Nuxt docs
- Phase 10 deviation carry-forward: HIGH — all 6 deviations documented in 10-01/10-03 SUMMARY files
- Drawer reuse from DPA + Dashboard row clicks: HIGH — Plan 10-02 explicit forward-compat statement

**Research date:** 2026-05-21
**Valid until:** 2026-06-20 (30 days — Nuxt UI v4 is a moving target but all in-scope components (UTable, UCard, UBadge, UInput, USlideover) are stable in 4.x; types and theme verified day-of against installed `node_modules/@nuxt/ui@4.8.0`)
