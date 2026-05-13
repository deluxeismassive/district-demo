---
phase: 02-data-layer-discovery
plan: 03
subsystem: ui
tags: [vue3, primevue, echarts, vue-echarts, pinia, drawer, multiselect, radar-chart]

requires:
  - phase: 02-data-layer-discovery/02-01
    provides: vendors.js with privacyScore shape + discovery.js with usage metrics
  - phase: 02-data-layer-discovery/02-02
    provides: tags store with tagGroups + assignments + global VChart registration in main.js

provides:
  - VendorDrawer.vue — right-side slide-over with vendor detail, usage grid, privacy radar, and tag MultiSelect
  - v-model:visible contract for DiscoveryView (Plan 04) to control drawer open/close
  - radarOption computed with 10 axes per UI-SPEC ECharts Radar Chart Contract
  - selectedTagIds computed getter/setter bridging MultiSelect to Pinia tagsStore.assignments

affects: [02-04-PLAN, DiscoveryView.vue consumer]

tech-stack:
  added: []
  patterns:
    - "visibleProxy computed pattern: delegate v-model:visible to parent via emit"
    - "Vendor null guard via template v-if — prevents crash during drawer close transition"
    - "selectedTagIds computed getter/setter pattern for MultiSelect <-> Pinia store binding"
    - "radarOption computed reactive to props.vendor.privacyScore for live chart updates"
    - "VChart used as global component (no local import) — registered in main.js via app.component"

key-files:
  created:
    - src/components/VendorDrawer.vue
  modified: []

key-decisions:
  - "VChart not imported locally — relies on global registration from main.js (Plan 02) to avoid double registration"
  - "Radar placeholder div (id=vendor-drawer-radar-slot) used in Task 1 then replaced in Task 2 — clean two-step approach"
  - "selectedTagIds setter writes directly to tagsStore.assignments[vendorId] — store's deep watch handles localStorage persistence"

patterns-established:
  - "Drawer v-model:visible via computed proxy: get from props, set via emit"
  - "Global ECharts component usage without local import in consuming components"

requirements-completed: [DISC-03, TAGS-02]

duration: 5min
completed: 2026-05-13
---

# Phase 2 Plan 03: VendorDrawer — Vendor Detail Slide-Over Summary

**PrimeVue Drawer slide-over with vendor header, usage grid, 10-axis ECharts radar chart, and grouped MultiSelect for Pinia tag assignment**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-05-13T19:34:00Z
- **Completed:** 2026-05-13T19:39:00Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Created `src/components/VendorDrawer.vue` (152 lines) — self-contained vendor detail slide-over
- 10-axis ECharts radar chart with exact UI-SPEC labels and brand colors (fill `rgba(72,76,230,0.15)`, stroke `#484ce6`)
- Grouped MultiSelect wired to `tagsStore.assignments[vendorId]` — tag selections persist via store's localStorage watch
- Component is entirely self-contained — Plan 04 only needs to mount it and pass the joined vendor row

## Task Commits

Each task was committed atomically:

1. **Task 1: Create VendorDrawer.vue with header, sections, and grouped tag MultiSelect** - `a652d3b` (feat)
2. **Task 2: Replace radar placeholder with VChart computed option (10-axis privacy chart)** - `97afb89` (feat)

## Files Created/Modified

- `src/components/VendorDrawer.vue` — Right-side slide-over: vendor header + category, usage 2-col grid, totalPrivacyScore badge, 10-axis VChart radar, grouped MultiSelect for tag assignment

## Component Shape

**Props:**
- `vendor: Object | null` — joined `{ ...vendor, ...discoveryRecord }` object from DiscoveryView tableRows
- `visible: Boolean` — controlled via `v-model:visible` from parent

**Emits:**
- `update:visible` — delegated through `visibleProxy` computed

**Computed properties:**
- `visibleProxy` — delegates v-model:visible pattern to parent
- `totalPrivacyScore` — `Object.values(vendor.privacyScore).reduce(sum + v, 0)`, max 100
- `selectedTagIds` — getter reads `tagsStore.assignments[vendorId]`, setter writes back
- `radarOption` — full ECharts option object with 10 radar indicators per UI-SPEC

## Radar Chart Confirmation

The 10 axis labels match UI-SPEC exactly, in the correct order aligned with privacyScore keys:

| Order | Axis Label | privacyScore key |
|-------|------------|-----------------|
| 1 | Information Collected | informationCollected |
| 2 | Use of Information | useOfInformation |
| 3 | Data Sharing | dataSharing |
| 4 | Security Measures | securityMeasures |
| 5 | User Rights | userRights |
| 6 | Retention Period | retentionPeriod |
| 7 | Compliance with Laws | complianceWithLaws |
| 8 | Updates to Privacy Policy | updatesToPolicy |
| 9 | Overall Clarity and Transparency | clarityAndTransparency |
| 10 | Contact Information | contactInformation |

Each axis: `max: 10`. Fill: `rgba(72, 76, 230, 0.15)`. Stroke: `#484ce6`, width 2.

## Decisions Made

- VChart not imported locally — relies on global `app.component('VChart', VChart)` registration from Plan 02's `main.js`. Using it locally would require re-importing echarts modules.
- Drawer width set via `:style="{ width: '480px' }"` as object binding (not string) — consistent with PrimeVue docs.
- `template v-if="vendor"` wraps entire drawer body — prevents null-access crash when drawer transitions to closed state while vendor is set to null by parent.

## Deviations from Plan

None — plan executed exactly as written. Both tasks followed the verbatim code from the plan spec.

**Merge prerequisite:** Plan 02-02 (worktree-agent-aa818125 branch) was merged into this worktree before execution to obtain the restructured tags store (`tagGroups` shape) and global VChart registration in `main.js`. This was required by the `depends_on: [02-01, 02-02]` frontmatter constraint.

## Issues Encountered

None. Build passed on first attempt for both tasks.

## Known Stubs

None — VendorDrawer is a complete component. It does not source data directly (data flows via props from DiscoveryView). The drawer body is guarded by `v-if="vendor"` so it renders nothing when vendor is null — this is intentional, not a stub.

## Next Phase Readiness

- Plan 04 (`DiscoveryView.vue` full implementation) can now import and mount `VendorDrawer`:
  ```html
  <VendorDrawer v-model:visible="drawerVisible" :vendor="selectedVendor" />
  ```
- Plan 04 is responsible for: joining vendor + discovery data into `tableRows`, setting `selectedVendor` on `@row-click`, and controlling `drawerVisible`
- The v-model:visible contract is ready; no changes to VendorDrawer needed in Plan 04

---
*Phase: 02-data-layer-discovery*
*Completed: 2026-05-13*
