---
phase: 13-deployment
plan: 02
subsystem: deploy-verification
tags: [deployment, smoke-test, static-generate, github-pages, nitro]

# Dependency graph
requires:
  - phase: 13-01
    provides: nuxt.config.ts with active baseURL + nitro.preset='github_pages'; deploy/postdeploy scripts in package.json
provides:
  - smoke-script: scripts/smoke.mjs — post-deploy live-URL health check (5 probes × 5 retries × 20s)
  - generate-verified: .output/public/ static build tree confirmed correct locally before live deploy
affects: [13-03-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Smoke script pattern: pure Node ESM CLI, zero deps, 5×20s retry per probe, AbortSignal.timeout per fetch"
    - "Static marker pattern: grep h1/h2 static text from page templates (NOT data-driven values)"
    - "Task 1 was verification-only (no files modified): generate run + artifact tree probe; Task 2 authored the new file"

key-files:
  created:
    - scripts/smoke.mjs
  modified: []

key-decisions:
  - "Task 1 has no commit artifact: nuxi generate is a build step that produces gitignored .output/; verification-only task"
  - "AbortSignal.timeout(10_000) used for per-fetch deadline — prevents single hung CDN request from blocking all 5 probes"
  - "Markers verified against app/pages/*.vue templates before authoring: all 5 matched the plan table exactly (no drift)"

patterns-established:
  - "Smoke probe authorship: verify each marker against live page template before committing — prevents stale test syndrome"
  - "scripts/ directory: Node CLI utilities invoked from npm lifecycle hooks live at project root scripts/, NOT under app/ or shared/"

requirements-completed: [DEPLOY-01]

# Metrics
duration: 8min
completed: 2026-05-22
---

# Phase 13 Plan 02: Deploy Verification Summary

**`npm run generate` exits clean producing 5-route pre-rendered static tree with baseURL baked in; `scripts/smoke.mjs` authored as zero-dep Node ESM CLI with 5 content probes × 5×20s CDN-wait retry, exiting non-zero on any miss**

## Performance

- **Duration:** 8 min
- **Started:** 2026-05-22T12:48:47Z
- **Completed:** 2026-05-22T12:56:30Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `npm run generate` ran against post-Plan-13-01 nuxt.config.ts and exited 0 in ~23s; all 5 routes pre-rendered, `.nojekyll` written (empty file, 0 bytes), `404.html` present for SPA fallback
- `.output/public/index.html` contains `/district-demo/_nuxt` (confirmed baseURL bake-in); all 5 page markers verified present in pre-rendered SSR HTML
- `scripts/smoke.mjs` authored (78 lines, 2906 bytes): pure Node ESM, 5 static-content probes, 5×20s retry loop, `AbortSignal.timeout(10s)` per fetch, `process.exit(1)` + stderr on any failure — zero npm dependencies

## Task Commits

Task 1 had no commit (verification-only — no files modified, `.output/` is gitignored build artifact):

1. **Task 1: Run npm run generate and verify .output/public/ structure** — no commit (verification only)
2. **Task 2: Author scripts/smoke.mjs post-deploy verification script** — `e67a050` (feat)

**Plan metadata:** (docs commit — see Final Commit section)

## Files Created/Modified

- `scripts/smoke.mjs` — Post-deploy live-URL health check. 5 probes (Dashboard, Discovery, DPA, Risk Position, Tags). 5×20s retry per probe. `AbortSignal.timeout(10_000)` per fetch. `process.exit(1)` + stderr messages on failure. Zero npm dependencies.

## .output/public/ Tree (Top 2 Levels)

```
.output/public/
├── _nuxt/              (16 JS+CSS chunks — hashed filenames)
│   ├── BCoDSNb1.js
│   ├── BngHzpib.js
│   ├── C0mWv4ZA.js
│   ├── CbEExycF.js
│   ├── DoqvqQ7l.js
│   ├── DpcKvTNT.js
│   ├── DTdTbmUs.js
│   ├── DUcxzua8.js
│   ├── DvBYwTER.js
│   ├── DVnXT8Eu.js
│   ├── DWDMzi-w.js
│   ├── entry.BkkZ4dxP.css
│   ├── error-404.C3kT2QX-.css
│   ├── error-500.BW0Y54Of.css
│   └── xpf0FdSa.js
├── .nojekyll           (empty — written by github_pages preset compiled hook)
├── _payload.json
├── 200.html
├── 404.html            (SPA fallback)
├── discovery/
│   └── index.html
├── dpa/
│   └── index.html
├── favicon.svg
├── icons.svg
├── index.html          (Dashboard — contains /district-demo/_nuxt asset paths)
├── risk/
│   └── index.html
└── tags/
    └── index.html
```

**Total:** 32 files, ~1.7 MB

## smoke.mjs PROBES Array (as written)

```js
const PROBES = [
  { path: '/',          marker: 'Top 8 Vendors Needing Attention', label: 'Dashboard' },
  { path: '/discovery', marker: 'Discovery',                       label: 'Discovery' },
  { path: '/dpa',       marker: 'DPA',                             label: 'DPA' },
  { path: '/risk',      marker: 'Risk Position',                   label: 'Risk Position' },
  { path: '/tags',      marker: 'Tags',                            label: 'Tags' },
]
```

All 5 markers cross-verified against `app/pages/*.vue` template text before commit — zero drift from planning table.

## Decisions Made

- Task 1 has no commit: `nuxi generate` produces only `.output/` (gitignored build artifact). The task is verification only; the config that drives the build was committed in Plan 13-01.
- `AbortSignal.timeout(10_000)` used (not `signal: controller.signal` with manual `setTimeout` + `clearTimeout`). Node 18+ ships `AbortSignal.timeout()` as a static method; project targets Node 24.14.0, so it's available unconditionally.
- `scripts/` directory created at project root per CONTEXT.md §Code Context: "smoke script lives at the project root (`scripts/smoke.mjs`), NOT under `shared/` or `app/`".

## Deviations from Plan

None — plan executed exactly as written. All 5 page markers matched the planning table verbatim. `.output/public/` structure matched the expected tree. No `.gitignore` changes needed (`.output/` was already listed).

## Issues Encountered

None.

## Carry-Forward Notes for Plan 13-03 (live deploy)

- `smoke.mjs` is now authored and `node --check` verified. It will run automatically via `postdeploy` after `gh-pages` push.
- Worst-case smoke duration: 5 probes × 5 retries × 20s = 500s (~8 min). Plan 13-03 should document this expectation so the developer does not interrupt the script during CDN propagation.
- The `200.html` file in `.output/public/` is expected (github_pages preset writes it alongside `404.html`; both serve as SPA fallback depending on hosting config). `gh-pages --nojekyll` will push both.
- Generate build time on this machine: ~23 seconds (client 11.7s + server 5.3s + prerender 6.1s).

## Known Stubs

None — this plan authors tooling only (smoke script + build verification). No UI components or data stubs introduced.

---
*Phase: 13-deployment*
*Completed: 2026-05-22*
