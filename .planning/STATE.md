---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
status: verifying
stopped_at: Completed 08-01-PLAN.md (file-based routing + dark-sidebar shell + 5 page stubs; all 22 probes pass)
last_updated: "2026-05-21T19:44:09.062Z"
last_activity: 2026-05-21
progress:
  total_phases: 7
  completed_phases: 2
  total_plans: 3
  completed_plans: 3
---

# Project State: District Demo Portal

**Last updated:** 2026-05-21
**Session:** Milestone v1.0.0 (Nuxt Migration) — Phase 8 (Layout & Routing) COMPLETE; Phase 9 (Data Layer) next

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** Phase 08 — layout-routing

---

## Current Position

Phase: 08 (layout-routing) — COMPLETE
Plan: 1 of 1 done
Plans: 3 of 3 done (cumulative across executed phases)
Status: Phase complete — ready for verification
Last activity: 2026-05-21 — Completed Plan 08-01 (file-based routing + persistent dark-sidebar shell + 5 page stubs)

---

## Accumulated Context

### Key Decisions (v0.5.0, carried forward)

| Decision | Outcome | Phase |
|----------|---------|-------|
| Router history mode | `createWebHashHistory` — GitHub Pages static hosting (replaced by Nuxt file routing in v1.0.0) | Phase 1 |
| Mock data location | All data in `src/data/*.js` files only — moves to `server/data/` in v1.0.0 | Phase 2 |
| Pinia store scope | Single tags store for all mutable state — continues in v1.0.0 via `@pinia/nuxt` | Phase 1 |
| Risk visualization | Donut chart (ECharts) above risk table | Phase 5 |
| Vendor join key | Stable `vendorId` string (e.g. `vendor-google-classroom`) across all data files | Phase 2 |
| View-level join pattern | `Object.fromEntries(dataArray.map(d => [d.vendorId, d]))` for O(1) cross-file lookups | Phase 2 |

### Key Decisions (v1.0.0 — active)

| Decision | Resolution | Phase |
|----------|-----------|-------|
| Nuxt SSR vs SPA mode | SSR — supports secure server-side API calls; static output via `nuxi generate` for GitHub Pages now | Phase 7 |
| Nuxt UI component mapping | DataTable → UTable, Dialog → UModal, MultiSelect → USelectMenu, Drawer → USlideover | Phase 7+ |
| ECharts SSR strategy | `<ClientOnly>` wrapper — avoids "window is not defined" crash; consistent across all charts | Phase 7 |
| server/api/ route naming | `vendors.get.ts`, `dpa.get.ts`, `edtech.get.ts` — REST-style, Nuxt file-based naming | Phase 9 |
| UBadge color strategy | `:style` binding with hex values from `riskLabels.ts` constants — no hardcoded Tailwind classes | Phase 11-12 |
| AWS Amplify glidepath | 3-line switch in nuxt.config.ts: `ssr: true`, remove static target, add nitro aws-amplify preset | Phase 13 |
| Pinia SSR persistence | `pinia-plugin-persistedstate` with `storesDirs: ['app/stores/**']` in nuxt.config.ts | Phase 7 |
| In-place Nuxt 4 migration | Delete v0.5.0 entry points (src/main.js, src/App.vue, src/style.css, vite.config.js, index.html, dist/) but preserve src/data/, src/components/, src/views/, src/router/, src/stores/, public/ for later phases | Phase 7-01 |
| Brand color migration | 11-shade palette (50-950) migrated verbatim from v0.5.0 SchoolDayPreset into app/assets/css/main.css @theme static; Nuxt UI maps via ui.colors.primary: 'brand' in app/app.config.ts | Phase 7-01 |
| Active-link sidebar shade | `!bg-primary-600` (brand-600 = `#3c40cc`) chosen over v0.5.0 brand-500 (`#484ce6`) for ~30% better contrast against white text; visually near-identical at sidebar pill size | Phase 8-01 |
| Sidebar component placement | Inlined in `app/layouts/default.vue` — no separate `app/components/SidebarNav.vue` (single instance; demo-iteration speed favors flat file) | Phase 8-01 |
| Tailwind v4 sidebar bg utility | `bg-[var(--color-sidebar)]` explicit arbitrary value — `bg-sidebar` utility unreliable for non-graded single-color vars in Tailwind v4 | Phase 8-01 |
| Nav metadata source of truth | `definePageMeta({ nav, navLabel, navIcon, navOrder })` per page; sidebar iterates `useRouter().options.routes` filtered by `meta.nav===true`, sorted by `meta.navOrder` — zero hardcoded route names | Phase 8-01 |
| navOrder gap convention | Use gaps of 10 (10/20/30/40/50) so future v1.1+ sections can slot in (e.g. 1EdTech at 25) without renumbering | Phase 8-01 |
| PageMeta type augmentation location | `app/types/page-meta.d.ts` with `declare module '#app'` + `export {}` module marker — single source of truth; Phase 9+ should NOT redeclare | Phase 8-01 |

### Active Blockers

None.

---

## Session Continuity

**To resume:** Run `/gsd:verify-work` to verify Phase 8 deliverables, then `/gsd:plan-phase 9` to plan Phase 9 (Data Layer).

**Stopped at:** Completed 08-01-PLAN.md (file-based routing + dark-sidebar shell + 5 page stubs; all 22 probes pass)

**Context for next session:**

- Phase 7 COMPLETE: All 5 ROADMAP success criteria empirically verified on a clean reinstall.
- Phase 8 COMPLETE: All 4 ROADMAP Phase 8 success criteria empirically verified via 22/22 grep+curl panel against live dev server on port 3001.
- NUXT-01, NUXT-02, NUXT-03, NUXT-04, LAYOUT-01 all closed.
- `app/stores/tags.ts` is the canonical Pinia store — typed, persist:true, SEED_TAG_GROUPS exported with 4 groups + 12 children, hex colors `#484ce6`/`#da8231`/`#16a34a`/`#dc2626` preserved from v0.5.0.
- `src/stores/tags.js` DELETED; `src/stores/` directory is empty (kept for historical clarity, not crawled by Nuxt).
- `app/app.vue` is now the canonical `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>` triple (template-only, no script).
- `app/layouts/default.vue` is the persistent shell: dark sidebar (`bg-[var(--color-sidebar)]`) + Lakewood header + `<slot />`. Sidebar nav driven by `useRouter().options.routes` filter+sort.
- `app/types/page-meta.d.ts` augments PageMeta with `nav?`, `navLabel?`, `navIcon?`, `navOrder?` — single source of truth, Phase 9+ MUST NOT redeclare.
- 5 page stubs exist at `app/pages/{index,discovery,dpa,risk,tags}.vue` with `<h1>` + one-line `<p>` placeholders; ready to receive `useFetch` content in Phase 9.
- nuxt-echarts SSR confirmed working from Phase 7-02 smoke test.
- Dev server: port 3000 by default; if busy Nuxt picks the next free port (test machine got 3001 — same as Phase 7-02).
- Dev-server log on Windows uses ANSI escape codes around port number — strip with `sed -r 's/\x1b\[[0-9;]*m//g'` before extracting via `grep -oE 'localhost:[0-9]+'`. Dev server kill via netstat-listener-PID + `taskkill /F /PID` (npm spawns nuxi as child so background-launcher PID is unreliable).
- Phase 9 NEXT: `server/api/*.get.ts` mock data routes + `useFetch`/`useAsyncData` patterns in pages (DATA-01, DATA-02).
- Phase 10 (Discovery) proves all major patterns — UTable, USlideover, ECharts, USelectMenu.
- Phase 11 (DPA + Dashboard) and Phase 12 (Risk + Tags) both depend on Phase 9 data layer only.
- Deployment (Phase 13) is intentionally last — static generate confirmed working after all pages.

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21 | Roadmap created: 2026-05-21*
