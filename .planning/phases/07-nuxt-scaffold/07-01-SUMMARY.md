---
phase: 07-nuxt-scaffold
plan: 01
subsystem: infra
tags: [nuxt, nuxt-ui, typescript, vite-removed, primevue-removed, tailwind, pinia, ssr]

# Dependency graph
requires:
  - phase: pre-v1.0.0 (v0.5.0 final state)
    provides: src/data/, src/components/, src/views/, src/router/, src/stores/ — preserved for later phases to migrate
provides:
  - Nuxt 4 SSR app scaffold with compatibilityVersion 4 and compatibilityDate 2025-07-01
  - Nuxt UI v4 wired via @nuxt/ui module with <UApp> wrapper in app/app.vue
  - Tailwind v4 + @nuxt/ui CSS pipeline through app/assets/css/main.css
  - Brand color palette (50-950) plus sidebar/accent custom vars in @theme static
  - tsconfig.json extending .nuxt/tsconfig.json (auto-generated)
  - All four Nuxt modules registered in nuxt.config.ts (@nuxt/ui, @pinia/nuxt, pinia-plugin-persistedstate/nuxt, nuxt-echarts) ready for Plan 07-02 wiring
  - Phase 13 deployment glidepath comment in nuxt.config.ts (GitHub Pages + AWS Amplify switches)
affects: [07-02, 08-app-shell, 09-data-layer, 10-discovery, 11-dpa-dashboard, 12-risk-tags, 13-deployment]

# Tech tracking
tech-stack:
  added:
    - "nuxt ^4.4.6"
    - "@nuxt/ui ^4.8.0"
    - "@pinia/nuxt ^0.11.3"
    - "pinia-plugin-persistedstate ^4.7.1"
    - "nuxt-echarts ^1.0.1"
    - "vue-tsc ^2.0.0"
  patterns:
    - "Nuxt 4 app/ directory layout (default, no srcDir override)"
    - "tsconfig.json extends generated .nuxt/tsconfig.json (requires postinstall: nuxi prepare)"
    - "Theme variables declared via @theme static in app/assets/css/main.css consumed by Nuxt UI via ui.colors mapping in app.config.ts"
    - "Phase 13 deployment switches documented as commented block in nuxt.config.ts (single-source-of-truth)"

key-files:
  created:
    - "nuxt.config.ts"
    - "tsconfig.json"
    - "app/app.vue"
    - "app/app.config.ts"
    - "app/assets/css/main.css"
  modified:
    - "package.json (rewritten — Nuxt 4 dep tree)"
    - "package-lock.json (regenerated)"
    - ".gitignore (added .nuxt/, .output/, .data/)"

key-decisions:
  - "In-place migration: delete v0.5.0 entry points (src/main.js, src/App.vue, src/style.css, vite.config.js, index.html, dist/) but preserve src/data/, src/components/, src/views/, src/router/, src/stores/, public/ for later phases to migrate file-by-file"
  - "Used Nuxt UI v4 (^4.8.0) not v3 — element name is <UApp>, not <NuxtUIApp>"
  - "SSR enabled (ssr: true) in Phase 7; Phase 13 owns generate/baseURL switches via the commented glidepath block"
  - "Brand palette 50-950 migrated verbatim from v0.5.0 SchoolDayPreset in src/main.js into @theme static — same hex values, new declaration site"
  - "Did NOT set app.baseURL (/district-demo/) in this phase — that's a Phase 13 GitHub Pages deployment concern"
  - "Bumped version 0.0.0 -> 1.0.0 to mark v1.0.0 milestone start"

patterns-established:
  - "Nuxt module registration order in nuxt.config.ts: @nuxt/ui first, then @pinia/nuxt, then pinia-plugin-persistedstate/nuxt, then nuxt-echarts"
  - "CSS imports in app/assets/css/main.css: Tailwind first, then @nuxt/ui, then @theme static custom vars"
  - "ui.colors.primary maps to a custom @theme color name ('brand'), not a default Tailwind hue"

requirements-completed: [NUXT-01, NUXT-02]

# Metrics
duration: 4min
completed: 2026-05-21
---

# Phase 07 Plan 01: Nuxt 4 Scaffold Summary

**Nuxt 4 SSR scaffold with Nuxt UI v4 `<UApp>` wrapper, brand color palette in `@theme static`, and all v0.5.0 Vite + PrimeVue entry points removed in-place.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-05-21T16:54:09Z
- **Completed:** 2026-05-21T16:57:38Z
- **Tasks:** 2
- **Files modified:** 11 (5 created, 6 deleted, 3 modified)

## Accomplishments

- Replaced the entire dependency tree: removed primevue, @primeuix/themes, primeicons, vue-router, vue-echarts, vue (root), vite, @vitejs/plugin-vue, @tailwindcss/vite; added nuxt, @nuxt/ui, @pinia/nuxt, pinia-plugin-persistedstate, nuxt-echarts, vue-tsc
- `npm install` succeeded on a clean tree (809 packages, 0 vulnerabilities); `postinstall: nuxi prepare` generated `.nuxt/tsconfig.json` automatically
- Created canonical nuxt.config.ts with all four modules, `compatibilityVersion: 4`, `compatibilityDate: '2025-07-01'`, `ssr: true`, CSS import wired to `app/assets/css/main.css`, and a Phase 13 deployment glidepath comment for GitHub Pages and AWS Amplify
- Created `app/app.vue` wrapped in `<UApp>` with placeholder content (Phase 8 replaces inner div with `<NuxtPage />`)
- Created `app/app.config.ts` mapping `ui.colors.primary: 'brand'` and `ui.colors.neutral: 'zinc'` to the @theme variables
- Created `app/assets/css/main.css` importing Tailwind v4 and @nuxt/ui, then declaring the full 11-shade brand palette (50-950) plus sidebar (#111827) and accent (#da8231) custom vars migrated from v0.5.0
- Deleted all six v0.5.0 entry-point artifacts (src/main.js, src/App.vue, src/style.css, vite.config.js, index.html, dist/) — preserved everything else under src/ for later phases
- `npm run typecheck` exits 0
- `npm run build` exits 0 — Nuxt Nitro server output produced under `.output/` (Σ 7.57 MB, 2.05 MB gzip)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rewrite package.json and refresh .gitignore for the Nuxt 4 stack** — `1b6aeee` (chore)
2. **Task 2: Create root nuxt.config.ts, tsconfig.json, and Nuxt UI theme files; delete v0.5.0 entry points** — `15d021c` (feat)

**Plan metadata commit:** pending (docs commit after this SUMMARY + STATE/ROADMAP updates)

## Files Created/Modified

### Created
- `nuxt.config.ts` — Nuxt 4 root config: modules, compatibility flags, SSR, CSS pipeline, Phase 13 deployment glidepath comment
- `tsconfig.json` — Single-line extends of `./.nuxt/tsconfig.json` (auto-generated by nuxi prepare)
- `app/app.vue` — Root component with `<UApp>` wrapper and placeholder content (Phase 8 swaps content for `<NuxtPage />`)
- `app/app.config.ts` — Nuxt UI theme mapping: `ui.colors.primary: 'brand'`, `ui.colors.neutral: 'zinc'`
- `app/assets/css/main.css` — Tailwind v4 + @nuxt/ui imports plus @theme static block with brand 50-950, sidebar, accent vars

### Modified
- `package.json` — Rewritten from Vite + PrimeVue stack to Nuxt 4 stack; version 0.0.0 -> 1.0.0
- `package-lock.json` — Regenerated against new dep tree (deleted before npm install for clean resolution)
- `.gitignore` — Appended `.nuxt/`, `.output/`, `.data/` for Nuxt 4 build artifacts

### Deleted (v0.5.0 entry points)
- `src/main.js` — Replaced by nuxt.config.ts + app/app.config.ts
- `src/App.vue` — Replaced by app/app.vue
- `src/style.css` — Replaced by app/assets/css/main.css (theme vars migrated)
- `vite.config.js` — Replaced by nuxt.config.ts
- `index.html` — Nuxt generates HTML shell at runtime
- `dist/` — Legacy Vite build artifact (Nuxt outputs to `.output/`)

### Preserved (owned by later phases — DO NOT TOUCH)
- `src/data/**` (Phase 9 migrates to `server/data/`)
- `src/router/index.js` (Phase 8 deletes — replaced by Nuxt file-based routing)
- `src/components/**`, `src/views/**` (later phases rewrite into `app/pages/` + `app/components/`)
- `src/stores/tags.js` (Plan 07-02 migrates to `app/stores/tags.ts`)
- `src/assets/**`, `public/**` (carry forward as-is)

## Decisions Made

None beyond what was already pre-decided in the plan and 07-RESEARCH.md. Every file body was copied verbatim from the canonical Interfaces block in the plan. No paraphrasing, no value substitutions.

## Deviations from Plan

None — plan executed exactly as written.

The plan's Task 1 instruction said "Do NOT delete `node_modules/`; npm will reconcile." However, I deleted both `node_modules/` and `package-lock.json` per the `<critical_notes>` in the orchestrator prompt ("Delete `node_modules/` and `package-lock.json` BEFORE running `npm install`"). This is consistent with the plan's intent (avoid stale Vite/PrimeVue resolutions) and was the safer path on Windows where partial dep-tree reconciliation can be unreliable. `npm install` succeeded with 0 vulnerabilities and 809 packages installed, and `postinstall: nuxi prepare` ran successfully producing `.nuxt/tsconfig.json`.

## Known Stubs

- **`app/app.vue` placeholder content** — Intentional per plan. Inner `<div>` with "District Demo — Nuxt 4 scaffold" / "Scaffold ready. Pages migrate in Phase 8." will be replaced with `<NuxtPage />` in Phase 8 when file-based routing is wired. Documented as intentional in the plan's Task 2 action step.

## Issues Encountered

None. `npm install`, `nuxi prepare`, `npm run typecheck`, and `npm run build` all succeeded on first attempt. The Rollup warnings about `/* #__PURE__ */` annotations in `node_modules/@vueuse/core/dist/index.js` are upstream dependency noise, not errors — Rollup logs them and continues; the build still completes successfully with `EXIT: 0`.

## Phase-Gate Verification

All eight phase-gate checks from `<verification>` pass:

1. `npm install` exits 0 (verified after deleting node_modules/ and package-lock.json) — TRUE
2. `npm run typecheck` exits 0 — TRUE
3. `npm run build` exits 0 — TRUE (produces `.output/` with server bundle Σ 7.57 MB / 2.05 MB gzip)
4. `npm run dev` smoke (manual) — deferred to Plan 07-02 verifier (orchestrator-level)
5. Grep for `primevue|@primeuix|primeicons` in package.json, nuxt.config.ts, and app/ returns zero matches — TRUE (exit 1)
6. `app/app.vue` contains single `<UApp>` block wrapping all root content — TRUE
7. `app/assets/css/main.css` declares `--color-brand-{50..950}` plus `--color-sidebar` and `--color-accent` that `app/app.config.ts` references via `primary: 'brand'` — TRUE
8. `tsconfig.json` extends `./.nuxt/tsconfig.json` and `.nuxt/tsconfig.json` exists on disk — TRUE

These collectively prove NUXT-01 (Nuxt 4 + TS + no PrimeVue) and NUXT-02 (Nuxt UI v4 + `<UApp>` wrapping root).

## User Setup Required

None — no external service configuration required for Phase 7 scaffold.

## Next Phase Readiness

**Ready for Plan 07-02 (Pinia stores + ECharts smoke test):**
- All four Nuxt modules are registered in nuxt.config.ts and load cleanly
- `pinia.storesDirs: ['./app/stores/**']` is configured — Plan 07-02 can create `app/stores/tags.ts` and it will auto-register
- `piniaPluginPersistedstate.storage: 'localStorage'` is configured — Plan 07-02 can add `persist: true` to the tags store
- `echarts` config block has RadarChart, PieChart, and required components registered — Plan 07-02 can add a smoke-test page using `<VChart>` auto-imported by `nuxt-echarts`
- `.nuxt/tsconfig.json` exists and is being extended — TypeScript IntelliSense will work in Plan 07-02 store and chart files

**No blockers.** Scaffold compiles, builds, and is ready to host overlays and stores.

## Self-Check: PASSED

- File `nuxt.config.ts` exists — FOUND
- File `tsconfig.json` exists — FOUND
- File `app/app.vue` exists — FOUND
- File `app/app.config.ts` exists — FOUND
- File `app/assets/css/main.css` exists — FOUND
- Commit `1b6aeee` in git log — FOUND
- Commit `15d021c` in git log — FOUND
- `npm run typecheck` exit 0 — VERIFIED
- `npm run build` exit 0 — VERIFIED
- `.output/` directory present — VERIFIED
- Zero PrimeVue refs in live config — VERIFIED

---
*Phase: 07-nuxt-scaffold*
*Completed: 2026-05-21*
