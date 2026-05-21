---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
current_phase: not_started
current_plan: not_started
status: defining_requirements
stopped_at: Milestone v1.0.0 started — defining requirements and roadmap
last_updated: "2026-05-21T00:00:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State: District Demo Portal

**Last updated:** 2026-05-21
**Session:** Milestone v1.0.0 (Nuxt Migration) started — requirements and roadmap in progress

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** v1.0.0 — Nuxt 4 migration (scaffold → layout → pages → deployment)

---

## Current Position

Phase: Not started (defining requirements)
Plan: —
Status: Defining requirements
Last activity: 2026-05-21 — Milestone v1.0.0 started

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

### Key Decisions (v1.0.0 — pending)

| Decision | Needed by | Notes |
|----------|-----------|-------|
| Nuxt SSR vs SPA mode | Phase 7 | SSR confirmed — supports secure server-side API calls |
| Nuxt UI v3 component mapping | Phase 8+ | DataTable → UTable, Dialog → UModal, MultiSelect → USelectMenu |
| server/api/ route naming | Phase 8 | Establish convention for mock data routes |
| AWS Amplify Nitro preset | Phase 10 | `node-server` or `aws-lambda` preset to confirm |

### Active Blockers

None.

---

## Session Continuity

**To resume:** Run `/gsd:plan-phase 7` to begin Phase 7 (Nuxt scaffold).

**Context for next session:**

- v0.5.0 complete and archived — all 6 phases, 15 plans shipped
- v1.0.0 milestone: Nuxt 4 migration (infrastructure only, no new features)
- Target: Nuxt 4 + Nuxt UI v3 + TypeScript + @pinia/nuxt + SSR + AWS Amplify
- All existing demo features must be preserved (Discovery, DPA, Risk, Tags, Dashboard)
- ECharts must be wrapped in `<ClientOnly>` for SSR compatibility
- Mock data moves to `server/data/` served via `server/api/` routes
- Phase numbering continues from 6 → starts at 7

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21*
