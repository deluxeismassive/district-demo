# Roadmap: District Demo Portal

## Milestones

- ✅ **v0.5.0 MVP** — Phases 1–6 (shipped 2026-05-21) — [archive](milestones/v0.5.0-ROADMAP.md)
- 🚧 **v1.0.0 Nuxt Migration** — Phases 7–13 (in progress)

## Phases

<details>
<summary>✅ v0.5.0 MVP (Phases 1–6) — SHIPPED 2026-05-21</summary>

- [x] **Phase 1: Shell & Routing** - SPA shell, hash routing, sidebar nav, stub views (2/2 plans) — completed 2026-05-13
- [x] **Phase 2: Data Layer + Discovery** - 27-vendor mock data, sortable/filterable Discovery table, VendorDrawer, tags (4/4 plans) — completed 2026-05-13
- [x] **Phase 3: DPA View** - DPA table with status badges, VendorDrawer DPA section, Dashboard card (3/3 plans) — completed 2026-05-13
- [x] **Phase 4: 1EdTech View** - 1EdTech certification data in VendorDrawer (2/2 plans) — completed 2026-05-13
- [x] **Phase 5: Risk Position View** - ECharts donut chart + sortable vendor tier table (2/2 plans) — completed 2026-05-13
- [x] **Phase 6: Tags Management** - Full CRUD page: inline rename, color palette, cascade delete, reset-to-defaults (2/2 plans) — completed 2026-05-21

</details>

### 🚧 v1.0.0 Nuxt Migration (In Progress)

**Milestone Goal:** Migrate from Vue 3 + Vite SPA to Nuxt 4 SSR app — TypeScript throughout, Nuxt UI v3, server/api/ mock data layer, AWS Amplify deployment config. All existing demo features preserved.

- [x] **Phase 7: Nuxt Scaffold** - Nuxt 4 project with TypeScript, Nuxt UI v3 replacing PrimeVue, Pinia SSR-safe with localStorage persistence (2/2 plans) — completed 2026-05-21
- [x] **Phase 8: Layout & Routing** - File-based routing for all 5 sections, default.vue app shell with dark sidebar (1/1 plans) — completed 2026-05-21
- [x] **Phase 9: Server Data Layer** - server/api/ routes serving mock data; pages use useFetch exclusively (2/2 plans) — completed 2026-05-21
- [x] **Phase 10: Discovery Page** - Fully functional Discovery with UTable, USlideover VendorDrawer, ECharts radar (ClientOnly), USelectMenu tag assignment (completed 2026-05-21)
- [ ] **Phase 11: DPA + Dashboard** - DPA table with UBadge color-coded statuses; Dashboard "Top 8 Vendors Needing Attention" card
- [ ] **Phase 12: Risk Position + Tags** - Risk donut chart (ClientOnly) + vendor tier UTable; Tags Management CRUD with UModal
- [ ] **Phase 13: Deployment** - Static generate for GitHub Pages; nuxt.config.ts Amplify glidepath (3-line switch to SSR)

## Phase Details

### Phase 7: Nuxt Scaffold
**Goal**: The Nuxt 4 foundation is running — TypeScript, Nuxt UI v3, SSR-safe Pinia, and all build-blocking compatibility issues resolved before any page work begins
**Depends on**: Nothing (first v1.0.0 phase)
**Requirements**: NUXT-01, NUXT-02, NUXT-03
**Success Criteria** (what must be TRUE):
  1. `npm run dev` starts a Nuxt 4 SSR dev server with no PrimeVue imports anywhere in the project
  2. `<UApp>` wraps the app root in `app/app.vue` — USlideover and UModal overlay components render without errors
  3. Pinia tags store initializes on server and hydrates on client without SSR mismatch warnings; tag data survives a page refresh via `pinia-plugin-persistedstate`
  4. ECharts renders in a `<ClientOnly>` wrapper (or via `nuxt-echarts` module) — no "window is not defined" SSR crash
  5. TypeScript compiles with zero errors on a clean `nuxi build`
**Plans**: 2 plans

Plans:
- [x] 07-01-PLAN.md — Nuxt 4 scaffold: package.json rewrite, nuxt.config.ts + tsconfig.json + app/app.vue (UApp) + app/app.config.ts + app/assets/css/main.css; delete v0.5.0 entry points; Nuxt UI v4
- [x] 07-02-PLAN.md — Pinia + ECharts SSR-safe wiring: migrate tags store to app/stores/tags.ts with persist:true, verify nuxt-echarts SSR via smoke test, phase-gate full verify

### Phase 8: Layout & Routing
**Goal**: All 5 demo sections resolve via file-based routing and the persistent app shell renders correctly on every page
**Depends on**: Phase 7
**Requirements**: NUXT-04, LAYOUT-01
**Success Criteria** (what must be TRUE):
  1. Navigating to `/`, `/discovery`, `/dpa`, `/risk`, `/tags` each loads the correct stub page — no 404s
  2. The dark sidebar nav is visible on every page with active route highlighted correctly using `NuxtLink`
  3. No manual `router/index.ts` file exists — all routing is driven by `app/pages/` file structure
  4. `definePageMeta` provides nav label and icon metadata consumed by the sidebar without hardcoding route names
**Plans**: 1 plan

Plans:
- [x] 08-01-PLAN.md — File-based routing + default.vue layout: replace app/app.vue with UApp/NuxtLayout/NuxtPage; create app/types/page-meta.d.ts (PageMeta augmentation); 5 page stubs under app/pages/ with definePageMeta nav metadata; app/layouts/default.vue dark sidebar driven by useRouter().options.routes; dev-server curl probes for all 5 routes
**UI hint**: yes

### Phase 9: Server Data Layer
**Goal**: All mock data is served through Nuxt server API routes and client-side code never imports data files directly
**Depends on**: Phase 8
**Requirements**: DATA-01, DATA-02
**Success Criteria** (what must be TRUE):
  1. `GET /api/vendors`, `GET /api/dpa`, and `GET /api/edtech` each return valid JSON from `server/data/*.ts` source files
  2. Opening browser DevTools Network tab on any page shows XHR/fetch calls to `/api/...` — no data imported from static files in client bundles
  3. A developer can change a vendor's DPA status in `server/data/dpa.ts` and see the change reflected after a page reload with no component edits
  4. `useFetch('/api/vendors')` in a page component returns typed vendor data with no TypeScript errors
**Plans**: 2 plans

Plans:
- [x] 09-01-PLAN.md — server/data/ migration: shared/types/data.ts + server/data/{vendors,dpa,edtech}.ts (discovery merged into Vendor, edtech orphan reconciled), shared/utils/riskLabels.ts, delete v0.5.0 src/data/*.js
- [x] 09-02-PLAN.md — server/api/{vendors,dpa,edtech}.get.ts handlers + useFetch wiring into app/pages/discovery.vue (proof-of-typing demo) + dev-server curl panel

### Phase 10: Discovery Page
**Goal**: The Discovery page is fully functional — vendor table with sort/filter, tag assignment, and the VendorDrawer drill-down with ECharts radar chart all work end to end
**Depends on**: Phase 9
**Requirements**: PAGE-01
**Success Criteria** (what must be TRUE):
  1. The vendor table loads 27 rows via `useFetch('/api/vendors')` and supports column sort and text search filter
  2. Clicking a vendor row opens the `USlideover` VendorDrawer with full vendor detail and a 10-axis ECharts radar chart rendering inside `<ClientOnly>`
  3. A user can assign and remove tags on a vendor from the `USelectMenu` in the table row — changes persist across page navigation via Pinia store
  4. Tag chips display on each vendor row reflecting current assignments
**Plans**: 3 plans

Plans:
- [x] 10-01-PLAN.md — Discovery UTable + search filter + tag chip cell (sort headers via render-fn helper; useDebounce filter; @vueuse/core hoisted explicit; @select stub for drawer handoff)
- [x] 10-02-PLAN.md — VendorDrawer USlideover extraction (DPA + 1EdTech via useFetch; 10-axis ECharts radar in ClientOnly with USkeleton fallback; v0.5.0 src/ cleanup)
- [x] 10-03-PLAN.md — Tag assignment via setVendorTags action (per-row compact USelectMenu + drawer USelectMenu; Pinia write-back; persists across navigation)
**UI hint**: yes

### Phase 11: DPA + Dashboard
**Goal**: The DPA page and Dashboard are functional — color-coded status badges, sortable/filterable DPA table, and the "Top 8 Vendors Needing Attention" card surface the right data
**Depends on**: Phase 9
**Requirements**: PAGE-02, PAGE-05
**Success Criteria** (what must be TRUE):
  1. The DPA table loads via `useFetch('/api/dpa')` and shows Signed/Unsigned/Expired/Pending status with color-coded `UBadge` per row (not plain text)
  2. `UBadge` colors are driven by `riskLabels.ts` constants using `:style` with hex values — no hardcoded color classes in the template
  3. The DPA table supports column sort and a text filter that narrows visible rows in real time
  4. The Dashboard "Top 8 Vendors Needing Attention" card lists vendors with unsigned or expired DPAs, derived from the same `/api/dpa` data
**Plans**: 2 plans

Plans:
- [ ] 11-01: DPA page — UTable with useFetch, UBadge status colors from riskLabels.ts, sort and filter
- [ ] 11-02: Dashboard page — UCard "Top 8 Vendors Needing Attention" computed from DPA data
**UI hint**: yes

### Phase 12: Risk Position + Tags
**Goal**: The Risk Position page shows a donut chart distribution and sortable vendor tier table; the Tags Management page supports full CRUD with cascade delete
**Depends on**: Phase 9
**Requirements**: PAGE-03, PAGE-04
**Success Criteria** (what must be TRUE):
  1. The Risk Position donut chart renders inside `<ClientOnly>` showing High/Medium/Low vendor distribution — no SSR crash
  2. `UBadge` tier badges (High/Medium/Low) on the vendor table use hex colors from `riskLabels.ts` via `:style` binding
  3. The vendor tier table is sortable by tier, vendor name, and usage metrics
  4. Tags Management page lists all tags with inline rename and 8-swatch color palette picker
  5. Deleting a tag triggers a `UModal` confirmation; confirming removes the tag and cleans all vendor assignments in the Pinia store; "Reset to defaults" restores seed tags
**Plans**: 2 plans

Plans:
- [ ] 12-01: Risk Position page — ClientOnly donut chart, sortable UTable with UBadge tiers from riskLabels.ts
- [ ] 12-02: Tags Management page — inline CRUD, UModal delete confirmation, cascade delete, reset-to-defaults
**UI hint**: yes

### Phase 13: Deployment
**Goal**: The app generates as a static site deployable to GitHub Pages today, and switching to AWS Amplify SSR in the future requires only 3 config line changes with no page-level code edits
**Depends on**: Phase 12
**Requirements**: DEPLOY-01, DEPLOY-02
**Success Criteria** (what must be TRUE):
  1. `npm run generate` completes without errors and produces a static build under `.output/public/` with base path `/district-demo/`
  2. `npm run deploy` publishes the static build to GitHub Pages via `gh-pages` and the site loads correctly at the GitHub Pages URL
  3. `nuxt.config.ts` has a clearly commented Amplify glidepath block — enabling SSR requires only: uncommenting `ssr: true`, removing the `static` target, and adding `nitro: { preset: 'aws-amplify' }`; no page files need changing
  4. A developer reading `nuxt.config.ts` can identify the Amplify switch without documentation
**Plans**: 1 plan

Plans:
- [ ] 13-01: Deployment config — nuxi generate static output, gh-pages deploy script, Amplify glidepath comments in nuxt.config.ts

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Shell & Routing | v0.5.0 | 2/2 | Complete | 2026-05-13 |
| 2. Data Layer + Discovery | v0.5.0 | 4/4 | Complete | 2026-05-13 |
| 3. DPA View | v0.5.0 | 3/3 | Complete | 2026-05-13 |
| 4. 1EdTech View | v0.5.0 | 2/2 | Complete | 2026-05-13 |
| 5. Risk Position View | v0.5.0 | 2/2 | Complete | 2026-05-13 |
| 6. Tags Management | v0.5.0 | 2/2 | Complete | 2026-05-21 |
| 7. Nuxt Scaffold | v1.0.0 | 2/2 | Complete | 2026-05-21 |
| 8. Layout & Routing | v1.0.0 | 1/1 | Complete | 2026-05-21 |
| 9. Server Data Layer | v1.0.0 | 2/2 | Complete | 2026-05-21 |
| 10. Discovery Page | v1.0.0 | 3/3 | Complete    | 2026-05-21 |
| 11. DPA + Dashboard | v1.0.0 | 0/2 | Not started | - |
| 12. Risk Position + Tags | v1.0.0 | 0/2 | Not started | - |
| 13. Deployment | v1.0.0 | 0/1 | Not started | - |

---

*Last updated: 2026-05-21 — Phase 10 (Discovery Page) complete; Phase 11 (DPA + Dashboard) next*
