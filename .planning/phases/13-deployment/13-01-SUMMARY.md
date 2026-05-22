---
phase: 13-deployment
plan: 01
subsystem: deploy-config
tags: [deployment, github-pages, nitro, gh-pages, amplify, adr]

# Dependency graph
requires:
  - phase: 12-risk-tags
    provides: all 5 pages confirmed working under SSR; deploy-target-agnostic page layer
provides:
  - nuxt-config-baseURL: app.baseURL='/district-demo/' for GitHub Pages subpath asset paths
  - nuxt-config-nitro-preset: nitro.preset='github_pages' for auto .nojekyll + SPA fallback
  - deploy-scripts: npm run deploy chains nuxi generate + gh-pages --nojekyll
  - amplify-adr: AMPLIFY-GLIDEPATH.md documents the 3-line GH Pages -> Amplify switch
affects: [13-02-generate, 13-03-deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Nitro preset github_pages: auto-writes .nojekyll + pre-renders 404.html; crawls all routes from /"
    - "gh-pages --nojekyll: belt-and-suspenders .nojekyll alongside Nitro preset compiled hook"
    - "postdeploy npm lifecycle hook: fires automatically after gh-pages push without explicit wiring"
    - "3-line glidepath pattern: nuxt.config.ts is the canonical switch; ADR is the canonical why"

key-files:
  created:
    - .planning/adr/AMPLIFY-GLIDEPATH.md
  modified:
    - nuxt.config.ts
    - package.json

key-decisions:
  - "app.baseURL='/district-demo/' in nuxt.config.ts for GitHub Pages subpath asset path resolution"
  - "nitro.preset='github_pages' for auto .nojekyll + SPA 404.html fallback without manual config"
  - "gh-pages --nojekyll flag is mandatory: belt-and-suspenders alongside Nitro preset's compiled hook"
  - "ssr:true kept (not false): preserves pre-rendering AND the Amplify SSR glidepath"
  - "ADR is source of truth for why; nuxt.config.ts is source of truth for the 3-line switch"

patterns-established:
  - "Deploy config pattern: all deploy-target switches are confined to one block in nuxt.config.ts — no page-level edits needed"
  - "ADR glidepath pattern: keep config minimal in source file, expand context in .planning/adr/"

requirements-completed: [DEPLOY-01, DEPLOY-02]

# Metrics
duration: 2min
completed: 2026-05-22
---

# Phase 13 Plan 01: Deployment Config Summary

**GitHub Pages static deploy wired: baseURL + github_pages preset in nuxt.config.ts, deploy/postdeploy scripts in package.json, and AMPLIFY-GLIDEPATH.md ADR documenting the 3-line switch to AWS Amplify SSR**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-22T12:42:56Z
- **Completed:** 2026-05-22T12:44:47Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Replaced `nuxt.config.ts` lines 30-42 placeholder block with active `app.baseURL` + `nitro.preset` config plus a 3-line Amplify glidepath comment pointing to the ADR
- Added `deploy` and `postdeploy` scripts to `package.json` (8 scripts total); `--nojekyll` flag present for belt-and-suspenders `.nojekyll` alongside the Nitro preset
- Created `.planning/adr/AMPLIFY-GLIDEPATH.md` (133 lines) with Context, Decision, Migration Steps (verbatim 3-line switch), `amplify.yml` skeleton, Consequences table, Alternatives, and Acceptance Test sections

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace nuxt.config.ts placeholder with active GH Pages config** - `80153b3` (feat)
2. **Task 2: Add deploy + postdeploy scripts to package.json** - `e41b446` (feat)
3. **Task 3: Author AMPLIFY-GLIDEPATH ADR** - `dbcf958` (docs)

**Plan metadata:** (docs commit — see Final Commit section)

## Files Created/Modified

- `nuxt.config.ts` - Added app.baseURL='/district-demo/', nitro.preset='github_pages', Amplify glidepath comment; removed Phase 7-era placeholder. All existing modules/css/pinia/echarts config preserved verbatim. 39 lines total (was 42).
- `package.json` - Added deploy + postdeploy scripts. 8 scripts total (was 6). gh-pages@^6.3.0 devDep untouched. Valid JSON confirmed.
- `.planning/adr/AMPLIFY-GLIDEPATH.md` - New ADR (133 lines). Context / Decision / Migration Steps / amplify.yml skeleton / Consequences / Alternatives Considered / Acceptance Test sections.

## Final Shape: nuxt.config.ts Deployment Block (lines 30-38)

```ts
  // === Deployment: GitHub Pages (v1.0.0) ===
  // To switch to AWS Amplify SSR: see .planning/adr/AMPLIFY-GLIDEPATH.md
  // 3-line switch: (1) remove app.baseURL, (2) set nitro.preset='aws-amplify', (3) add amplify.yml
  app: {
    baseURL: '/district-demo/',
  },
  nitro: {
    preset: 'github_pages',
  },
```

## Final Shape: package.json scripts block

```json
"scripts": {
  "dev": "nuxi dev",
  "build": "nuxi build",
  "generate": "nuxi generate",
  "preview": "nuxi preview",
  "typecheck": "nuxi typecheck",
  "postinstall": "nuxi prepare",
  "deploy": "nuxi generate && gh-pages -d .output/public --nojekyll",
  "postdeploy": "node scripts/smoke.mjs"
},
```

## ADR Sections and Line Count

`.planning/adr/AMPLIFY-GLIDEPATH.md` — 133 lines

| Section | Purpose |
|---------|---------|
| Title + Metadata | Status: Accepted (deferred to v1.1.0+), Date: 2026-05-22 |
| ## Context | Why GH Pages for v1.0.0; Amplify target for v1.1.0+; DEPLOY-02 gating contract |
| ## Decision | Keep ssr:true + nuxi generate; nuxt.config.ts is canonical switch source |
| ## Migration Steps (3-line switch) | Verbatim 3-step numbered list; ssr:true no-change note |
| ## amplify.yml skeleton | Full yaml block with nvm/npm ci/build/.amplify-hosting artifacts |
| ## Consequences | GH Pages vs Amplify property comparison tables |
| ## Alternatives Considered | Vercel, Netlify, GH Actions + node-server; Amplify rationale |
| ## Acceptance Test for the Future Migration | 6-item checklist for future contributor |

## Decisions Made

- `--nojekyll` flag is mandatory on the `gh-pages` command (OQ-2): without it, `gh-pages` excludes the `.nojekyll` dotfile from the push (dotfiles ignored by default), and GitHub Pages' Jekyll processor hides `_nuxt/` JS chunks causing 404s. The Nitro `github_pages` preset writes `.nojekyll` at compile time but `gh-pages` won't push it without `--nojekyll` or `--dotfiles`. Used `--nojekyll` (more explicit than `--dotfiles` which would include ALL dotfiles).
- `ssr: true` kept (not changed to `ssr: false`): setting `ssr: false` would produce a client-only SPA shell with no pre-rendered content AND would lose the Amplify SSR glidepath. `ssr: true` + `nuxi generate` is the correct "pre-render now, run as SSR later" pattern.
- ADR length: 133 lines (within the 80-150 target). Every section answers a specific future contributor question. No prose padding.

## Deviations from Plan

None — plan executed exactly as written. All three files match the verbatim interface strings specified in `<interfaces>` block of 13-01-PLAN.md.

## Issues Encountered

None.

## Carry-Forward Notes for Plan 13-02 (smoke script)

The smoke script (`scripts/smoke.mjs`) referenced by `postdeploy` will be created in Plan 13-02.
Content markers confirmed against static page template strings (RESEARCH.md OQ-3):

| Route | Label | Marker String |
|-------|-------|---------------|
| `/` | Dashboard | `Top 8 Vendors Needing Attention` |
| `/discovery` | Discovery | `Discovery` (h1 heading) |
| `/dpa` | DPA | `DPA` (h1 heading) |
| `/risk` | Risk Position | `Risk Position` (h1 heading) |
| `/tags` | Tags | `Tags` (h1 heading) |

Retry strategy: 5 attempts × 20s delay = up to 100s wait for GH Pages CDN propagation.

## Known Stubs

None — this plan creates deployment config and documentation files only. No UI components or data stubs introduced.

---
*Phase: 13-deployment*
*Completed: 2026-05-22*
