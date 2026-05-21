---
phase: 08-layout-routing
plan: 01
subsystem: routing-layout
tags: [nuxt-pages, nuxt-layouts, define-page-meta, nuxt-link, sidebar-nav, typescript, file-based-routing, page-meta-augmentation]

# Dependency graph
requires:
  - phase: 07-02
    provides: app/app.vue stub (template-only, no script), Nuxt 4 + @nuxt/ui v4 + Tailwind v4 stack, --color-sidebar and --color-brand-* tokens in app/assets/css/main.css, nuxt.config.ts with @nuxt/ui auto-registering @nuxt/icon
provides:
  - File-based routing for 5 demo sections (/, /discovery, /dpa, /risk, /tags) — no manual vue-router config
  - Persistent dark-sidebar app shell in app/layouts/default.vue iterating useRouter().options.routes filtered by meta.nav===true, sorted by meta.navOrder
  - app/types/page-meta.d.ts PageMeta interface augmentation with nav, navLabel, navIcon, navOrder (permanent — Phase 9+ should NOT redeclare)
  - 5 page stubs ready to receive useFetch-driven content in Phase 9
  - app/app.vue canonical UApp > NuxtLayout > NuxtPage triple (replaces Phase 7 placeholder)
affects: [09-data-layer, 10-discovery, 11-dpa-dashboard, 12-risk-tags]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "File-based routing via app/pages/*.vue (lowercase filenames) — Nuxt scans at build time, generates route table; URL is filename minus .vue"
    - "definePageMeta literal-only macro carries nav metadata (nav, navLabel, navIcon, navOrder) into route.meta at build time — sidebar reads via useRouter().options.routes filter+sort"
    - "PageMeta interface augmentation via declare module '#app' + export {} module marker enables typed custom meta keys"
    - "NuxtLink with BOTH active-class and exact-active-class set to !bg-primary-600 !text-white — exact-active-class avoids root '/' prefix-match bug, !important wins cascade over base text-gray-400"
    - "Tailwind v4 arbitrary-value bg-[var(--color-sidebar)] for non-graded CSS vars (bg-sidebar utility unsafe with single non-shaded var)"
    - "Inline sidebar in app/layouts/default.vue (no separate SidebarNav component) — fewer files, same-day demo iteration"

key-files:
  created:
    - "app/types/page-meta.d.ts (PageMeta interface augmentation)"
    - "app/layouts/default.vue (dark sidebar + Lakewood header + slot)"
    - "app/pages/index.vue (Dashboard stub, navOrder 10)"
    - "app/pages/discovery.vue (Discovery stub, navOrder 20)"
    - "app/pages/dpa.vue (DPA stub, navOrder 30)"
    - "app/pages/risk.vue (Risk Position stub, navOrder 40)"
    - "app/pages/tags.vue (Tags stub, navOrder 50)"
  modified:
    - "app/app.vue (Phase 7 placeholder paragraph replaced with UApp > NuxtLayout > NuxtPage)"

key-decisions:
  - "Used !bg-primary-600 (brand-600 = #3c40cc) for active-link bg instead of v0.5.0 brand-500 (#484ce6) — slightly darker improves contrast vs white text (~5.2:1 vs ~4.0:1), visually near-identical at sidebar pill size"
  - "Inlined sidebar in app/layouts/default.vue rather than splitting into app/components/SidebarNav.vue — one-instance use, demo-iteration speed favors flat file"
  - "Used bg-[var(--color-sidebar)] explicit arbitrary value, not bg-sidebar utility — Tailwind v4 may not generate utilities from non-graded single-color vars"
  - "Set BOTH active-class and exact-active-class to the same !bg-primary-600 !text-white string — defends against future refactor drift, satisfies Pitfalls 3 and 11"
  - "navOrder values use gaps of 10 (10/20/30/40/50) to leave room for future v1.1 sections (e.g., a 1EdTech route at navOrder 25)"

patterns-established:
  - "Pattern A: File-based routing — add app/pages/X.vue → /X route appears automatically; no router edits"
  - "Pattern B: Metadata-driven nav — adding a section is a single-file operation (create app/pages/X.vue with definePageMeta + nav: true)"
  - "Pattern C: NuxtLink active styling — both active-class and exact-active-class, both with ! Tailwind important markers"
  - "Pattern D: PageMeta type augmentation — declare module '#app' with custom keys + export {} module marker"

requirements-completed: [NUXT-04, LAYOUT-01]

# Metrics
duration: 18min
completed: 2026-05-21
---

# Phase 8 Plan 01: Layout & Routing Summary

**File-based routing for 5 demo sections wired through a persistent dark-sidebar app shell driven by definePageMeta + useRouter().options.routes — zero hardcoded route names**

## Performance

- **Duration:** ~18 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 4
- **Files created:** 7
- **Files modified:** 1 (app/app.vue)

## Accomplishments

- Replaced the Phase 7 placeholder paragraph in `app/app.vue` with the canonical `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>` triple — `<NuxtLayout>` now in the chain so `default.vue` mounts.
- Added 5 file-based routes (`/`, `/discovery`, `/dpa`, `/risk`, `/tags`) — Nuxt's `app/pages/` scan automatically generates the route table; no `vue-router` config file anywhere.
- Built `app/layouts/default.vue` as a persistent shell that iterates `useRouter().options.routes` filtered by `meta.nav === true` and sorted by `meta.navOrder` — adding a 6th route in v1.1 is a single-file operation.
- Augmented the `PageMeta` interface in `app/types/page-meta.d.ts` so `nav`, `navLabel`, `navIcon`, `navOrder` autocomplete and typecheck across all pages.
- Verified empirically against a live SSR dev server (port 3001) — all 5 routes return HTTP 200 with page-specific `<h1>`, persistent sidebar (`Schoolday`), persistent header (`Lakewood Unified School District`), and all 5 nav labels rendered.

## Task Commits

Each task was committed atomically:

1. **Task 1: PageMeta type augmentation + NuxtLayout chain in app.vue** — `9901131` (feat)
2. **Task 2: 5 page stubs with definePageMeta nav metadata** — `2a4692c` (feat)
3. **Task 3: Default layout with router-driven dark sidebar shell** — `0d94cd5` (feat)
4. **Task 4: Phase-gate dev-server smoke probe (verification-only, no commit)** — verification on commit `0d94cd5`

**Plan metadata commit:** (added at end of plan with SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- **Created** `app/types/page-meta.d.ts` — `declare module '#app' { interface PageMeta { nav?, navLabel?, navIcon?, navOrder? } } export {}`
- **Created** `app/layouts/default.vue` — flex shell: `<aside class="bg-[var(--color-sidebar)]">` with NuxtLink list + `<header>Lakewood Unified School District</header>` + `<main><slot /></main>`
- **Created** `app/pages/index.vue` — Dashboard stub, `definePageMeta({ nav: true, navLabel: 'Dashboard', navIcon: 'i-lucide-home', navOrder: 10 })`
- **Created** `app/pages/discovery.vue` — Discovery stub, `i-lucide-search`, navOrder 20
- **Created** `app/pages/dpa.vue` — DPA stub, `i-lucide-file-text`, navOrder 30
- **Created** `app/pages/risk.vue` — Risk Position stub, `i-lucide-alert-triangle`, navOrder 40
- **Created** `app/pages/tags.vue` — Tags stub, `i-lucide-tag`, navOrder 50
- **Modified** `app/app.vue` — Phase 7 placeholder paragraph replaced with the 7-line `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>` template; no `<script>` block

## Phase 8 ROADMAP Success Criteria — empirical evidence

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `/`, `/discovery`, `/dpa`, `/risk`, `/tags` each return HTTP 200 with page-specific h1 SSR markup | PASS | `curl -w "%{http_code}"` returned `200` for all 5 paths against `http://localhost:3001`; each body matched `<h1[^>]*>Dashboard</h1>`, `<h1[^>]*>Discovery</h1>`, `<h1[^>]*>DPA</h1>`, `<h1[^>]*>Risk Position</h1>`, `<h1[^>]*>Tags</h1>` respectively |
| 2 | Sidebar (`Schoolday` + 5 NuxtLinks) and header (`Lakewood Unified School District`) appear in SSR HTML on every page; `exact-active-class` is set on every NuxtLink | PASS | Every one of 5 route bodies contained both `Schoolday` and `Lakewood Unified School District` substrings; `grep -q 'exact-active-class="!bg-primary-600 !text-white"' app/layouts/default.vue` matched |
| 3 | No `router/index.ts` or other router config file exists anywhere; no `createRouter`/`createWebHistory`/`createWebHashHistory` imports anywhere | PASS | `find app/ src/ -maxdepth 4 \( -name 'router*.ts' -o -name 'router*.js' \)` returned empty; `grep -rE "createRouter\|createWebHistory\|createWebHashHistory" app/ nuxt.config.ts` returned empty; `grep '"vue-router"' package.json` returned empty |
| 4 | Sidebar reads nav data from `useRouter().options.routes` filtered by `meta.nav === true` and sorted by `meta.navOrder` — zero hardcoded route names in `app/layouts/default.vue` | PASS | `grep -q 'router.options.routes' app/layouts/default.vue` matched; `grep -q 'meta?.nav === true' app/layouts/default.vue` matched; `grep -q 'navOrder' app/layouts/default.vue` matched; root `/` body contained all 5 nav labels (`Dashboard\|Discovery\|DPA\|Risk Position\|Tags`) → `sort -u \| wc -l = 5` |

## Phase-gate probe panel — 22/22 pass

**Static probes (file existence + content):**

- `test -f app/app.vue` PASS, `test -f app/layouts/default.vue` PASS, `test -f app/types/page-meta.d.ts` PASS
- `test -f app/pages/{index,discovery,dpa,risk,tags}.vue` PASS (5/5)
- `grep -q '<NuxtLayout>' app/app.vue` PASS; `grep -q '<NuxtPage' app/app.vue` PASS; `grep -q '<UApp>' app/app.vue` PASS
- `grep -q "declare module '#app'" app/types/page-meta.d.ts` PASS; `grep -q '^export {}' app/types/page-meta.d.ts` PASS
- Each page: `grep -q 'definePageMeta(' app/pages/$p.vue` PASS (5/5); `grep -q 'nav: true' app/pages/$p.vue` PASS (5/5)
- `grep -q 'router.options.routes' app/layouts/default.vue` PASS; `grep -q 'meta?.nav === true' app/layouts/default.vue` PASS
- `grep -q 'exact-active-class' app/layouts/default.vue` PASS; `grep -q '<NuxtLink' app/layouts/default.vue` PASS
- `! grep -q '<RouterLink' app/layouts/default.vue` PASS
- `grep -q 'bg-\[var(--color-sidebar)\]' app/layouts/default.vue` PASS
- `grep -q 'Schoolday' app/layouts/default.vue` PASS; `grep -q 'Lakewood Unified School District' app/layouts/default.vue` PASS

**Build probes:**

- `npm run typecheck` exit 0 (run after Task 1, Task 2, Task 3, and Task 4)
- `npm run build` exit 0 — per-route server chunks emitted (`index-WtR2g0nk.mjs`, `discovery-CIMv8N7J.mjs`, `dpa-Cx-yQLO8.mjs`, `risk-DCrhZJAN.mjs`, `tags-PdGHH1vV.mjs`, `default-CJaxyMKe.mjs`); `.output/server/` and `.output/public/` both produced

**Runtime probes (dev server on port 3001):**

- All 5 paths → HTTP 200 PASS (5/5)
- All 5 bodies contain page-specific `<h1>` PASS (5/5)
- All 5 bodies contain `Schoolday` (sidebar persistent shell) PASS (5/5)
- All 5 bodies contain `Lakewood Unified School District` (header persistent shell) PASS (5/5)
- Root `/` body contains all 5 unique nav labels → `wc -l = 5` PASS

**Negative probes (regression guards):**

- No router config file anywhere (`find app/ src/` empty) PASS
- No `createRouter`/`createWebHistory`/`createWebHashHistory` imports anywhere PASS
- No `"vue-router"` in package.json PASS
- No PrimeIcons `pi pi-*` regression in app/ PASS
- No `<RouterLink>` in `app/layouts/default.vue` PASS

## Decisions Made

- **Active-link shade:** `!bg-primary-600` (brand-600 = `#3c40cc`) chosen over v0.5.0 `brand-500` (`#484ce6`) for ~30% better contrast against white text. Visually near-identical at sidebar pill size; locked in via the !important marker so it beats the base `text-gray-400` cascade.
- **Sidebar inlined in default.vue:** No separate `app/components/SidebarNav.vue` for Phase 8 — single instance, demo-iteration speed favors a flat 45-line file. Phase 10+ may refactor if multiple sidebars emerge.
- **`bg-[var(--color-sidebar)]` over `bg-sidebar`:** Tailwind v4 utility generation from a single non-graded `--color-sidebar` var is unreliable; the explicit arbitrary-value form is verified.
- **Both `active-class` AND `exact-active-class` set to identical strings:** Defensive against a future refactor changing one prop and forgetting the other — same final active styling either way.
- **`navOrder` gaps of 10:** Leaves room for v1.1+ sections to slot in (e.g., a `1EdTech` route at `navOrder: 25`) without renumbering existing pages.

## Deviations from Plan

None — plan executed exactly as written. All 4 tasks ran in order, each `<verify>` block went green on the first pass.

The plan-checker's notes flagged two cosmetic issues that did not affect execution:
- The plan's Task 1 `find` predicate for router files lacked `\( ... \)` parentheses; the simpler form returned empty (no router files exist), so the assertion held regardless.
- Task 4's `ss -tlnp` port discovery is Linux-only; the executor used the documented Windows-compatible alternative (parse dev-server log for `Local: http://localhost:PORT`, stripping ANSI codes) and confirmed port 3001 (3000 was busy locally, matching Phase 7-02).

## Issues Encountered

- **Dev-server port extraction needed ANSI stripping.** The Nuxt 4 dev log emits colored output (e.g., `localhost:\x1b[1m3001\x1b[22m`). The first port-extraction probe matched the empty string between `localhost:` and the escape code. Fixed by piping through `sed -r 's/\x1b\[[0-9;]*m//g'` before the `grep -oE 'localhost:[0-9]+'`. No code change needed — Bash command refinement only.

- **Dev-server kill via PID unreliable.** `npm run dev` spawns `nuxi` as a child, so the parent PID returned by the background launcher does not correspond to the listener. Resolved by `netstat -ano | grep ":3001 " | grep LISTENING` → `taskkill /F /PID <listener-pid>`. Logged in env_notes; documented in this summary for Phase 9+ executors.

## User Setup Required

None — no external service configuration required.

## Manual UAT (deferred to /gsd:verify-work)

The following visual/interactive checks were intentionally excluded from the automated probe panel and belong to `/gsd:verify-work`:

- **Active highlight color:** Open `http://localhost:3001/discovery` in a browser, confirm the Discovery nav item has the `!bg-primary-600` (`#3c40cc`) active background and contrast against the dark sidebar is acceptable to the eye.
- **Active highlight transfer:** Click through Dashboard → Discovery → DPA → Risk Position → Tags in sequence, confirm only the clicked item is highlighted at each step (root `/` is NOT incorrectly active on sub-routes — Pitfall 3 fix).
- **No Vue hydration warnings:** Open browser DevTools console on initial load of each route, confirm no `[Vue warn]: Hydration` messages appear.

## Handoff to Phase 9

- **Page stubs have no data.** Each of `app/pages/{index,discovery,dpa,risk,tags}.vue` is a placeholder `<h1>` + one-line `<p>`. Phase 9 will replace each body with `useFetch`/`useAsyncData`-driven content fetching from `server/api/` routes.
- **PageMeta augmentation is permanent.** Do NOT redeclare `nav`/`navLabel`/`navIcon`/`navOrder` in any future `.d.ts` file — `app/types/page-meta.d.ts` is the single source of truth. If Phase 9+ wants to add a `badge` or `permission` field, extend the same interface.
- **Sidebar is metadata-driven.** Phase 9+ can hide a route from the sidebar by setting `definePageMeta({ nav: false })` (e.g., for an admin-only preview route) — no layout edit required.
- **No layout overrides on Phase 8 stubs.** None of the 5 pages set `definePageMeta({ layout: ... })`. Phase 9+ should keep this unless a route specifically needs a print or bare layout (in which case create `app/layouts/print.vue` / `bare.vue` first).
- **PHASE 9 PRIORITY:** Per ROADMAP, the next plan is Phase 9 data layer (`server/api/*.get.ts` + `useFetch` patterns) — provides the data hooks that Phase 10-12 page implementations will consume.

## Known Orphans (deferred deletion)

The following v0.5.0 files remain on disk but are outside Nuxt 4's scan paths (`app/` only — `src/` is ignored):

- `src/views/*.vue` (Dashboard/Discovery/Reports/Settings — superseded by `app/pages/`)
- `src/components/layout/SidebarNav.vue` and `AppShell.vue` (superseded by `app/layouts/default.vue`)
- `src/components/` other files (consumed by Phases 10-12 as those phases rewrite each view)
- `src/router/` (if present; not crawled by Nuxt)

These will be deleted incrementally by Phases 10-12 as each view is rewritten. Confirmed safe: none are referenced by anything in `app/`, `nuxt.config.ts`, or `package.json`.

## Next Phase Readiness

- **Routing skeleton is empirically proven.** All 5 routes SSR cleanly with the persistent shell. Phase 9 can start implementing the data layer (`server/api/*.get.ts`) with high confidence that page stubs receive `useFetch` data correctly.
- **No blockers.** No npm installs needed, no `nuxt.config.ts` edits needed, no architectural questions outstanding.
- **NUXT-04 and LAYOUT-01 requirements closed** — verifiable via the probe panel above.

---
*Phase: 08-layout-routing*
*Completed: 2026-05-21*

## Self-Check: PASSED
