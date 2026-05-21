---
phase: 04-1edtech-view
plan: "01"
subsystem: data
tags: [edtech, 1edtech, data-enrichment, riskLabels, reports]
dependency_graph:
  requires: []
  provides: [edtech-js-enriched, EDTECH_STATUS_COLORS, ReportsView-cleanup]
  affects: [src/components/VendorDrawer.vue]
tech_stack:
  added: []
  patterns: [same-Object.fromEntries-join-pattern, same-DPA-badge-color-style]
key_files:
  created: []
  modified:
    - src/data/edtech.js
    - src/data/riskLabels.js
    - src/views/ReportsView.vue
decisions:
  - "EDTECH_STATUS_COLORS reuses DPA semantic palette — Certified=green, Not Certified=gray, In Review=amber, Expired=red"
  - "5 distinct standards assigned across 17 non-null records (OneRoster 2.0 x6, LTI 1.3 x6, QTI 3.0 x2, Caliper 1.2 x2, CASE 1.0 x1)"
metrics:
  duration: "1 min"
  completed_date: "2026-05-13"
---

# Phase 04 Plan 01: 1EdTech Data Prep Summary

**One-liner:** Enriched all 27 edtech.js vendor records with certificationStandard + certifiedDate fields, added EDTECH_STATUS_COLORS to riskLabels.js, and removed the dead 1EdTech tab from ReportsView.

## What Was Built

Three independent file edits that prepare all non-VendorDrawer surface area for the 1EdTech feature, enabling Plan 02 (VendorDrawer integration) to consume both data sources cleanly.

## Standard Distribution (certificationStandard assignments)

All 17 non-null records (15 Certified + 3 Expired) use these standards:

| Standard | Count | Vendors |
|----------|-------|---------|
| OneRoster 2.0 | 6 | google-classroom, schoology, clever, classlink, powerschool (Expired) |
| LTI 1.3 | 6 | canvas, microsoft-teams, seesaw, nearpod, pear-deck, flipgrid (Expired) |
| Caliper 1.2 | 2 | ixl, khan-academy |
| QTI 3.0 | 2 | mystery-science, renaissance (Expired) |
| CASE 1.0 | 1 | newsela |

Null standard (10 vendors): zoom, kahoot (In Review), quizlet, edpuzzle (In Review), readworks, prodigy, dreambox (In Review), naviance, infinite-campus, securly (In Review), gaggle

## EDTECH_STATUS_COLORS Confirmation

Keys in EDTECH_STATUS_COLORS exactly match the four certificationStatus values used in edtech.js:

| certificationStatus | Color | Hex |
|---------------------|-------|-----|
| Certified | green-600 | #16a34a |
| Not Certified | gray-500 | #6b7280 |
| In Review | amber-500 | #f59e0b |
| Expired | red-600 | #dc2626 |

This matches the DPA semantic palette for visual consistency across the portal.

## Files Modified

| File | Change | Lines |
|------|--------|-------|
| src/data/edtech.js | Added certificationStandard + certifiedDate to all 27 records | +81/-27 |
| src/data/riskLabels.js | Appended EDTECH_STATUS_COLORS export | +13 |
| src/views/ReportsView.vue | Removed '1EdTech' from tabs array | +1/-1 |

## Task Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | eb35a8b | feat(04-01): enrich edtech.js with certificationStandard and certifiedDate for all 27 vendors |
| 2 | 8a99720 | feat(04-01): add EDTECH_STATUS_COLORS export to riskLabels.js |
| 3 | f98f9dc | feat(04-01): remove 1EdTech tab from ReportsView.vue tabs array |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - this plan is data preparation only. No UI rendering depends on these stubs.

## Self-Check: PASSED

- src/data/edtech.js: 27 records, 27 certificationStandard fields, 27 certifiedDate fields
- src/data/riskLabels.js: EDTECH_STATUS_COLORS export present with all 4 keys
- src/views/ReportsView.vue: tabs = ['DPA', 'Risk Position'], no '1EdTech' string
- npm run build: exits 0
