# Roadmap: District Demo Portal

## Milestones

- ✅ **v0.5.0 MVP** — Phases 1–6 (shipped 2026-05-21) — [archive](milestones/v0.5.0-ROADMAP.md)
- ✅ **v0.6.0 Nuxt Migration** — Phases 7–13 (shipped 2026-05-22) — [archive](milestones/v0.6.0-ROADMAP.md)

## Phases

<details>
<summary>✅ v0.5.0 MVP (Phases 1–6) — SHIPPED 2026-05-21</summary>

- [x] **Phase 1: Shell & Routing** — SPA shell, hash routing, sidebar nav, stub views (2/2 plans, 2026-05-13)
- [x] **Phase 2: Data Layer + Discovery** — 27-vendor mock data, sortable/filterable Discovery table, VendorDrawer, tags (4/4 plans, 2026-05-13)
- [x] **Phase 3: DPA View** — DPA table with status badges, VendorDrawer DPA section, Dashboard card (3/3 plans, 2026-05-13)
- [x] **Phase 4: 1EdTech View** — 1EdTech certification data in VendorDrawer (2/2 plans, 2026-05-13)
- [x] **Phase 5: Risk Position View** — ECharts donut chart + sortable vendor tier table (2/2 plans, 2026-05-13)
- [x] **Phase 6: Tags Management** — Full CRUD page: inline rename, color palette, cascade delete, reset-to-defaults (2/2 plans, 2026-05-21)

</details>

<details>
<summary>✅ v0.6.0 Nuxt Migration (Phases 7–13) — SHIPPED 2026-05-22</summary>

Full framework migration: Vue 3 + Vite SPA + PrimeVue 4 → Nuxt 4 SSR + Nuxt UI v4 + TypeScript. Mock data moved to `server/data/*.ts` served via `server/api/` Nitro routes; static-generated to GitHub Pages with documented Amplify SSR glidepath. Live at https://deluxeismassive.github.io/district-demo/.

- [x] **Phase 7: Nuxt Scaffold** — Nuxt 4 + TypeScript + Nuxt UI v4 + SSR-safe Pinia + persistedstate (2/2 plans, 2026-05-21)
- [x] **Phase 8: Layout & Routing** — File-based routing for 5 sections + dark-sidebar default layout (1/1 plans, 2026-05-21)
- [x] **Phase 9: Server Data Layer** — `server/api/` Nitro routes serving typed mock data; `useFetch` exclusive on client (2/2 plans, 2026-05-21)
- [x] **Phase 10: Discovery Page** — UTable + USlideover VendorDrawer + ECharts radar (ClientOnly) + USelectMenu tag assignment (3/3 plans, 2026-05-21)
- [x] **Phase 11: DPA + Dashboard** — DPA table with UBadge color-coded statuses + Dashboard "Top 8 Vendors Needing Attention" UCard (2/2 plans, 2026-05-22)
- [x] **Phase 12: Risk Position + Tags** — Risk donut (initial-SSR) + tier UTable + Tags Management CRUD with UModal (2/2 plans, 2026-05-22)
- [x] **Phase 13: Deployment** — `nuxi generate` to GitHub Pages + smoke probe + `nuxt.config.ts` Amplify glidepath + ADR (3/3 plans, 2026-05-22)

Full archive with key decisions, deferred ideas, and technical debt: [milestones/v0.6.0-ROADMAP.md](milestones/v0.6.0-ROADMAP.md).

</details>

### ⏭ Next Milestone (TBD)

Run `/gsd:new-milestone` to scope the next milestone. Carried-forward backlog in [v0.6.0 archive § Issues Deferred](milestones/v0.6.0-ROADMAP.md): DPA expiry warning, click-to-filter on donut, tag-filter on Discovery, 1EdTech detail surface, real API wiring, AWS Amplify SSR deployment, custom domain.

---

*Last updated: 2026-05-22 — v0.6.0 Nuxt Migration shipped (7 phases, 15 plans, 84 commits). Full per-phase details + decisions log in [milestones/v0.6.0-ROADMAP.md](milestones/v0.6.0-ROADMAP.md). Next milestone TBD — run `/gsd:new-milestone`.*
