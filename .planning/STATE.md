---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
status: executing
stopped_at: Completed 11-01-PLAN.md (PAGE-02 surface shipped, ROADMAP Phase 11 success criteria 1-3 satisfied)
last_updated: "2026-05-22T00:42:10.626Z"
last_activity: 2026-05-22
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 10
  completed_plans: 9
---

# Project State: District Demo Portal

**Last updated:** 2026-05-21
**Session:** Milestone v1.0.0 (Nuxt Migration) — Phase 9 COMPLETE; server/api routes + useFetch demo wired; Phase 10 (Discovery UTable + USlideover + ECharts) next after `/gsd:verify-work`

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** Phase 11 — dpa-dashboard

---

## Current Position

Phase: 11 (dpa-dashboard) — EXECUTING
Plan: 2 of 2
Plans: 5 of 5 done (cumulative across executed phases — Phases 7, 8, 9)
Status: Ready to execute
Last activity: 2026-05-22

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
| Discovery merged into Vendor interface (no /api/discovery route) | At-rest denormalization — eliminates the v0.5.0 client-side `Object.fromEntries(...)` join, reduces Discovery page fetches from 2 to 1; Vendor carries frequency/lastSeen/userCount/studentCount inline | Phase 9-01 |
| Data type home: `shared/types/data.ts` | Auto-imports on both server and client via Nuxt 4 `shared/` convention; `server/utils/types.ts` rejected because it would force soft client→server dependencies for explicit annotations | Phase 9-01 |
| Edtech orphan reconciliation: no-op | Research §4 anticipated 28 source records with one orphan to drop; actual `src/data/edtech.js` shipped with exactly 27 records and 0 vendorId orphans — migration verbatim; documented inline in `server/data/edtech.ts` | Phase 9-01 |
| Explicit `Vendor[]` / `DpaRecord[]` / `EdtechRecord[]` annotation on data arrays | Forces compile-time validation against the interface — TypeScript only catches missing fields without explicit annotation (research Pitfall §7) | Phase 9-01 |
| v0.5.0 `src/data/*.js` deleted in Plan 09-01 (not deferred) | typecheck + `npm run build` green without them; deferring would leave a dead-code graveyard. `src/views/` and `src/components/` still reference them on disk but live outside Nuxt's scan path — deleted incrementally by Phases 10-12 | Phase 9-01 |
| Nitro event handler shape | `server/api/X.get.ts` is 3 lines: `import X from '~~/server/data/X'` + `export default defineEventHandler(() => X)`. `defineEventHandler` auto-imported by Nuxt 4 (no `from 'h3'`); return plain typed array (no `new Response(...)` wrapping — kills type inference per research Pitfall #2) | Phase 9-02 |
| useFetch with zero manual generics | Nitro's typed-routes inference flows the handler return type to `useFetch('/api/vendors')` automatically; `useFetch<Vendor[]>(...)` explicitly avoided as a drift risk (research §3, §10) | Phase 9-02 |
| `default: () => []` on useFetch | Promotes data ref from `Ref<Vendor[] \| null>` to `Ref<Vendor[]>`; eliminates template null guard so `{{ vendors.length }}` renders safely under SSR (research §7, Pitfall #4) | Phase 9-02 |
| Phase 9 wires ONE page (`app/pages/discovery.vue`) as proof-of-typing demo | Other 4 page stubs untouched until Phases 10-12 own them; ROADMAP success criterion 4 satisfied by single wiring (research §9) | Phase 9-02 |
| Discovery table chip cell + sortHeader helper + manual debounced filter pattern | sortHeader closure + useDebounce(search, 200) + UBadge `color="neutral" :style="{backgroundColor: hex}"` — reused by Phase 11 DPA table verbatim | Phase 10-01 |
| Drawer state lifting via single page-level selectedVendorId + selectedVendor + drawerOpen get/set | One drawer instance at page level (not per-row); USlideover v-model:open via computed bridge; clears selectedVendorId on close — Phase 11 DPA view reuses VendorDrawer.vue as-is | Phase 10-02 |
| ClientOnly wrap for interaction-mounted ECharts; NOT wrapped for initial-SSR ECharts | Drawer radar (interaction-mounted) → ClientOnly + USkeleton fallback; Phase 12 Risk donut (initial SSR) → no wrap, let nuxt-echarts handle SVG fallback. Formalizes Phase 7 anti-pattern reconciliation | Phase 10-02 |
| Pinia setup-store action pattern (named fn inside callback + included in return) | `setVendorTags(vendorId, tagIds)` + empty-array delete branch + `clearVendorTags(vendorId)` — grep-able write path; enables Phase 12 cascade-delete reuse; keeps localStorage JSON tidy | Phase 10-03 |
| Two-surface single-action pattern for USelectMenu (per-row + drawer share one Pinia action) | Both surfaces call `tagsStore.setVendorTags(vendorId, ids)` via explicit `:model-value` + `@update:model-value` binding; reactivity flows back to #tags-cell chip slot through tableRows computed | Phase 10-03 |
| USelectMenu :ui slot key is `base` not `trigger` (verified vs installed theme) | Plan §interfaces snippet had `:ui="{ trigger: 'w-auto' }"` — invalid; the SelectMenu theme (extends Select) uses `base` for the trigger button. Documented as Plan 10-03 deviation; carry-forward: always cross-check Nuxt UI v4 :ui slot keys against `node_modules/@nuxt/ui/dist/shared/ui.*.mjs` before authoring | Phase 10-03 |

### Active Blockers

None.

---

## Session Continuity

**To resume:** Run `/gsd:verify-work` to manually verify Phase 10 ROADMAP success criteria (UTable sort + filter, drawer + radar, USelectMenu tag assign + persistence). Per Plan 10-03 SUMMARY § "Manual UAT" — assign tags via per-row `+` trigger → chips appear; open drawer → same selection visible; add tag from drawer → row chip updates live; reload `/discovery` → chips still present; navigate to `/` then back → chips still present; remove all tags → localStorage entry deleted. After verify-work, proceed to Phase 11 (DPA + Dashboard).

**Stopped at:** Completed 11-01-PLAN.md (PAGE-02 surface shipped, ROADMAP Phase 11 success criteria 1-3 satisfied)

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
- Dev server: port 3000 by default; if busy Nuxt picks the next free port (test machine got 3001 in earlier phases; Phase 9-02 run bound 3000 cleanly).
- Dev-server log on Windows uses ANSI escape codes around port number — strip with `sed -r 's/\x1b\[[0-9;]*m//g'` before extracting via `grep -oE 'localhost:[0-9]+'`. Dev server kill via netstat-listener-PID + `taskkill /F /PID` (npm spawns nuxi as child so background-launcher PID is unreliable).
- Phase 9-01 COMPLETE: typed data layer migrated — `shared/types/data.ts` (Vendor/DpaRecord/EdtechRecord interfaces, auto-imported on server+client), `shared/utils/riskLabels.ts` (5 color maps), `server/data/{vendors,dpa,edtech}.ts` (27 records each, explicit type annotations); discovery.js metrics merged into Vendor inline by vendorId; all 5 v0.5.0 `src/data/*.js` files deleted; typecheck + build green.
- Phase 9-02 COMPLETE: 3 Nitro event handlers added at `server/api/{vendors,dpa,edtech}.get.ts` (3 lines each); `app/pages/discovery.vue` rewired to `useFetch('/api/vendors', { default: () => [] })` with no manual generic; live dev-server curl panel green (all 3 routes → 200 + application/json + 27 records; `/discovery` SSR HTML contains `Loaded 27 vendors`); `npm run typecheck` and `npm run build` exit 0; DATA-01 + DATA-02 closed.
- Phase 10 COMPLETE: PAGE-01 closed; all 4 ROADMAP Phase 10 success criteria green.
  - Plan 10-01: UTable with 27 rows + 6 sortable columns (sortHeader helper) + debounced filter (useDebounce 200ms) + `#tags-cell` chip slot reading from `tagsStore.assignments`; `@vueuse/core` hoisted to explicit dep.
  - Plan 10-02: `app/components/VendorDrawer.vue` extracted (USlideover 480px right side + 10-axis ECharts radar in ClientOnly + USkeleton fallback + DPA / 1EdTech sections); page-level selectedVendorId + selectedVendor + drawerOpen get/set computed trio; v0.5.0 PrimeVue Discovery+Drawer dead-code swept.
  - Plan 10-03: Pinia setup-store actions `setVendorTags(vendorId, tagIds)` + `clearVendorTags(vendorId)` with empty-array cleanup branch; per-row USelectMenu (compact `+` icon trigger in 3rem column) + drawer USelectMenu both write through the same action; reactivity flows back to chip slot via `tableRows` computed; `persist: true` + persistedstate plugin handles localStorage automatically; SSR HTML grew to 120,055 bytes (27 trigger renders).
- Phase 10 deviation lessons (carry-forward for Phase 11+):
  1. `@pinia/nuxt v0.11.3` does NOT auto-import store factories; always add explicit `import { useTagsStore } from '~/stores/tags'` (10-01 + 10-03).
  2. Nuxt UI v4 `TableColumn.meta.class` shape is `{ th?, td? }`, not a plain string (10-01).
  3. Nuxt UI v4 USelectMenu `:ui` slot key for the trigger button is **`base`**, not `trigger` (10-03 — cross-check `node_modules/@nuxt/ui/dist/shared/ui.*.mjs` before authoring `:ui` overrides).
  4. ClientOnly wrap only for interaction-mounted ECharts (drawer/modal); never for initial-SSR charts (let nuxt-echarts handle SVG fallback) — formalized 10-02.
  5. SSR `<tr` counting on Nuxt's single-line HTML uses `grep -oE '<tr[ >]' | wc -l`, not `grep -c '<tr'` (10-02).
- Phase 11 (DPA + Dashboard) and Phase 12 (Risk + Tags) both depend on Phase 9 data layer only.
- Deployment (Phase 13) is intentionally last — static generate confirmed working after all pages.

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21 | Roadmap created: 2026-05-21*
