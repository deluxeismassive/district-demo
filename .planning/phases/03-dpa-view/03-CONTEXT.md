# Phase 3: DPA View - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the DPA view surface across three locations:
1. **DPA tab in DiscoveryView** — tab toggle switches between the Discovery grid and a new DPA grid (same page, two views)
2. **VendorDrawer DPA section** — DPA fields added to the existing vendor detail slide-over
3. **Dashboard "Top 8 At-Risk" card** — hardcoded list of the 8 highest-risk vendors with risk label badges, replacing the Dashboard skeleton

Risk labels are hardcoded in mock data (not computed). Phase 5 will build the full risk calculation engine.

</domain>

<decisions>
## Implementation Decisions

### DPA Grid Location
- **D-01:** DPA grid lives in **DiscoveryView** as a second tab, not in ReportsView. DiscoveryView gets a tab bar toggling between "Discovery" and "DPA" views.
- **D-02:** Both tabs share the same page shell (filter input, header area). Tab state is local to DiscoveryView.
- **D-03:** ReportsView DPA tab — Claude's discretion on whether it reuses the DPA component or remains a skeleton stub. Do not block Phase 3 delivery on this.

### DPA Grid Columns
- **D-04:** Columns: Vendor Name, Category, Status badge (Signed / Unsigned / Expired / Pending), Signed Date, Expiry Date, Risk Label
- **D-05:** All columns are sortable via column header click (PrimeVue DataTable pattern from Phase 2)
- **D-06:** Global text filter above the table — same pattern as Discovery grid
- **D-07:** Status badge uses semantic colors: Signed = green, Expired = red, Pending = amber, Unsigned = gray
- **D-08:** Risk Label renders as a color-coded badge column (colors: Claude's discretion — use severity semantics: red for highest-risk labels)

### Risk Labels
- **D-09:** Risk labels are **hardcoded per vendor in `dpa.js`** — not computed from any score calculation. This allows same-day sales iteration without touching component logic.
- **D-10:** Three label values: `"High Usage / No DPA"`, `"No DPA"`, `"High Risk Score"`. A vendor may have one label or none (null).
- **D-11:** The 8 vendors surfaced on the Dashboard card must have a risk label set in `dpa.js`.
- **D-12:** All other vendors may have a risk label if appropriate (e.g., Expired DPA vendors that are still active). Claude assigns plausible risk labels to the full vendor set.

### VendorDrawer DPA Section
- **D-13:** The existing `VendorDrawer.vue` gains a DPA section showing: Status badge, Signed Date, Expiry Date, and Risk Label (if set).
- **D-14:** DPA section appears alongside the existing usage metrics, privacy radar chart, and tag assignment sections. Placement: after usage metrics, before the privacy chart — Claude's discretion on exact ordering.
- **D-15:** Join: `dpa.js` looked up by `vendorId` at the drawer level, same pattern as discovery/vendor join.

### Dashboard Top 8 Card
- **D-16:** DashboardView gets a "Top 8 Vendors Needing Attention" card (or similarly named) replacing the current skeleton.
- **D-17:** Card shows a list of 8 hardcoded vendors — each row: vendor name, category, and risk label badge.
- **D-18:** The 8 vendors are hardcoded by selecting vendors from `vendors.js` that have risk labels in `dpa.js` — no dynamic sort/filter logic needed. Planner/executor selects the 8 most compelling for demo storytelling.
- **D-19:** Dashboard may include additional summary stats (e.g., total vendor count, DPA coverage %) as Claude's discretion — keep it lightweight, don't over-engineer the stub.

### "Needs Attention" Count (DPA-02)
- **D-20:** The DPA-02 requirement ("page header shows count of vendors needing DPA review") is satisfied by the Dashboard card. The DPA tab itself does not need a separate header count — Claude's discretion on whether to add a simple subtitle count to the DPA tab header.

### Claude's Discretion
- Exact risk label badge colors (beyond the semantic guidance above)
- Whether the DPA tab shows a subtitle count of "X vendors need attention"
- Exact ordering of sections in VendorDrawer
- Dashboard card layout (list vs. small table vs. grid of cards)
- Whether ReportsView DPA tab reuses the DPA grid component or stays as skeleton
- Row click behavior on DPA grid rows (recommended: opens VendorDrawer — reuses Phase 2 work cleanly)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — v1 requirements; Phase 3 covers DPA-01, DPA-02

### Prior Phase Context
- `.planning/phases/01-shell-routing/01-CONTEXT.md` — Router (hash history), layout decisions, PrimeVue/Tailwind, color palette (`#484CE6` primary, `#DA8231` accent)
- `.planning/phases/02-data-layer-discovery/02-CONTEXT.md` — Data file structure, vendorId join pattern, DataTable pattern, VendorDrawer, tag system, localStorage

### Existing Code to Read Before Planning
- `src/views/DiscoveryView.vue` — DataTable + global filter pattern to replicate for DPA grid; tab bar to be added
- `src/components/VendorDrawer.vue` — Existing drawer to extend with DPA section
- `src/views/DashboardView.vue` — Stub to replace with Top 8 card
- `src/views/ReportsView.vue` — Existing tab structure; DPA tab may reuse Phase 3 component
- `src/data/dpa.js` — Already seeded with 27 vendors; needs `riskLabel` field added
- `src/data/vendors.js` — Vendor base data (name, category, vendorId)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/views/DiscoveryView.vue` — PrimeVue DataTable with global filter, sortable columns, row click → drawer. DPA grid is the same pattern; add tab bar above it.
- `src/components/VendorDrawer.vue` — Slide-over panel. Extend with a DPA section block.
- `src/data/dpa.js` — Already has all 27 vendors with status/signedDate/expiryDate. Add `riskLabel` field (string | null) per vendor.
- `src/data/vendors.js` — Vendor name, category, vendorId — join key for all views.
- PrimeVue `Tag` component — already used in Discovery for tag pills; reuse for status badges and risk label badges.
- PrimeVue `DataTable` + `Column` — established pattern, no new install needed.

### Established Patterns
- View-level join: `Object.fromEntries(data.map(d => [d.vendorId, d]))` — use same pattern to join `vendors.js` + `dpa.js` in the DPA tab
- Global filter: `FilterMatchMode.CONTAINS` on Name + Category fields
- Sortable columns: `:sortable="true"` on each DataTable Column
- Tab state: `const activeTab = ref('Discovery')` — local ref, no router involvement

### Integration Points
- `src/views/DiscoveryView.vue` — Add tab bar (`Discovery` | `DPA`), render DPA grid component when DPA tab is active
- `src/components/VendorDrawer.vue` — Import `dpa.js`, look up vendor's DPA record by `vendorId`, render new DPA section
- `src/views/DashboardView.vue` — Replace skeleton with Top 8 card component
- `src/data/dpa.js` — Add `riskLabel` field to each vendor entry

</code_context>

<specifics>
## Specific Ideas

- **Risk label hardcoding rationale:** Sales rep needs to control which vendors appear "risky" in a specific demo — hardcoded labels give full control without touching any logic. Phase 5 will layer in computed risk tiers on top.
- **Tab toggle in DiscoveryView:** User explicitly wants Discovery and DPA as sibling tabs on the same page — not separate routes. This keeps the vendor browsing experience unified: flip between "how are they used?" and "do we have a DPA?" for the same vendor set.
- **VendorDrawer as the DPA detail surface:** Rather than a separate DPA drill-down, the existing drawer is the right place for vendor-level DPA detail — keeps the sales narrative in one place (rep clicks a vendor, sees everything: usage, privacy score, DPA status).
- **Dashboard card as the "alert" surface:** The top 8 card is the sales-facing attention signal — the rep opens the dashboard and the prospect immediately sees the risk. This replaces the original DPA-02 requirement for a per-tab count.

</specifics>

<deferred>
## Deferred Ideas

- **Expiry warning highlighting** (DPA-V2-03 from REQUIREMENTS.md) — amber row highlight for DPAs expiring within 90 days. Noted in v2 requirements; not in Phase 3 scope.
- **Version currency indicator** (DPA-V2-01) — whether on-file DPA matches current vendor version. Deferred to v2.
- **Addendum presence indicator** (DPA-V2-02) — flag for district-specific addendum. Deferred to v2.
- **Risk score connection to actual privacy scores** — risk labels are hardcoded now; Phase 5 builds the computed tier logic.
- **Click-to-filter by risk label on Dashboard card** — linking the dashboard card to a pre-filtered DPA grid view. Natural follow-on, not in Phase 3 scope.

</deferred>

---

*Phase: 03-dpa-view*
*Context gathered: 2026-05-13*
