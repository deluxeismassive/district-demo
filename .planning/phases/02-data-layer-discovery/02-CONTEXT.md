# Phase 2: Data Layer + Discovery - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish all mock data files with realistic vendor fixtures, and build the fully interactive Discovery view — sortable/filterable vendor table, vendor detail slide-over panel (with usage deep-dive, privacy policy radar chart, and tag assignment), and tag display in the table.

All three data source files (discovery, DPA, 1EdTech) are seeded in this phase even though their views come in Phases 3-4. This ensures vendorId consistency across the entire data layer from day one.

</domain>

<decisions>
## Implementation Decisions

### Data File Structure
- **D-01:** Four separate `src/data/` files — `vendors.js`, `discovery.js`, `dpa.js`, `edtech.js` — all seeded in Phase 2
- **D-02:** `vendors.js` holds shared base metadata per vendor: `vendorId`, `name`, `category`, and all 10 privacy policy dimension scores
- **D-03:** `discovery.js` holds usage metrics per vendor: frequency, lastSeen, userCount, studentCount — keyed by vendorId
- **D-04:** `dpa.js` holds DPA status, signedDate, expiryDate per vendor — values are realistic placeholders in Phase 2; Phase 3 builds the view
- **D-05:** `edtech.js` holds 1EdTech certification status per vendor — values are realistic placeholders in Phase 2; Phase 4 builds the view
- **D-06:** Join key is stable `vendorId` string (e.g. `"vendor-google-classroom"`) — never use display name as a key

### Privacy Policy Scores (in vendors.js)
- **D-07:** Each vendor has a `privacyScore` object with 10 dimension scores (each 1–10):
  - `informationCollected`, `useOfInformation`, `dataSharing`, `securityMeasures`, `userRights`, `retentionPeriod`, `complianceWithLaws`, `updatesToPolicy`, `clarityAndTransparency`, `contactInformation`
- **D-08:** Total privacy score = sum of all 10 dimensions (max 100). Computed, not stored.
- **D-09:** Privacy score radar chart renders in the vendor detail slide-over using ECharts (vue-echarts). ECharts is installed in Phase 2 and reused in Phase 5 for the risk donut chart.

### Vendor Fixtures
- **D-10:** ~25–30 realistic edtech brands seeded by Claude (Google Classroom, Canvas, Zoom, Schoology, IXL, Clever, SeeSaw, Kahoot, etc.)
- **D-11:** Vendors have a realistic spread of DPA statuses (Signed, Unsigned, Expired, Pending) and usage patterns (high/medium/low frequency)
- **D-12:** All 10 privacy policy dimension scores assigned per vendor with plausible variation

### Vendor Detail View (DISC-03)
- **D-13:** Clicking a vendor row in Discovery opens a PrimeVue Drawer (slide-over from right)
- **D-14:** The slide-over shows: vendor name + category, usage deep-dive (discovery metrics), privacy policy radar chart + total score, and tag assignment control
- **D-15:** Tag assignment in the slide-over uses a grouped multi-select control (child tags grouped under parent labels)

### Discovery Table
- **D-16:** PrimeVue DataTable with sortable columns: Vendor Name, Category, Frequency, Last Seen, Users, Students, Tags
- **D-17:** Filter input above the table narrows results in real time (global filter or per-column — Claude's discretion)
- **D-18:** Tags column displays assigned child tag pills, visually grouped by their parent tag — read-only in the table
- **D-19:** No inline tag creation or '+' button in the table. Tag management is entirely in Settings/Tags (Phase 6)

### Tag System Structure
- **D-20:** Tags are hierarchical: parent groups contain child tags. Only child tags are assigned to vendors (not parent tags directly)
- **D-21:** The `useTagsStore` holds `tagGroups` (array of parent groups, each with `id`, `name`, `color`, and `children` array of child tags)
- **D-22:** `assignments` in the store is an object keyed by `vendorId`, value is an array of child tag IDs
- **D-23:** Claude seeds realistic edtech-context parent groups and child tags (e.g. Curriculum → Math, Science, ELA; Communication → Parent Engagement, Staff Messaging; Assessment → Formative, Summative)

### Tag Persistence
- **D-24:** Both `tagGroups` and `assignments` are persisted to localStorage — survive page refresh and browser close
- **D-25:** Pinia store uses `watch()` to sync state to localStorage on every change; initializes from localStorage on first load
- **D-26:** localStorage keys: `schoolday-tag-groups` and `schoolday-tag-assignments`

### Claude's Discretion
- Exact number of vendor fixtures (target 25–30, within that range is fine)
- Specific parent group names and child tag names for seed data
- Filter UX in the Discovery table (global search bar vs per-column filters)
- Radar chart visual styling and color scheme within the existing brand palette
- Exact layout and proportions of the vendor detail slide-over panel

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — v1 requirements; Phase 2 covers FOUND-03, DISC-01, DISC-02, DISC-03, TAGS-02

### Prior Phase Context
- `.planning/phases/01-shell-routing/01-CONTEXT.md` — Router (hash history), layout decisions, PrimeVue/Tailwind setup, SidebarNav pattern, Pinia store initialization

### Codebase
- `.planning/codebase/STACK.md` — Installed packages; ECharts (vue-echarts + echarts) NOT yet installed — install in Phase 2
- `.planning/codebase/CONVENTIONS.md` — PascalCase components, 2-space indent, no TypeScript, `<script setup>` pattern

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/views/DiscoveryView.vue` — Exists as a skeleton stub with Skeleton placeholders. Replace entirely with the full implementation.
- `src/stores/tags.js` — Exists with empty `tags` and `assignments` refs. Restructure to support `tagGroups` hierarchy and localStorage persistence.
- `src/components/layout/AppShell.vue` — Persistent layout shell; Drawer component will render inside or alongside the RouterView area.

### Established Patterns
- Vue 3 `<script setup>` Composition API — maintain throughout
- PrimeVue 4 components (Aura preset, `#484CE6` primary) — DataTable, Drawer, MultiSelect all available without additional install
- Tailwind v4 for layout and utility classes
- 2-space indentation, no TypeScript, relative imports (no `@/` alias configured yet)

### Integration Points
- `src/router/index.js` — Discovery route already registered at `/discovery`
- `src/stores/tags.js` — Pinia store wired and accessible from all views; needs restructuring in this phase
- `src/main.js` — Vue app entry; ECharts plugin registration goes here after install
- New: `src/data/vendors.js`, `src/data/discovery.js`, `src/data/dpa.js`, `src/data/edtech.js`
- New: `src/components/VendorDrawer.vue` (or similar) — the detail slide-over component

</code_context>

<specifics>
## Specific Ideas

- **Privacy policy radar chart:** 10 axes labeled with the 10 dimension names. Sales rep can point at it during a demo to show "how we evaluate vendor privacy." Scores per dimension make it interactive and data-rich.
- **Radar chart axes (exact names):** Information Collected, Use of Information, Data Sharing, Security Measures, User Rights, Retention Period, Compliance with Laws, Updates to Privacy Policy, Overall Clarity and Transparency, Contact Information
- **3 distinct data sources:** The user explicitly noted that Discovery, DPA, and 1EdTech are separate source systems with different schemas that must cross-reference via vendorId. The file structure mirrors this separation intentionally — not just for code organization.
- **Tag hierarchy display:** Child tag pills in the table row should visually indicate their parent group (e.g., group label above a cluster of pills, or pill color matching parent group color)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 2 scope.

</deferred>

---

*Phase: 02-data-layer-discovery*
*Context gathered: 2026-05-13*
