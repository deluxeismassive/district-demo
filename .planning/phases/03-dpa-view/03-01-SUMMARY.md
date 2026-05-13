---
phase: 03-dpa-view
plan: 01
subsystem: data
tags: [data-layer, risk-labels, dpa, mock-data]
dependency_graph:
  requires: []
  provides: [src/data/riskLabels.js, src/data/dpa.js riskLabel field]
  affects: [Plan 02 DPA grid, Plan 03 Dashboard card, VendorDrawer DPA section]
tech_stack:
  added: []
  patterns: [named exports for shared constants, hardcoded risk labels for same-day iteration]
key_files:
  created:
    - src/data/riskLabels.js
  modified:
    - src/data/dpa.js
decisions:
  - "Risk label strings are duplicated in dpa.js (not imported from riskLabels.js) so the data file remains plain JSON-like and editable by sales in under an hour"
  - "Added flipgrid (Expired + video content) and gaggle (Pending + safety monitoring) as additional labeled vendors beyond the required 8 for demo richness"
metrics:
  duration: 8min
  completed: 2026-05-13
  tasks_completed: 2
  files_modified: 2
---

# Phase 03 Plan 01: Risk Label Data Foundation Summary

Extended the DPA mock data with hardcoded riskLabel values per D-09 through D-12, and created a shared risk-label constants module (`src/data/riskLabels.js`) so all downstream views (DPA grid, VendorDrawer, Dashboard card) read labels and badge colors from a single source.

## What Was Built

### Task 1: src/data/riskLabels.js (new file)

Three named exports:

**RISK_LABELS** — canonical label string constants:
- `HIGH_USAGE_NO_DPA: 'High Usage / No DPA'`
- `NO_DPA: 'No DPA'`
- `HIGH_RISK_SCORE: 'High Risk Score'`

**RISK_LABEL_COLORS** — badge hex colors keyed by label string:
- `'High Usage / No DPA': '#b91c1c'` (red-700 — most severe: in-use vendor with no DPA)
- `'No DPA': '#ef4444'` (red-500 — severe but lower usage)
- `'High Risk Score': '#d97706'` (amber-600 — moderate: signed DPA but poor privacy posture)

**DPA_STATUS_COLORS** — status badge hex colors:
- `Signed: '#16a34a'` (green-600)
- `Expired: '#dc2626'` (red-600)
- `Pending: '#f59e0b'` (amber-500)
- `Unsigned: '#6b7280'` (gray-500)

### Task 2: src/data/dpa.js (extended)

All 27 records now carry a `riskLabel` field as the last property. 10 vendors have non-null labels; 17 have `riskLabel: null`.

## Dashboard Storyline Vendors (Required 8)

| vendorId | status | riskLabel | Rationale |
|----------|--------|-----------|-----------|
| vendor-zoom | Expired | No DPA | High-profile video vendor with expired DPA |
| vendor-kahoot | Unsigned | High Usage / No DPA | Widely used quiz platform, no DPA in place |
| vendor-quizlet | Unsigned | High Usage / No DPA | Heavy student usage, no DPA coverage |
| vendor-prodigy | Unsigned | High Usage / No DPA | Adaptive math at scale, no DPA coverage |
| vendor-securly | Unsigned | High Risk Score | Web filter touching sensitive student browsing data |
| vendor-naviance | Unsigned | No DPA | Counseling platform handling sensitive records |
| vendor-infinite-campus | Expired | No DPA | SIS with highest-stakes student data |
| vendor-renaissance | Expired | High Risk Score | Expired DPA + assessment data sensitivity |

## Additional Labels (Claude's Discretion per D-12)

| vendorId | status | riskLabel | Rationale |
|----------|--------|-----------|-----------|
| vendor-flipgrid | Expired | High Risk Score | Expired + student video content is sensitive |
| vendor-gaggle | Pending | High Risk Score | Safety monitoring handles sensitive student communications |

vendor-readworks (Pending): `null` — pending DPA in progress, low concern for demo.

## Label Distribution

| Label | Count |
|-------|-------|
| High Usage / No DPA | 3 |
| No DPA | 3 |
| High Risk Score | 4 |
| null | 17 |
| **Total** | **27** |

All three badge colors render in the demo (coverage confirmed).

## Deviations from Plan

None — plan executed exactly as written. The recommended additional labels (flipgrid, gaggle, readworks) were all applied as recommended.

## Self-Check: PASSED

- FOUND: src/data/riskLabels.js
- FOUND: src/data/dpa.js
- FOUND commit: 9d54549 (feat(03-01): create shared risk-label constants module)
- FOUND commit: 0c500ae (feat(03-01): add riskLabel field to all 27 DPA records)
