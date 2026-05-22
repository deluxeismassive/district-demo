---
gsd_state_version: 1.0
milestone: v1.0.0
milestone_name: Nuxt Migration
status: executing
stopped_at: Completed 13-deployment/13-01-PLAN.md
last_updated: "2026-05-22T12:46:27.689Z"
last_activity: 2026-05-22
progress:
  total_phases: 7
  completed_phases: 6
  total_plans: 15
  completed_plans: 13
---

# Project State: District Demo Portal

**Last updated:** 2026-05-22
**Session:** Milestone v1.0.0 (Nuxt Migration) — Phase 13 Plan 01 complete. Deployment config wired: nuxt.config.ts has active baseURL + nitro.preset, package.json has deploy + postdeploy scripts, AMPLIFY-GLIDEPATH.md ADR created.

---

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-21)

**Core value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.
**Current focus:** Phase 13 — deployment

---

## Current Position

Phase: 13 (deployment) — EXECUTING
Plan: 2 of 3
Plans: 13 of 15 done (cumulative across executed phases — Phases 7, 8, 9, 10, 11, 12, 13-01)
Status: Executing Phase 13
Last activity: 2026-05-22 -- Phase 13 Plan 01 complete

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
| AWS Amplify glidepath | 3-line switch in nuxt.config.ts: (1) remove app.baseURL, (2) set nitro.preset='aws-amplify', (3) add amplify.yml — documented in .planning/adr/AMPLIFY-GLIDEPATH.md | Phase 13-01 |
| GitHub Pages deploy config | app.baseURL='/district-demo/' + nitro.preset='github_pages' active in nuxt.config.ts; deploy script: `nuxi generate && gh-pages -d .output/public --nojekyll` | Phase 13-01 |
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
| DPA table uses `:style` hex injection via DPA_STATUS_COLORS + RISK_LABEL_COLORS — NO semantic preset on UBadge, NO Tailwind `bg-*-NNN` class injection | Plan 11-01's `#status-cell` + `#riskLabel-cell` slots use `color="neutral" variant="solid" :style="{ backgroundColor: <hex>, color: '#ffffff' }"` — same pattern as VendorDrawer.vue lines 134-139 lifted to table rows; sales rep can recolor by editing one hex in shared/utils/riskLabels.ts | Phase 11-01 |
| Vue SSR emits inline `:style` in canonical-input hex form (`background-color:#16a34a`), NOT `rgb()` form | Acceptance probes that grep `background-color: rgb(...)` will FAIL even when the code is correct; future plans must probe the hex form directly. Verified in Plan 11-01 deviation #1 and confirmed again in Plan 11-02 | Phase 11-01 |
| Dashboard Top-8 derivation = `dpaList.filter(d => d.riskLabel !== null).slice(0, 8)` — file-order slice, NO severity re-sort | v0.5.0 verbatim algorithm; 4 Unsigned + 4 Expired in current data exactly matches ROADMAP SC#4 wording "vendors with unsigned or expired DPAs". Surfaces Zoom, Kahoot, Quizlet, Flip, Prodigy, Renaissance, Naviance, Infinite Campus | Phase 11-02 |
| Dashboard KPI tiles are plain divs, NOT UCards (single UCard reserved for the Top-8 card only) | v0.5.0 visual parity + avoids size-disparity jar of 3 mini-UCards next to a wider Top-8 UCard. ROADMAP SC#4 wording "using UCard" applies only to the Top-8 card per research § Open Question #2 | Phase 11-02 |
| `useFetch('/api/dpa', { default: () => [] })` URL-key dedup verified across 3 call sites — no `key` option anywhere | `app/pages/dpa.vue` + `app/pages/index.vue` + `app/components/VendorDrawer.vue` all use identical call shape; Nuxt dedups by URL = one cache entry shared across all surfaces. Build chunks include `dpa.get.mjs` once at 4.47 kB | Phase 11-01, 11-02 |

### Active Blockers

None.

---

## Session Continuity

**To resume:** Phase 13 (Deployment) is the final v1.0.0 phase. Start with `/gsd:plan-phase 13` (or `/gsd:discuss-phase 13` if deployment context still needs to be gathered).

Phase 13 scope per ROADMAP:

- `nuxi generate` static output for GitHub Pages with base path `/district-demo/`
- `npm run deploy` wired through `gh-pages` package (already in dependencies)
- 3-line Amplify glidepath comment block in `nuxt.config.ts`: enable `ssr: true`, remove static target, add `nitro: { preset: 'aws-amplify' }` — no page-level edits

**Stopped at:** Completed 13-deployment/13-01-PLAN.md

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
- Phase 11 COMPLETE: PAGE-02 + PAGE-05 closed; all 4 ROADMAP Phase 11 success criteria green.
  - Plan 11-01: `app/pages/dpa.vue` rewired from 16-line stub → 184-line full page (UTable 6 sortable columns, UInput + useDebounce(200) filter, `#status-cell` + `#riskLabel-cell` UBadge `:style` hex injection, page-level VendorDrawer mount via selectedVendorId + selectedVendor + drawerOpen trio); 89588 bytes SSR; all 4 status hex + 3 risk-label hex counts match data distribution exactly (16 / 5 / 4 / 2 status; 3 / 3 / 4 risk-label).
  - Plan 11-02: `app/pages/index.vue` rewired from 16-line stub → 145-line Dashboard (3 KPI tile divs reading "27" / "16" / "9", single UCard variant="outline" with `#header` slot for "Top 8 Vendors Needing Attention", 8 clickable rows via @click=selectVendor + RISK_LABEL_COLORS `:style` UBadges, page-level VendorDrawer mount); 42106 bytes SSR; 8x `cursor-pointer hover:bg-gray-50`, 3x #b91c1c + 3x #ef4444 + 2x #d97706 hex backgrounds present.
  - `useFetch('/api/dpa')` URL-key dedup empirically verified — all 3 call sites (dpa.vue + index.vue + VendorDrawer.vue) share one cache entry; build chunks include `dpa.get.mjs` once at 4.47 kB.
- Phase 11 deviation lessons (carry-forward for Phase 12+):
  1. Vue 3 SSR emits inline `:style` in canonical-input hex form (`background-color:#16a34a`), NOT `rgb(22, 163, 74)` — acceptance probes must grep hex literal directly (11-01 deviation #1, confirmed in 11-02).
  2. UCard slot keys: `root` / `header` / `title` / `description` / `body` / `footer` (NOT `content` — that's USlideover's key). No `:ui` override needed for default UCard usage (11-02 confirmation).
  3. Top-8 row hover-bleed uses `-mx-4 sm:-mx-6 px-4 sm:px-6` negative-then-positive margin pattern to reclaim UCard's body padding for full-width hover (11-02 pattern, Tailwind v4 idiom).
  4. Vendor display names differ from vendorIds — `vendor-flipgrid` displays as "Flip" (Microsoft rebranded 2022). Future verification probes should cross-reference `server/data/vendors.ts` display names, NOT extrapolate from vendorId (11-02 deviation #1).
- Phase 12 (Risk + Tags) depends on Phase 9 data layer + Phase 10 tags store + Phase 11 UBadge `:style` pattern (now ready to reuse for `RISK_TIER_COLORS` chips on Risk Position tier badges).
- Deployment (Phase 13) is intentionally last — static generate confirmed working after all pages.

---
*State initialized: 2026-05-13 | Reset for v1.0.0: 2026-05-21 | Roadmap created: 2026-05-21*
