---
phase: 02-data-layer-discovery
plan: 02
subsystem: data-layer
tags: [pinia, echarts, vue-echarts, localstorage, tags-store]
dependency_graph:
  requires: []
  provides: [useTagsStore-phase2-shape, VChart-global-registration]
  affects: [src/stores/tags.js, src/main.js]
tech_stack:
  added: [vue-echarts, echarts/core, echarts/renderers, echarts/charts, echarts/components]
  patterns: [pinia-setup-store, localstorage-watch-persistence, echarts-tree-shaking]
key_files:
  created: []
  modified:
    - src/stores/tags.js
    - src/main.js
decisions:
  - "localStorage persistence confirmed: tags survive page refresh via deep watchers (schoolday-tag-groups, schoolday-tag-assignments)"
  - "ECharts tree-shaken to radar-only: CanvasRenderer + RadarChart + RadarComponent + TooltipComponent"
  - "use([...]) called before createApp() per vue-echarts requirement"
  - "VChart registered globally so Plan 03 VendorDrawer needs no per-component import"
metrics:
  duration: 55s
  completed: "2026-05-13"
  tasks_completed: 2
  files_modified: 2
requirements_satisfied: [TAGS-02]
---

# Phase 02 Plan 02: Tags Store Restructure + ECharts Registration Summary

**One-liner:** Hierarchical Pinia tags store with localStorage persistence (schoolday-tag-groups/schoolday-tag-assignments) and globally registered VChart with tree-shaken radar ECharts modules.

---

## What Was Built

### Task 1: Tags Store Restructure

**Before:** Flat `{ tags: ref([]), assignments: ref({}) }` — 9-line placeholder with no persistence.

**After:** Hierarchical `{ tagGroups: ref([...]), assignments: ref({}) }` with localStorage watchers.

**Store shape transformation:**

```
BEFORE                          AFTER
──────────────────────          ─────────────────────────────────────────
tags: ref([])                   tagGroups: ref([
                                  { id, name, color, children: [{id, name}] }
                                  ...4 groups, 11 child tags total
                                ])
assignments: ref({})            assignments: ref({})  (vendorId → childTagId[])
(no persistence)                + deep watchers → localStorage
```

**Seed data:** 4 parent groups, 11 child tags:
- Curriculum (#484ce6): Math, Science, ELA, Social Studies
- Assessment (#da8231): Formative, Summative
- Communication (#16a34a): Parent Engagement, Staff Messaging
- Administration (#dc2626): HR, Finance, Scheduling

**localStorage keys (D-26):**
- `schoolday-tag-groups` — persists tagGroups array
- `schoolday-tag-assignments` — persists assignments object

**Persistence pattern:** `watch(ref, val => localStorage.setItem(key, JSON.stringify(val)), { deep: true })` on both refs. `loadOrDefault()` helper with try/catch for safe JSON parse on init.

### Task 2: ECharts Registration in main.js

**ECharts modules registered (tree-shaken, radar-only):**
1. `CanvasRenderer` — rendering engine
2. `RadarChart` — chart type
3. `RadarComponent` — chart configuration
4. `TooltipComponent` — tooltip support

**Registration order (critical):**
1. `use([...])` at line 34 — before `createApp(App)` at line 36
2. `app.component('VChart', VChart)` at line 48 — before `app.mount('#app')` at line 50

**Not registered:** Full echarts package (`import * as echarts` avoided — tree-shaken only).

---

## Plans Unblocked

- **Plan 03 (VendorDrawer):** Can use `<VChart :option="..." />` without any per-component ECharts imports. Tags store provides `tagGroups` + `assignments` refs for MultiSelect binding.
- **Plan 04 (DiscoveryView):** Reads `tagGroups[*].color` to render colored tag pills; reads `assignments[vendorId]` to show which tags are active per vendor row.

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Stubs

None — both files are fully functional. The `assignments` object starts empty by design; vendors receive tag assignments in Plan 03 via VendorDrawer MultiSelect.

---

## Self-Check

**Files exist:**
- `src/stores/tags.js` — present
- `src/main.js` — present

**Commits exist:**
- `93c5f4a` — feat(02-02): restructure tags store
- `9eed973` — feat(02-02): register ECharts radar modules

## Self-Check: PASSED
