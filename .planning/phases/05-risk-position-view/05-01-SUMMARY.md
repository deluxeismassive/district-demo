---
phase: 05-risk-position-view
plan: 01
subsystem: ui
tags: [echarts, vue-echarts, risk-position, data-constants]

# Dependency graph
requires:
  - phase: 04-1edtech-view
    provides: "EDTECH_STATUS_COLORS in riskLabels.js — pattern this plan extends"
provides:
  - "RISK_TIER_COLORS export in src/data/riskLabels.js (High/#dc2626, Medium/#f59e0b, Low/#16a34a)"
  - "PieChart registered globally in main.js ECharts use() call"
  - "LegendComponent registered globally in main.js ECharts use() call"
affects: [05-02-risk-position-view]

# Tech tracking
tech-stack:
  added: []
  patterns: ["Extend ECharts use() in main.js when adding new chart types — same pattern used for RadarChart in Phase 2"]

key-files:
  created: []
  modified:
    - src/data/riskLabels.js
    - src/main.js

key-decisions:
  - "RISK_TIER_COLORS reuses DPA semantic palette (red-600/amber-500/green-600) for badge consistency across portal"

patterns-established:
  - "Append color constant to riskLabels.js (never hardcode in components) — established pattern from D-07/D-12 now extended to D-15"

requirements-completed: [RISK-01, RISK-02]

# Metrics
duration: 1min
completed: 2026-05-13
---

# Phase 05 Plan 01: Risk Position Foundation Summary

**RISK_TIER_COLORS constant added to riskLabels.js and PieChart + LegendComponent registered in ECharts global use() — Plan 02 donut chart unblocked**

## Performance

- **Duration:** 1 min
- **Started:** 2026-05-13T22:22:42Z
- **Completed:** 2026-05-13T22:23:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Appended `RISK_TIER_COLORS` export to `src/data/riskLabels.js` with exact D-10/D-15 hex values (High/#dc2626, Medium/#f59e0b, Low/#16a34a)
- Extended `echarts/charts` import in `main.js` to include `PieChart` alongside existing `RadarChart`
- Extended `echarts/components` import in `main.js` to include `LegendComponent` alongside existing `RadarComponent` and `TooltipComponent`
- Updated `use([...])` call to register all five ECharts modules globally
- `npm run build` passes with no errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Append RISK_TIER_COLORS to riskLabels.js** - `ae5c89a` (feat)
2. **Task 2: Register PieChart and LegendComponent in main.js** - `c8c68ca` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/data/riskLabels.js` - Appended RISK_TIER_COLORS export (5 named exports total, no default export)
- `src/main.js` - Extended ECharts imports + use() for PieChart and LegendComponent

## Decisions Made
- RISK_TIER_COLORS intentionally reuses red-600/amber-500/green-600 from DPA_STATUS_COLORS semantic palette — consistent badge colors across the portal (per D-10, D-15)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Build warning about chunk sizes is pre-existing (DiscoveryView and main bundle exceed 500 kB) — unrelated to this plan's changes.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- `RISK_TIER_COLORS` is importable from `src/data/riskLabels.js` for Plan 02 badge styling
- `PieChart` and `LegendComponent` are globally registered — `<VChart>` donut element in Plan 02 will render without "Component not registered" runtime errors
- Plan 02 (ReportsView rewrite with donut chart + risk table) is fully unblocked

---
*Phase: 05-risk-position-view*
*Completed: 2026-05-13*
