---
phase: 07-nuxt-scaffold
plan: 02
subsystem: state
tags: [pinia, ssr, persisted-state, nuxt-echarts, typescript, phase-gate]

# Dependency graph
requires:
  - phase: 07-01
    provides: nuxt.config.ts with all 4 modules + storesDirs + storage:localStorage + echarts config; app/app.vue stub; package.json with Nuxt 4 stack
provides:
  - app/stores/tags.ts — typed setup-style Pinia store with persist:true; SEED_TAG_GROUPS exported with all four v0.5.0 groups and hex colors preserved
  - TypeScript types: TagItem, TagGroup, TagAssignments (consumed by Phases 10 and 12)
  - Empirically verified nuxt-echarts SSR integration (smoke-tested then reverted in app/app.vue)
  - Clean phase-gate state: typecheck/build/dev all pass on a clean install
affects: [10-discovery, 12-risk-tags]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pinia setup-store style with explicit `ref<T>()` annotations for SSR-safe typing"
    - "Persistence via `persist: true` boolean only — global storage:localStorage from nuxt.config.ts handles localStorage selection (per-store storage config would crash SSR)"
    - "ECharts SSR via nuxt-echarts module; <VChart> auto-imported; NEVER wrap in <ClientOnly> (double-wrapping breaks SSR SVG fallback)"

key-files:
  created:
    - "app/stores/tags.ts"
  modified:
    - "app/app.vue (smoke-test → revert; net diff vs Plan 07-01 = none)"
  deleted:
    - "src/stores/tags.js (v0.5.0 store; superseded)"
---

# Plan 07-02 Summary — Pinia + ECharts SSR-safe wiring

## Tasks executed

### Task 1: Migrate Pinia tags store to app/stores/tags.ts
- Created `app/stores/tags.ts` with the canonical contents from the plan interfaces block.
- Deleted `src/stores/tags.js`.
- Net diff from v0.5.0 store:
  - **Added**: 3 TypeScript types (`TagItem`, `TagGroup`, `TagAssignments`); explicit `ref<T>()` annotations; `{ persist: true }` third arg to `defineStore`.
  - **Removed**: `loadOrDefault()` helper, both `watch()` blocks, the two `TAG_GROUPS_KEY` / `ASSIGNMENTS_KEY` constants, all direct `localStorage` reads/writes, all `process.client` checks.
  - **Preserved verbatim**: 4 tag-group ids and hex colors (`#484ce6`, `#da8231`, `#16a34a`, `#dc2626`); 12 child tag ids and names; store id `'tags'`; state shape (`tagGroups` + `assignments`).
- Commit: `302d11b feat(07-02): migrate tags store to SSR-safe TypeScript Pinia store`

### Task 2: nuxt-echarts SSR smoke test (verify-then-revert)
- Temporarily added `<VChart :option="smokeOption" style="height: 200px" />` plus `<script setup lang="ts">` block to `app/app.vue`.
- Built with `npm run build` — clean exit, no `window is not defined`.
- Booted `npm run dev` — clean exit, no `[Vue warn]: Hydration` warnings.
- Reverted `app/app.vue` to the Plan 07-01 stub (template-only, no script, no chart).
- Commit: `94ff2c8 test(07-02): smoke-test nuxt-echarts SSR integration (verify-then-revert)`

### Task 3: Phase-gate verification (clean reinstall)
- Removed `node_modules/`, `package-lock.json`, `.nuxt/`, `.output/`.
- `npm install` — clean exit; `nuxi prepare` postinstall regenerated `.nuxt/tsconfig.json`.
- `npm run typecheck` — exit 0.
- `npm run build` — exit 0; both `.output/server/` and `.output/public/` produced.
- `npm run dev` — bound to port 3001 (3000 occupied locally); served full SSR HTML from `curl http://localhost:3001` (9.8 KB).
- Dev-server log scanned for SSR red flags — **zero matches** for `window is not defined`, `ReferenceError window`, `[Vue warn] Hydration`, `Cannot find UAppProvider`, `nuxt-echarts Error`.

## Phase 7 ROADMAP success criteria — empirical evidence

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | `npm run dev` starts Nuxt 4 SSR with no PrimeVue imports | PASS | Dev log shows `Nuxt 4.4.6 (with Nitro 2.13.4, Vite 7.3.3, Vue 3.5.34)`; grep for primevue/@primeuix/primeicons in nuxt.config + app/ returns nothing |
| 2 | `<UApp>` wraps app root | PASS | `grep '<UApp>' app/app.vue` passes; SSR HTML emits expected content |
| 3 | Pinia tags store hydrates without SSR mismatch | PASS | `__NUXT_DATA__` script in SSR HTML contains `"pinia"` key with empty state object; no hydration warnings in dev log |
| 4 | ECharts renders via nuxt-echarts with no SSR crash | PASS | Smoke test (Task 2) built and dev-ran with `<VChart>` mounted, no `window is not defined`. `VChartIsland.server-*.mjs` server chunk emitted by build |
| 5 | TypeScript compiles with zero errors on clean `nuxi build` | PASS | `npm run typecheck` and `npm run build` both exit 0 after clean reinstall |

## Phase-gate grep panel — 14/14 pass

All 14 grep probes from Plan 07-02 Task 3 pass:
- `compatibilityVersion: 4`, `compatibilityDate: '2025-07-01'` in nuxt.config.ts
- All 4 modules registered: `@nuxt/ui`, `@pinia/nuxt`, `pinia-plugin-persistedstate/nuxt`, `nuxt-echarts`
- `pinia.storesDirs` points at `app/stores`; `piniaPluginPersistedstate.storage` set to `localStorage`
- `<UApp>` in `app/app.vue`; `persist: true` in `app/stores/tags.ts`
- `@import "tailwindcss"` and `@import "@nuxt/ui"` in `app/assets/css/main.css`
- No PrimeVue/primeicons/@primeuix references anywhere in nuxt.config or app/
- No `primevue`, `@primeuix`, `primeicons`, `vue-router`, or `vue-echarts` in package.json deps

## Known orphans (acceptable, document for handoff)

The v0.5.0 store wrote to two localStorage keys: `schoolday-tag-groups` and `schoolday-tag-assignments`. The new store uses a single key `tags` (the store id). Any browser that loaded v0.5.0 will have the old keys still present in localStorage — they are now orphaned. **Acceptable**: synthetic demo data, no migration path needed (per Plan 07-RESEARCH).

## Manual UAT (deferred to `/gsd:verify-work`)

- Open the dev server in a browser → confirm `<UApp>` mounts without console errors.
- Mutate a tag via Pinia devtools → refresh → confirm change persists (validates localStorage round-trip).
- Confirm no `[Vue warn]: Hydration` warnings appear in the browser console on initial load.

## Handoff to Phase 8

Scaffold is fully wired and SSR-safe. Phase 8 owns:
- Replacing `app/app.vue` contents with `<NuxtPage />` (the stub paragraph is intentional placeholder).
- Creating `app/layouts/default.vue` with the dark sidebar nav.
- Adding stub pages under `app/pages/` for `index`, `discovery`, `dpa`, `risk`, `tags`.

Phase 7 leaves nothing in `app/stores/` other than `tags.ts`. The `src/stores/` directory is empty (kept for historical clarity; not crawled by Nuxt).
