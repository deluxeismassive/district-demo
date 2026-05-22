---
phase: 12-risk-position-tags
plan: 01
subsystem: ui
tags: [nuxt-echarts, pie-chart, donut, utable, ubadge, vendor-drawer, ssr, risk-tier, useFetch]

# Dependency graph
requires:
  - phase: 07-nuxt-scaffold
    provides: "nuxt-echarts module with PieChart + Tooltip + Legend registration; <UApp> wrapper; SSR scaffold"
  - phase: 09-data-layer
    provides: "/api/vendors, /api/dpa, /api/edtech Nitro handlers + shared/types/data.ts + shared/utils/riskLabels.ts"
  - phase: 10-discovery
    provides: "VendorDrawer.vue auto-import (USlideover 480px + 10-axis ECharts radar + DPA/1EdTech sections); sortHeader + page-level drawer state-lifting trio"
  - phase: 11-dpa-dashboard
    provides: "UBadge color=\"neutral\" + variant=\"solid\" + :style hex injection pattern (dpa.vue); useFetch URL-key dedup verified across 3 call sites"
provides:
  - "Full Risk Position page surface at /risk: donut + sortable tier table + VendorDrawer mount"
  - "calcTier(dpa, vendor, edtech) 3-input derivation function — High/Medium/Low tier with 1EdTech reducer"
  - "Empirical proof that nuxt-echarts initial-SSR rendering works WITHOUT <ClientOnly> (Phase 7 § 5 Pitfall #6 + Phase 10-02 reconciliation upheld)"
  - "Three-way useFetch join pattern (Vendor + DpaRecord + EdtechRecord) — read template for any future cross-source page"
affects: [12-tags-management, 13-deploy, v1.1-future-features]

# Tech tracking
tech-stack:
  added: []  # zero new deps — all primitives previously installed (nuxt-echarts Phase 7, @nuxt/ui v4 Phase 7)
  patterns:
    - "Initial-SSR ECharts: <VChart> mounted directly without <ClientOnly>; nuxt-echarts emits <x-vue-echarts> custom-element placeholder in SSR HTML, hydrates to canvas/SVG on client"
    - "3-way useFetch join with default: () => [] on each — drawer's internal /api/dpa + /api/edtech fetches re-use the page's cached payloads via URL-key dedup"
    - "Numeric tierOrder field for sort accessor + string tier field for UBadge label — sidesteps the alphabetical 'H' < 'L' < 'M' problem (Medium would sort last)"

key-files:
  created: []
  modified:
    - "app/pages/risk.vue — rewritten from 16-line Phase 8 stub to 233-line full Risk Position surface"

key-decisions:
  - "Donut renders WITHOUT <ClientOnly> wrap — Phase 7 § 5 Pitfall #6 + STATE.md ECharts SSR strategy + Phase 7-02 empirical proof all align. Option A succeeded; Option B fallback was not needed."
  - "Sourced donut slice colors from RISK_TIER_COLORS imports rather than hardcoded hex (one-line edit to recolor; matches v0.5.0 recommendation)"
  - "RiskRow.certificationStatus uses imported EdtechCertStatus type (verified exported from shared/types/data.ts:41); no inline union needed"
  - "1EdTech Status column renders plain text (v0.5.0 parity); deferred UBadge upgrade to v1.1 per research § Open Question 3"
  - "Default sort = tierOrder ascending → High first (matches v0.5.0 ReportsView sortField=tierOrder + sortOrder=1)"

patterns-established:
  - "Initial-SSR ECharts pattern: NO <ClientOnly>; rely on nuxt-echarts SVG/server-island fallback. Document with inline HTML comment referencing Phase 7 § 5 Pitfall #6 to prevent future regression."
  - "3-way useFetch join: vendors + dpaList + edtechList all with { default: () => [] }; no manual generic; no key option (URL-key dedup is the contract)."
  - "Tier derivation as inline pure function (calcTier) — one consumer, no benefit from extracting to a composable; lifted verbatim from v0.5.0 ReportsView lines 22-32."

requirements-completed: [PAGE-03]

# Metrics
duration: ~10min
completed: 2026-05-22
---

# Phase 12 Plan 01: Risk Position Page Summary

**Initial-SSR ECharts donut + sortable UTable tier breakdown + page-level VendorDrawer mount — three-way useFetch join (Vendor + DpaRecord + EdtechRecord) closes PAGE-03 with zero ClientOnly wraps.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-05-22T01:43:00Z
- **Completed:** 2026-05-22T01:51:00Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Rewrote `app/pages/risk.vue` from 16-line Phase 8 stub to 233-line full Risk Position surface
- ECharts donut chart renders without `<ClientOnly>` — nuxt-echarts SSR strategy formalized in STATE.md upheld (Option A succeeded; Option B fallback not needed)
- 5-column sortable UTable with `tierOrder` (numeric) accessor for default High-first sort
- Tier UBadge + DPA Status UBadge both use `color="neutral" variant="solid" :style="{ backgroundColor: <hex>, color: '#ffffff' }"` — Phase 11 pattern carry-forward
- VendorDrawer auto-imported and mounted at page level — same `selectedVendorId + selectedVendor + drawerOpen` trio as `dpa.vue` and `discovery.vue`
- PAGE-03 closed; PAGE-04 still owned by parallel Plan 12-02

## Task Commits

Each task was committed atomically (parallel mode — `--no-verify` on all commits per orchestrator policy):

1. **Task 1: Rewrite app/pages/risk.vue — full Risk Position surface** — `e208f18` (feat)

_Note: SUMMARY commit + STATE.md/ROADMAP.md/REQUIREMENTS.md updates handled by orchestrator at phase close per parallel-mode file-scope policy._

## Files Created/Modified

- `app/pages/risk.vue` — Rewritten from 16-line stub (Phase 8) to 233-line surface containing:
  - Three `useFetch` calls (`/api/vendors`, `/api/dpa`, `/api/edtech`) with `default: () => []`
  - `TIER_ORDER` const + `calcTier(dpa, vendor, edtech)` pure function (verbatim v0.5.0 port)
  - `RiskRow` type alias + `dpaMap` + `edtechMap` + `riskRows` computeds (explicit `(d: DpaRecord)` / `(e: EdtechRecord)` annotations per Phase 10/11 lesson #3)
  - `tierCounts` + `chartOption` computed for the donut (colors sourced from `RISK_TIER_COLORS` imports, not hardcoded)
  - `sortHeader` helper + 5-column `TableColumn<RiskRow>[]` (meta.class `{ th?, td? }` shape per Phase 10/11 lesson #2)
  - Drawer state-lifting trio (`selectedVendorId` + `onRowSelect` + `selectedVendor` + `drawerOpen` get/set)
  - HTML comment above `<VChart>` documenting the deliberate no-ClientOnly choice with research/STATE.md citations

## Decisions Made

- **Option A (no `<ClientOnly>`) succeeded** — Plan defaulted to Option A; Option B fallback (USkeleton + ClientOnly wrap) was not needed. nuxt-echarts emits `<x-vue-echarts style="height:280px;width:100%;">` placeholder in SSR HTML and hydrates client-side, exactly as designed in Phase 10-02. No SSR crash, no `window is not defined` error.
- **`EdtechCertStatus` import succeeded** — verified exported from `shared/types/data.ts:41`. Used as `RiskRow.certificationStatus` type without inline union fallback.
- **Donut slice colors sourced from imports** — `itemStyle: { color: RISK_TIER_COLORS.High }` etc. (not hardcoded `#dc2626`). Matches plan's recommended pattern and supports the sub-1-hour iteration rule (one-line edit to recolor).
- **Default sort = `tierOrder` ascending** — `ref([{ id: 'tierOrder', desc: false }])`. High first; matches v0.5.0 `sortField="tierOrder" :sortOrder="1"` ReportsView default.

## Deviations from Plan

None — plan executed exactly as written.

The plan's "fallback to Option B if SSR error surfaces" branch was not triggered. Build + typecheck + dev-server curl all green on Option A.

The only minor item to flag (not a deviation, just a note):
- Plan acceptance probe #6 said `grep -c 'sortHeader(' app/pages/risk.vue == 5`. Actual count is 6 (1 function definition + 5 column invocations). This matches the dpa.vue equivalent (7 = 1 def + 6 columns). The probe's exact equality was an off-by-one in the plan wording; the intent (5 sortable column headers) is satisfied.

## Issues Encountered

- **`node .output/server/index.mjs` preview server crashes on Windows path with spaces** — `Cannot find module 'C:\Repos\PGC Demo\district-demo\.output\server\chunks\routes\renderer.mjs'` — known Nuxt/Nitro Windows bundling issue unrelated to this plan's code. Worked around by curling `/risk` against the already-running dev server (PID 12936) which serves correctly. Build artifact + chunk sizes are healthy (`risk-8K4aJ3ds.mjs (10.6 kB)`); production deploy unaffected.

## Verification Probes

### Static greps (all green)

| # | Probe | Expected | Actual |
|---|-------|----------|--------|
| 1 | `<VChart` present | ≥1 | 1 |
| 2 | Three `useFetch('/api/{vendors,dpa,edtech}')` calls | 3 | 3 |
| 3 | `function calcTier` present | ≥1 | 1 |
| 4 | `RISK_TIER_COLORS[row.original.tier]` | ≥1 | 1 |
| 5 | `DPA_STATUS_COLORS[row.original.dpaStatus]` | ≥1 | 1 |
| 6 | `sortHeader(` occurrences | 5 (probe) / 6 (1 def + 5 cols) | 6 ✓ intent |
| 7 | `sorting = ref([{ id: 'tierOrder'` | ≥1 | 1 |
| 8 | `<VendorDrawer` + `v-model:open="drawerOpen"` | ≥1 each | 1 + 1 |
| 9 | `from '#shared/utils/riskLabels'` | ≥1 | 1 |
| 10 | `from '#shared/types/data'` | ≥1 | 1 |
| 11 | NO `<ClientOnly` | 0 | 0 ✓ |
| 12 | NO `color="(success\|error\|warning\|info)"` on UBadge | 0 | 0 ✓ |
| 13 | NO `bg-(red\|amber\|green)-NNN` Tailwind classes | 0 | 0 ✓ |
| 14 | NO `useFetch.*key:` option | 0 | 0 ✓ |
| 15 | No edits to forbidden files (VendorDrawer / server/ / shared/ / nuxt.config.ts) | 0 | 0 ✓ |

### Build / typecheck

- `npm run typecheck` — exit 0 (no errors)
- `npm run build` — exit 0; `risk-*.mjs` chunk = 10.6 kB (content-hashed filename); `dpa.get.mjs` shared once (4.47 kB — URL-key dedup verified)

### Runtime SSR (dev server)

- `curl -fsS http://localhost:3000/risk` returned 91,042 bytes of SSR HTML
- `<x-vue-echarts style="height:280px;width:100%;">` element present in SSR (initial-SSR donut placeholder confirmed)
- `<thead>` × 1, `<tbody>` × 1, `<tr>` × 29 (1 header + 27 rows + 1 UTable internal)
- Tier text occurrences in body: 2× `>High<`, 7× `>Medium<`, 18× `>Low<` (sums to 27 = vendor count; matches v0.5.0 distribution intuition)
- Tier+DPA hex backgrounds: 34× `#16a34a;color:#ffffff` (Low + Signed badges) + 6× `#dc2626;color:#ffffff` (High tier + Expired DPA) + 9× `#f59e0b;color:#ffffff` (Medium tier + Pending DPA)

### Donut SSR rendering mode

**Custom-element placeholder** (`<x-vue-echarts style="height:280px;width:100%;">`) in the initial SSR HTML. nuxt-echarts hydrates this to a canvas (configured renderer) on the client. The SSR HTML does NOT include inline `<svg>` or `<canvas>` chart markup — this is expected dev-mode behavior with `renderer: 'canvas'` set in `nuxt.config.ts`. The chart container is correctly part of the initial-SSR payload; no hydration mismatch or `window is not defined` errors. Phase 7-02 smoke test's "nuxt-echarts SSR confirmed working" carry-forward upheld.

### Empirical tier distribution (computed at execute)

| Tier | Count | Color |
|------|-------|-------|
| High | 2 | `#dc2626` |
| Medium | 7 | `#f59e0b` |
| Low | 18 | `#16a34a` |
| **Total** | **27** | (matches vendor count) |

This distribution is consistent with the algorithm:
- DPA Signed/Pending (18 vendors) → all start Low → all stay Low (18 Low ✓)
- DPA Unsigned/Expired with userCount > 1000 → start High; Certified reduces to Medium (so Medium count includes "reduced from High")
- DPA Unsigned/Expired with userCount ≤ 1000 → start Medium; Certified reduces to Low (so Low count may include "reduced from Medium")

The 2 High / 7 Medium split among the 9 bad-DPA vendors plus any tier reductions from 1EdTech Certified status is internally consistent with `server/data/*` real data.

## User Setup Required

None — no external service configuration required. Static demo with mocked data.

## Next Phase Readiness

- **PAGE-03 closed.** Plan 12-02 owns PAGE-04 (Tags Management) in parallel; orchestrator will verify both at phase close.
- **Risk Position SSR pattern is reusable** for any future single-source-of-truth chart-above-table page (e.g., a future "Cost Position" page in v1.1).
- **VendorDrawer reuse pattern** now confirmed across 4 pages: discovery, dpa, index (Dashboard Top-8), risk. Single source of truth; zero modifications needed in this plan.
- **Donut SSR-without-ClientOnly is empirically proven** for a `PieChart` in a real page (not just the Phase 7-02 throwaway smoke test in `app.vue`). Future ECharts work should reuse this pattern for initial-SSR charts and the `<ClientOnly>` + USkeleton pattern only for interaction-mounted charts (drawer/modal).

## Self-Check: PASSED

- File exists: `app/pages/risk.vue` ✓ (233 lines)
- Commit `e208f18` exists in `git log` ✓
- Build artifact `risk-DPOULdvh.mjs` (content-hashed) exists in `.output/server/chunks/build/` ✓
- No forbidden files modified ✓

---
*Phase: 12-risk-position-tags*
*Plan: 01*
*Completed: 2026-05-22*
