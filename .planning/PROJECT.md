# District Demo Portal

## What This Is

A sales demo web portal for edtech that displays school district data across five sections — Discovery (vendor/domain usage), DPA status, Risk Position, and 1EdTech compliance data. Built as a clickable mockup with fully synthetic data (27 vendors, all `src/data/*.js`), shown by sales reps to district admin prospects. Deployed as a static SPA to GitHub Pages; no server, no auth.

## Core Value

Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

## Requirements

### Validated (v0.5.0)

- ✓ Multi-page SPA routing with a persistent sidebar nav (Dashboard / Discovery / DPA / Risk / Settings) — v0.5.0 Phase 1
- ✓ Consistent app shell (sidebar + header + content area) renders on every route — v0.5.0 Phase 1
- ✓ Pinia `useTagsStore` initialized and accessible from all components — v0.5.0 Phase 1
- ✓ All display data lives in `src/data/*.js` files, editable without touching components — v0.5.0 Phase 2
- ✓ Discovery page: 27-vendor sortable/filterable DataTable (name, category, usage metrics, user/student counts) — v0.5.0 Phase 2
- ✓ Discovery page: users can assign and remove tags on vendors — v0.5.0 Phase 2
- ✓ VendorDrawer: slide-over with full usage data, 10-axis ECharts radar chart, grouped tag MultiSelect — v0.5.0 Phase 2
- ✓ DPA page: sortable/filterable table with status badge (Signed/Unsigned/Expired/Pending), signed/expiry dates — v0.5.0 Phase 3
- ✓ Dashboard: "Top 8 Vendors Needing Attention" card surfacing unsigned/expired DPAs — v0.5.0 Phase 3
- ✓ VendorDrawer: DPA section (status, dates, risk label) — v0.5.0 Phase 3
- ✓ VendorDrawer: 1EdTech section (status badge, standard name, certified date; empty fallback) — v0.5.0 Phase 4
- ✓ Risk Position page: ECharts donut chart with tier distribution (High/Medium/Low) — v0.5.0 Phase 5
- ✓ Risk Position page: sortable 5-column vendor table with computed risk tiers — v0.5.0 Phase 5
- ✓ Tags management page: full CRUD (inline rename, 8-color palette, cascade delete, reset-to-defaults) — v0.5.0 Phase 6

### Active (v2.0 candidates)

- [ ] DPA expiry warning — amber highlight for DPAs expiring within 90 days
- [ ] Risk table with contributing factors — show what drives each vendor's tier
- [ ] Click donut chart segment to filter the risk table below
- [ ] Filter Discovery table by one or more tags
- [ ] 1EdTech detail — which standards/tiers a vendor holds
- [ ] Cross-reference 1EdTech certified vendors with Discovery active usage

### Out of Scope

- Real backend / live data connections — demo uses synthetic data only
- Authentication / login screen — portal opens directly; login adds friction with no demo benefit
- Mobile optimization — sales demos happen on desktop/laptop
- Multi-district support — single fixture district is the right demo scope
- Bulk import / export (CSV, PDF) — pulls demo attention to operational workflows vs. insight story
- Full CRUD on vendor records — raises "is this real data?" questions; tag CRUD only
- Student/user PII — all data is synthetic and non-identifying

## Context

- **v0.5.0 shipped 2026-05-21** — 6 phases, 15 plans, 8 days, ~2,331 source LOC
- **Stack**: Vue 3.5 + Vite 8 (rolldown) + PrimeVue 4.5 + Tailwind v4 + Pinia 3 + ECharts / vue-echarts
- **Data**: 27 vendors across 4 `src/data/*.js` files (vendors, discovery, dpa, edtech); `vendorId` is the stable join key across all files
- **Routing**: `createWebHashHistory` — mandatory for GitHub Pages static hosting
- **Theme**: PrimeVue Aura preset, SchoolDay primary `#484ce6`, dark sidebar `#111827`
- Sales reps are the primary operators; district admins are the demo audience
- Same-day iteration requirement met — any section's data is editable in `src/data/*.js` without touching components

## Constraints

- **Tech stack**: Vue 3 + Vite — already established, do not introduce conflicting frameworks
- **Deployment**: Static GitHub Pages — no server, no SSR, no backend calls
- **Data**: All data is mocked/synthetic — no Druid, DPA API, or 1EdTech API connections in this demo
- **Iteration speed**: Mock data and section content must be changeable by a developer in under an hour
- **Auth**: None — portal opens directly with no login

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `createWebHashHistory` for routing | GitHub Pages cannot serve HTML5 pushstate fallbacks | ✓ Good |
| Mock data in `src/data/*.js` files | Same-day iteration requires data decoupled from components | ✓ Good |
| `vendorId` stable join key | Cross-file joins without brittle display-name matching | ✓ Good |
| `darkModeSelector: false` in PrimeVue | Portal uses structural dark sidebar, not system dark mode | ✓ Good |
| Risk visualization: donut + table | Donut shows distribution; table enables per-vendor drill-down | ✓ Good |
| 1EdTech in VendorDrawer only | No standalone 1EdTech page — drawer is the single surface | ✓ Good |
| Separate pages/routes per section | Each section is its own page for clear navigation | ✓ Good |
| No authentication | Demo is guided by a sales rep; login adds friction with no benefit | ✓ Good |
| Vite 8 stub views created early | Rolldown resolves lazy imports at build time; stubs required before Phase 2 | ✓ Good |
| `@primeuix/themes` import path | Correct PrimeVue 4.x path (not legacy `@primevue/themes` alias) | ✓ Good |

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
*Last updated: 2026-05-21 after v0.5.0 milestone*
