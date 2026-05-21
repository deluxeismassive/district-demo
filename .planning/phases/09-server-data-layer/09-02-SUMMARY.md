---
phase: 09-server-data-layer
plan: 02
subsystem: server-data-layer
tags: [nuxt-server, nitro-event-handler, server-api, usefetch, ssr, typed-routes, type-inference, http-api]

# Dependency graph
requires:
  - phase: 09-01
    provides: "shared/types/data.ts (Vendor/DpaRecord/EdtechRecord interfaces auto-imported on server+client); server/data/{vendors,dpa,edtech}.ts (27 typed records each with explicit type annotations); v0.5.0 src/data/*.js graveyard cleared"
  - phase: 08-01
    provides: "5 page stubs at app/pages/{index,discovery,dpa,risk,tags}.vue (only discovery.vue modified by 09-02; other 4 untouched); app/types/page-meta.d.ts PageMeta augmentation (NOT redeclared); app/layouts/default.vue sidebar that drives the /discovery link"
  - phase: 07-02
    provides: "Nuxt 4 SSR scaffold with auto-imported defineEventHandler from Nitro/h3; nuxt.config.ts with ssr: true"
provides:
  - "server/api/vendors.get.ts — GET /api/vendors handler returning Vendor[] (27 records) via Nitro auto-import of defineEventHandler"
  - "server/api/dpa.get.ts — GET /api/dpa handler returning DpaRecord[] (27 records)"
  - "server/api/edtech.get.ts — GET /api/edtech handler returning EdtechRecord[] (27 records)"
  - "app/pages/discovery.vue rewired to call useFetch('/api/vendors', { default: () => [] }) and render 'Loaded 27 vendors' via SSR — proof-of-typing demo confirms Nitro→useFetch type inference works end-to-end with zero manual generics"
  - "Phase 9 ROADMAP success criteria 1, 2, 4 empirically green; criterion 3 (hot-swap) is a manual UAT deferred to /gsd:verify-work"
affects: [10-discovery, 11-dpa-dashboard, 12-risk-tags]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "server/api/*.get.ts — single-line Nitro event handler returning a plain typed array; defineEventHandler auto-imported by Nuxt 4, no h3 import needed; no new Response() wrapping (kills type inference)"
    - "Typed useFetch with zero manual generics — Nitro's typed-routes inference flows the handler's return type to useFetch('/api/vendors'); useFetch<Vendor[]>(...) is explicitly avoided as redundant"
    - "default: () => [] factory on useFetch — promotes the data ref from Ref<Vendor[] | null> to Ref<Vendor[]>, eliminating template-level null guards"
    - "Server-rendered useFetch — no <ClientOnly> wrapping, no $fetch in setup; the SSR pass resolves vendors and bakes the count into the initial HTML so a curl probe can grep 'Loaded 27 vendors' off the response body"
    - "~~/server/data/{vendors,dpa,edtech} alias — ~~ is the Nuxt 4 alias for the project root; preferred over relative ../data/* for refactor-safety"

key-files:
  created:
    - "server/api/vendors.get.ts (5 lines — import vendors + defineEventHandler returning the array)"
    - "server/api/dpa.get.ts (5 lines)"
    - "server/api/edtech.get.ts (5 lines)"
  modified:
    - "app/pages/discovery.vue (Phase 8 stub replaced with definePageMeta + useFetch + template that renders Loaded {{ vendors.length }} vendors)"
  deleted: []

key-decisions:
  - "Single-page wiring (discovery.vue only) — research §9 recommendation; one wiring satisfies ROADMAP success criterion 4, more is gold-plating that Phases 10-12 would have to navigate around"
  - "Trust Nitro's automatic type inference — no manual <Vendor[]> generic on useFetch; the handler's inferred return type flows to the composable automatically; the manual generic is a drift risk per research §3 and §10"
  - "default: () => [] factory — drops the null guard in the template; required because Loaded {{ vendors.length }} vendors needs vendors to be non-null at render time per research §7 and Pitfall #4"
  - "No nitro.prerender.routes configuration in Phase 9 — deferred to Phase 13 (deployment); page-level payload inlining is sufficient for current scope per research §5"
  - "Task 3 (verification-only, no file changes) — no commit issued; per the plan, an empty chore commit is acceptable but skipped to keep history clean. All probes documented inline in this summary"

patterns-established:
  - "Pattern A: Nitro event handlers are 3 lines — `import x from '~~/server/data/x'` + `export default defineEventHandler(() => x)`. No method routing logic, no response wrapping. Phases 10-12 reuse this for any read endpoint."
  - "Pattern B: useFetch in a page's <script setup> with default: () => [] is the canonical client read; await it at top-level (Suspense handles), destructure { data }, render via template. NO $fetch in setup."
  - "Pattern C: Phase 9 demo wiring sets the SSR-verifiable count probe — curl /discovery | grep -q 'Loaded N records' is the cheapest way to confirm an entire fetch+render chain works end-to-end."

requirements-completed: [DATA-01, DATA-02]

# Metrics
duration: ~3min
completed: 2026-05-21
---

# Phase 9 Plan 02: server/api/ Handlers + useFetch Discovery Wiring Summary

**Three single-line Nitro event handlers expose the 81 typed records from Plan 09-01 over HTTP; discovery.vue calls useFetch('/api/vendors') with zero manual generics and SSR-renders 'Loaded 27 vendors' — DATA-01 and DATA-02 fully closed.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-21T20:45:26Z
- **Completed:** 2026-05-21T20:48:25Z
- **Tasks:** 3 (Tasks 1 and 2 produced commits; Task 3 was verification-only)
- **Files created:** 3 (server/api/{vendors,dpa,edtech}.get.ts)
- **Files modified:** 1 (app/pages/discovery.vue)
- **Files deleted:** 0

## Accomplishments

- Created three Nitro event handlers — `server/api/vendors.get.ts`, `server/api/dpa.get.ts`, `server/api/edtech.get.ts` — each importing its typed data array from `~~/server/data/` and returning it from a 3-line `defineEventHandler` block. `defineEventHandler` is auto-imported by Nuxt 4 (no `from 'h3'` import); no `new Response(...)` wrapping (would kill type inference per research Pitfall #2). Total handler code: 15 lines across 3 files.
- Rewired `app/pages/discovery.vue` from a Phase 8 stub into the Phase 9 proof-of-typing demo. The page now calls `useFetch('/api/vendors', { default: () => [] })` (no manual `<Vendor[]>` generic) and the template renders `Loaded {{ vendors.length }} vendors from /api/vendors.` The Phase 8 `definePageMeta` block (`nav`, `navLabel: 'Discovery'`, `navIcon: 'i-lucide-search'`, `navOrder: 20`) was preserved verbatim.
- Verified the end-to-end data flow against a live `npm run dev` server on port 3000:
  - `GET /api/vendors` → 200, `Content-Type: application/json`, JSON array with 27 records.
  - `GET /api/dpa` → 200, `Content-Type: application/json`, JSON array with 27 records.
  - `GET /api/edtech` → 200, `Content-Type: application/json`, JSON array with 27 records.
  - `GET /discovery` → SSR HTML contains the literal string `Loaded 27 vendors` (proves the page SSR-resolved useFetch on the server and baked the count into the initial HTML — NOT a client-side fetch-after-hydration).
- Verified the boundary: no file under `app/` imports from `src/data/`, `server/data/`, or `server/api/`. DATA-02 held by construction.
- `npm run typecheck` exits 0 after each task — confirms Nitro's typed-routes inference works with zero manual generics. `npm run build` exits 0 — the production build cleanly bundles all 3 handlers (`.output/server/chunks/routes/api/{vendors,dpa,edtech}.get.mjs`).

## Task Commits

Each task was committed atomically:

1. **Task 1: Create three server/api/*.get.ts handlers** — `b285396` (feat)
2. **Task 2: Wire useFetch into app/pages/discovery.vue** — `f24206f` (feat)
3. **Task 3: Phase-gate verification (dev server curl panel + npm run build)** — no commit (verification-only; per the plan's `<action>`, no-commit is the preferred form; all probes documented in this summary)

**Plan metadata:** [pending — final commit by orchestrator covers SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md]

## Files Created/Modified

| File | Action | Detail |
|------|--------|--------|
| `server/api/vendors.get.ts` | created | 5 lines — imports `vendors` from `~~/server/data/vendors`, returns via `defineEventHandler` |
| `server/api/dpa.get.ts` | created | 5 lines — same pattern with `dpa` |
| `server/api/edtech.get.ts` | created | 5 lines — same pattern with `edtech` |
| `app/pages/discovery.vue` | modified | Replaced Phase 8 stub: keeps `definePageMeta` block, adds `useFetch('/api/vendors', { default: () => [] })` at top of script setup, template renders `Loaded {{ vendors.length }} vendors from <code>/api/vendors</code>` |

## Phase Requirement Status

| Requirement | Status | Note |
|-------------|--------|------|
| DATA-01 | ✅ closed | Plan 09-01 created the typed source data in `server/data/*.ts`; Plan 09-02 added the HTTP routes (`server/api/*.get.ts`) that expose it. All 3 routes return 200 + application/json + correct record counts. |
| DATA-02 | ✅ closed | `app/pages/discovery.vue` uses `useFetch('/api/vendors')` — no direct client-side data imports. Negative grep confirms no file under `app/` imports from `src/data/`, `server/data/`, or `server/api/`. |

## Phase 9 ROADMAP Success Criteria — Empirical Evidence

| # | Criterion | Status | Probe | Result |
|---|-----------|--------|-------|--------|
| 1 | `GET /api/vendors|dpa|edtech` return valid JSON from `server/data/*.ts` | ✅ green | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/<route>` (×3) + `curl -s ... | node -e 'JSON.parse(stdin).length'` (×3) | All 3 routes: 200, `Content-Type: application/json`, JSON array of length 27 |
| 2 | Network tab on `/discovery` shows the XHR call to `/api/vendors` | ⏳ manual UAT | Visual DevTools inspection in `/gsd:verify-work` | Architecturally satisfied — `useFetch('/api/vendors')` is the only fetch path; SSR pass baked the response into the page payload, and a hydration-time fetch would be visible in DevTools (deferred manual check) |
| 3 | Hot-swap `server/data/dpa.ts` → reload → see change | ⏳ manual UAT | Visual reload after editing data in `/gsd:verify-work` | Deferred to `/gsd:verify-work`; per 09-VALIDATION.md `<Manual-Only Verifications>` |
| 4 | `useFetch('/api/vendors')` returns typed `Vendor[]` data with no TypeScript errors | ✅ green | `npm run typecheck` after Task 2; `npm run build` after Task 3 | Both exit 0; no manual generic needed; Nitro inference flows handler → useFetch automatically |

## Key Decisions

1. **One-page wiring, not all five.** Per research §9, ROADMAP success criterion 4 ("`useFetch` in a page component returns typed vendor data") is satisfied by a single proof-of-typing wiring. Wiring the other 4 pages in Phase 9 would create partial state that Phases 10-12 would have to refactor around. Discovery is the right target because Phase 10 owns it next and can extend the wiring incrementally.
2. **No manual generic on useFetch.** Nitro's typed-routes feature auto-types `data` from the handler's return type. Adding `useFetch<Vendor[]>('/api/vendors')` duplicates that inference and creates a drift risk if the handler's return shape ever changes. Research §3 and §10 both explicitly flag this as an anti-pattern.
3. **`default: () => []` to drop the null guard.** Without the default factory, `data.value` is `Ref<Vendor[] | null>` and the template `{{ vendors.length }}` becomes `{{ vendors?.length ?? 0 }}` or it crashes on null. The factory promotes the ref to `Ref<Vendor[]>` so `vendors.length` is unconditionally safe (research §7, Pitfall #4).
4. **Defer `nitro.prerender.routes` config to Phase 13.** Phase 9 routes work at dev-server time via Nitro's live HMR. Phase 13 (deployment) will wire prerendering — at that point `nitro.prerender.crawlLinks: true` (the `nuxi generate` default) will discover all 5 pages via the sidebar `<NuxtLink>`s. Adding explicit `/api/*` prerender targets is an optional Phase 13 hedge, not a Phase 9 deliverable.
5. **Task 3 made no commit.** Task 3 is verification-only — no file changes. The plan allows either "no commit" or "empty chore commit" as acceptable; we chose no-commit to keep history clean (3 commits total for this plan: 2 task commits + 1 metadata commit).

## Patterns Established

- **Pattern A (server route):** `server/api/X.get.ts` is a 3-line file: `import X from '~~/server/data/X'` → `export default defineEventHandler(() => X)`. No middleware, no method dispatching logic, no `new Response()`. Phases 10-12 reuse this exact shape if they need any additional read endpoints (e.g., for future filters).
- **Pattern B (client read):** A page's `<script setup>` does `const { data: X } = await useFetch('/api/X', { default: () => [] })`. The `await` applies to the useFetch call (Suspense handles), not to `.value` access. NEVER `$fetch('/api/X')` in setup — research Pitfall #6.
- **Pattern C (SSR-verifiable probe):** When a page calls useFetch and renders the result in its template, `curl /<page> | grep -q '<expected literal>'` is the cheapest way to verify the entire chain (route → handler → JSON → useFetch → template → SSR HTML) works end-to-end. This is the same probe Phase 8 used for sidebar nav rendering.

## Deviations from Plan

None — plan executed exactly as written.

The plan's verify-block syntax referenced Linux-style `kill $DEV_PID` for the dev-server teardown; on Windows the netstat-listener-PID + `taskkill //F //PID` pattern was already pre-described in the environment notes (carry-forward from Phase 7-02 and Phase 8-01). Used that pattern as documented — no deviation.

## Issues Encountered

None. All 3 tasks ran clean on the first attempt:

- `npm run typecheck` passed after Task 1 (3 handlers created) and again after Task 2 (discovery wired).
- `npm run build` passed at Task 3 — all 3 API routes bundled into `.output/server/chunks/routes/api/*.get.mjs`.
- Dev server bound port 3000 (not 3001 — port was free this run); ANSI-stripped log-tail extraction worked first try; curl probes all returned expected results in single shots.
- Dev-server teardown via `netstat -ano | grep ":3000 " | grep LISTENING` → `taskkill //F //PID 21624` cleanly released the port.

## Manual UAT (deferred to /gsd:verify-work)

Per 09-VALIDATION.md `<Manual-Only Verifications>`:

1. **DevTools Network tab inspection** — open `http://localhost:3000/discovery` with DevTools → Network. Confirm a `/api/vendors` request fires on initial page load OR (more likely under SSR) confirm the page payload contains the 27-vendor data inlined and a subsequent client navigation issues a `_payload.json` request. Either pattern satisfies ROADMAP criterion 2.
2. **Hot-swap probe (ROADMAP criterion 3 / DATA-01 SC#3)** — `npm run dev`, note one vendor's DPA status in `/api/dpa` response, edit `server/data/dpa.ts` to flip that status, save, reload the page, confirm new status appears. The "iteration speed: < 1hr" requirement is verified by the act of editing + reloading.

## Known Carry-Forward

- `src/views/*.vue` and `src/components/*.vue` still on disk but outside Nuxt's scan path; deleted incrementally by Phases 10-12 as each view is rewritten.
- `src/stores/` directory is empty (cleared in Phase 7-02); kept for historical clarity.
- Pre-existing Rollup/iconify deprecation warnings during `npm run build` (`@iconify/utils`, `@vueuse/core`, `@vue/shared`) — upstream library noise, unchanged from Plan 09-01; not introduced by Plan 09-02.

## Next Phase Readiness

**Phase 10 (Discovery: UTable + USlideover + ECharts radar) is unblocked.** The handoff:

- `app/pages/discovery.vue` already has a working `useFetch('/api/vendors')` call with typed `Vendor[]` data; Phase 10 extends it with the `UTable` columns array, the `USlideover` VendorDrawer, the ECharts radar, and `USelectMenu` tag assignment — none of which require touching the fetch wiring.
- The typed `Vendor` interface in `shared/types/data.ts` is the single source of truth; Phase 10's column definitions reference `Vendor.name`, `Vendor.category`, `Vendor.frequency`, etc. directly with editor autocomplete and compile-time validation.
- Phase 11 (DPA + Dashboard) reuses Pattern B verbatim against `/api/dpa`; the Phase 8 stub at `app/pages/dpa.vue` is the next target.
- Phase 12 (Risk + Tags) does the same for `/api/vendors` (risk tiers are derived from `Vendor.privacyScore`) and is independent of Phase 11.
- Phase 13 (deployment) is the only phase left with potential surprises — see "Key Decisions" item 4 for the prerendering hedge.

## Self-Check

- [x] `server/api/vendors.get.ts` exists, imports vendors from `~~/server/data/vendors`, returns via `defineEventHandler` — verified via grep
- [x] `server/api/dpa.get.ts` exists, imports dpa from `~~/server/data/dpa`, returns via `defineEventHandler` — verified via grep
- [x] `server/api/edtech.get.ts` exists, imports edtech from `~~/server/data/edtech`, returns via `defineEventHandler` — verified via grep
- [x] No file under `server/api/` imports from `'h3'` — verified via Grep (no matches)
- [x] No file under `server/api/` uses `new Response(` — verified via Grep (no matches)
- [x] `app/pages/discovery.vue` calls `useFetch('/api/vendors'` — verified via grep
- [x] `app/pages/discovery.vue` has `default: () => []` — verified via grep
- [x] `app/pages/discovery.vue` renders `Loaded {{ vendors.length }} vendors` in template — verified via grep
- [x] `app/pages/discovery.vue` preserves Phase 8 `definePageMeta` block (`navOrder: 20`) — verified via grep
- [x] No `$fetch('/api` in `app/pages/discovery.vue` — verified via Grep (no matches)
- [x] No `useFetch<` generic in `app/pages/discovery.vue` — verified via Grep (no matches)
- [x] No file under `app/` imports from `src/data/`, `server/data/`, or `server/api/` — verified via Grep (no matches in all 3 boundary probes)
- [x] `npm run typecheck` exits 0 — verified after Task 1 and Task 2
- [x] `npm run build` exits 0 — verified at Task 3; all 3 API routes bundled into `.output/server/chunks/routes/api/`
- [x] Against live `npm run dev` on port 3000: all 3 `/api/*` routes return 200 + `Content-Type: application/json` + JSON array of length 27 — verified via curl panel
- [x] `curl http://localhost:3000/discovery | grep -q "Loaded 27 vendors"` matches — verified (SSR proof, response body contains the literal)
- [x] 2 atomic feat commits: `b285396`, `f24206f`

## Self-Check: PASSED

All 4 created/modified files exist on disk; all 2 commit hashes resolve in `git log`; all 4 ROADMAP success criteria for Phase 9 have an empirical green status (or documented manual-UAT deferral); SUMMARY.md exists at the plan-specified path.

---
*Phase: 09-server-data-layer*
*Completed: 2026-05-21*
