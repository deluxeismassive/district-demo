# Retrospective: District Demo Portal

---

## Milestone: v0.5.0 MVP

**Shipped:** 2026-05-21
**Phases:** 6 | **Plans:** 15

### What Was Built

1. Vue 3 + PrimeVue 4 + Pinia + Tailwind v4 SPA shell with hash routing and data-driven sidebar nav
2. 27-vendor Discovery DataTable with VendorDrawer (ECharts radar chart, grouped tag MultiSelect, localStorage)
3. DPA page with sortable/filterable table, status badges, and Dashboard "Top 8 at-risk" card
4. 1EdTech certification data in VendorDrawer (badge + standard + certified date; graceful empty state)
5. Risk Position page with ECharts donut chart and sortable vendor table with computed tier formula
6. Tags management CRUD page (inline rename, 8-color palette, cascade delete, reset-to-defaults)

### What Worked

- **Small plans executed fast**: 15 plans averaging 3–5 min each — the granular breakdown prevented context drift and kept each plan reviewable
- **`vendorId` join key established early**: Seeding all 4 data files in Phase 2 Plan 01 before any view consumed them meant zero join-key confusion in later phases
- **VendorDrawer as the universal drill surface**: Consolidating DPA + 1EdTech + usage into one drawer simplified navigation and avoided redundant table views
- **riskLabels.js constants module**: Centralizing badge color maps in one file paid dividends across 3 phases that all needed color-coded status display
- **stub views in Phase 1 Plan 01**: Creating minimal stubs early resolved the Vite 8 / rolldown build-time import issue before it could block Phase 2

### What Was Inefficient

- **ROADMAP.md progress row for Phase 3 went stale**: The row showed 1/3 plans complete even after all plans finished — manual progress tracking drifted from reality
- **No milestone audit run**: `/gsd:audit-milestone` was skipped; gaps (if any) weren't formally documented before archival

### Patterns Established

- **Router meta pattern**: `meta.nav`, `meta.label`, `meta.icon` drives sidebar without hardcoding routes in SidebarNav
- **View-level join pattern**: `Object.fromEntries(dataArray.map(d => [d.vendorId, d]))` for O(1) cross-file vendor lookups
- **Tailwind v4 `@theme` block** for brand color tokens — generates `bg-primary`, `text-primary` utilities without `tailwind.config.js`
- **PrimeVue 4 import paths**: `@primevue/core/api` for FilterMatchMode; `@primeuix/themes` for presets

### Key Lessons

- Vite 8 (rolldown) resolves lazy dynamic imports at build time — create stub view files before wiring router, or builds fail
- `darkModeSelector: false` is required when using a structural dark sidebar without CSS dark mode toggle
- PrimeVue 4 import paths changed from v3 — verify before installing to avoid runtime errors
- Sales demo portals benefit from a single-file-per-data-domain approach; one bad fixture edit won't corrupt unrelated views

---

## Cross-Milestone Trends

| Metric | v0.5.0 |
|--------|------|
| Phases | 6 |
| Plans | 15 |
| Timeline | 8 days |
| Source LOC | ~2,331 |
| Requirements shipped | 14/14 |
| Avg plan duration | ~3–5 min |

---

*Created: 2026-05-21 after v0.5.0 milestone*
