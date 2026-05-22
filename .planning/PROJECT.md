# District Demo Portal

## What This Is

A sales demo web portal for edtech that displays school district data across five sections — Discovery (vendor/domain usage), DPA status, Risk Position, and 1EdTech compliance data. Built on Nuxt 4 with SSR and Nuxt UI, targeting AWS Amplify deployment and eventual connection to the app-catalog backend. Demo data is fully synthetic (27 vendors in `server/data/`), shown by sales reps to district admin prospects.

## Core Value

Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

## Current State

**v0.6.0 Nuxt Migration shipped 2026-05-22.** Portal is live at https://deluxeismassive.github.io/district-demo/ with all 5 demo surfaces functional. Source on GitHub at https://github.com/deluxeismassive/district-demo.

**No active milestone.** Run `/gsd:new-milestone` to scope the next milestone. Backlog candidates (carried forward from v0.6.0 deferred section):
- Real API connections to app-catalog backend via `server/api/` routes
- AWS Amplify SSR deployment (dev/staging/prod environments) — 3-line glidepath ready in `nuxt.config.ts` + full migration ADR
- DPA expiry warning — amber highlight for DPAs expiring within 90 days
- Filter Discovery table by one or more tags
- Click donut chart segment to filter Risk table below
- 1EdTech detail surface — which standards/tiers a vendor holds
- Risk table with contributing factors
- GitHub Actions CI/CD workflow (replace manual `npm run deploy`)
- Custom domain via `public/CNAME`

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

### Validated (v0.6.0 — in progress)

- ✓ **NUXT-01**: App runs as a Nuxt 4 SSR project with TypeScript and `compatibilityVersion: 4` — Validated in Phase 7
- ✓ **NUXT-02**: Nuxt UI v4 is the sole component library — no PrimeVue dependency remains — Validated in Phase 7
- ✓ **NUXT-03**: Pinia tags store works with SSR-safe hydration via `@pinia/nuxt` — Validated in Phase 7
- ✓ **NUXT-04**: All 5 demo sections resolve via file-based routing in `app/pages/` — Validated in Phase 8
- ✓ **LAYOUT-01**: Persistent app shell implemented as `app/layouts/default.vue` with dark sidebar nav, `NuxtLink` active highlighting — Validated in Phase 8
- ✓ **DATA-01**: Mock data served through Nuxt server API routes (`server/api/vendors.get.ts`, `dpa.get.ts`, `edtech.get.ts`); typed source data in `server/data/*.ts` with `shared/types/data.ts` interfaces — Validated in Phase 9
- ✓ **DATA-02**: `app/pages/discovery.vue` uses `useFetch('/api/vendors')` with full Nitro type inference; negative-grep boundary enforces no direct `server/data/` imports from `app/` — Validated in Phase 9
- ✓ **PAGE-01**: Discovery page fully functional — `UTable` with sort/filter, `USlideover` `VendorDrawer.vue` with 10-axis ECharts radar in `<ClientOnly>`, per-row + drawer `USelectMenu` writing back to Pinia via `setVendorTags`/`clearVendorTags` actions — Validated in Phase 10
- ✓ **PAGE-02**: DPA page fully functional — `UTable` joined on vendors + DPA, 6 sortable columns, useDebounce filter, `UBadge` `:style` hex from `DPA_STATUS_COLORS` and `RISK_LABEL_COLORS` (no semantic color classes), row-click → `VendorDrawer` — Validated in Phase 11
- ✓ **PAGE-05**: Dashboard "Top 8 Vendors Needing Attention" — `UCard` derived from same `/api/dpa` (URL-key dedup); 3 KPI tiles; row-click → `VendorDrawer` — Validated in Phase 11
- ✓ **PAGE-03**: Risk Position page fully functional — initial-SSR ECharts donut (no `<ClientOnly>` wrap; nuxt-echarts SVG fallback) + sortable `UTable` with hex-injected tier `UBadge`s; page-level `VendorDrawer` mount — Validated in Phase 12
- ✓ **PAGE-04**: Tags Management page fully functional — 8 Pinia store actions (rename / setColor / delete / reset / addGroup / addTag), `UModal` cascade-delete confirmations with vendor counts, 8-swatch color palette popover, `pinia-plugin-persistedstate` localStorage roundtrip — Validated in Phase 12
- ✓ **DEPLOY-01**: App generates as a static site via `nuxi generate`; base path `/district-demo/` configured; `npm run deploy` publishes to GitHub Pages via `gh-pages -d .output/public --nojekyll`; live URL: `https://deluxeismassive.github.io/district-demo/` — Validated in Phase 13
- ✓ **DEPLOY-02**: `nuxt.config.ts` is structured for the Amplify glidepath — the 3-line switch (remove `app.baseURL`, change `nitro.preset` to `'aws-amplify'`, add `amplify.yml`) is documented inline + fully reasoned in `.planning/adr/AMPLIFY-GLIDEPATH.md`; no page-level edits needed — Validated in Phase 13

### Deferred to v0.7.0+

- [ ] DPA expiry warning — amber highlight for DPAs expiring within 90 days
- [ ] Risk table with contributing factors — show what drives each vendor's tier
- [ ] Click donut chart segment to filter the risk table below
- [ ] Filter Discovery table by one or more tags
- [ ] 1EdTech detail — which standards/tiers a vendor holds
- [ ] Cross-reference 1EdTech certified vendors with Discovery active usage
- [ ] Real API connections to app-catalog backend

### Out of Scope

- Authentication / login screen — portal opens directly; login adds friction with no demo benefit
- Mobile optimization — sales demos happen on desktop/laptop
- Multi-district support — single fixture district is the right demo scope
- Bulk import / export (CSV, PDF) — pulls demo attention away from insight story
- Full CRUD on vendor records — tag CRUD only; vendor CRUD raises "is this real?" questions
- Student/user PII — all data is synthetic and non-identifying

## Context

- **v0.6.0 shipped 2026-05-22** — Nuxt 4 migration milestone complete. All 7 phases (Phases 7-13), 15 plans done. Live at `https://deluxeismassive.github.io/district-demo/`.
- **v0.5.0 shipped 2026-05-21** — 6 phases, 15 plans, ~2,331 source LOC (Vue 3 + Vite SPA)
- **Stack**: Nuxt 4 + Nuxt UI v4 + Tailwind v4 + Pinia + ECharts (initial-SSR for static charts, ClientOnly for interaction-mounted) + TypeScript
- **Deployment (v0.6.0)**: Static GitHub Pages via `nuxi generate` + `gh-pages -d .output/public --nojekyll`; postdeploy smoke probe at `scripts/smoke.mjs` (5 routes × 5 retries × 20s backoff)
- **Deployment (future)**: AWS Amplify SSR documented as a 3-line glidepath in `nuxt.config.ts` + full migration ADR at `.planning/adr/AMPLIFY-GLIDEPATH.md`
- **Data**: 27 vendors in `server/data/*.ts` (typed via `shared/types/data.ts`); served through `server/api/{vendors,dpa,edtech}.get.ts` Nitro routes; baked into `_payload.json` at generate time
- **Routing**: Nuxt file-based routing (`app/pages/`); 5 sections — `/`, `/discovery`, `/dpa`, `/risk`, `/tags`
- Sales reps are the primary operators; district admins are the demo audience
- Same-day iteration requirement: mock data in `server/data/` files, editable without touching components

## Constraints

- **Framework**: Nuxt 4 — do not introduce conflicting frameworks or custom Vite configs
- **UI**: Nuxt UI v4 only — no PrimeVue, no other component libraries
- **Deployment**: Static GitHub Pages (current); Amplify SSR is a future 3-line switch (do not re-architect prematurely)
- **Data**: All data is mocked/synthetic during this milestone — no live API connections yet
- **Iteration speed**: Mock data and section content must be changeable by a developer in under an hour
- **Auth**: None in this milestone — portal opens directly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| `createWebHashHistory` for routing | GitHub Pages cannot serve HTML5 pushstate fallbacks | ✓ Good (v0.5.0) |
| Mock data in `src/data/*.js` files | Same-day iteration requires data decoupled from components | ✓ Good (v0.5.0) |
| `vendorId` stable join key | Cross-file joins without brittle display-name matching | ✓ Good (v0.5.0) |
| Risk visualization: donut + table | Donut shows distribution; table enables per-vendor drill-down | ✓ Good (v0.5.0) |
| 1EdTech in VendorDrawer only | No standalone 1EdTech page — drawer is the single surface | ✓ Good (v0.5.0) |
| Nuxt 4 SSR over SPA mode | SSR is required for secure server-side API calls to app-catalog | — Pending |
| Nuxt UI v3 over PrimeVue | First-party Nuxt integration, Tailwind-based, production-oriented | — Pending |
| server/api/ for mock data | Establishes the API contract that real backend calls will follow | — Pending |
| AWS Amplify + Nitro node-server | Amplify supports Node SSR; enables server routes for API proxying | — Pending |
| TypeScript throughout | Production-ready codebase requires type safety from the start | — Pending |

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
*Last updated: 2026-05-22 — v0.6.0 Nuxt Migration COMPLETE. All 7 phases shipped; portal live at https://deluxeismassive.github.io/district-demo/. Ready for /gsd:complete-milestone.*
