# Project State: District Demo Portal

**Last updated:** 2026-05-13
**Session:** Roadmap creation

---

## Project Reference

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

**Current focus:** Phase 1 — Shell & Routing

---

## Current Position

**Milestone:** v1
**Current phase:** 1 — Shell & Routing
**Current plan:** None started
**Status:** Not started

**Progress:**
```
Phase 1 [          ] 0%   Shell & Routing
Phase 2 [          ] 0%   Data Layer + Discovery
Phase 3 [          ] 0%   DPA View
Phase 4 [          ] 0%   1EdTech View
Phase 5 [          ] 0%   Risk Position View
Phase 6 [          ] 0%   Tags Management
```

**Overall:** 0/6 phases complete

---

## Performance Metrics

**Plans completed:** 0
**Plans failed:** 0
**Verifier passes:** 0
**Repair cycles used:** 0

---

## Accumulated Context

### Key Decisions (logged)

| Decision | Outcome | Phase |
|----------|---------|-------|
| Router history mode | Use `createWebHashHistory` — GitHub Pages cannot serve HTML5 pushstate fallbacks | Phase 1 |
| Mock data location | All data in `src/data/*.js` files only — never hardcoded in components | Phase 2 |
| Pinia store scope | Single tags store for all mutable state — initialized in Phase 1, consumed from Phase 2 onward | Phase 1 |
| Risk visualization | Donut chart (ECharts) above risk table — confirmed during roadmap derivation from research recommendation | Phase 5 |
| Vendor join key | Stable `vendorId` string (e.g. `vendor-google-classroom`) across all data files — not display name | Phase 2 |

### Decisions Pending

| Decision | Needed by | Options |
|----------|-----------|---------|
| Tag persistence scope | Phase 2 planning | Does demo require tags to survive page refresh? If yes, add localStorage watch to Pinia store. If no, skip. |
| Vendor fixture list | Phase 2 planning | Select 20-40 real edtech brand names with realistic spread of DPA statuses and risk tiers |
| npm version verification | Phase 1 planning | Verify current versions of `primevue`, `vue-echarts`, `echarts`, `tailwindcss` before install |

### Active Blockers

None.

### Todos

- [ ] Verify npm package versions before Phase 1 install
- [ ] Decide tag localStorage persistence before Phase 2 planning
- [ ] Choose vendor fixture list before Phase 2 data file creation

---

## Session Continuity

**To resume:** Run `/gsd:plan-phase 1` to begin planning Phase 1 (Shell & Routing).

**Context for next session:**
- Roadmap is created, 14/14 requirements mapped, 6 phases
- Phase 1 is the entry point — creates router, AppShell, SidebarNav, stub views, and Pinia store init
- Research summary is at `.planning/research/SUMMARY.md` — contains stack recommendations, pitfall list, and phase-level rationale
- `createWebHashHistory` is non-negotiable for GitHub Pages — must be set in `router/index.js` in Phase 1
- All phases have UI components (all 6 are `UI hint: yes`)

---
*State initialized: 2026-05-13*
