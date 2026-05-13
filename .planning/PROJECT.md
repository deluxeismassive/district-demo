# District Demo Portal

## What This Is

A sales demo web portal for edtech that displays school district data across multiple sections — discovery (app/domain usage), DPA status, risk position, and 1EdTech compliance data. Built as a clickable mockup with fully synthetic data, shown by sales reps to district admin prospects. Needs to iterate same-day as sales requirements change.

## Core Value

Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

## Requirements

### Validated

- ✓ Vue 3 + Vite project scaffold configured — existing
- ✓ GitHub Pages deployment pipeline (`npm run deploy`) — existing
- ✓ Base path configured for `/district-demo/` — existing

### Validated

- ✓ Multi-page SPA routing with a persistent sidebar nav (Dashboard / Discovery / Reports / Settings) — Validated in Phase 1: Shell & Routing
- ✓ Consistent app shell (sidebar + header + content area) renders on every route — Validated in Phase 1: Shell & Routing
- ✓ Pinia `useTagsStore` initialized and accessible from all components — Validated in Phase 1: Shell & Routing
- ✓ Discovery page: display vendor/domain name, usage metrics (frequency, last seen), and user/student counts from mocked data — Validated in Phase 2: Data Layer + Discovery
- ✓ Discovery page: users can assign tags to vendors/domains — Validated in Phase 2: Data Layer + Discovery
- ✓ All data backed by editable mock data files (`src/data/*.js`) for same-day sales iteration — Validated in Phase 2: Data Layer + Discovery

### Active

- ✓ DPA page: sortable/filterable DataTable with status badge, signed/expiry dates, and risk labels — Validated in Phase 3: DPA View
- ✓ At-risk vendor surface: "Top 8 Vendors Needing Attention" card on Dashboard + VendorDrawer DPA section — Validated in Phase 3: DPA View
- [ ] Risk Position page: display a converged view of discovery + DPA data showing district risk (visualization approach TBD during planning)
- ✓ 1EdTech certification data: visible in VendorDrawer (status badge, standard, certified date) — Validated in Phase 4: 1EdTech View
- [ ] Tags management: users can create, edit, and delete tags used to categorize vendors/domains
- [ ] All data backed by editable mock data files (JSON/JS config) for same-day sales iteration
- [ ] Section structure flexible — easy to add or remove pages without structural rework

### Out of Scope

- Real backend / live data connections — demo uses synthetic data only
- Authentication / login screen — portal opens directly
- Student/user PII — all data is synthetic and non-identifying
- Multi-district support — one fixture district for the demo
- Mobile optimization — sales demos happen on desktop/laptop

## Context

- Phase 4 complete — 1EdTech View: edtech.js enriched with certificationStandard + certifiedDate (27 records, 5 real standards), EDTECH_STATUS_COLORS added to riskLabels.js, VendorDrawer 1EdTech section (between DPA and Privacy Score), dead '1EdTech' tab removed from ReportsView
- Phase 3 complete — DPA View: Discovery|DPA tab bar, DpaGrid with 6-column sortable table + badge colors, riskLabels.js constants, VendorDrawer DPA section, Dashboard Top 8 Vendors Needing Attention card with KPI tiles
- Phase 2 complete — Discovery page fully functional: 27-vendor DataTable (sortable, filterable), VendorDrawer slide-over with 10-axis ECharts radar chart, tag assignment via grouped MultiSelect, localStorage persistence, all data from `src/data/*.js`
- Phase 1 complete — SPA shell with Vue Router (hash history), Pinia, PrimeVue 4 (Aura preset, `#484CE6` primary), Tailwind v4, and 4 stub views with skeleton placeholders
- Existing codebase is a bare Vue 3 + Vite starter (default scaffold, `HelloWorld.vue` only) — all portal features are net-new
- Deployed as a static SPA to GitHub Pages; no server-side runtime
- Sales reps are the primary operators; district admins are the audience
- The number of portal sections is not fixed — expect it to grow or shrink as the product story evolves
- Risk Position visualization approach is deliberately undefined — needs a design decision during Phase planning
- Same-day iteration requirement means mock data must live in standalone files (not hardcoded in components)

## Constraints

- **Tech stack**: Vue 3 + Vite — already established, do not introduce conflicting frameworks
- **Deployment**: Static GitHub Pages — no server, no SSR, no backend calls
- **Data**: All data is mocked/synthetic — no Druid, DPA API, or 1EdTech API connections in this demo
- **Iteration speed**: Mock data and section content must be changeable by a developer in under an hour
- **Auth**: None — portal opens directly with no login

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Separate pages/routes per section | User confirmed — each section is its own page | — Pending |
| Mock data in config/JSON files | Same-day iteration requires data decoupled from components | — Pending |
| No authentication | Demo is guided by a sales rep; login adds friction with no benefit | — Pending |
| Risk Position visualization TBD | Approach not yet defined — will be decided during phase planning | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-13 after Phase 4: 1EdTech View*
