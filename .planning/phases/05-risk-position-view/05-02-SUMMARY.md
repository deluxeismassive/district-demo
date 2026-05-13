---
phase: 05-risk-position-view
plan: 02
subsystem: ui
tags: [vue3, primevue, echarts, vue-echarts, datatable, risk-tier]

# Dependency graph
requires:
  - phase: 05-01
    provides: PieChart + LegendComponent registered in main.js, RISK_TIER_COLORS in riskLabels.js
  - phase: 03-dpa-view
    provides: DPA status data (src/data/dpa.js) and DpaGrid sortable DataTable pattern
  - phase: 04-1edtech-view
    provides: 1EdTech certification data (src/data/edtech.js) and VendorDrawer 1EdTech section
provides:
  - Live Risk Position page at /reports route (no tab bar, no skeleton)
  - Donut chart showing High:2 / Medium:7 / Low:18 vendor tier distribution
  - Sortable 5-column vendor risk DataTable with tier, DPA, 1EdTech, and Users columns
  - calcTier() formula implementing D-01/D-02/D-03 from CONTEXT.md
  - VendorDrawer drill-down from any row in the risk table
affects: [06-tags-management]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Risk tier calculation: calcTier(dpa, discovery, edtech) — bad DPA + high usage = High/Medium, 1EdTech Certified reduces tier by one step"
    - "Tier sort key: numeric TIER_ORDER object {High:1, Medium:2, Low:3} as DataTable sortField instead of string tier name"
    - "View-level joins: Object.fromEntries(data.map(d => [d.vendorId, d])) for dpa, discovery, edtech maps"
    - "ECharts legend formatter reads computed tierCounts.value[name] for live counts"

key-files:
  created: []
  modified:
    - src/views/ReportsView.vue

key-decisions:
  - "tierOrder numeric field (not tier string) used as DataTable sortField — prevents alphabetical H<L<M misordering (RESEARCH Pitfall 3)"
  - "Row object for VendorDrawer passes explicit fields (not spread) to avoid collision between vendorId-joined data shapes (RESEARCH Pitfall 4)"
  - "Chart height fixed at 280px via inline style — prevents VChart 0px collapse in PrimeVue flex layout (RESEARCH Pitfall 5)"
  - "1EdTech Status column renders plain text, not a Tag badge — per D-12 to avoid badge color confusion with DPA Status"
  - "Entire DataTable row is clickable to open VendorDrawer (not just vendor name cell) — recommended by 05-UI-SPEC.md Claude's Discretion #2"

patterns-established:
  - "Risk tier formula: badDpa=(Unsigned|Expired) + highUsage=(userCount>1000) -> High/Medium/Low, then Certified 1EdTech reduces by one step"
  - "Sort by numeric proxy field pattern: create tierOrder field for numeric DataTable sort when display field is a string enum"

requirements-completed:
  - RISK-01
  - RISK-02

# Metrics
duration: ~15min (including checkpoint verification)
completed: 2026-05-13
---

# Phase 05 Plan 02: Risk Position View Summary

**ECharts donut chart (High:2 / Medium:7 / Low:18) above a 5-column sortable PrimeVue DataTable, replacing the 2-tab Reports skeleton with a live risk position page driven by calcTier() joining all four data sources**

## Performance

- **Duration:** ~15 min (including human checkpoint verification)
- **Started:** 2026-05-13T22:00:00Z
- **Completed:** 2026-05-13T22:41:13Z
- **Tasks:** 2 (Task 1: auto; Task 2: checkpoint:human-verify, approved)
- **Files modified:** 1

## Accomplishments

- Rewrote `src/views/ReportsView.vue` from a 2-tab skeleton (DPA / Risk Position with Skeleton placeholders) into a fully live Risk Position page — no tab bar, no skeleton components remain
- Implemented `calcTier()` applying the D-01/D-02/D-03 formula: vendors with bad DPA (Unsigned/Expired) and high usage (>1000 users) land as High tier; 1EdTech Certified certification reduces tier by one step
- All 15 browser smoke test checks passed on first attempt: heading, donut chart, legend counts (High:2 / Medium:7 / Low:18), tooltip formatting, 5-column table, default sort (High vendors first), badge colors, comma-formatted user counts, row-click drawer, Discovery regression, and clean console

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite ReportsView.vue as the Risk Position page** - `c54873b` (feat)
2. **Task 2: Browser smoke test** - checkpoint approved by user (no code commit needed)

**Plan metadata:** committed with this SUMMARY

## Files Created/Modified

- `src/views/ReportsView.vue` - Fully rewritten: donut chart + sortable vendor risk DataTable + VendorDrawer integration; calcTier() formula joining dpa.js, discovery.js, edtech.js, vendors.js

## Decisions Made

- `tierOrder` numeric proxy field (`{High:1, Medium:2, Low:3}`) used as `sortField` on the DataTable — ensures High vendors sort first (ascending numeric) rather than alphabetical H < L < M which would put Medium last (RESEARCH Pitfall 3 fix)
- Row object passed to VendorDrawer uses explicit field picks (vendorId, name, category, privacyScore, tier, ...) rather than object spread — prevents silent field collision when joining multiple data shapes (RESEARCH Pitfall 4 fix)
- Chart height fixed at `style="height: 280px"` — prevents VChart collapsing to 0px inside PrimeVue flex layout (RESEARCH Pitfall 5 fix)
- 1EdTech Status column renders plain text, no Tag badge — D-12 decision to avoid color confusion with DPA Status badges
- Entire DataTable row clickable for VendorDrawer (not name cell only) — 05-UI-SPEC.md Claude's Discretion recommendation #2

## Deviations from Plan

None - plan executed exactly as written. The full rewrite matched the spec in 05-02-PLAN.md without requiring any auto-fixes or architectural changes.

## Issues Encountered

None - `npm run build` passed on first attempt, and all 15 browser smoke test checks passed on first verification pass.

## User Setup Required

None - no external service configuration required.

## Human Verification Results

User approved Task 2 checkpoint after walking through all 15 browser checks:
- Page heading "Risk Position" (no tab bar confirmed)
- Donut chart with three colored segments (red/amber/green)
- Legend showing "High (2)", "Medium (7)", "Low (18)"
- Tooltip format: "High: 2 vendors (7.4%)"
- 5-column DataTable: Vendor Name | Risk Tier | DPA Status | 1EdTech Status | Users
- Default sort: High-tier vendors (Zoom, Kahoot) at top
- Sort interaction: all columns sortable, Risk Tier sort uses numeric tier order
- Badge colors: Risk Tier (red/amber/green), DPA Status (green/red/amber/gray), 1EdTech plain text
- Users column: comma-formatted numbers (e.g., "1,920")
- VendorDrawer: opens on row click with full vendor data
- Discovery regression: radar chart and DPA tab still functional
- Console: no errors or ECharts registration warnings

## Next Phase Readiness

- Phase 5 is complete: both RISK-01 and RISK-02 requirements satisfied
- RISK-01: all 27 vendors have a computed risk tier badge visible in the DataTable
- RISK-02: donut chart visually conveys tier distribution with legend counts and tooltip percentages
- VendorDrawer reused as-is from Phase 2 — no modifications needed for risk table drill-down
- Phase 6 (Tags Management) can proceed: tagging infrastructure from Phase 2 (Pinia store + localStorage) is intact

## Self-Check: PASSED

- FOUND: commit c54873b (feat(05-02): rewrite ReportsView as live Risk Position page)
- FOUND: .planning/phases/05-risk-position-view/05-02-SUMMARY.md

---
*Phase: 05-risk-position-view*
*Completed: 2026-05-13*
