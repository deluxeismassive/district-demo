# Phase 2: Data Layer + Discovery - Research

**Researched:** 2026-05-13
**Domain:** Vue 3 data layer (static ES module files), PrimeVue 4 DataTable with sorting/filtering, vue-echarts radar chart, Pinia localStorage persistence
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Four separate `src/data/` files — `vendors.js`, `discovery.js`, `dpa.js`, `edtech.js` — all seeded in Phase 2
- **D-02:** `vendors.js` holds shared base metadata per vendor: `vendorId`, `name`, `category`, and all 10 privacy policy dimension scores
- **D-03:** `discovery.js` holds usage metrics per vendor: frequency, lastSeen, userCount, studentCount — keyed by vendorId
- **D-04:** `dpa.js` holds DPA status, signedDate, expiryDate per vendor — values are realistic placeholders in Phase 2; Phase 3 builds the view
- **D-05:** `edtech.js` holds 1EdTech certification status per vendor — values are realistic placeholders in Phase 2; Phase 4 builds the view
- **D-06:** Join key is stable `vendorId` string (e.g. `"vendor-google-classroom"`) — never use display name as a key
- **D-07:** Each vendor has a `privacyScore` object with 10 dimension scores (each 1–10): `informationCollected`, `useOfInformation`, `dataSharing`, `securityMeasures`, `userRights`, `retentionPeriod`, `complianceWithLaws`, `updatesToPolicy`, `clarityAndTransparency`, `contactInformation`
- **D-08:** Total privacy score = sum of all 10 dimensions (max 100). Computed, not stored.
- **D-09:** Privacy score radar chart renders in the vendor detail slide-over using ECharts (vue-echarts). ECharts is installed in Phase 2 and reused in Phase 5 for the risk donut chart.
- **D-10:** ~25–30 realistic edtech brands seeded by Claude (Google Classroom, Canvas, Zoom, Schoology, IXL, Clever, SeeSaw, Kahoot, etc.)
- **D-11:** Vendors have a realistic spread of DPA statuses (Signed, Unsigned, Expired, Pending) and usage patterns (high/medium/low frequency)
- **D-12:** All 10 privacy policy dimension scores assigned per vendor with plausible variation
- **D-13:** Clicking a vendor row in Discovery opens a PrimeVue Drawer (slide-over from right)
- **D-14:** The slide-over shows: vendor name + category, usage deep-dive (discovery metrics), privacy policy radar chart + total score, and tag assignment control
- **D-15:** Tag assignment in the slide-over uses a grouped multi-select control (child tags grouped under parent labels)
- **D-16:** PrimeVue DataTable with sortable columns: Vendor Name, Category, Frequency, Last Seen, Users, Students, Tags
- **D-17:** Filter input above the table narrows results in real time (global filter or per-column — Claude's discretion)
- **D-18:** Tags column displays assigned child tag pills, visually grouped by their parent tag — read-only in the table
- **D-19:** No inline tag creation or '+' button in the table. Tag management is entirely in Settings/Tags (Phase 6)
- **D-20:** Tags are hierarchical: parent groups contain child tags. Only child tags are assigned to vendors (not parent tags directly)
- **D-21:** The `useTagsStore` holds `tagGroups` (array of parent groups, each with `id`, `name`, `color`, and `children` array of child tags)
- **D-22:** `assignments` in the store is an object keyed by `vendorId`, value is an array of child tag IDs
- **D-23:** Claude seeds realistic edtech-context parent groups and child tags (e.g. Curriculum → Math, Science, ELA; Communication → Parent Engagement, Staff Messaging; Assessment → Formative, Summative)
- **D-24:** Both `tagGroups` and `assignments` are persisted to localStorage — survive page refresh and browser close
- **D-25:** Pinia store uses `watch()` to sync state to localStorage on every change; initializes from localStorage on first load
- **D-26:** localStorage keys: `schoolday-tag-groups` and `schoolday-tag-assignments`

### Claude's Discretion

- Exact number of vendor fixtures (target 25–30, within that range is fine)
- Specific parent group names and child tag names for seed data
- Filter UX in the Discovery table (global search bar vs per-column filters — recommendation: global search bar, simpler and faster for a demo)
- Radar chart visual styling and color scheme within the existing brand palette
- Exact layout and proportions of the vendor detail slide-over panel

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 2 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-03 | All display data lives in `src/data/*.js` files, editable without touching components | Static ES module export pattern; four files seeded in Phase 2 |
| DISC-01 | User can view a sortable, filterable table of vendors with name, category, usage metrics, and user/student counts | PrimeVue DataTable with `sortField`/`sortOrder`, `v-model:filters`, `globalFilterFields` |
| DISC-02 | User can assign and remove tags on a vendor from the Discovery table | PrimeVue Drawer opened on row click; MultiSelect with grouped options writes to `useTagsStore.assignments` |
| DISC-03 | User can expand or open a detail view for a vendor to see full usage data | PrimeVue Drawer (`position="right"`) opened via `@rowClick` event handler |
| TAGS-02 | User can assign and remove tags on vendor rows in the Discovery page | Same as DISC-02 — MultiSelect in VendorDrawer; tag pills rendered read-only in table Tags column |
</phase_requirements>

---

## Summary

Phase 2 has two coupled concerns: (1) establish the complete static data layer in `src/data/` and (2) replace the `DiscoveryView.vue` skeleton with a fully interactive vendor table. All decisions are locked — there are no architectural choices to make.

The data layer is plain ES module arrays exported from four files. No async loading, no store for vendor/discovery data (just static imports into the view). Only the tags store uses Pinia with localStorage persistence.

The Discovery UI is built entirely from already-installed PrimeVue 4 components (DataTable, Column, Drawer, MultiSelect, Tag, InputText, IconField, InputIcon). The only new install is `echarts` + `vue-echarts` for the radar chart. Both packages have stable current versions (echarts 6.0.0, vue-echarts 8.0.1) that are compatible with Vue 3.

**Primary recommendation:** Implement in two waves — Wave 1 seeds all four data files and restructures the tags store; Wave 2 builds DiscoveryView and VendorDrawer consuming that data.

---

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| primevue | ^4.5.5 | DataTable, Drawer, MultiSelect, Tag, InputText | Already installed, Aura preset configured |
| pinia | ^3.0.4 | Tags store with localStorage watch | Already installed and wired |
| vue-router | ^5.0.7 | Hash history routing | Already installed, `/discovery` route registered |

### New Install Required
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| echarts | 6.0.0 (latest) | Apache ECharts core — radar chart engine | Peer dependency of vue-echarts |
| vue-echarts | 8.0.1 (latest) | Vue 3 wrapper for ECharts | Decided in D-09; reused in Phase 5 |

**Version verification (confirmed against npm registry 2026-05-13):**
- `echarts`: latest = `6.0.0`, dist-tag `latest` confirmed
- `vue-echarts`: latest = `8.0.1`, dist-tag `latest` confirmed
- `vue-echarts` peer dependency: `{ vue: '^3.3.0', echarts: '^6.0.0' }` — both satisfied

**Installation:**
```bash
npm install echarts vue-echarts
```

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| PrimeVue DataTable | hand-rolled table | DataTable provides built-in sort, filter, row events — zero reason to hand-roll for a demo |
| vue-echarts radar | Chart.js radar | vue-echarts is already decided (D-09); Chart.js would be an extra install with no benefit |
| Pinia watch() for localStorage | pinia-plugin-persistedstate | Plugin adds a dependency; `watch()` pattern is 5 lines of code and explicitly decided in D-25 |

---

## Architecture Patterns

### Project Structure (Phase 2 additions)
```
src/
├── data/               # NEW — all mock data (FOUND-03)
│   ├── vendors.js      # Base vendor metadata + privacy scores (D-02)
│   ├── discovery.js    # Usage metrics per vendor (D-03)
│   ├── dpa.js          # DPA status placeholder (D-04)
│   └── edtech.js       # 1EdTech status placeholder (D-05)
├── stores/
│   └── tags.js         # RESTRUCTURE — tagGroups + assignments + localStorage (D-21..D-26)
├── components/
│   └── VendorDrawer.vue  # NEW — slide-over detail panel (D-13..D-15)
└── views/
    └── DiscoveryView.vue # REPLACE skeleton with full implementation (D-16..D-19)
```

### Pattern 1: Static ES Module Data Files

**What:** Each data domain is a plain JS file exporting an array of plain objects. No store, no reactive wrapper — just `export default []`.

**When to use:** All four `src/data/` files (FOUND-03 requirement: editable without touching components).

**Example:**
```javascript
// src/data/vendors.js
export default [
  {
    vendorId: 'vendor-google-classroom',
    name: 'Google Classroom',
    category: 'LMS',
    privacyScore: {
      informationCollected: 7,
      useOfInformation: 6,
      dataSharing: 5,
      securityMeasures: 9,
      userRights: 7,
      retentionPeriod: 6,
      complianceWithLaws: 8,
      updatesToPolicy: 7,
      clarityAndTransparency: 8,
      contactInformation: 9
    }
  },
  // ... 24-29 more vendors
]

// src/data/discovery.js
export default [
  {
    vendorId: 'vendor-google-classroom',
    frequency: 'Daily',
    lastSeen: '2026-05-12',
    userCount: 1842,
    studentCount: 14230
  },
  // ...
]
```

### Pattern 2: View-level Data Join (computed ref)

**What:** `DiscoveryView.vue` imports both `vendors.js` and `discovery.js`, joins them by `vendorId` into a computed array of flat row objects for DataTable consumption. No separate store for vendor data.

**When to use:** DiscoveryView is the only consumer of joined vendor+discovery data in Phase 2. Keeps data join local to the view.

**Example:**
```javascript
// src/views/DiscoveryView.vue <script setup>
import vendorsData from '../data/vendors.js'
import discoveryData from '../data/discovery.js'
import { computed } from 'vue'

const discoveryMap = Object.fromEntries(discoveryData.map(d => [d.vendorId, d]))

const tableRows = computed(() =>
  vendorsData.map(v => ({
    ...v,
    ...discoveryMap[v.vendorId]
  }))
)
```

### Pattern 3: PrimeVue DataTable with Global Filter

**What:** DataTable receives `v-model:filters` with a `global` key initialized from `FilterMatchMode.CONTAINS`. `globalFilterFields` lists the fields to search. An InputText above the table binds to `filters['global'].value`.

**When to use:** DISC-01 real-time filter requirement.

**Example:**
```javascript
// Source: primevue.org/datatable/#filter (verified 2026-05-13)
import { FilterMatchMode } from 'primevue/api'
import { ref } from 'vue'

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})
```

```html
<IconField>
  <InputIcon><i class="pi pi-search" /></InputIcon>
  <InputText v-model="filters['global'].value" placeholder="Search vendors..." />
</IconField>

<DataTable
  :value="tableRows"
  v-model:filters="filters"
  :globalFilterFields="['name', 'category']"
  @row-click="openDrawer"
  sortField="name"
  :sortOrder="1"
>
  <Column field="name" header="Vendor Name" sortable />
  <Column field="category" header="Category" sortable />
  <Column field="frequency" header="Frequency" sortable />
  <Column field="lastSeen" header="Last Seen" sortable />
  <Column field="userCount" header="Users" sortable />
  <Column field="studentCount" header="Students" sortable />
  <Column header="Tags" />
</DataTable>
```

**Key detail:** `@row-click` (not `@rowClick`) emits an event object with `event.data` = the clicked row object.

### Pattern 4: PrimeVue Drawer (Slide-over)

**What:** `Drawer` with `position="right"` and fixed width via inline style. Controlled by `v-model:visible`. Opened from `DiscoveryView` via `@row-click` handler, receives selected vendor as prop.

**When to use:** DISC-03 vendor detail requirement (D-13).

**Example:**
```html
<!-- In DiscoveryView.vue -->
<VendorDrawer v-model:visible="drawerVisible" :vendor="selectedVendor" />
```

```html
<!-- VendorDrawer.vue -->
<Drawer v-model:visible="visible" position="right" style="width: 480px">
  <!-- header, sections, radar chart, MultiSelect -->
</Drawer>
```

### Pattern 5: vue-echarts Radar Chart (tree-shaken)

**What:** Register only the required ECharts modules globally in `main.js` using the `use()` call. Import `VChart` component in `VendorDrawer.vue`. Pass a computed `option` ref.

**When to use:** Privacy policy radar chart (D-09).

**Registration in main.js (add after existing PrimeVue setup):**
```javascript
// Source: github.com/ecomfe/vue-echarts (verified 2026-05-13)
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, RadarChart, RadarComponent, TooltipComponent])
app.component('VChart', VChart)
```

**Radar option shape:**
```javascript
// Source: vue-echarts.dev (verified 2026-05-13)
const radarOption = computed(() => ({
  radar: {
    indicator: [
      { name: 'Information Collected', max: 10 },
      { name: 'Use of Information', max: 10 },
      { name: 'Data Sharing', max: 10 },
      { name: 'Security Measures', max: 10 },
      { name: 'User Rights', max: 10 },
      { name: 'Retention Period', max: 10 },
      { name: 'Compliance with Laws', max: 10 },
      { name: 'Updates to Privacy Policy', max: 10 },
      { name: 'Overall Clarity and Transparency', max: 10 },
      { name: 'Contact Information', max: 10 }
    ]
  },
  series: [{
    type: 'radar',
    data: [{
      value: [
        props.vendor.privacyScore.informationCollected,
        props.vendor.privacyScore.useOfInformation,
        props.vendor.privacyScore.dataSharing,
        props.vendor.privacyScore.securityMeasures,
        props.vendor.privacyScore.userRights,
        props.vendor.privacyScore.retentionPeriod,
        props.vendor.privacyScore.complianceWithLaws,
        props.vendor.privacyScore.updatesToPolicy,
        props.vendor.privacyScore.clarityAndTransparency,
        props.vendor.privacyScore.contactInformation
      ],
      areaStyle: { color: 'rgba(72, 76, 230, 0.15)' },
      lineStyle: { color: '#484ce6', width: 2 }
    }]
  }],
  tooltip: { trigger: 'item' }
}))
```

### Pattern 6: Pinia Tags Store with localStorage Persistence

**What:** `useTagsStore` restructured from the current flat `tags` + `assignments` to `tagGroups` (hierarchical) + `assignments`. Both are initialized from localStorage on first load and persisted via `watch()` on every change.

**When to use:** D-21 through D-26 (tag hierarchy + persistence).

**Example:**
```javascript
// src/stores/tags.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const TAG_GROUPS_KEY = 'schoolday-tag-groups'
const ASSIGNMENTS_KEY = 'schoolday-tag-assignments'

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref(loadFromStorage(TAG_GROUPS_KEY, [
    // seed data — Curriculum, Communication, Assessment groups etc.
  ]))

  const assignments = ref(loadFromStorage(ASSIGNMENTS_KEY, {}))

  watch(tagGroups, val => localStorage.setItem(TAG_GROUPS_KEY, JSON.stringify(val)), { deep: true })
  watch(assignments, val => localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(val)), { deep: true })

  return { tagGroups, assignments }
})
```

### Pattern 7: PrimeVue MultiSelect with Grouped Options

**What:** MultiSelect with `optionGroupLabel="name"` and `optionGroupChildren="children"` for the hierarchical tag structure. `v-model` bound to a computed getter/setter that reads/writes `useTagsStore.assignments[vendorId]`.

**When to use:** Tag assignment in VendorDrawer (D-15, TAGS-02).

**Example:**
```html
<MultiSelect
  v-model="selectedTagIds"
  :options="tagsStore.tagGroups"
  optionLabel="name"
  optionValue="id"
  optionGroupLabel="name"
  optionGroupChildren="children"
  placeholder="Assign tags..."
  display="chip"
  class="w-full"
>
  <template #emptyfilter>No tags available. Create tags in Settings.</template>
</MultiSelect>
```

```javascript
const selectedTagIds = computed({
  get: () => tagsStore.assignments[props.vendor?.vendorId] ?? [],
  set: (val) => { tagsStore.assignments[props.vendor.vendorId] = val }
})
```

### Anti-Patterns to Avoid

- **Storing computed total privacy score in data:** D-08 says computed, not stored. Calculate inline: `Object.values(vendor.privacyScore).reduce((a, b) => a + b, 0)`
- **Using vendor display name as join key:** D-06 is explicit — `vendorId` string only, never `name`
- **Putting vendor/discovery data in Pinia:** Only tags require store (mutable state). Static vendor/discovery data is plain module imports.
- **Global filter across all columns:** Only filter `name` and `category` fields — numeric columns (userCount, studentCount) produce confusing matches when typed text is `"14"`.
- **Registering all of ECharts globally:** Tree-shake with `use([...])` — import only `CanvasRenderer`, `RadarChart`, `RadarComponent`, `TooltipComponent`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sortable table columns | Custom sort logic + click handlers | PrimeVue DataTable `sortable` Column prop | DataTable handles multi-column sort, sort direction toggle, aria labels |
| Real-time filter | Custom computed with string matching | DataTable `v-model:filters` + `globalFilterFields` | FilterMatchMode.CONTAINS handles case-insensitive substring matching |
| Slide-over panel | `position: fixed` div with CSS transition | PrimeVue Drawer | Drawer handles backdrop, focus trap, Escape key, accessibility roles |
| Grouped dropdown | Nested `<select>` or custom listbox | PrimeVue MultiSelect with `optionGroupLabel` | MultiSelect handles chip display, search within options, keyboard nav |
| Tag pills | `<span>` elements styled manually | PrimeVue Tag component | Tag handles PrimeVue theming consistency |
| localStorage sync | Custom plugin or interval polling | `watch()` from Vue Composition API | watch with `{ deep: true }` is idiomatic Pinia pattern for persistence |

**Key insight:** Every interactive UI requirement in this phase is handled by already-installed PrimeVue 4 components. The only genuine engineering in Phase 2 is (a) data file content, (b) the join/computed logic in DiscoveryView, and (c) the radar chart option object.

---

## Common Pitfalls

### Pitfall 1: `@row-click` vs `@rowClick` Event Naming

**What goes wrong:** PrimeVue DataTable emits `row-click` (kebab-case). Using `@rowClick` silently fails — no error, no handler called.

**Why it happens:** PrimeVue docs show camelCase in some places but Vue template event binding expects kebab-case for component events.

**How to avoid:** Use `@row-click="onRowClick"`. The event object has shape `{ originalEvent, data, index }` — access the row with `event.data`.

**Warning signs:** Clicking rows does nothing; no console error.

### Pitfall 2: vue-echarts VChart Missing `use()` Registration

**What goes wrong:** VChart renders blank or throws "ECharts component not registered" console errors.

**Why it happens:** ECharts uses a global registry pattern. If `use([CanvasRenderer, RadarChart, RadarComponent, TooltipComponent])` is not called before the component mounts, the chart cannot render.

**How to avoid:** Call `use([...])` in `main.js` before `app.mount('#app')`. Register `VChart` globally there too.

**Warning signs:** Empty chart container with correct dimensions, console warning about missing renderer.

### Pitfall 3: localStorage Watch Not Deep

**What goes wrong:** Tags added to a group's `children` array don't persist — only top-level array replacement triggers the watch.

**Why it happens:** Default Vue `watch()` is shallow — it only tracks the ref's identity, not nested mutations.

**How to avoid:** Pass `{ deep: true }` to both watches in the tags store.

**Warning signs:** After page refresh, newly added child tags are gone; but entire group additions/removals persist.

### Pitfall 4: MultiSelect `optionValue` with Group Children

**What goes wrong:** When using `optionGroupChildren`, the `optionValue` refers to a property on the **child** objects (not the group). If child objects have `id` property, use `optionValue="id"`. If omitted, the entire child object is used as value — `assignments` stores objects instead of IDs.

**How to avoid:** Ensure child tag objects have an `id` field. Set `optionValue="id"` on MultiSelect. `assignments[vendorId]` should be an array of ID strings.

**Warning signs:** `assignments` contains full tag objects; serialization to localStorage is unexpectedly large.

### Pitfall 5: VChart Height Must Be Explicit

**What goes wrong:** VChart renders with zero height and is invisible.

**Why it happens:** The VChart component does not infer height from parent flex containers without an explicit height set.

**How to avoid:** Always set `style="height: 320px"` (or equivalent) directly on `<VChart>`. The UI-SPEC specifies 320px.

**Warning signs:** Drawer section for Privacy Policy Score shows empty space; no chart visible.

### Pitfall 6: DataTable `filterDisplay` Conflicts with Global Filter

**What goes wrong:** Adding `filterDisplay="row"` or `filterDisplay="menu"` shows per-column filter controls that conflict with the single global search bar intended by the UI-SPEC.

**How to avoid:** Do NOT set `filterDisplay` prop. Global filter works without it. The `filters` ref only needs the `global` key.

**Warning signs:** Each column header shows a filter input or menu icon — clutters the table header.

---

## Code Examples

### Complete Tags Store (restructured)

```javascript
// src/stores/tags.js
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const TAG_GROUPS_KEY = 'schoolday-tag-groups'
const ASSIGNMENTS_KEY = 'schoolday-tag-assignments'

const SEED_TAG_GROUPS = [
  {
    id: 'group-curriculum',
    name: 'Curriculum',
    color: '#484ce6',
    children: [
      { id: 'tag-math', name: 'Math' },
      { id: 'tag-science', name: 'Science' },
      { id: 'tag-ela', name: 'ELA' },
      { id: 'tag-social-studies', name: 'Social Studies' }
    ]
  },
  {
    id: 'group-assessment',
    name: 'Assessment',
    color: '#da8231',
    children: [
      { id: 'tag-formative', name: 'Formative' },
      { id: 'tag-summative', name: 'Summative' }
    ]
  },
  {
    id: 'group-communication',
    name: 'Communication',
    color: '#16a34a',
    children: [
      { id: 'tag-parent-engagement', name: 'Parent Engagement' },
      { id: 'tag-staff-messaging', name: 'Staff Messaging' }
    ]
  },
  {
    id: 'group-admin',
    name: 'Administration',
    color: '#dc2626',
    children: [
      { id: 'tag-hr', name: 'HR' },
      { id: 'tag-finance', name: 'Finance' },
      { id: 'tag-scheduling', name: 'Scheduling' }
    ]
  }
]

function loadOrDefault(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch {
    return defaultVal
  }
}

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref(loadOrDefault(TAG_GROUPS_KEY, SEED_TAG_GROUPS))
  const assignments = ref(loadOrDefault(ASSIGNMENTS_KEY, {}))

  watch(tagGroups, val => localStorage.setItem(TAG_GROUPS_KEY, JSON.stringify(val)), { deep: true })
  watch(assignments, val => localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(val)), { deep: true })

  return { tagGroups, assignments }
})
```

### Computed Total Privacy Score

```javascript
// Inside VendorDrawer.vue <script setup>
const totalPrivacyScore = computed(() =>
  props.vendor
    ? Object.values(props.vendor.privacyScore).reduce((sum, v) => sum + v, 0)
    : 0
)
```

### Row Click Handler in DiscoveryView

```javascript
const drawerVisible = ref(false)
const selectedVendor = ref(null)

function onRowClick(event) {
  selectedVendor.value = event.data
  drawerVisible.value = true
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vue 2 + vue-echarts 4 | Vue 3 + vue-echarts 8 | 2023 | vue-echarts 8 drops Vue 2 support; tree-shaking `use()` pattern required |
| Pinia store for all data | Static imports for read-only data | Current best practice | Only mutable state (tags) needs a store; static vendor data stays as plain module arrays |
| `@primevue/themes` import | `@primeuix/themes` import | PrimeVue 4.x | Legacy alias removed; must use `@primeuix/themes` (already correct in this project) |

**Deprecated/outdated:**
- `FilterService` from PrimeVue: No longer needed for global filter. Use `FilterMatchMode` from `primevue/api` instead.
- ECharts v5 `import * as echarts`: Replaced by tree-shaken `use()` pattern in current projects.

---

## Open Questions

1. **Tag pill color in the table Tags column**
   - What we know: UI-SPEC says "Matches parent group color from `useTagsStore.tagGroups[n].color`; fallback to `#da8231`"
   - What's unclear: The planner must decide whether tag pills use PrimeVue `Tag` component `style` prop or a CSS class for dynamic color
   - Recommendation: Use inline `style` on PrimeVue `Tag` — dynamic colors cannot be done with Tailwind classes at runtime

2. **VendorDrawer prop contract**
   - What we know: The drawer receives a vendor object that must include joined discovery metrics AND vendor metadata
   - Recommendation: Pass the pre-joined row object from `tableRows` (already contains both `...vendor` and `...discoveryRecord` fields) — no re-join needed inside the drawer

---

## Environment Availability

All dependencies are either already installed or installable from public npm. No external services required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | v24.14.0 | — |
| npm | Package install | ✓ | (project lockfile present) | — |
| echarts | vue-echarts radar | ✗ (not installed) | 6.0.0 (npm latest) | — (must install) |
| vue-echarts | Radar chart component | ✗ (not installed) | 8.0.1 (npm latest) | — (must install) |
| primevue | DataTable, Drawer, MultiSelect | ✓ | ^4.5.5 | — |
| pinia | Tags store | ✓ | ^3.0.4 | — |
| localStorage | Tag persistence | ✓ | Native browser API | — |

**Missing dependencies with no fallback:**
- `echarts` + `vue-echarts` — required for radar chart; no fallback. Must be installed in Wave 0 or first task of Phase 2.

---

## Validation Architecture

`nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None detected — this is a Vite/Vue SPA with no test runner configured |
| Config file | None — no vitest.config.*, jest.config.*, or playwright.config.* found |
| Quick run command | `npm run dev` + browser smoke test (manual) |
| Full suite command | `npm run build` (verifies no compilation errors) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-03 | `src/data/*.js` files exist and export arrays | smoke | `npm run build` (build fails if import broken) | ❌ Wave 0 |
| DISC-01 | Vendor table renders with sortable columns and real-time filter | manual | Manual browser check at `/discovery` | N/A |
| DISC-02 | Tag assignment via MultiSelect updates table tag pills | manual | Manual browser check — assign tag, verify pill appears | N/A |
| DISC-03 | Row click opens Drawer with vendor detail and radar chart | manual | Manual browser check — click row, verify drawer opens | N/A |
| TAGS-02 | Tags persist after page refresh | manual | Assign tag → refresh → verify tag still shown | N/A |

**Rationale:** No automated test framework exists in this project. All validation is browser smoke testing as established in Phase 1. Build compilation (`npm run build`) provides the only automated check — it will fail if any import path is broken or a component has a template compilation error.

### Sampling Rate

- **Per task commit:** `npm run build` (confirms no compilation errors)
- **Per wave merge:** `npm run dev` + manual browser walkthrough of Discovery page
- **Phase gate:** Full browser smoke test before `/gsd:verify-work` — table renders, sort works, filter works, row click opens drawer with radar chart, tag assignment persists after refresh

### Wave 0 Gaps

- [ ] No test infrastructure gaps — project uses browser smoke testing only; no test files to create
- [ ] `npm install echarts vue-echarts` — required before any component referencing VChart can build

*(Existing approach: browser smoke test as established in Phase 1)*

---

## Sources

### Primary (HIGH confidence)
- `npm view vue-echarts version` — confirmed 8.0.1 is latest stable
- `npm view echarts version` — confirmed 6.0.0 is latest stable
- `npm view vue-echarts peerDependencies` — confirmed Vue ^3.3.0, echarts ^6.0.0
- `github.com/ecomfe/vue-echarts` — global registration pattern, tree-shaking `use()` call, VChart component usage
- `primevue.org/datatable/#filter` — FilterMatchMode import, filters ref shape, globalFilterFields, @row-click event
- `primevue.org/multiselect/` — optionGroupLabel, optionGroupChildren, display="chip" pattern
- `primevue.org/drawer/` — v-model:visible, position prop, width via inline style

### Secondary (MEDIUM confidence)
- WebSearch: PrimeVue 4 DataTable globalFilterFields — confirmed pattern consistent with official docs
- WebSearch: vue-echarts 8 Vue 3 setup — consistent with official GitHub README

### Tertiary (LOW confidence)
- None — all key patterns verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions confirmed against npm registry, peer deps verified
- Architecture: HIGH — all patterns sourced from official PrimeVue 4 and vue-echarts docs
- Pitfalls: HIGH — row-click naming, VChart registration, and deep watch pitfalls are well-documented behaviors
- Data file contract: HIGH — locked decisions in CONTEXT.md, no ambiguity

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (stable libraries — 30 day window)
