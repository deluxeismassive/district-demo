# Requirements: District Demo Portal — v1.0.0 Nuxt Migration

**Defined:** 2026-05-21
**Milestone:** v1.0.0 Nuxt Migration
**Core Value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

---

## v1.0.0 Requirements

### Foundation

- [x] **NUXT-01**: App runs as a Nuxt 4 project with TypeScript (`compatibilityVersion: 4`, `compatibilityDate: '2025-07-01'`); all PrimeVue dependencies removed from `package.json`
- [x] **NUXT-02**: `@nuxt/ui` v4 is the sole component library; `<UApp>` wraps the app root in `app/app.vue` so overlays (USlideover, UModal) render correctly
- [x] **NUXT-03**: Pinia tags store works without SSR crashes; `@pinia/nuxt` module configured with `storesDirs: ['app/stores/**']`; localStorage persistence via `pinia-plugin-persistedstate`
- [x] **NUXT-04**: All 5 demo sections resolve via file-based routing in `app/pages/`; no manual Vue Router config remains; hash history (`createWebHashHistory`) removed

### Layout

- [x] **LAYOUT-01**: Persistent app shell implemented as `app/layouts/default.vue` with dark sidebar nav; `NuxtLink` replaces `RouterLink`; active route highlighting works on all pages

### Data Layer

- [x] **DATA-01**: All mock data served through Nuxt server API routes (`server/api/vendors.get.ts`, `server/api/dpa.get.ts`, `server/api/edtech.get.ts`); source data in `server/data/*.ts`
- [x] **DATA-02**: Pages and components use `useFetch('/api/...')` exclusively to load data; no direct imports of data files from client-side code

### Pages

- [ ] **PAGE-01**: Discovery page fully functional — `UTable` with column sort and search filter, `USlideover` VendorDrawer with ECharts radar chart (client-only via `<ClientOnly>` or `nuxt-echarts`), `USelectMenu` tag assignment with tag display
- [ ] **PAGE-02**: DPA page fully functional — `UTable` with column sort and filter, color-coded `UBadge` status badges for Signed/Unsigned/Expired/Pending
- [ ] **PAGE-03**: Risk Position page fully functional — donut chart (`<VChartFull>` or `<ClientOnly>` wrapped) + `UTable` sortable vendor tier table with `UBadge` tier badges
- [ ] **PAGE-04**: Tags Management page fully functional — inline CRUD, `UModal` delete confirmation dialog, cascade delete cleans vendor assignments, reset-to-defaults
- [ ] **PAGE-05**: Dashboard functional — "Top 8 Vendors Needing Attention" card surfacing unsigned/expired DPAs using `UCard`

### Deployment

- [ ] **DEPLOY-01**: App generates as a static site via `nuxi generate` (or `npm run generate`); base path `/district-demo/` configured; `npm run deploy` publishes to GitHub Pages via `gh-pages`
- [ ] **DEPLOY-02**: `nuxt.config.ts` is structured for the Amplify glidepath — switching from GitHub Pages to AWS Amplify SSR requires only: (1) enabling `ssr: true`, (2) removing `static` target, (3) adding `nitro: { preset: 'aws-amplify' }`; no page-level code changes needed

---

## Deferred to v1.1.0+

### Feature Enhancements

- DPA expiry warning — amber highlight for DPAs expiring within 90 days
- Risk table with contributing factors — show what drives each vendor's tier
- Click donut chart segment to filter the risk table below
- Filter Discovery table by one or more tags
- 1EdTech detail — which standards/tiers a vendor holds
- Cross-reference 1EdTech certified vendors with Discovery active usage

### Infrastructure

- AWS Amplify SSR deployment (dev/staging/production environments)
- Real API connections to app-catalog backend via `server/api/` routes
- `amplify.yml` configuration for Amplify CI/CD
- Environment-specific runtime config (`NUXT_` prefix convention)

---

## Out of Scope (v1.0.0)

| Feature | Reason |
|---------|--------|
| Authentication / login screen | Portal opens directly; login adds friction with no demo benefit |
| Mobile optimization | Sales demos happen on desktop/laptop |
| Multi-district support | Single fixture district is right demo scope |
| Bulk import / export | Pulls demo attention away from insight story |
| Full CRUD on vendor records | Tag CRUD only; vendor CRUD raises "is this real?" questions |
| Real API connections | Demo uses synthetic data during this milestone |
| Multi-environment Amplify config | Waiting for environment provisioning |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| NUXT-01 | Phase 7 | Complete (2026-05-21) |
| NUXT-02 | Phase 7 | Complete (2026-05-21) |
| NUXT-03 | Phase 7 | Complete (2026-05-21) |
| NUXT-04 | Phase 8 | Complete (2026-05-21) |
| LAYOUT-01 | Phase 8 | Complete (2026-05-21) |
| DATA-01 | Phase 9 | Not started |
| DATA-02 | Phase 9 | Not started |
| PAGE-01 | Phase 10 | Not started |
| PAGE-02 | Phase 11 | Not started |
| PAGE-05 | Phase 11 | Not started |
| PAGE-03 | Phase 12 | Not started |
| PAGE-04 | Phase 12 | Not started |
| DEPLOY-01 | Phase 13 | Not started |
| DEPLOY-02 | Phase 13 | Not started |

**Coverage:**
- v1.0.0 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---

*Requirements defined: 2026-05-21*
