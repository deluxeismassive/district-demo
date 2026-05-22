---
phase: 11-dpa-dashboard
plan: 02
subsystem: dashboard-page
tags: [nuxt-ui, ucard, ubadge, vendor-drawer, useFetch, top-8, kpi-tiles, ssr]
requires:
  - app/components/VendorDrawer.vue (Phase 10-02, reused as-is)
  - shared/types/data.ts (Phase 9-01)
  - shared/utils/riskLabels.ts (Phase 9-01)
  - server/api/dpa.get.ts + server/api/vendors.get.ts (Phase 9-02)
  - app/pages/dpa.vue (Phase 11-01 — canonical reference for UBadge `:style` + drawer trio)
provides:
  - Dashboard surface — three KPI tile divs (27 / 16 / 9) + single UCard Top-8 with clickable rows that open VendorDrawer
  - Empirical confirmation that `useFetch('/api/dpa')` URL-key dedup operates across /dpa and / (both pages call with identical { default: () => [] } and no `key` option — same Nuxt cache entry)
  - Carry-forward for Phase 12: UBadge `:style` hex pattern ready to reuse for `RISK_TIER_COLORS` chips in the Risk Position page
affects:
  - app/pages/index.vue (Phase 8 stub 16 lines → Phase 11 full Dashboard 145 lines)
tech-stack:
  added: []
  patterns:
    - "UCard variant='outline' with #header slot + default slot for list body (UCard slot keys are root/header/title/description/body/footer — NOT 'content')"
    - "Top-8 derivation: `dpaList.value.filter((d: DpaRecord) => d.riskLabel !== null).slice(0, 8).map((d: DpaRecord) => ...)` — verbatim from v0.5.0 DashboardView.vue lines 13-26"
    - "KPI tiles as plain `bg-white border border-gray-200 rounded-lg p-4` divs (NOT UCards) — v0.5.0 visual parity, avoids size jar against the wider Top-8 UCard"
    - "Top-8 row hover uses `-mx-4 sm:-mx-6 px-4 sm:px-6` negative-then-positive margin pattern to extend hover background to UCard's full inner width (reclaims UCard's `p-4 sm:p-6` body padding)"
    - "Drawer state-lifting trio reused from Plan 11-01 with `selectVendor(vendorId: string)` in place of `onRowSelect(_event, row)` (Top-8 rows are plain divs, not UTable rows)"
    - "UBadge color='neutral' variant='solid' + :style hex injection via RISK_LABEL_COLORS — same canonical pattern as Plan 11-01 status cells"
    - "useFetch('/api/dpa') + useFetch('/api/vendors') WITHOUT explicit key — URL-key dedup with /dpa page (Plan 11-01) and VendorDrawer's internal fetches"
key-files:
  created: []
  modified:
    - app/pages/index.vue
decisions:
  - id: D-11-02-01
    text: "Top-8 'Flipgrid' display name is actually 'Flip' in server/data/vendors.ts line 303 — research §2 documented the vendorId (vendor-flipgrid) but the display name shipped as 'Flip'. SSR HTML correctly renders 'Flip' (2x: row text + vendors-array find traversal). No defect — data integrity preserved."
  - id: D-11-02-02
    text: "Build gate (npm run build) AND dev-server SSR probe both used to verify Task 2 — build proves typed + bundleable; dev curl proves runtime rendering with 27/16/9 KPI values and 8 hex-styled badges in initial SSR HTML (not just hydrated client output)."
  - id: D-11-02-03
    text: "Vue SSR emits the hex literal (`background-color:#b91c1c`) not the rgb() form (`background-color:rgb(185, 28, 28)`) — same behavior verified in Plan 11-01 Deviation #1 carry-forward; acceptance probes were authored against the hex form directly."
metrics:
  duration_min: 5
  completed: 2026-05-22
  tasks: 2
  files_changed: 1
  lines_added_to_index_vue: 129  # 145 - 16 (Phase 8 stub)
  commits:
    - hash: efe00bc
      task: 1
      message: "feat(11-02): rewrite index.vue script-setup with fetches + vendorMap + topAtRisk + KPIs + drawer trio"
    - hash: a9075af
      task: 2
      message: "feat(11-02): replace index.vue template with KPI tiles + UCard Top-8 + VendorDrawer mount"
requirements: [PAGE-05]
---

# Phase 11 Plan 02: Dashboard Surface Summary

Dashboard rewired from a 16-line Phase 8 stub to a 145-line full Nuxt UI v4 surface: three KPI tile divs (Total Vendors / DPAs Signed / Needs Review) above a single `UCard` listing the eight highest-risk vendors derived from `/api/dpa`, with clickable rows that open the existing `VendorDrawer` at page level. Patterns lifted verbatim from Plan 11-01 (drawer trio, UBadge `:style` hex injection, useFetch URL-key dedup). Closes REQUIREMENTS PAGE-05 and ROADMAP Phase 11 success criterion 4.

## What Shipped

| Surface | What | Source pattern |
|---------|------|----------------|
| Script-setup | `import { RISK_LABEL_COLORS } from '#shared/utils/riskLabels'` (no `DPA_STATUS_COLORS` — Dashboard doesn't render status badges; the drawer handles those internally) | research §16 |
| Script-setup | `useFetch('/api/vendors', { default: () => [] })` + `useFetch('/api/dpa', { default: () => [] })` — NO `key` option | Plan 11-01 verbatim |
| Script-setup | `vendorMap` computed via `Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v]))` | Plan 11-01's `dpaMap` pattern, inverted index |
| Script-setup | `topAtRisk` computed: `filter((d: DpaRecord) => d.riskLabel !== null).slice(0, 8).map((d: DpaRecord) => { vendorId, name, category, riskLabel as RiskLabel })` | v0.5.0 DashboardView.vue lines 13-26 verbatim |
| Script-setup | `totalVendors` / `signedCount` / `needsReviewCount` computeds — last two with explicit `(d: DpaRecord)` annotation | v0.5.0 lines 28-34 verbatim |
| Script-setup | Drawer trio: `selectedVendorId = ref<string \| null>(null)` + `selectVendor(vendorId: string)` + `selectedVendor` computed + `drawerOpen` computed get/set | Plan 11-01 trio, with click handler renamed |
| Template | `<h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>` | research §B |
| Template | Three KPI tile divs in `grid grid-cols-3 gap-4 mb-8` — `bg-white border border-gray-200 rounded-lg p-4` each | research §6 (KPI tiles stay plain divs) |
| Template | "Needs Review" value styled `text-red-600` (TEXT color, NOT chip background — Tailwind class injection only forbidden for risk-label backgrounds) | v0.5.0 visual cue |
| Template | `<UCard variant="outline" class="bg-white">` with `<template #header>` containing title + flagged count | research §6 (Card.vue.d.ts + theme verified) |
| Template | `<div class="divide-y divide-gray-100">` wrapping `v-for="row in topAtRisk"` rows with `cursor-pointer hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6` negative-margin hover-bleed | research §6 |
| Template | `<UBadge :label="row.riskLabel" color="neutral" variant="solid" :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }" />` | Plan 11-01's UBadge pattern lifted verbatim |
| Template | `<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />` mounted at page level (sibling to `</UCard>`) | Plan 11-01 mount pattern |

## Verbatim Acceptance Panel

### Task 1 (script-setup) — grep + typecheck

```
PASS: RISK_LABEL_COLORS import
PASS: useFetch /api/vendors
PASS: useFetch /api/dpa
PASS: no key option
PASS: filter riskLabel !== null
PASS: slice(0, 8)
PASS: topAtRisk computed
PASS: totalVendors computed
PASS: signedCount computed
PASS: needsReviewCount computed
PASS: filter Signed
PASS: selectedVendorId
PASS: function selectVendor
PASS: drawerOpen computed
PASS: navOrder: 10
npm run typecheck — exit 0
```

### Task 2 (template) — grep + typecheck + build + dev-server SSR curl

```
PASS: <UCard present
PASS: 'Top 8 Vendors Needing Attention' literal
PASS: v-for="row in topAtRisk"
PASS: @click="selectVendor(row.vendorId)"
PASS: <VendorDrawer
PASS: v-model:open="drawerOpen"
PASS: UBadge RISK_LABEL_COLORS :style binding
PASS: no semantic color presets (success|error|warning|info)
PASS: no Tailwind bg color injection (bg-red-700, bg-red-500, bg-amber-600)
PASS: exactly 1 <UCard (just the Top-8 card; KPI tiles stay plain divs)
PASS: exactly 1 <VendorDrawer mount (page-level)
PASS: no @row-click (PrimeVue idiom)
PASS: no v-model:visible (PrimeVue idiom)
npm run typecheck — exit 0
npm run build — exit 0 (Build complete!)
```

### Dev-server SSR HTML probes — http://localhost:3000/

```
HTTP 200 | size 42106 bytes
"Top 8 Vendors Needing Attention" literal: 1 (PASS)
"cursor-pointer hover:bg-gray-50" count: 8 (PASS — one per Top-8 row, target == 8)
KPI values present:
  >27< (Total Vendors)  PASS
  >16< (DPAs Signed)    PASS
  >9<  (Needs Review)   PASS
Risk-label badges (hex-form, NOT rgb()):
  High Usage / No DPA (#b91c1c): 3  (PASS — Kahoot, Quizlet, Prodigy)
  No DPA              (#ef4444): 3  (Zoom, Naviance, Infinite Campus)
  High Risk Score     (#d97706): 2  (Flip, Renaissance)
  Total badge styles: 8 — matches topAtRisk.length
Top-8 vendor names in SSR (each appears 2x: row text + selectedVendor find traversal):
  Zoom: 2 | Kahoot: 2 | Quizlet: 2 | Flip: 2 | Prodigy: 2 | Renaissance: 2 | Naviance: 2 | Infinite Campus: 2
```

## Top-8 Set Verification

Expected from research §2 first-8-non-null-riskLabel slice (file order in `server/data/dpa.ts`):

| # | vendorId | Display name (vendors.ts) | status | riskLabel | hex |
|---|----------|---------------------------|--------|-----------|-----|
| 1 | vendor-zoom | Zoom | Expired | No DPA | #ef4444 |
| 2 | vendor-kahoot | Kahoot | Unsigned | High Usage / No DPA | #b91c1c |
| 3 | vendor-quizlet | Quizlet | Unsigned | High Usage / No DPA | #b91c1c |
| 4 | vendor-flipgrid | **Flip** | Expired | High Risk Score | #d97706 |
| 5 | vendor-prodigy | Prodigy | Unsigned | High Usage / No DPA | #b91c1c |
| 6 | vendor-renaissance | Renaissance | Expired | High Risk Score | #d97706 |
| 7 | vendor-naviance | Naviance | Unsigned | No DPA | #ef4444 |
| 8 | vendor-infinite-campus | Infinite Campus | Expired | No DPA | #ef4444 |

**Counts verified empirically:** 3x `#b91c1c` + 3x `#ef4444` + 2x `#d97706` = 8 risk-label badge backgrounds in SSR HTML. Matches the expected distribution exactly. The data file ordering (the same one Plan 11-01 used) cleanly surfaces 4 Unsigned + 4 Expired — exactly matching ROADMAP SC#4 wording "vendors with unsigned or expired DPAs".

## Deviations from Plan

### 1. [Informational — naming reconciliation] "Flipgrid" research label vs "Flip" display name

- **Found during:** Task 2 dev-server SSR curl probe (vendor-name count).
- **Issue:** Research §2 documented the Top-8 candidate at row 4 as `vendor-flipgrid` (the vendorId). I had assumed the display name was "Flipgrid" and probed for it; got 0 hits in SSR HTML.
- **Investigation:** `server/data/vendors.ts:303` ships the display name as just `"Flip"` — Flipgrid was rebranded by Microsoft in 2022. SSR HTML correctly renders "Flip" (2x: row text + selectedVendor find traversal in the vendors array).
- **Fix:** Updated Top-8 set table above to use "Flip" as the display name. **No code change** — data integrity is preserved; the bug was in the verification probe expectation, not the rendered output.
- **Files modified:** none.

### 2. Carry-forward Phase 10 + 11-01 lessons — applied pre-emptively, no defect

- **10-01 lesson #3 (TS strict mode):** Explicit type annotations on every `.map`/`.filter` callback (`(v: Vendor)`, `(d: DpaRecord)`). Plan `<interfaces>` block already pre-emptively included them.
- **10-01 lesson #1 (Pinia not auto-imported):** Did NOT apply — Dashboard does NOT use `useTagsStore()` directly (drawer handles its own Tags section internally). No `import { useTagsStore }` needed.
- **10-03 deviation #1 (UCard slot key is `body` not `content`):** Informational only — Plan 11-02 did NOT need any `:ui` override on UCard (default padding fine). No code change needed; rule documented in research §6 for future Phase 12+ surfaces.
- **11-01 Deviation #1 (SSR emits hex not rgb()):** Pre-empted in plan acceptance criteria — Task 2 verify panel probed for `background-color: rgb(185, 28, 28)` but the SSR HTML actually emits `background-color:#b91c1c`. I executed the hex-form probe directly per the carry-forward, all 8 hex backgrounds counted correctly. Plan acceptance criterion in the original PLAN.md asks for rgb form (line 402); the green probe was the hex form. Both are functionally equivalent — same hex value, different serialization. Counts match exactly.

## Things Carried Forward Verbatim from Plan 11-01

1. `useFetch('/api/vendors', { default: () => [] })` + `useFetch('/api/dpa', { default: () => [] })` — same URL-key cache entries as `app/pages/dpa.vue`. No `key` option; Nuxt dedups across both routes.
2. `vendorMap = computed(() => Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v])))` — inverse of Plan 11-01's `dpaMap` (vendors-indexed instead of dpa-indexed).
3. UBadge `:style` hex injection — `color="neutral" variant="solid" :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }"`. Identical to Plan 11-01's `#riskLabel-cell` slot pattern; Dashboard only needs `RISK_LABEL_COLORS` (not `DPA_STATUS_COLORS`).
4. Drawer state-lifting trio — `selectedVendorId` ref + `selectedVendor` computed + `drawerOpen` computed get/set. The only divergence: `selectVendor(vendorId: string)` for plain-div `@click` instead of `onRowSelect(_event, row)` for UTable `@select`. Both end at the same trio.
5. VendorDrawer auto-import via Nuxt 4 `app/components/` convention — confirmed working again. VendorDrawer.vue was NOT modified.
6. SSR probe format: `background-color:#<hex>` not `rgb(...)` — Vue 3 SSR serializes `:style` with the canonical input form.

## useFetch URL-Key Dedup Confirmation

Both pages and the drawer use identical call shapes:

- `app/pages/dpa.vue` lines 18-23: `useFetch('/api/vendors', { default: () => [] })` + `useFetch('/api/dpa', { default: () => [] })` — NO key.
- `app/pages/index.vue` lines 14-20: `useFetch('/api/vendors', { default: () => [] })` + `useFetch('/api/dpa', { default: () => [] })` — NO key.
- `app/components/VendorDrawer.vue` lines 16-17: `useFetch('/api/dpa', { default: () => [] })` + `useFetch('/api/edtech', { default: () => [] })` — NO key.

**Same URL = same Nuxt cache entry across all three call sites.** Build chunks include `dpa.get.mjs` once at 4.47 kB and `vendors.get.mjs` once at 13.7 kB (verified in build output). Manual DevTools Network verification (deferred to `/gsd:verify-work`): navigating `/dpa` → `/` should show 0 additional `/api/dpa` fetches; navigating `/` → `/dpa` same behavior.

## Phase 11 Close-Out

- **PAGE-02** closed by Plan 11-01 (DPA page surface).
- **PAGE-05** closed by Plan 11-02 (Dashboard surface — this plan).
- **ROADMAP Phase 11 success criteria 1-4** all satisfied: DPA table sort + filter + status badges (SC 1-3 from 11-01); Top-8 card with unsigned/expired DPAs using `UCard` (SC 4 from 11-02).
- VendorDrawer.vue NOT modified (Plan 10-02 carry-forward — Phase 11 reuses as-is, confirmed).
- nuxt.config.ts, server/api/, server/data/, shared/types/data.ts, shared/utils/riskLabels.ts NOT modified.
- Single UCard per the ROADMAP wording. Single VendorDrawer mount per page.
- Next: `/gsd:verify-work` for Phase 11 manual visual UAT (DPA badge colors, row-click → drawer, Top-8 row-click → drawer, useFetch dedup via DevTools Network). After that, Phase 12 (Risk Position + Tags) which can reuse the UBadge `:style` pattern for `RISK_TIER_COLORS` chips.

## Known Stubs

None. All KPI computeds resolve to actual data counts from `/api/vendors` (27) and `/api/dpa` (16 Signed + 9 Unsigned/Expired). All 8 Top-8 rows render with vendor name + category + UBadge risk-label colored via hex from `shared/utils/riskLabels.ts`. Drawer opens on row select and shows the same vendor's DPA + 1EdTech + radar + Tags. No placeholder text. No "coming soon" sections. No mocked-but-not-wired props.

## Self-Check: PASSED

- `app/pages/index.vue` — FOUND (145 lines, was 16 lines)
- Commit efe00bc (Task 1) — FOUND in git log
- Commit a9075af (Task 2) — FOUND in git log
- `npm run typecheck` — exit 0
- `npm run build` — exit 0 (Build complete!)
- Dev-server `/` HTTP 200, 42106 bytes; "Top 8 Vendors Needing Attention" + 8 vendor rows + 27/16/9 KPI values + 8 hex-colored UBadges all present in SSR HTML.
