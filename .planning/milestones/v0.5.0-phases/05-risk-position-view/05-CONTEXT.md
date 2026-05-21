# Phase 5: Risk Position View - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the ReportsView skeleton with a live Risk Position page. Two deliverables:
1. **Donut chart** — ECharts pie (with inner radius) showing vendor count and proportion by risk tier (High / Medium / Low)
2. **Vendor risk table** — Sortable PrimeVue DataTable of all 27 vendors with Name, Risk Tier badge, DPA Status, 1EdTech Status, and User Count columns

Risk tiers are computed live in the component by joining `dpa.js`, `discovery.js`, and `edtech.js` — no new data file.

Additionally: remove the now-dead DPA tab from ReportsView (only Risk Position content remains, so the tab bar itself is removed too).

</domain>

<decisions>
## Implementation Decisions

### Risk Tier Formula
- **D-01:** Base tier derived from DPA status + usage volume:
  - `Unsigned` or `Expired` DPA + `userCount > 1000` → **High**
  - `Unsigned` or `Expired` DPA + `userCount ≤ 1000` → **Medium**
  - `Signed` or `Pending` DPA → **Low**
- **D-02:** 1EdTech modifier: if `certificationStatus === 'Certified'` (active, non-expired), reduce the base tier by one level:
  - High → Medium
  - Medium → Low
  - Low → Low (no further reduction)
  - `Expired` certifications do NOT reduce the tier — only active `Certified` status applies.
- **D-03:** Usage threshold: `userCount > 1000` (from `discovery.js`) defines "high usage". `userCount` is the student/user count per vendor.
- **D-04:** All three data sources joined by `vendorId`:
  - `dpaData` — DPA status and risk labels
  - `discoveryData` — userCount for usage threshold
  - `edtechData` — certificationStatus for 1EdTech modifier
  - `vendorsData` — vendor name for display

### Page Structure
- **D-05:** ReportsView (`src/views/ReportsView.vue`) is rewritten to be the Risk Position page directly — no tab bar. The existing `tabs = ['DPA', 'Risk Position']` tab UI is removed entirely since only Risk Position content remains.
- **D-06:** The "DPA" tab that was in ReportsView is removed. DPA data is already accessible via DiscoveryView's Discovery|DPA tab bar — the Reports DPA tab was a dead skeleton.
- **D-07:** Page layout: donut chart in a card at the top, vendor table below it. No separate route needed — the `/reports` route continues to load ReportsView.

### Donut Chart
- **D-08:** Use ECharts pie chart with `radius: ['45%', '70%']` (donut). VChart is already globally registered.
- **D-09:** ECharts needs `PieChart` and `LegendComponent` registered in `main.js` (currently only `RadarChart` + `TooltipComponent` are registered). Add them via the same `use()` pattern.
- **D-10:** Chart colors match the semantic palette established in `riskLabels.js`:
  - High → `#dc2626` (red-600)
  - Medium → `#f59e0b` (amber-500)
  - Low → `#16a34a` (green-600)
- **D-11:** Chart shows counts in the legend label (e.g., "High (6)") and percentage in the tooltip on hover. No click-to-filter behavior in v1 (RISK-V2-02).

### Vendor Table
- **D-12:** Five columns (in order): Vendor Name | Risk Tier | DPA Status | 1EdTech Status | Users
  - **Risk Tier**: color-coded badge (High/Medium/Low) using the same hex palette as D-10
  - **DPA Status**: plain text or existing DPA_STATUS_COLORS badge (Signed/Unsigned/Expired/Pending)
  - **1EdTech Status**: plain text (Certified/Not Certified/In Review/Expired) — no badge needed, this is a supporting column
  - **Users**: numeric, formatted with commas (e.g., "14,230")
- **D-13:** Table is sortable by all columns. Default sort: Risk Tier descending (High first).
- **D-14:** No filter input on the risk table in v1 — discovery filtering exists elsewhere.

### Risk Tier Constants
- **D-15:** Add `RISK_TIER_COLORS` to `src/data/riskLabels.js`:
  ```js
  export const RISK_TIER_COLORS = {
    High: '#dc2626',
    Medium: '#f59e0b',
    Low: '#16a34a'
  }
  ```
  Import in RiskPositionView (or directly in ReportsView after rewrite).

### Claude's Discretion
- Exact ECharts option object structure for the donut (legend position, tooltip formatter, label visibility)
- Whether to show vendor name as a link that opens VendorDrawer (pattern exists in DiscoveryView — Claude may reuse if it adds demo value)
- Card/container styling for the chart section (match existing DpaGrid/DiscoveryView page padding)
- Exact label for the "Users" column header

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — RISK-01, RISK-02 are the requirements for this phase

### Prior Phase Context
- `.planning/phases/02-data-layer-discovery/02-CONTEXT.md` — VendorDrawer join pattern, vendorId as the join key, VChart registration approach
- `.planning/phases/03-dpa-view/03-CONTEXT.md` — DPA status values (Signed/Unsigned/Expired/Pending), riskLabels.js pattern, DpaGrid sortable table pattern

### Existing Code to Read Before Planning
- `src/views/ReportsView.vue` — File being replaced; currently has DPA + Risk Position tab bar skeleton
- `src/data/riskLabels.js` — File to extend with `RISK_TIER_COLORS`; already exports `DPA_STATUS_COLORS`, `EDTECH_STATUS_COLORS`, `RISK_LABEL_COLORS`
- `src/main.js` — ECharts registration; currently registers `RadarChart`, `TooltipComponent`. Need to add `PieChart`, `LegendComponent`
- `src/data/dpa.js` — DPA status + riskLabel per vendorId (27 records)
- `src/data/discovery.js` — userCount + studentCount + frequency per vendorId (27 records)
- `src/data/edtech.js` — certificationStatus + certificationStandard + certifiedDate per vendorId (27 records, enriched in Phase 4)
- `src/data/vendors.js` — Vendor name + category + privacyScore per vendorId (27 records)
- `src/components/DpaGrid.vue` — Sortable table pattern to replicate for the risk vendor table
- `src/views/DiscoveryView.vue` — VChart usage pattern (radar chart options structure, VChart component usage)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VChart` — globally registered in `main.js`; used in `VendorDrawer.vue` for radar chart. Donut uses same component with `PieChart` type
- `DpaGrid.vue` — sortable DataTable with PrimeVue Column, badge styling with PrimeVue Tag, `@row-click` handler. Direct template for the risk vendor table
- `riskLabels.js` — exports constants for badge colors; extend with `RISK_TIER_COLORS`
- PrimeVue `Tag` component — already imported in VendorDrawer and DpaGrid for badges

### Established Patterns
- Join map: `const dpaMap = Object.fromEntries(dpaData.map(d => [d.vendorId, d]))` (from VendorDrawer)
- Computed tier: `computed(() => vendors.map(v => ({ ...v, tier: calcTier(dpaMap[v.vendorId], discoveryMap[v.vendorId], edtechMap[v.vendorId]) })))`
- ECharts registration pattern in `main.js`: `use([CanvasRenderer, RadarChart, RadarComponent, TooltipComponent])`
- VChart option object: `const option = { series: [{ type: 'pie', radius: [...], data: [...] }] }`

### Integration Points
- `src/main.js` — add `PieChart`, `LegendComponent` to the `use([...])` call
- `src/views/ReportsView.vue` — full rewrite: remove tab bar, import data files + riskLabels, build computed risk list, render chart + table
- `src/data/riskLabels.js` — append `RISK_TIER_COLORS` export

</code_context>

<specifics>
## Specific Ideas

- **1EdTech as a risk reducer** — User explicitly wants 1EdTech certification to lower risk tier by one level. This makes the "converged view" story tangible: a vendor missing a DPA but certified by 1EdTech is less alarming than one with neither.
- **Full contributing factors table** — User chose "Vendor, Risk tier, DPA, 1EdTech, Usage" — all inputs that drove the tier are visible. Transparent and demo-friendly.
- **Chart tells the headline** — The donut gives the sales rep an instant "X vendors are High risk" stat to open the conversation with.

</specifics>

<deferred>
## Deferred Ideas

- **RISK-V2-01** — Risk table with contributing factors detail (drill-down per factor). Not in v1 — the column approach covers this simply.
- **RISK-V2-02** — Click donut segment to filter the vendor table below. Not in v1.
- **Reports DPA tab** — Was a skeleton; explicitly removed in this phase. If a unified Reports page is needed in future, it would be re-architected from scratch.
- **Privacy score as a risk input** — `vendors.js` has `privacyScore` fields (7 sub-dimensions). Could contribute to tier in v2 but not discussed for v1.

</deferred>

---

*Phase: 05-risk-position-view*
*Context gathered: 2026-05-13*
