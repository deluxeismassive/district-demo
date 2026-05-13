---
phase: 04-1edtech-view
plan: "02"
subsystem: VendorDrawer
tags: [1edtech, vendor-drawer, certification, badge, drawer-section]
dependency_graph:
  requires:
    - 04-01 (edtech.js with certificationStandard + certifiedDate, EDTECH_STATUS_COLORS in riskLabels.js)
  provides:
    - 1EdTech Certification section in VendorDrawer between DPA and Privacy Policy Score
  affects:
    - src/components/VendorDrawer.vue
tech_stack:
  added: []
  patterns:
    - Object.fromEntries(edtechData.map) join by vendorId (mirrors dpaMap pattern)
    - vendorEdtech computed wrapping the join map lookup
    - PrimeVue Tag :style binding with EDTECH_STATUS_COLORS
    - v-if conditional rows for optional certificationStandard and certifiedDate fields
key_files:
  created: []
  modified:
    - src/components/VendorDrawer.vue
decisions:
  - "1EdTech section placed between DPA and Privacy Policy Score per D-08/D-09 decisions"
  - "Status badge always rendered; Standard and Certified Date rows are conditional per D-10"
  - "Section heading is '1EdTech Certification' for clarity over bare '1EdTech'"
metrics:
  duration: 39s
  completed: "2026-05-13"
  tasks_completed: 1
  tasks_total: 2
  files_modified: 1
---

# Phase 04 Plan 02: 1EdTech VendorDrawer Section Summary

**One-liner:** Added 1EdTech Certification section to VendorDrawer with EDTECH_STATUS_COLORS badge and conditional Standard/Date rows, joined from edtech.js by vendorId.

## What Was Built

### Task 1: 1EdTech section added to VendorDrawer.vue

Four changes were made to `src/components/VendorDrawer.vue`:

1. **Import edtechData** — `import edtechData from '../data/edtech.js'` added after dpaData import
2. **Extend riskLabels import** — `EDTECH_STATUS_COLORS` added alongside `DPA_STATUS_COLORS, RISK_LABEL_COLORS`
3. **Join map + computed** — `edtechMap` (Object.fromEntries by vendorId) and `vendorEdtech` computed added after vendorDpa, following the identical dpaMap pattern
4. **1EdTech Certification section in template** — inserted between the DPA `</section>` and the `<Divider />` before Privacy Policy Score

#### Section structure:
- Section heading: `1EdTech Certification` (h3, `text-sm font-semibold text-gray-900 mb-4`)
- Status badge: always shown via PrimeVue Tag with `EDTECH_STATUS_COLORS[vendorEdtech.certificationStatus]` background
- Standard row: conditional on `v-if="vendorEdtech.certificationStandard"` (null for Not Certified / In Review vendors)
- Certified Date row: conditional on `v-if="vendorEdtech.certifiedDate"` (null for same vendors)
- Fallback: `No 1EdTech record on file.` when vendorEdtech is null

**Line count delta:** 193 lines (before) → 223 lines (after) — +30 lines

**Build:** `npm run build` exits 0. Chunk size warnings are pre-existing.

## Acceptance Criteria Verification

| Criterion | Result |
|-----------|--------|
| `import edtechData from '../data/edtech.js'` present | PASS |
| `EDTECH_STATUS_COLORS` in riskLabels import | PASS |
| `const edtechMap = Object.fromEntries(edtechData.map((d) => [d.vendorId, d]))` | PASS |
| `const vendorEdtech = computed(` | PASS |
| `1EdTech Certification` h3 heading | PASS |
| `vendorEdtech.certificationStatus` in Tag :value | PASS |
| `EDTECH_STATUS_COLORS[vendorEdtech.certificationStatus]` in :style | PASS |
| `v-if="vendorEdtech.certificationStandard"` conditional row | PASS |
| `v-if="vendorEdtech.certifiedDate"` conditional row | PASS |
| `No 1EdTech record on file.` fallback | PASS |
| New section after DPA, before Privacy Policy Score | PASS |
| DPA section unchanged | PASS |
| Privacy Policy Score section unchanged | PASS |
| `npm run build` exits 0 | PASS |

## Checkpoint Status

**Task 2 (checkpoint:human-verify)** is pending — awaiting human visual verification of all four vendor scenarios.

### Expected verification scenarios:

| Vendor | Status | Expected badge | Standard row | Certified Date row |
|--------|--------|---------------|---|---|
| Google Classroom | Certified | Green (#16a34a) "Certified" | "OneRoster 2.0" | "2024-03-15" |
| Quizlet | Not Certified | Gray (#6b7280) "Not Certified" | Hidden | Hidden |
| Kahoot | In Review | Amber (#f59e0b) "In Review" | Hidden | Hidden |
| Flipgrid | Expired | Red (#dc2626) "Expired" | "LTI 1.3" | "2020-06-15" |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all 27 vendors have edtech.js records; the fallback exists but is not exercised in fixture data.

## EDTECH-01 Requirement Status

EDTECH-01 is now satisfied through the drawer surface per decisions D-01/D-02 (no standalone 1EdTech page — the drawer IS the 1EdTech view). Should be marked Validated at next `/gsd:transition`.

## Self-Check: PENDING

Human checkpoint (Task 2) not yet completed. Self-check will finalize after human approval.
