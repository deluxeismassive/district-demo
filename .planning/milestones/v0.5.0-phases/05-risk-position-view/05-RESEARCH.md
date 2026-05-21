# Phase 5: Risk Position View - Research

**Researched:** 2026-05-13
**Domain:** Vue 3 data join, ECharts pie/donut chart, PrimeVue DataTable sortable badge table
**Confidence:** HIGH

## Summary

Phase 5 replaces the skeletal `ReportsView.vue` with a fully live Risk Position page. The deliverables are a donut chart (ECharts `PieChart`) and a sortable vendor risk table (PrimeVue `DataTable`). All source data is already seeded in four `src/data/*.js` files from prior phases — no new data files are needed.

Risk tiers are computed in a `computed()` by joining all four data sources on `vendorId`, applying the two-step formula from D-01/D-02: DPA status + user count determines a base tier (High / Medium / Low), then active 1EdTech `Certified` status reduces it by one level. The simulation against actual fixture data confirmed the distribution is **High: 2 / Medium: 7 / Low: 18** across 27 vendors.

The existing codebase already has ECharts + `vue-echarts` installed as runtime dependencies and `VChart` globally registered. Only `PieChart` and `LegendComponent` need to be added to the `use([...])` call in `main.js`. The `DpaGrid.vue` sortable table and `VendorDrawer.vue` VChart usage are both ready-to-reuse patterns.

**Primary recommendation:** Rewrite `ReportsView.vue` in a single focused plan — extend `riskLabels.js`, register two ECharts modules in `main.js`, then write the new view component that joins data, computes tiers, and renders the chart + table.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Risk Tier Formula**
- D-01: Base tier from DPA status + usage:
  - `Unsigned` or `Expired` DPA + `userCount > 1000` → High
  - `Unsigned` or `Expired` DPA + `userCount <= 1000` → Medium
  - `Signed` or `Pending` DPA → Low
- D-02: 1EdTech modifier: `certificationStatus === 'Certified'` (non-expired) reduces base tier by one level. `Expired` certifications do NOT reduce the tier.
- D-03: Usage threshold `userCount > 1000` (from `discovery.js`).
- D-04: Join key is `vendorId` across `dpaData`, `discoveryData`, `edtechData`, `vendorsData`.

**Page Structure**
- D-05: `ReportsView.vue` is rewritten — no tab bar remains.
- D-06: DPA tab removed; DPA data accessible via DiscoveryView.
- D-07: Donut chart card at top, vendor table below. `/reports` route unchanged.

**Donut Chart**
- D-08: ECharts pie with `radius: ['45%', '70%']`.
- D-09: Add `PieChart` and `LegendComponent` to `main.js` via same `use()` pattern.
- D-10: Colors — High `#dc2626`, Medium `#f59e0b`, Low `#16a34a`.
- D-11: Legend labels show counts (e.g., "High (2)"); tooltip shows percentage on hover. No click-to-filter in v1.

**Vendor Table**
- D-12: Five columns in order: Vendor Name | Risk Tier | DPA Status | 1EdTech Status | Users
  - Risk Tier: color-coded badge (Tag component)
  - DPA Status: badge using `DPA_STATUS_COLORS`
  - 1EdTech Status: plain text (no badge)
  - Users: numeric with commas
- D-13: Sortable on all columns. Default sort: Risk Tier descending (High first).
- D-14: No filter input on risk table in v1.

**Risk Tier Constants**
- D-15: Add `RISK_TIER_COLORS` to `src/data/riskLabels.js`:
  ```js
  export const RISK_TIER_COLORS = {
    High: '#dc2626',
    Medium: '#f59e0b',
    Low: '#16a34a'
  }
  ```

### Claude's Discretion
- Exact ECharts option object structure (legend position, tooltip formatter, label visibility)
- Whether vendor name links open VendorDrawer (pattern exists in DiscoveryView — reuse if it adds demo value)
- Card/container styling for chart section (match existing page padding)
- Exact label for the "Users" column header

### Deferred Ideas (OUT OF SCOPE)
- RISK-V2-01: Risk table with contributing factors detail (drill-down per factor)
- RISK-V2-02: Click donut segment to filter the vendor table
- Reports DPA tab — removed this phase, not to be rebuilt
- Privacy score as a risk input (`privacyScore` fields in `vendors.js`)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| RISK-01 | Each vendor has a calculated risk tier (High / Medium / Low) derived from DPA status and usage volume | D-01 through D-04 formula verified against all 27 fixtures; tier distribution confirmed as High:2 / Medium:7 / Low:18 |
| RISK-02 | A donut chart displays the distribution of vendors by risk tier | ECharts `PieChart` + `radius: ['45%','70%']` pattern verified; `PieChart` and `LegendComponent` imports confirmed at `echarts/charts` and `echarts/components` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue-echarts (`VChart`) | Already installed | Donut chart rendering | Already globally registered in `main.js`; used by `VendorDrawer.vue` radar chart |
| echarts `PieChart` | Already installed | Pie/donut series type | Confirmed export at `echarts/charts`; same pattern as `RadarChart` |
| echarts `LegendComponent` | Already installed | Chart legend with count labels | Confirmed export at `echarts/components`; needed for "High (2)" style labels |
| PrimeVue `DataTable` + `Column` | Already installed | Sortable vendor table | Identical to `DpaGrid.vue` pattern — already proven for sortable badge tables |
| PrimeVue `Tag` | Already installed | Risk tier and DPA status badges | Already used in `DpaGrid.vue` and `VendorDrawer.vue` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vue `computed` | Vue 3 core | Risk tier derivation | Multi-source join and tier logic lives in a single `computed()` |
| `Object.fromEntries` | ES2019, native | vendorId lookup maps | Standard join pattern already established in all prior views |

### No New Installs Needed
All dependencies are already installed. The only code changes to third-party integration are two additional imports in `main.js`.

## Architecture Patterns

### Recommended Project Structure
No new files or folders. Changes are:
```
src/
├── data/
│   └── riskLabels.js        # Append RISK_TIER_COLORS export
├── main.js                  # Add PieChart + LegendComponent to use([...])
└── views/
    └── ReportsView.vue      # Full rewrite — donut chart + vendor table
```

### Pattern 1: Four-Source Join with Computed Tier
**What:** Import all four data files, build lookup maps by `vendorId`, compute a flat row array with tier included.
**When to use:** Any view that synthesizes multiple data sources into a single table.
**Example:**
```js
import vendorsData from '../data/vendors.js'
import dpaData from '../data/dpa.js'
import discoveryData from '../data/discovery.js'
import edtechData from '../data/edtech.js'
import { RISK_TIER_COLORS, DPA_STATUS_COLORS, EDTECH_STATUS_COLORS } from '../data/riskLabels.js'

const dpaMap = Object.fromEntries(dpaData.map(d => [d.vendorId, d]))
const discMap = Object.fromEntries(discoveryData.map(d => [d.vendorId, d]))
const edtechMap = Object.fromEntries(edtechData.map(d => [d.vendorId, d]))

function calcTier(dpaRec, discRec, edtechRec) {
  const risky = dpaRec.status === 'Unsigned' || dpaRec.status === 'Expired'
  let base
  if (risky && discRec.userCount > 1000) base = 'High'
  else if (risky) base = 'Medium'
  else base = 'Low'
  if (edtechRec.certificationStatus === 'Certified') {
    if (base === 'High') base = 'Medium'
    else if (base === 'Medium') base = 'Low'
  }
  return base
}

const riskRows = computed(() =>
  vendorsData.map(v => ({
    ...v,
    ...dpaMap[v.vendorId],
    ...discMap[v.vendorId],
    certificationStatus: edtechMap[v.vendorId]?.certificationStatus,
    tier: calcTier(dpaMap[v.vendorId], discMap[v.vendorId], edtechMap[v.vendorId])
  }))
)
```
Source: established join pattern from `VendorDrawer.vue` and `DpaGrid.vue` in this project.

### Pattern 2: ECharts Donut (Pie with Inner Radius)
**What:** Build an ECharts `option` object with `type: 'pie'` and `radius` as a two-element array for the donut hole.
**When to use:** Count/proportion visualization with semantic color per category.
**Example:**
```js
const chartOption = computed(() => {
  const counts = { High: 0, Medium: 0, Low: 0 }
  riskRows.value.forEach(r => counts[r.tier]++)
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      data: [
        `High (${counts.High})`,
        `Medium (${counts.Medium})`,
        `Low (${counts.Low})`
      ]
    },
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: false } },
      data: [
        { value: counts.High,   name: `High (${counts.High})`,   itemStyle: { color: '#dc2626' } },
        { value: counts.Medium, name: `Medium (${counts.Medium})`, itemStyle: { color: '#f59e0b' } },
        { value: counts.Low,    name: `Low (${counts.Low})`,     itemStyle: { color: '#16a34a' } }
      ]
    }]
  }
})
```
Source: ECharts docs + existing `radarOption` pattern in `VendorDrawer.vue`.

### Pattern 3: Sortable DataTable with Computed Sort Order
**What:** PrimeVue `DataTable` with `sortField` and `sortOrder` props for default sort; `sortable` on each `Column`.
**When to use:** Any table needing default sort by a non-string computed field.

**Pitfall — sorting computed badge field:** `tier` is a string ('High', 'Medium', 'Low'). Alphabetical sort puts High last. To sort High first by default, either:
1. Add a `tierOrder` numeric field to each row (`High=1`, `Medium=2`, `Low=3`) and sort by that, OR
2. Use DataTable's `:sortFunction` on the tier column to apply custom comparison.

Option 1 (tierOrder numeric field) is simpler and more reliable in PrimeVue 4:
```js
const TIER_ORDER = { High: 1, Medium: 2, Low: 3 }

const riskRows = computed(() =>
  vendorsData.map(v => ({
    // ...join fields...
    tier: calcTier(...),
    tierOrder: TIER_ORDER[calcTier(...)]
  }))
)
```
Then in template:
```html
<DataTable :value="riskRows" sortField="tierOrder" :sortOrder="1" ...>
  <Column field="tierOrder" header="Risk Tier" sortable>
    <template #body="{ data }">
      <Tag :value="data.tier" :style="{ backgroundColor: RISK_TIER_COLORS[data.tier], color: '#ffffff' }" />
    </template>
  </Column>
```

### Pattern 4: ECharts Registration (main.js)
**What:** Import named chart/component types from tree-shakeable subpaths, add to `use([...])`.
**When to use:** Adding any new chart type to the app.
**Example:**
```js
import { PieChart } from 'echarts/charts'
import { LegendComponent } from 'echarts/components'
// Add to existing use() call:
use([CanvasRenderer, RadarChart, PieChart, RadarComponent, TooltipComponent, LegendComponent])
```
Confirmed: `PieChart` exported from `echarts/charts`, `LegendComponent` from `echarts/components` — both verified against installed package.

### Anti-Patterns to Avoid
- **Alphabetical default sort on tier strings:** 'High' / 'Low' / 'Medium' sorts Medium last. Use a `tierOrder` numeric field.
- **Re-importing full echarts:** The project uses tree-shakeable imports (`echarts/core`, `echarts/charts`, `echarts/components`). Never `import * from 'echarts'`.
- **Spreading conflicting keys without care:** `dpaMap[v.vendorId]` and `discMap[v.vendorId]` both have a `vendorId` key. Spread order matters — spread vendor last or pick fields explicitly to avoid accidental overwrite.
- **Legend name must match data name exactly:** ECharts legend items are matched by the `name` field on each data point. If legend labels include counts ("High (2)"), the data `name` must also be "High (2)" — not just "High".

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Donut chart rendering | Custom SVG arc math | `VChart` with `PieChart` + `radius` array | ECharts handles hover, tooltip, animation, resize |
| Sortable table | Custom sort handlers | PrimeVue `DataTable` with `sortable` columns | Already used in `DpaGrid.vue` — zero new learning curve |
| Badge / pill styling | Inline conditional classes | PrimeVue `Tag` with `:style` | Consistent with all other badges in the portal |
| Numeric formatting | Manual string concatenation | `.toLocaleString()` | Already used in `DiscoveryView.vue` — `data.userCount.toLocaleString()` |

## Verified Tier Distribution (Pre-Computed)

From simulation against all 27 fixtures using D-01/D-02 formula:

| Tier | Count | Vendors |
|------|-------|---------|
| High | 2 | vendor-zoom (Expired DPA, 1920 users, Not Certified), vendor-kahoot (Unsigned DPA, 1120 users, In Review) |
| Medium | 7 | vendor-quizlet, vendor-flipgrid, vendor-prodigy, vendor-renaissance, vendor-naviance, vendor-infinite-campus, vendor-securly |
| Low | 18 | All Signed/Pending DPA vendors + any with active Certified 1EdTech status that reduced from Medium |

**Demo story the chart tells:** "2 High-risk vendors — Zoom with an expired DPA and Kahoot with none at all — both in daily use by 1,000+ users. The 7 Medium-risk vendors include apps where the 1EdTech certification wasn't enough to overcome missing DPA coverage."

## Common Pitfalls

### Pitfall 1: ECharts Tooltip Not Showing
**What goes wrong:** `tooltip` renders nothing or errors silently.
**Why it happens:** `TooltipComponent` must be registered. It already is — confirmed in `main.js`. But if the trigger type is wrong, tooltip may not fire on slice hover.
**How to avoid:** Use `trigger: 'item'` for pie charts (not `trigger: 'axis'` which is for line/bar).
**Warning signs:** Hovering slice shows no tooltip; no console error.

### Pitfall 2: Legend Items Not Rendering
**What goes wrong:** Chart renders but legend is empty.
**Why it happens:** `LegendComponent` not registered, or legend `data` array names don't match series data `name` fields exactly.
**How to avoid:** Register `LegendComponent` in `main.js`. Ensure legend `data` strings and series `data[i].name` strings are identical — if counts are embedded in the name, they must match.
**Warning signs:** Legend area is blank; or legend shows items but they're un-styled.

### Pitfall 3: Risk Tier Sort Order Wrong
**What goes wrong:** DataTable default sort puts "High" last (alphabetical 'H' < 'L' < 'M').
**Why it happens:** PrimeVue DataTable sorts strings lexicographically.
**How to avoid:** Add a `tierOrder` numeric field (`High=1, Medium=2, Low=3`) to each row in the computed. Sort by `tierOrder` ascending.
**Warning signs:** Default table load shows Low vendors at top, High at bottom.

### Pitfall 4: Spread Collision Between Data Sources
**What goes wrong:** A field from one data file silently overwrites a field from another when spreading.
**Why it happens:** `dpaData`, `discoveryData`, and `vendorsData` all have a `vendorId` field; `discoveryData` and `dpaData` both have no shared conflict beyond that, but future additions could collide.
**How to avoid:** Explicitly pick the fields needed from each data source rather than a blanket spread, or spread in a controlled order and verify no collision.
**Warning signs:** A column shows wrong data — particularly if `status` or other short-name fields overlap.

### Pitfall 5: VChart `autoresize` in Hidden/Narrow Container
**What goes wrong:** Chart renders at 0px height or doesn't resize correctly after mount.
**Why it happens:** ECharts reads container dimensions at mount time. If the container has no explicit height, chart collapses.
**How to avoid:** Set `style="height: Xpx; width: 100%"` on `<VChart>` (same pattern as `VendorDrawer.vue` uses `style="height: 320px; width: 100%"`).
**Warning signs:** Empty gray rectangle where chart should be; chart is invisible.

## Code Examples

### ECharts Registration in main.js (verified)
```js
import { PieChart } from 'echarts/charts'
import { LegendComponent } from 'echarts/components'
// existing line becomes:
use([CanvasRenderer, RadarChart, PieChart, RadarComponent, TooltipComponent, LegendComponent])
```

### RISK_TIER_COLORS addition to riskLabels.js (per D-15)
```js
export const RISK_TIER_COLORS = {
  High: '#dc2626',
  Medium: '#f59e0b',
  Low: '#16a34a'
}
```
Append after existing `EDTECH_STATUS_COLORS` export. No existing exports modified.

### Tier Sort with tierOrder numeric field
```js
const TIER_ORDER = { High: 1, Medium: 2, Low: 3 }

const riskRows = computed(() =>
  vendorsData.map(v => {
    const dpa = dpaMap[v.vendorId]
    const disc = discMap[v.vendorId]
    const et = edtechMap[v.vendorId]
    const tier = calcTier(dpa, disc, et)
    return {
      vendorId: v.vendorId,
      name: v.name,
      tier,
      tierOrder: TIER_ORDER[tier],
      dpaStatus: dpa.status,
      certificationStatus: et.certificationStatus,
      userCount: disc.userCount
    }
  })
)
```

### DataTable default sort by tierOrder ascending (High first)
```html
<DataTable :value="riskRows" sortField="tierOrder" :sortOrder="1" dataKey="vendorId" rowHover>
```

### Users column with comma formatting (existing pattern from DiscoveryView)
```html
<Column field="userCount" header="Users" sortable>
  <template #body="{ data }">{{ data.userCount.toLocaleString() }}</template>
</Column>
```

### VChart donut sizing (match VendorDrawer pattern)
```html
<VChart :option="chartOption" autoresize style="height: 280px; width: 100%" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tab-based ReportsView with DPA skeleton | Single-purpose Risk Position page | This phase | ReportsView goes from 2-tab skeleton to a real page |
| RadarChart only registered in main.js | RadarChart + PieChart both registered | This phase | Donut chart becomes available globally |

## Environment Availability

Step 2.6: SKIPPED (no external dependencies — all libraries already installed, no new installs required).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework detected |
| Config file | None |
| Quick run command | `npm run dev` (visual smoke test in browser) |
| Full suite command | `npm run build` (build must succeed without errors) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RISK-01 | Each vendor has a calculated risk tier | manual-only | Navigate to `/reports`, verify all 27 vendors show a tier badge | N/A |
| RISK-02 | Donut chart shows distribution by risk tier | manual-only | Verify chart shows 3 slices: High(2), Medium(7), Low(18) | N/A |

### Sampling Rate
- **Per task commit:** `npm run build` — build must succeed with no errors
- **Per wave merge:** Visual smoke test in browser — chart renders, table sorts, tier badges display
- **Phase gate:** Full `npm run build` green before `/gsd:verify-work`

### Wave 0 Gaps
None — no test infrastructure exists in this project and none is expected for this phase. Validation is manual browser verification.

## Sources

### Primary (HIGH confidence)
- Direct file reads: `src/main.js`, `src/data/riskLabels.js`, `src/data/dpa.js`, `src/data/discovery.js`, `src/data/edtech.js`, `src/data/vendors.js` — confirmed all field names, existing patterns, and data values
- Direct file reads: `src/components/DpaGrid.vue`, `src/views/DiscoveryView.vue`, `src/components/VendorDrawer.vue` — confirmed reusable patterns for join, DataTable, Tag, VChart
- Node.js verification: `echarts/charts` exports `PieChart` as function; `echarts/components` exports `LegendComponent` as function — confirmed against installed package
- Runtime simulation: All 27 vendors run through D-01/D-02 formula in Node.js — tier distribution verified as High:2, Medium:7, Low:18

### Secondary (MEDIUM confidence)
- ECharts donut `radius` array pattern (`['45%', '70%']`) — consistent with ECharts documentation standard and confirmed structurally matches existing `radarOption` in `VendorDrawer.vue`
- Legend `data` / series `name` matching requirement — standard ECharts behavior, confirmed by reasoning from existing `RadarComponent` pattern

### Tertiary (LOW confidence)
- None — all findings are verified against actual project files or installed packages

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed installed; import paths verified via Node.js
- Architecture: HIGH — join pattern, DataTable pattern, and VChart pattern all read directly from existing working code
- Tier calculation: HIGH — simulation run against all 27 real fixtures; distribution confirmed
- Pitfalls: HIGH — derived from direct code analysis and confirmed pitfall for sort order (alphabetical 'H' < 'L' < 'M')

**Research date:** 2026-05-13
**Valid until:** 2026-06-12 (stable stack — 30 days)
