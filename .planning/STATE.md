---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
current_phase: not_started
current_plan: not_started
status: planning
stopped_at: Roadmap created — ready to begin Phase 7
last_updated: "2026-05-21T00:00:00.000Z"
progress:
  total_phases: 7
  completed_phases: 0
  total_plans: 13
  completed_plans: 0
  percent: 0
---

# Project State: District Demo Portal

**Last updated:** 2026-05-21
**Session:** Milestone v1.0.0 (Nuxt Migration) — roadmap created, Phase 7 ready to plan

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** v1.0.0 — Nuxt 4 migration (scaffold → layout → data layer → pages → deployment)

---

## Current Position

Phase: Not started (roadmap complete, beginning Phase 7)
Plan: —
Status: Planning
Last activity: 2026-05-21 — v1.0.0 roadmap created (7 phases, 13 plans)

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

### Active Blockers

None.

---

## Session Continuity

**To resume:** Run `/gsd:plan-phase 7` to begin Phase 7 (Nuxt Scaffold).

**Context for next session:**

- v0.5.0 complete and archived — all 6 phases, 15 plans shipped
- v1.0.0 roadmap: 7 phases (7–13), 13 plans, all 14 requirements mapped
- Phase 7 must resolve SSR blockers BEFORE any page work: localStorage crash and ECharts window reference
- PrimeVue must be fully removed in Phase 7 before page migration begins
- `<UApp>` in `app/app.vue` is required for USlideover and UModal to render
- `storesDirs: ['app/stores/**']` must be set in nuxt.config.ts for Pinia auto-import
- Phase 10 (Discovery) proves all major patterns — UTable, USlideover, ECharts, USelectMenu
- Phase 11 (DPA + Dashboard) and Phase 12 (Risk + Tags) both depend on Phase 9 data layer only
- Deployment (Phase 13) is intentionally last — static generate confirmed working after all pages

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21 | Roadmap created: 2026-05-21*
