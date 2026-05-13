---
phase: 03-dpa-view
plan: 02
subsystem: ui
tags: [dpa-grid, discovery-view, tab-bar, datatable, badges]
dependency_graph:
  requires: [src/data/riskLabels.js, src/data/dpa.js riskLabel field, src/data/vendors.js, src/components/VendorDrawer.vue]
  provides: [src/components/DpaGrid.vue, Discovery|DPA tab bar in DiscoveryView]
  affects: [Plan 03 Dashboard card (DPA count surface), DiscoveryView end-to-end flow]
tech_stack:
  added: []
  patterns: [view-level join via Object.fromEntries, tab bar from ReportsView pattern, shared drawer state at view level]
key_files:
  created:
    - src/components/DpaGrid.vue
  modified:
    - src/views/DiscoveryView.vue
decisions:
  - "DpaGrid.vue owns filter + DataTable but not drawer state — emits row-click to parent so VendorDrawer can be shared across both tabs without duplication"
  - "needsAttentionCount (Unsigned + Expired) shown in DpaGrid header area to give the DPA tab a meaningful summary at a glance"
  - "filteredCount span in DiscoveryView header uses v-if guard so it hides on the DPA tab (DpaGrid shows its own count)"
metrics:
  duration: ~2min
  completed: 2026-05-13
  tasks_completed: 2
  files_modified: 2
---

# Phase 03 Plan 02: DPA Grid + Tab Bar Summary

Built the DPA grid as a self-contained `DpaGrid.vue` component and embedded it as a second tab inside `DiscoveryView.vue`. Sales reps can now flip between "how is this vendor used?" (Discovery tab) and "do we have a DPA in place?" (DPA tab) on the same screen, with clicking any row on either tab opening the same VendorDrawer.

## What Was Built

### Task 1: src/components/DpaGrid.vue (new file)

Self-contained DPA DataTable component. Key design decisions:

**Column structure (6 columns, all sortable):**
| Field | Header | Notes |
|-------|--------|-------|
| name | Vendor Name | minWidth 12rem |
| category | Category | 10rem |
| status | Status | 8rem — Tag badge via DPA_STATUS_COLORS |
| signedDate | Signed Date | 9rem — null renders '—' |
| expiryDate | Expiry Date | 9rem — null renders '—' |
| riskLabel | Risk Label | 12rem — v-if guard; null renders '—' |

**View-level join:** `Object.fromEntries(dpaData.map((d) => [d.vendorId, d]))` — same pattern established in Phase 2 for DiscoveryView.

**Emit signature:** `defineEmits(['row-click'])` — `onRowClick(event)` passes the full PrimeVue row-click event to the parent. Parent accesses `event.data` to get the vendor record.

**Filter:** Global filter on `['name', 'category']` using `FilterMatchMode.CONTAINS` from `@primevue/core/api`.

**Attention count:** `needsAttentionCount` (Unsigned + Expired) shown at top-right of filter row. Gives a quick risk summary on the DPA tab.

### Task 2: src/views/DiscoveryView.vue (modified)

Changes made:
1. Added `import DpaGrid from '../components/DpaGrid.vue'`
2. Added `const tabs = ['Discovery', 'DPA']` and `const activeTab = ref('Discovery')`
3. Tab bar added below page header, above content — pattern copied verbatim from `ReportsView.vue` (border-b-2 active indicator, `border-primary text-primary` active class)
4. Existing Discovery filter + DataTable wrapped in `<template v-if="activeTab === 'Discovery'">`
5. DPA tab: `<template v-else-if="activeTab === 'DPA'"><DpaGrid @row-click="onRowClick" /></template>`
6. `filteredCount` span guarded with `v-if="activeTab === 'Discovery'"` (DpaGrid shows its own count)
7. `VendorDrawer` remains at bottom of template, shared by both tabs through the same `onRowClick` handler

**No Discovery columns were removed.** All 7 existing columns (name, category, frequency, lastSeen, userCount, studentCount, tags) are preserved in the Discovery tab.

## Verification Results

1. `npx vite build` — succeeds with no errors
2. `grep -c 'field="' src/components/DpaGrid.vue` — returns 6
3. `grep "DPA_STATUS_COLORS[data.status]"` — match found
4. `grep "RISK_LABEL_COLORS[data.riskLabel]"` — match found
5. `grep "activeTab = ref('Discovery')"` — match found
6. `grep "<DpaGrid"` — match found

## Deviations from Plan

None — plan executed exactly as written. The template structure, import paths, and tab bar pattern all match the plan specification.

## Known Stubs

None. All 27 DPA records are wired from `src/data/dpa.js` (with riskLabel fields from Plan 01). The component renders live data for all rows.

## Self-Check: PASSED

- FOUND: src/components/DpaGrid.vue
- FOUND: src/views/DiscoveryView.vue (modified)
- FOUND commit: 2b5d8dc (feat(03-02): create DpaGrid.vue with DataTable + 6 columns + filter + row-click emit)
- FOUND commit: aaac152 (feat(03-02): add Discovery|DPA tab bar to DiscoveryView with shared drawer)
