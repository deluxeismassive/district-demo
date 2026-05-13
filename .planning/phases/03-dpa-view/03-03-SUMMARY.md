---
phase: 03-dpa-view
plan: 03
subsystem: ui
tags: [vendor-drawer, dashboard, dpa, risk-labels, at-risk-vendors]
dependency_graph:
  requires: [src/data/riskLabels.js, src/data/dpa.js riskLabel field, src/data/vendors.js]
  provides: [VendorDrawer DPA section, DashboardView Top 8 card]
  affects: [DPA-02 requirement satisfaction, sales demo narrative]
tech_stack:
  added: []
  patterns: [PrimeVue Tag badge with inline :style color, computed join by vendorId, filter+slice for top-N]
key_files:
  created: []
  modified:
    - src/components/VendorDrawer.vue
    - src/views/DashboardView.vue
    - src/data/dpa.js
    - src/data/riskLabels.js
decisions:
  - "DPA section placement confirmed between Usage and Privacy Policy Score per D-14 — preserves drawer reading order from operational context to policy/compliance to scoring"
  - "Top 8 derived dynamically at runtime (filter+slice on dpa.js) rather than hardcoded list in component — data file drives selection, enabling same-day iteration"
  - "KPI tile 'Needs Review' shows Unsigned + Expired count in red (#dc2626) to match DPA_STATUS_COLORS.Expired — visual urgency consistent with badge color semantics"
metrics:
  duration: 12min
  completed: 2026-05-13
  tasks_completed: 2
  files_modified: 4
---

# Phase 03 Plan 03: VendorDrawer DPA + Dashboard Top 8 Summary

Extended VendorDrawer with a DPA section showing status badge, signed/expiry dates, and risk label, and replaced the DashboardView skeleton with a "Top 8 Vendors Needing Attention" card with three KPI tiles — completing the Phase 3 sales narrative surfaces.

## What Was Built

### Task 1: VendorDrawer DPA Section (src/components/VendorDrawer.vue)

New DPA section inserted between Usage and Privacy Policy Score sections. Imports:
- `Tag` from `primevue/tag`
- `dpaData` from `../data/dpa.js`
- `DPA_STATUS_COLORS`, `RISK_LABEL_COLORS` from `../data/riskLabels.js`

Script setup additions:
- `dpaMap` — static lookup map (vendorId → dpa record) built via `Object.fromEntries`
- `vendorDpa` — computed returning the selected vendor's DPA record or null

Template section renders:
- Status: `<Tag>` with `DPA_STATUS_COLORS[vendorDpa.status]` background
- Signed Date: text with `?? '—'` null fallback
- Expiry Date: text with `?? '—'` null fallback
- Risk Label: `<Tag>` with `RISK_LABEL_COLORS[vendorDpa.riskLabel]` background, guarded by `v-if="vendorDpa.riskLabel"`

### Final VendorDrawer Section Order

1. Header (vendor name + category)
2. Usage (frequency, last seen, user count, student count)
3. **DPA** (status badge, signed date, expiry date, risk label badge if set)
4. Privacy Policy Score (total score + radar chart)
5. Tags (MultiSelect for tag assignment)

### Task 2: DashboardView Top 8 Card (src/views/DashboardView.vue)

Complete file replacement: 19 lines of skeleton → 80 lines of working UI.

Imports: `computed`, `Tag`, `vendorsData`, `dpaData`, `RISK_LABEL_COLORS`

Computeds:
- `topAtRisk` — filters `dpaData` for `riskLabel != null`, takes first 8, joins with `vendorsData` by `vendorId`
- `totalVendors` — `vendorsData.length`
- `signedCount` — count of `status === 'Signed'`
- `needsReviewCount` — count of `status === 'Unsigned' || status === 'Expired'`

## Top 8 Vendors on Dashboard Card

The filter `dpaData.filter(d => d.riskLabel != null).slice(0, 8)` yields these 8 rows in order:

| # | Vendor | Category | Risk Label |
|---|--------|----------|------------|
| 1 | Zoom | Video Conferencing | No DPA |
| 2 | Kahoot! | Assessment | High Usage / No DPA |
| 3 | Quizlet | Study Tools | High Usage / No DPA |
| 4 | Flip | Engagement | High Risk Score |
| 5 | Prodigy | Adaptive Learning | High Usage / No DPA |
| 6 | Renaissance | Assessment | High Risk Score |
| 7 | Naviance | Counseling | No DPA |
| 8 | Infinite Campus | SIS | No DPA |

## KPI Tile Values (current data set)

| Tile | Value | Notes |
|------|-------|-------|
| Total Vendors | 27 | All vendors in vendors.js |
| DPAs Signed | 16 | status === 'Signed' in dpa.js |
| Needs Review | 9 | 5 Unsigned + 4 Expired — shown in red |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Applied missing Plan 01 data to worktree**
- **Found during:** Pre-task setup
- **Issue:** Plan 01 feat commits (`9d54549` create riskLabels.js, `0c500ae` add riskLabel fields) were made on a separate worktree branch and were never merged into master. The master branch's `docs(03-01)` commit was the only Plan 01 artifact on master, leaving `src/data/riskLabels.js` absent and `src/data/dpa.js` without `riskLabel` fields. This worktree, branched from master, therefore lacked all Plan 01 data outputs.
- **Fix:** Created `src/data/riskLabels.js` with the exact content from commit `9d54549` and rewrote `src/data/dpa.js` with `riskLabel` fields matching commit `0c500ae`. Included in Task 1 commit.
- **Files modified:** src/data/riskLabels.js (created), src/data/dpa.js (riskLabel fields added)
- **Commit:** a9b2e87

## Known Stubs

None — all data is wired from real data files with computed joins. No hardcoded empty values, placeholder text, or unconnected props.

## Self-Check: PASSED

- FOUND: src/components/VendorDrawer.vue — contains DPA section heading
- FOUND: src/views/DashboardView.vue — contains "Top 8 Vendors Needing Attention", no Skeleton
- FOUND: src/data/riskLabels.js — new file with RISK_LABEL_COLORS and DPA_STATUS_COLORS
- FOUND: src/data/dpa.js — 27 records with riskLabel field
- FOUND commit: a9b2e87 (feat(03-03): add DPA section to VendorDrawer)
- FOUND commit: f46585c (feat(03-03): replace DashboardView skeleton with Top 8 card)
- BUILD: npx vite build succeeded with no errors
