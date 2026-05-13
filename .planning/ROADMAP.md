# Roadmap: District Demo Portal

**Created:** 2026-05-13
**Milestone:** v1
**Granularity:** Standard
**Coverage:** 14/14 v1 requirements mapped

---

## Phases

- [x] **Phase 1: Shell & Routing** - Working SPA with sidebar nav, all routes registered, Pinia store initialized, shared component foundations in place (completed 2026-05-13)
- [ ] **Phase 2: Data Layer + Discovery** - Mock data files seeded with realistic vendors, Discovery view fully functional with sortable/filterable table, vendor detail, and tag assignment
- [ ] **Phase 3: DPA View** - DPA page with status badges, signed/expiry dates, and "needs attention" headline count
- [ ] **Phase 4: 1EdTech View** - 1EdTech certification table displaying vendor compliance status
- [ ] **Phase 5: Risk Position View** - Risk tier calculation, donut chart showing vendor distribution by tier
- [ ] **Phase 6: Tags Management** - Tags page with full create/rename/delete and color assignment

---

## Phase Details

### Phase 1: Shell & Routing
**Goal**: The app has a working SPA skeleton — all routes resolve, the persistent sidebar nav is visible on every page, and the Pinia store is wired up for tags state
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-04
**Success Criteria** (what must be TRUE):
  1. Navigating between all section links in the sidebar loads the correct stub view without a page reload or 404
  2. The sidebar nav is visible and shows an active highlight on every route
  3. Refreshing the browser on any route (e.g., `/#/dpa`) returns to that same view, not a 404
  4. The Pinia tags store is initialized and accessible from any component
**Plans**: 2 plans
  - [ ] 01-shell-routing/01-PLAN-A.md — Install deps and wire foundation (router + Pinia + PrimeVue + Tailwind v4)
  - [ ] 01-shell-routing/01-PLAN-B.md — Build AppShell, SidebarNav, and 4 stub views with skeletons
**UI hint**: yes

### Phase 2: Data Layer + Discovery
**Goal**: All mock data schemas are established in `src/data/*.js` and the Discovery page is fully functional — vendors are browsable, sortable, filterable, drillable, and taggable
**Depends on**: Phase 1
**Requirements**: FOUND-03, DISC-01, DISC-02, DISC-03, TAGS-02
**Success Criteria** (what must be TRUE):
  1. The Discovery table displays 20+ realistic vendors with name, category, usage metrics, and user/student counts loaded from `src/data/` files
  2. Clicking any column header sorts the table by that column
  3. Typing in the filter input narrows the vendor list in real time
  4. Clicking a vendor row opens a detail view showing full usage data for that vendor
  5. A user can assign and remove tags on a vendor row directly from the Discovery table
**Plans**: 4 plans
  - [ ] 02-data-layer-discovery/02-01-PLAN.md — Install ECharts + seed 4 data files (vendors, discovery, dpa, edtech) with 27 vendors
  - [ ] 02-data-layer-discovery/02-02-PLAN.md — Restructure tags store with tagGroups + localStorage; register VChart globally
  - [ ] 02-data-layer-discovery/02-03-PLAN.md — Build VendorDrawer with usage detail, 10-axis radar chart, and grouped tag MultiSelect
  - [ ] 02-data-layer-discovery/02-04-PLAN.md — Replace DiscoveryView skeleton with sortable/filterable table mounting the drawer
**UI hint**: yes

### Phase 3: DPA View
**Goal**: District admins can review every vendor's DPA status at a glance, with the most pressing items surfaced in the page header
**Depends on**: Phase 2
**Requirements**: DPA-01, DPA-02
**Success Criteria** (what must be TRUE):
  1. The DPA table displays all vendors with a color-coded status badge (Signed / Unsigned / Expired / Pending), signed date, and expiry date
  2. Clicking a column header sorts the DPA table by that column; the filter input narrows results in real time
  3. The page header shows an accurate count of vendors that need DPA review (unsigned or expired)
**Plans**: TBD
**UI hint**: yes

### Phase 4: 1EdTech View
**Goal**: District admins can see which vendors hold 1EdTech certifications in a clean, consistent table
**Depends on**: Phase 2
**Requirements**: EDTECH-01
**Success Criteria** (what must be TRUE):
  1. The 1EdTech page displays a table of vendors with their certification status badge and relevant certification metadata
  2. The table is sortable by column header
**Plans**: TBD
**UI hint**: yes

### Phase 5: Risk Position View
**Goal**: District admins can see a converged picture of vendor risk — a summary chart and per-vendor risk tiers derived from DPA status and usage volume
**Depends on**: Phase 3, Phase 4
**Requirements**: RISK-01, RISK-02
**Success Criteria** (what must be TRUE):
  1. Every vendor in the portal has a calculated risk tier (High / Medium / Low) visible on the Risk Position page
  2. A donut chart above the table shows the count and proportion of vendors in each risk tier
  3. Risk tiers are derived from real mock data fields — a vendor with no signed DPA and high usage volume appears as High risk
**Plans**: TBD
**UI hint**: yes

### Phase 6: Tags Management
**Goal**: Users can manage the full tag library — create new tags, rename existing ones, change colors, and delete tags — from a dedicated settings page
**Depends on**: Phase 2
**Requirements**: TAGS-01
**Success Criteria** (what must be TRUE):
  1. The Tags page lists all existing tags with their name and assigned color
  2. A user can create a new tag with a name and color, and it immediately appears in the tag list and is available for assignment in Discovery
  3. A user can rename a tag and see the updated name reflected on all vendors that have it assigned
  4. A user can delete a tag and it is removed from all vendor assignments
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Shell & Routing | 2/2 | Complete   | 2026-05-13 |
| 2. Data Layer + Discovery | 0/4 | Not started | - |
| 3. DPA View | 0/? | Not started | - |
| 4. 1EdTech View | 0/? | Not started | - |
| 5. Risk Position View | 0/? | Not started | - |
| 6. Tags Management | 0/? | Not started | - |

---

## Coverage

| Requirement | Phase |
|-------------|-------|
| FOUND-01 | Phase 1 |
| FOUND-02 | Phase 1 |
| FOUND-04 | Phase 1 |
| FOUND-03 | Phase 2 |
| DISC-01 | Phase 2 |
| DISC-02 | Phase 2 |
| DISC-03 | Phase 2 |
| TAGS-02 | Phase 2 |
| DPA-01 | Phase 3 |
| DPA-02 | Phase 3 |
| EDTECH-01 | Phase 4 |
| RISK-01 | Phase 5 |
| RISK-02 | Phase 5 |
| TAGS-01 | Phase 6 |

**v1 requirements: 14/14 mapped**

---
*Roadmap created: 2026-05-13*
*Last updated: 2026-05-13 after initial creation*
