---
phase: 7
slug: nuxt-scaffold
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — Nuxt 4 ships `nuxi typecheck` (vue-tsc) for type validation. No unit/integration runner installed in Phase 7 (deferred to Phase 9 when API routes exist). |
| **Config file** | `tsconfig.json` extends auto-generated `.nuxt/tsconfig.json`; no test config |
| **Quick run command** | `npm run typecheck` |
| **Full suite command** | `npm install && npm run typecheck && npm run build` |
| **Estimated runtime** | ~60 seconds (install ~30s, typecheck ~10s, build ~20s on warm cache) |

---

## Sampling Rate

- **After every task commit:** Run task-specific grep probes for that task's NUXT-XX criteria (< 5s total)
- **After every plan wave:** Run `npm install && npm run typecheck && npm run build` plus dev-server smoke test (cancel after "Listening" line)
- **Before `/gsd:verify-work`:** Full suite must be green AND dev server boots without errors AND `<UApp>` overlay smoke test passes
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | NUXT-01 | static | `! grep -E '"(primevue\|@primeuix\|primeicons\|vue-router\|vue-echarts)"' package.json` | ❌ W0 | ⬜ pending |
| 7-01-02 | 01 | 1 | NUXT-01 | static | `grep -q 'compatibilityVersion: 4' nuxt.config.ts && grep -q "compatibilityDate.*'2025-07-01'" nuxt.config.ts` | ❌ W0 | ⬜ pending |
| 7-01-03 | 01 | 1 | NUXT-01 | static | `grep -q '"@nuxt/ui"' nuxt.config.ts && grep -q "'@nuxt/ui'" nuxt.config.ts` | ❌ W0 | ⬜ pending |
| 7-01-04 | 01 | 1 | NUXT-02 | static | `grep -q '<UApp>' app/app.vue` | ❌ W0 | ⬜ pending |
| 7-01-05 | 01 | 1 | NUXT-02 | file-exists | `test -f app/assets/css/main.css && grep -q '@import "tailwindcss"' app/assets/css/main.css && grep -q '@import "@nuxt/ui"' app/assets/css/main.css` | ❌ W0 | ⬜ pending |
| 7-01-06 | 01 | 1 | NUXT-01 | build | `npm run typecheck` → exit 0 | ❌ W0 | ⬜ pending |
| 7-01-07 | 01 | 1 | NUXT-01 | build | `npm run build` → exit 0 | ❌ W0 | ⬜ pending |
| 7-02-01 | 02 | 2 | NUXT-03 | static | `grep -q "'@pinia/nuxt'" nuxt.config.ts && grep -q "'pinia-plugin-persistedstate/nuxt'" nuxt.config.ts` | ❌ W0 | ⬜ pending |
| 7-02-02 | 02 | 2 | NUXT-03 | static | `grep -A 3 'pinia:' nuxt.config.ts \| grep -q "app/stores"` | ❌ W0 | ⬜ pending |
| 7-02-03 | 02 | 2 | NUXT-03 | static | `grep -A 3 'piniaPluginPersistedstate' nuxt.config.ts \| grep -q "localStorage"` | ❌ W0 | ⬜ pending |
| 7-02-04 | 02 | 2 | NUXT-03 | file-exists | `test -f app/stores/tags.ts && grep -q 'persist: true' app/stores/tags.ts` | ❌ W0 | ⬜ pending |
| 7-02-05 | 02 | 2 | NUXT-03 | static | `grep -q "'nuxt-echarts'" nuxt.config.ts` | ❌ W0 | ⬜ pending |
| 7-02-06 | 02 | 2 | NUXT-03 | build | `npm run typecheck && npm run build` → both exit 0 | ❌ W0 | ⬜ pending |
| 7-02-07 | 02 | 2 | NUXT-03 | runtime | dev server starts and `curl -s http://localhost:3000` returns HTML without "window is not defined" in stderr | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Phase 7 is a scaffold phase — Wave 0 IS the scaffold. Files that must be created:

- [ ] `nuxt.config.ts` — modules (`@nuxt/ui`, `@pinia/nuxt`, `pinia-plugin-persistedstate/nuxt`, `nuxt-echarts`), `compatibilityVersion: 4`, `compatibilityDate: '2025-07-01'`, `ssr: true`, `pinia.storesDirs`, `piniaPluginPersistedstate.storage: 'localStorage'`
- [ ] `tsconfig.json` (root) — extends `./.nuxt/tsconfig.json`
- [ ] `app/app.vue` — `<UApp>` wrapper with stub content
- [ ] `app/app.config.ts` — `ui.colors.primary` mapping
- [ ] `app/assets/css/main.css` — `@import "tailwindcss"` + `@import "@nuxt/ui"` + theme variables migrated from `src/style.css`
- [ ] `app/stores/tags.ts` — migrated SSR-safe Pinia tags store with `persist: true`
- [ ] `package.json` — rewritten scripts/dependencies (PrimeVue/vue-router/vue-echarts removed, Nuxt stack added)
- [ ] `.gitignore` — add `.output/`, `.nuxt/`, `.data/`

*No test framework installed in Wave 0 — deferred to Phase 9 when there are testable server/api routes.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `<UApp>` overlay components render without console errors | NUXT-02 | No headless overlay test runner installed yet | Run `npm run dev`, load `http://localhost:3000`, open browser devtools console, confirm no Vue/Nuxt errors logged on initial render |
| No SSR hydration mismatch warning for Pinia store | NUXT-03 | Hydration warnings only fire in browser console at runtime | Run `npm run dev`, load page that reads the tags store, confirm no `[Vue warn]: Hydration ... mismatch` in console |
| Tag state survives page refresh (localStorage persistence) | NUXT-03 | Requires browser localStorage interaction | Run `npm run dev`, open page, modify a tag via store devtools or console, refresh, verify persisted value matches |
| ECharts pattern wired (no SSR crash) | NUXT-03 (Validation Architecture) | Runtime check that `nuxt-echarts` module loads | Run `npm run dev`, check terminal stderr is clean of "window is not defined" / "ReferenceError" |

Manual checks run during `/gsd:verify-work` before phase sign-off.

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
