---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
status: executing
last_updated: "2026-05-21T16:59:05.993Z"
last_activity: 2026-05-21
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 2
  completed_plans: 1
---

# Project State: District Demo Portal

**Last updated:** 2026-05-21
**Session:** Milestone v1.0.0 (Nuxt Migration) — Phase 7 Plan 01 complete (Nuxt 4 scaffold), Plan 02 next

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** Phase 07 — nuxt-scaffold

---

## Current Position

Phase: 07 (nuxt-scaffold) — EXECUTING
Plan: 2 of 2
Status: Plan 01 complete (NUXT-01, NUXT-02); Plan 02 ready (Pinia stores + ECharts smoke test)
Last activity: 2026-05-21 -- Completed 07-01-PLAN.md (Nuxt 4 scaffold)

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

### Active Blockers

None.

---

## Session Continuity

**To resume:** Run `/gsd:execute-phase 7` to execute Plan 07-02 (Pinia stores + ECharts smoke test).

**Stopped at:** Completed 07-01-PLAN.md (Nuxt 4 scaffold)

**Context for next session:**

- Plan 07-01 COMPLETE: Nuxt 4 scaffold ready — `npm install`, `npm run typecheck`, `npm run build` all exit 0
- NUXT-01 (Nuxt 4 + TS + no PrimeVue) and NUXT-02 (Nuxt UI v4 + `<UApp>` wrapping root) both verified
- All four Nuxt modules registered: @nuxt/ui, @pinia/nuxt, pinia-plugin-persistedstate/nuxt, nuxt-echarts
- Brand palette and accent vars live in app/assets/css/main.css @theme static; app.config.ts maps ui.colors.primary: 'brand'
- v0.5.0 entry points deleted (src/main.js, src/App.vue, src/style.css, vite.config.js, index.html, dist/)
- Preserved for later phases: src/data/, src/components/, src/views/, src/router/, src/stores/, public/
- Plan 07-02 NEXT: migrate src/stores/tags.js to app/stores/tags.ts (SSR-safe + persist: true), wire ECharts smoke test
- Phase 7 must resolve SSR blockers BEFORE any page work: localStorage crash and ECharts window reference (covered in Plan 07-02)
- Phase 10 (Discovery) proves all major patterns — UTable, USlideover, ECharts, USelectMenu
- Phase 11 (DPA + Dashboard) and Phase 12 (Risk + Tags) both depend on Phase 9 data layer only
- Deployment (Phase 13) is intentionally last — static generate confirmed working after all pages

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21 | Roadmap created: 2026-05-21*
