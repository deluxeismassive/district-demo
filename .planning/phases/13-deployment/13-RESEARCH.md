# Phase 13: Deployment — Research

**Researched:** 2026-05-22
**Domain:** Nuxt 4 static site generation, GitHub Pages deployment, Nitro presets, post-deploy smoke verification
**Confidence:** HIGH (all key claims sourced from installed package source code or official Nuxt 4 docs)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Manual `npm run deploy` triggered from developer's machine — no GitHub Actions in v1.0.0
- **D-02:** Compound script: `"deploy": "nuxi generate && gh-pages -d .output/public"` — single command builds and pushes
- **D-03:** `gh-pages` v6.3.0 already in devDependencies — no new dependency
- **D-04:** Public URL = `https://deluxeismassive.github.io/district-demo/`
- **D-05:** `app.baseURL: '/district-demo/'` — matches repo subpath
- **D-06:** `nitro.preset: 'github_pages'` — handles SPA fallback automatically
- **D-07:** No custom domain in v1.0.0
- **D-08:** `"postdeploy": "node scripts/smoke.mjs"` npm hook
- **D-09:** Script curls all 5 routes and greps for distinctive content markers
- **D-10:** Smoke check exits non-zero on any miss; prints URL + failed probe to stderr; no auto-rollback
- **D-11:** Keep `nuxt.config.ts` comment block short — 3-line Amplify switch + ADR pointer
- **D-12:** Create `.planning/adr/AMPLIFY-GLIDEPATH.md` with expanded migration context
- **D-13:** `nuxt.config.ts` is source of truth for the switch; ADR is source of truth for the why

### Claude's Discretion

- Exact smoke probe markers (1-2 distinctive strings per route from current SSR output — must be stable across vendor data edits)
- ADR structure (standard Problem / Decision / Alternatives Considered / Consequences format)
- `gh-pages` deploy branch name (default `gh-pages` is fine)
- README badge for live URL (add if it doesn't blow scope)
- Whether to set `ssr: false` or leave `ssr: true` for static generate (research resolves this — see below)
- 404 page customization (default Nuxt 404 acceptable)
- Public asset additions beyond `public/` (skip unless required)

### Deferred Ideas (OUT OF SCOPE)

- GitHub Actions CI/CD workflow (v1.1.0+)
- Custom domain — requires `public/CNAME` + DNS + baseURL change to `/`
- Build-time chunk-splitting / performance tuning
- Error tracking
- Environment-specific runtime config (`NUXT_PUBLIC_*`)
- Multi-environment deploys
- 404 page customization
- Rollback strategy beyond native gh-pages behavior
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DEPLOY-01 | App generates as static site via `nuxi generate`; base path `/district-demo/` configured; `npm run deploy` publishes to GitHub Pages via `gh-pages` | Covered by OQ-1, OQ-2 — preset source verified, deploy command shape confirmed |
| DEPLOY-02 | `nuxt.config.ts` structured for Amplify glidepath — switching from GH Pages to AWS Amplify SSR requires only: (1) enabling `ssr: true`, (2) removing `static` target, (3) adding `nitro: { preset: 'aws-amplify' }` | Covered by OQ-7 — Amplify preset source analyzed, ADR content fully defined |
</phase_requirements>

---

## Summary

Phase 13 is a pure infrastructure phase with no new product features. Every technical question was resolved against installed package source code (nitropack 2.13.4) or official Nuxt 4 docs rather than secondary accounts.

The `github_pages` Nitro preset does three things automatically: (1) pre-renders `/` and `/404.html`, (2) writes `.nojekyll` to block Jekyll processing of `_nuxt/` assets, and (3) sets `crawlLinks: true` so all linked pages pre-render without manual route enumeration. The preset source is at `node_modules/nitropack/dist/presets/_static/preset.mjs` and was read directly. The `gh-pages` v6.3.0 CLI (source at `node_modules/gh-pages/bin/gh-pages.js`) has a native `--nojekyll` flag, but it is NOT needed because the preset already writes `.nojekyll` into `.output/public/`. The `deploy` command does NOT need `--dotfiles` either — that flag is for dotfile-named files in the source directory, not the `_nuxt/` subdirectory (underscore prefix, not dot prefix).

During `nuxi generate`, pages are pre-rendered server-side; `useFetch('/api/...')` responses are executed at build time (server routes run once), and the data is baked into each page's inline payload or a co-located `_payload.json` file. No API calls happen at client runtime on first load — the client receives hydrated HTML. Client-side navigation between pre-rendered routes reads from `_payload.json` files. This is the correct and expected behavior; no changes to any page or API route are needed.

The `ssr: true` default MUST be kept — do not set `ssr: false`. With `ssr: true` + `nuxi generate`, Nuxt runs each page through SSR at build time and emits static HTML. Setting `ssr: false` would produce a client-only SPA shell (no pre-rendered content) which defeats the purpose and loses the Amplify SSR glidepath.

**Primary recommendation:** Execute the 4 tasks in order: (1) update `nuxt.config.ts` with the GH Pages config + Amplify glidepath comment, (2) add `deploy` + `postdeploy` scripts to `package.json`, (3) write `scripts/smoke.mjs`, (4) write `.planning/adr/AMPLIFY-GLIDEPATH.md`. No page-level code changes needed.

---

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| `nuxi generate` | Nuxt 4.4.6 (installed) | Pre-renders all routes into `.output/public/` static HTML | Built into Nuxt; the standard SSG command |
| `gh-pages` | 6.3.0 (installed) | Pushes `.output/public/` to the `gh-pages` branch | Already a devDep; zero new install cost |
| Nitro `github_pages` preset | nitropack 2.13.4 (installed) | Sets `static: true`, pre-renders `/` + `/404.html`, writes `.nojekyll`, enables `crawlLinks` | First-party Nuxt/Nitro — no external tooling needed |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| `scripts/smoke.mjs` | Node.js built-in (`fetch`) | Post-deploy live-URL health check | Runs automatically via `postdeploy` npm hook |
| `.planning/adr/AMPLIFY-GLIDEPATH.md` | — | Documents why GH Pages now + exact migration path | Consumed by a future contributor executing the Amplify migration |

### No New Dependencies
Phase 13 introduces zero new npm dependencies. `gh-pages` is already installed. The smoke script uses Node.js global `fetch` (available since Node 18; project targets Node 24.14.0).

---

## Open Questions — Resolved

### OQ-1: Nitro `github_pages` Preset Behavior (HIGH confidence)

**Source:** `node_modules/nitropack/dist/presets/_static/preset.mjs` — read directly.

The `githubPages` preset (aliased as `github_pages`) does the following:

1. **Extends `static`** — inherits `static: true`, `.output/public` output dir, `crawlLinks: true`
2. **Pre-renders** `/` and `/404.html` as explicit seed routes (link crawler finds the rest)
3. **Writes `.nojekyll`** automatically via a `compiled` hook:
   ```js
   await fsp.writeFile(join(nitro.options.output.publicDir, '.nojekyll'), '')
   ```
4. **Does NOT generate `200.html`** — only `404.html` as the SPA fallback. GitHub Pages uses `404.html` to serve unmatched paths, which lets Nuxt's client router take over.

**What `nuxi generate` + `github_pages` produces in `.output/public/`:**
```
.output/public/
├── .nojekyll            ← auto-written by compiled hook
├── 404.html             ← SPA fallback (Nuxt client router handles navigation)
├── index.html           ← pre-rendered Dashboard page
├── discovery/
│   ├── index.html       ← pre-rendered Discovery page
│   └── _payload.json    ← useFetch data baked at build time
├── dpa/
│   ├── index.html
│   └── _payload.json
├── risk/
│   ├── index.html
│   └── _payload.json
├── tags/
│   ├── index.html
│   └── _payload.json
└── _nuxt/               ← JS/CSS chunks (underscore prefix, NOT dot prefix)
    ├── entry.HASH.js
    ├── app.HASH.js
    └── *.css
```

**Interaction with `app.baseURL`:** The Nitro preset itself does not parse `app.baseURL` — that is handled by Nuxt's build layer. Setting `app: { baseURL: '/district-demo/' }` causes all asset paths in generated HTML to be prefixed with `/district-demo/`, and the crawler pre-renders routes relative to that base. The resulting `index.html` references `/_nuxt/` assets as `/district-demo/_nuxt/entry.HASH.js`.

### OQ-2: `gh-pages` Package + Nuxt 4 `.output` Gotchas (HIGH confidence)

**Source:** `node_modules/gh-pages/bin/gh-pages.js` — read directly.

**Command shape:** `gh-pages -d .output/public` works as-is. No additional flags needed.

**Why no `--dotfiles` flag needed:** The `--dotfiles` flag includes files whose *names* begin with `.` (e.g., a hypothetical `.secret`). The `.nojekyll` file written by the Nitro preset IS a dotfile — it will be excluded by default because gh-pages ignores dotfiles unless `--dotfiles` is specified. **Therefore**, either:
- (a) Rely on the Nitro preset's `.nojekyll` and add `--dotfiles` to the deploy command so `.nojekyll` is included in the push, OR
- (b) Use the gh-pages `--nojekyll` flag which adds `.nojekyll` separately (without needing `--dotfiles`)

**Recommended approach:** Use `--nojekyll` (gh-pages native flag, verified in source). The deploy command becomes:
```
gh-pages -d .output/public --nojekyll
```
This is more explicit than `--dotfiles` (which would also publish any other dotfiles that might land in `.output/public/`).

**`_nuxt/` underscore directory:** NOT a dotfile. gh-pages handles it correctly without any flags. Underscore-prefixed paths ARE filtered by Jekyll (GitHub Pages' static site processor), but `.nojekyll` disables Jekyll entirely, so `_nuxt/` loads correctly.

**Default branch:** `gh-pages` (the default) — no `--branch` flag needed.

### OQ-3: Smoke Probe Approach (HIGH confidence for Node.js patterns; MEDIUM for GH Pages timing)

**GH Pages propagation timing:**
- Typical: 1-3 minutes after `gh-pages` push completes
- Worst case: 10-20 minutes (CDN propagation during peak load)
- The `gh-pages` push itself takes 5-30 seconds; the CDN update is the variable

**Smoke script design principles:**
1. **Retry with backoff** — first request may 404 if CDN hasn't propagated yet
2. **Probe the deployed base URL** — curl `https://deluxeismassive.github.io/district-demo/` not `localhost`
3. **Exit non-zero on miss** — so the developer sees a clear failure
4. **Sales-rep-readable output** — show pass/fail per route, live URL, which string was missing

**Recommended script shape** (`scripts/smoke.mjs`):
```js
// Uses Node 18+ global fetch — no dependencies needed
const BASE = 'https://deluxeismassive.github.io/district-demo'
const MAX_RETRIES = 5
const RETRY_DELAY_MS = 20_000  // 20s between retries; total wait up to ~100s

const PROBES = [
  { path: '/',          marker: 'Top 8 Vendors Needing Attention', label: 'Dashboard' },
  { path: '/discovery', marker: 'Discovery',                       label: 'Discovery' },
  { path: '/dpa',       marker: 'DPA',                             label: 'DPA' },
  { path: '/risk',      marker: 'Risk Position',                   label: 'Risk Position' },
  { path: '/tags',      marker: 'Tags',                            label: 'Tags' },
]
```

**Content marker guidance** (resolved from page source — see OQ-3a below for rationale):

| Route | Marker String | Stability |
|-------|---------------|-----------|
| `/` | `Top 8 Vendors Needing Attention` | Static string in `index.vue` line 114 — not data-driven |
| `/discovery` | `Discovery` (h1) | Page heading — static |
| `/dpa` | `DPA` (h1 or title area) | Page heading — static |
| `/risk` | `Risk Position` (h1) | Page heading at `risk.vue` line 177 — static |
| `/tags` | `Tags` (h1 or navLabel) | Static |

These markers appear in SSR-rendered HTML (`<h1>` text) and are NOT derived from vendor data, so they survive any data edit. Avoid markers like `"27"` (vendor count) or specific vendor names (could change if data is updated).

**Exit code handling:** Script should `process.exit(1)` if any probe fails after all retries. Use `console.error()` for failures (stderr) and `console.log()` for passing probes (stdout).

### OQ-4: ADR Template Conventions (HIGH confidence)

The standard ADR format from [adr.github.io](https://adr.github.io/) is:
1. **Status** — Accepted / Proposed / Deprecated / Superseded
2. **Context** — The problem / forces at play
3. **Decision** — What was decided
4. **Consequences** — What happens as a result (positive and negative)

For the AMPLIFY-GLIDEPATH ADR, append:
5. **Alternatives Considered** — GH Actions auto-deploy, Vercel, Netlify, raw node-server
6. **Migration Steps** — The exact 3-line `nuxt.config.ts` diff + `amplify.yml` shape

The AMPLIFY-GLIDEPATH ADR should include the verbatim 3-line diff (DEPLOY-02 contract), the Amplify output directory (`.amplify-hosting/`), and required `amplify.yml` skeleton. This makes the future migration self-contained.

### OQ-5: Static Generate + `useFetch` — Build-Time vs Runtime (HIGH confidence)

**Source:** Nuxt 4 official prerendering docs + nitropack `_static` preset source.

When `nuxi generate` runs with `ssr: true` (the default):

1. Nuxt boots a local Nitro server
2. For each pre-rendered route (crawled from `/`), Nuxt renders the page server-side
3. `useFetch('/api/vendors')` executes against the **local Nitro server** (the same server that will serve the app in SSR mode) — the `server/api/vendors.get.ts` handler runs
4. The response data is serialized into the page's **inline payload** (embedded in `<script>` tag in the HTML) AND into a co-located `_payload.json` file
5. The browser receives pre-rendered HTML + hydrated data — no API call on initial load
6. Client-side navigation between routes reads `_payload.json` from the static file server

**Result for this project:** The 5 pre-rendered routes (`/`, `/discovery`, `/dpa`, `/risk`, `/tags`) each contain their full data baked in at build time. The Nitro server API routes (`/api/vendors`, `/api/dpa`, `/api/edtech`) run ONCE at generate time — they do NOT need to exist at runtime on GitHub Pages (and they don't — static hosting has no server). The `_payload.json` files serve as the static data source for client navigation.

**Smoke probes must check for pre-rendered HTML content** (e.g., the h1 heading), NOT for API response JSON. The API routes will 404 if curled against the live URL (expected behavior for a static site).

**The `ssr: true` decision is confirmed correct.** Do NOT set `ssr: false`. Reasons:
- `ssr: false` produces a hollow SPA shell; data fetches happen entirely in the browser
- That breaks the Amplify glidepath (Amplify needs `ssr: true` at runtime)
- `ssr: true` + `nuxi generate` IS the correct pattern for "pre-render now, run as SSR later"

### OQ-6: README Badge (MEDIUM confidence)

The shields.io badge for GitHub Pages deployment status uses the built-in `pages-build-deployment` GitHub Actions workflow that GH Pages auto-triggers on every `gh-pages` branch push:

```markdown
[![GitHub Pages](https://img.shields.io/github/deployments/deluxeismassive/district-demo/github-pages?label=GitHub%20Pages)](https://deluxeismassive.github.io/district-demo/)
```

Or simpler static badge:
```markdown
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://deluxeismassive.github.io/district-demo/)
```

**Recommendation:** Use the static badge variant. It's a 1-line README edit, doesn't depend on CI/CD workflow status (since deployment is manual via `npm run deploy`), and gives the sales rep a direct click-to-demo link at the top of the README.

### OQ-7: AWS Amplify Nitro Preset for the ADR (HIGH confidence)

**Source:** `node_modules/nitropack/dist/presets/aws-amplify/preset.mjs` — read directly.

The `aws-amplify` preset:
- Extends `node-server` (NOT `static`) — it's a live SSR server
- Output dir: `.amplify-hosting/` (NOT `.output/`)
  - Server bundle: `.amplify-hosting/compute/default/`
  - Static assets: `.amplify-hosting/static/district-demo/` (baseURL is appended)
- Runs `writeAmplifyFiles` hook which generates Amplify's `deploy-manifest.json` and routing config
- **No `amplify.yml` is strictly required** — Amplify auto-detects Nuxt and selects the preset via zero-config

**Minimum `amplify.yml`** for explicit control:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 20
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**The 3-line glidepath switch in `nuxt.config.ts`:**
```ts
// FROM (github_pages — current):
app: { baseURL: '/district-demo/' },
nitro: { preset: 'github_pages' },

// TO (aws-amplify — future, 3 changes):
// 1. ssr: true — already true, no change needed (ssr defaults to true)
// 2. Remove app.baseURL (Amplify serves from domain root)
// 3. Change nitro.preset: 'github_pages' → 'aws-amplify'
```

Exact DEPLOY-02 wording says: "(1) enabling `ssr: true`". Since `ssr: true` is already the default and already explicitly set in `nuxt.config.ts`, the switch is actually: (1) remove `app.baseURL`, (2) change `nitro.preset`, (3) optionally add `amplify.yml`. The comment in `nuxt.config.ts` should reflect what actually changes.

**NUXT_PUBLIC_* env vars:** Only needed when adding real API connections (v1.1.0+). For v1.0.0 synthetic data, no env vars are needed for either deployment target.

### OQ-8: Pinia `persistedstate` + Static Generate (HIGH confidence)

**Source:** `pinia-plugin-persistedstate` official docs + STATE.md Phase 7 decision record.

`pinia-plugin-persistedstate` writes to `localStorage` on the **client** only. During `nuxi generate`:
1. The server-side render runs without `localStorage` — the plugin's SSR guard skips persistence
2. The HTML is emitted with initial store state (from `SEED_TAG_GROUPS`)
3. On client hydration, the plugin reads `localStorage` and re-hydrates the store

This is exactly the SSR-safe behavior the plugin was designed for. The Nuxt module (`pinia-plugin-persistedstate/nuxt`) configures itself to use `localStorage` only in browser context. **No changes needed for static generate.**

The tags store (`app/stores/tags.ts`) uses `persist: true` against the Nuxt module which auto-handles SSR safety. This was verified working in Phase 7-02 smoke tests.

### OQ-9: `nuxt.config.ts` Lines 30-42 Placeholder Block (HIGH confidence)

The current block (lines 30-42) is a comment explaining two future deployment states. Phase 13 replaces it with active configuration. The existing spirit (GH Pages section + Amplify section) is preserved per D-11.

**Current block (to replace):**
```ts
// === Phase 13 deployment switches (do not enable in Phase 7) ===
//
// GitHub Pages (next target):
//   app: { baseURL: '/district-demo/' },
//   nitro: { preset: 'github_pages' },
//   build via `npm run generate && npm run deploy`
//
// AWS Amplify SSR (future):
//   nitro: { preset: 'aws-amplify' },
//   keep ssr: true; remove baseURL/static
//
// Switching between deployment targets should require only edits in this block.
```

**Replacement block (active config + glidepath comment):**
```ts
// === Deployment: GitHub Pages (v1.0.0) ===
// To switch to AWS Amplify SSR (v1.1.0+), see .planning/adr/AMPLIFY-GLIDEPATH.md
// 3-line switch: (1) remove app.baseURL, (2) set nitro.preset to 'aws-amplify', (3) add amplify.yml
app: {
  baseURL: '/district-demo/',
},
nitro: {
  preset: 'github_pages',
},
```

This is surgically minimal (D-11) while being immediately readable to a developer without the ADR.

---

## Architecture Patterns

### Recommended File Structure (new files only)

```
district-demo/
├── nuxt.config.ts              ← EDIT: replace lines 30-42 with active config
├── package.json                ← EDIT: add deploy + postdeploy scripts
├── scripts/
│   └── smoke.mjs               ← NEW: post-deploy health check
└── .planning/
    └── adr/
        └── AMPLIFY-GLIDEPATH.md ← NEW: migration ADR
```

No changes to `app/`, `server/`, or `shared/` — pages are deploy-target-agnostic.

### Pattern 1: `nuxt.config.ts` Deployment Block

Active GH Pages config lives at the top level of `defineNuxtConfig({})`. The `app.baseURL` and `nitro.preset` are adjacent so the glidepath comment above them is unambiguous.

```ts
// Source: node_modules/nitropack/dist/presets/_static/preset.mjs + nuxt.config.ts Phase 13
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: { compatibilityVersion: 4 },
  ssr: true,

  // === Deployment: GitHub Pages (v1.0.0) ===
  // To switch to AWS Amplify SSR: see .planning/adr/AMPLIFY-GLIDEPATH.md
  // 3-line switch: remove app.baseURL, set nitro.preset='aws-amplify', add amplify.yml
  app: {
    baseURL: '/district-demo/',
  },
  nitro: {
    preset: 'github_pages',
  },

  // ... modules, css, pinia, echarts unchanged ...
})
```

### Pattern 2: npm Scripts Block

```json
{
  "scripts": {
    "dev":         "nuxi dev",
    "build":       "nuxi build",
    "generate":    "nuxi generate",
    "preview":     "nuxi preview",
    "typecheck":   "nuxi typecheck",
    "postinstall": "nuxi prepare",
    "deploy":      "nuxi generate && gh-pages -d .output/public --nojekyll",
    "postdeploy":  "node scripts/smoke.mjs"
  }
}
```

**Note:** `postdeploy` runs automatically after `deploy` completes (npm lifecycle hook — no explicit wiring needed).

### Pattern 3: Smoke Script Structure

```js
// scripts/smoke.mjs — Node 18+ global fetch, no dependencies
const BASE = 'https://deluxeismassive.github.io/district-demo'
const MAX_RETRIES = 5
const RETRY_MS = 20_000

const PROBES = [
  { path: '/',          marker: 'Top 8 Vendors Needing Attention', label: 'Dashboard' },
  { path: '/discovery', marker: 'Discovery',                       label: 'Discovery' },
  { path: '/dpa',       marker: 'DPA',                             label: 'DPA' },
  { path: '/risk',      marker: 'Risk Position',                   label: 'Risk Position' },
  { path: '/tags',      marker: 'Tags',                            label: 'Tags' },
]

async function probe(p, attempt) { /* fetch + grep + retry */ }

async function main() {
  console.log(`\nSmoke check: ${BASE}\n`)
  let passed = 0, failed = 0
  for (const p of PROBES) {
    const ok = await probe(p, 0)
    ok ? passed++ : failed++
  }
  console.log(`\n${passed}/${PROBES.length} probes passed`)
  if (failed > 0) {
    console.error(`\nERROR: ${failed} probe(s) failed. Site may not be live yet.`)
    process.exit(1)
  }
}

main()
```

### Anti-Patterns to Avoid

- **Don't set `ssr: false`** — produces client-only SPA shell; loses pre-rendering AND breaks Amplify glidepath
- **Don't add `target: 'static'`** — this is a Nuxt 2 config key; Nuxt 3/4 uses `nuxi generate` + Nitro presets instead. Setting it is a no-op or causes warnings.
- **Don't use `--dotfiles` without understanding scope** — it would include ALL dotfiles from `.output/public/` in the push. Use `--nojekyll` instead (it's explicit and safe).
- **Don't probe API route URLs** — `https://deluxeismassive.github.io/district-demo/api/vendors` will 404 on a static site. Probe page URLs only.
- **Don't probe vendor-count strings like "27"** — data-dependent; will break if synthetic data is updated.
- **Don't run smoke script before GH Pages propagates** — the `postdeploy` hook runs immediately after the `gh-pages` git push. The first probe attempt will likely fail (CDN not live yet). Build in retry logic with 20s delay.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| `.nojekyll` creation | Manual `fs.writeFileSync('.output/public/.nojekyll', '')` | Nitro `github_pages` preset compiled hook | Auto-runs on every `nuxi generate` — no drift risk |
| Force-push to `gh-pages` branch | Custom git commands | `gh-pages -d .output/public --nojekyll` | Handles orphan commits, branch creation, remote tracking |
| SPA 404 fallback | Custom `404.html` | Nitro preset pre-renders `/404.html` automatically | Preset-owned; matches Nuxt router expectations |
| Retry HTTP in smoke script | Custom retry library | Inline `for` loop with `setTimeout` | No dependency needed; Node 24 global `fetch` is sufficient |
| Amplify deploy config | Custom webpack/build logic | `nitro.preset: 'aws-amplify'` | Preset generates `.amplify-hosting/` + `deploy-manifest.json` automatically |

---

## Common Pitfalls

### Pitfall 1: `_nuxt/` Assets 404 Without `.nojekyll`

**What goes wrong:** GitHub Pages runs Jekyll on every push. Jekyll ignores directories prefixed with `_`. The `_nuxt/` folder (all JS/CSS chunks) is invisible to Jekyll. The site loads an empty shell with broken assets.

**Why it happens:** Jekyll silently skips `_nuxt/` — no error, just 404s for every chunk file.

**How to avoid:** The Nitro `github_pages` preset writes `.nojekyll` to `.output/public/` automatically at compile time. Additionally, `gh-pages --nojekyll` writes it again during the push. Belt-and-suspenders. Verify by checking for `.nojekyll` in the `gh-pages` branch after first deploy.

**Warning signs:** Site loads but is blank (white screen), browser DevTools shows 404s for `/_nuxt/*.js` files.

### Pitfall 2: Smoke Script Fires Before CDN Is Live

**What goes wrong:** `postdeploy` runs immediately after `gh-pages` push returns. The CDN may not have picked up the new content yet. Every probe returns 404, the script exits 1, the developer thinks the deploy failed.

**Why it happens:** `gh-pages` exits after the git push completes — it has no way to wait for GitHub's CDN to propagate.

**How to avoid:** Build retry logic (5 attempts × 20s = up to 100s wait) into `smoke.mjs`. On each attempt, log which retry number is running so the developer knows the script is waiting, not hung.

**Warning signs:** All 5 probes fail simultaneously on first run but pass on a manual re-run 2 minutes later.

### Pitfall 3: `app.baseURL` Missing or Wrong

**What goes wrong:** Assets load at `/` root paths instead of `/district-demo/`. `index.html` references `/district-demo/_nuxt/...` but actual GitHub Pages URL is `https://deluxeismassive.github.io/district-demo/`. Without `baseURL`, Nuxt emits `/_nuxt/...` paths, which 404 on the GH Pages subdirectory.

**Why it happens:** GitHub Pages serves this repo at a subpath (`/district-demo/`). Nuxt's default is `baseURL: '/'`.

**How to avoid:** Set `app: { baseURL: '/district-demo/' }` in `nuxt.config.ts` (decision D-05). Verify after generate by grepping `.output/public/index.html` for `/district-demo/_nuxt/`.

**Warning signs:** Site loads but all JS/CSS returns 404; browser address bar shows `https://deluxeismassive.github.io/district-demo/` but network tab shows requests to `/_nuxt/...` (missing the subdirectory).

### Pitfall 4: `target: 'static'` (Nuxt 2 Legacy Config)

**What goes wrong:** Adding `target: 'static'` to `defineNuxtConfig` produces a warning in Nuxt 3/4 and may interfere with Nitro preset selection.

**Why it happens:** Nuxt 2 used `target: 'static'` to switch between modes. Nuxt 3/4 deprecated this in favor of the `nuxi generate` command + Nitro presets.

**How to avoid:** Never add `target: 'static'` to `nuxt.config.ts`. Use `nitro: { preset: 'github_pages' }` + `nuxi generate` instead.

### Pitfall 5: `gh-pages` Default Branch Collision

**What goes wrong:** If the repository has content on the `gh-pages` branch from the v0.5.0 era (old Vue 3 / Vite build artifacts), the first `gh-pages -d .output/public` push overlays the new content. This is the correct behavior — it replaces the old content — but if the old build's `index.html` is still cached by the CDN, the user may briefly see the old site.

**Why it happens:** `gh-pages` defaults to force-replacing the branch HEAD (no history by default with `--no-history`).

**How to avoid:** This is expected and correct. The smoke script will wait for the new content to propagate. No action needed.

### Pitfall 6: Smoke Probing the Wrong URL

**What goes wrong:** Probing `http://localhost:3000/` (dev server) or `https://deluxeismassive.github.io/` (root, not subpath) instead of `https://deluxeismassive.github.io/district-demo/`.

**How to avoid:** Hardcode the full base URL (`https://deluxeismassive.github.io/district-demo`) in `smoke.mjs` as a module-level constant. Add a comment noting why the `/district-demo` subpath is required.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `target: 'static'` in nuxt.config | `nuxi generate` + Nitro preset | Nuxt 3.0 | Old config key is ignored/warns in Nuxt 3/4 |
| Manual `.nojekyll` file in `public/` | Nitro `github_pages` preset compiled hook | Nuxt 3.x | Auto-generated; never drift |
| Nuxt 2 `dist/` output directory | `.output/public/` (Nitro standard) | Nuxt 3.0 / Nitro | `gh-pages -d .output/public` is the correct path |
| Hash routing for SPA on GH Pages | Pre-rendered routes + `404.html` SPA fallback | Nuxt 3/4 + Nitro | No hash URLs; all 5 routes get clean pre-rendered HTML |

**Deprecated/outdated:**
- `@nuxtjs/gh-pages` module: No longer needed; `gh-pages` CLI + Nitro preset covers the full workflow
- v0.5.0 `"deploy": "gh-pages -d dist"`: Replace with `"nuxi generate && gh-pages -d .output/public --nojekyll"` (the `dist/` directory no longer exists in the Nuxt 4 project)

---

## Code Examples

### nuxt.config.ts — Deployment Block (Final Shape)

```ts
// Source: node_modules/nitropack/dist/presets/_static/preset.mjs (verified)
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },

  // === Deployment: GitHub Pages (v1.0.0) ===
  // To switch to AWS Amplify SSR: see .planning/adr/AMPLIFY-GLIDEPATH.md
  // 3-line switch: (1) remove app.baseURL, (2) set nitro.preset='aws-amplify', (3) add amplify.yml
  app: {
    baseURL: '/district-demo/',
  },
  nitro: {
    preset: 'github_pages',
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-echarts',
  ],

  css: ['~/assets/css/main.css'],

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  echarts: {
    renderer: 'canvas',
    charts: ['RadarChart', 'PieChart'],
    components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
  },
})
```

### Smoke Script — Retry Pattern

```js
// scripts/smoke.mjs
// Node 18+ global fetch — zero dependencies
const BASE = 'https://deluxeismassive.github.io/district-demo'
const MAX_RETRIES = 5
const RETRY_DELAY_MS = 20_000  // 20s; total max wait ~100s

const PROBES = [
  { path: '/',          marker: 'Top 8 Vendors Needing Attention', label: 'Dashboard' },
  { path: '/discovery', marker: 'Discovery',                       label: 'Discovery' },
  { path: '/dpa',       marker: 'DPA',                             label: 'DPA' },
  { path: '/risk',      marker: 'Risk Position',                   label: 'Risk Position' },
  { path: '/tags',      marker: 'Tags',                            label: 'Tags' },
]

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function probeOnce({ path, marker, label }) {
  const url = `${BASE}${path}`
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` }
    const html = await res.text()
    if (!html.includes(marker)) return { ok: false, reason: `marker not found: "${marker}"` }
    return { ok: true }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

async function probeWithRetry(probe) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const result = await probeOnce(probe)
    if (result.ok) {
      console.log(`  PASS  ${probe.label} (${BASE}${probe.path})`)
      return true
    }
    if (attempt < MAX_RETRIES) {
      console.log(`  WAIT  ${probe.label} — attempt ${attempt}/${MAX_RETRIES}: ${result.reason}`)
      await sleep(RETRY_DELAY_MS)
    } else {
      console.error(`  FAIL  ${probe.label} — ${result.reason}`)
      console.error(`        URL: ${BASE}${probe.path}`)
    }
  }
  return false
}

async function main() {
  console.log(`\nPost-deploy smoke check`)
  console.log(`Live URL: ${BASE}\n`)

  let passed = 0, failed = 0
  for (const probe of PROBES) {
    const ok = await probeWithRetry(probe)
    ok ? passed++ : failed++
  }

  console.log(`\nResult: ${passed}/${PROBES.length} probes passed`)
  if (failed > 0) {
    console.error(`\nERROR: ${failed} probe(s) failed. Check ${BASE} manually.`)
    process.exit(1)
  }
}

main()
```

### AMPLIFY-GLIDEPATH.md — Skeleton

```markdown
# ADR: AWS Amplify SSR Glidepath

**Status:** Accepted (implementation deferred to v1.1.0)
**Date:** 2026-05-22
**Deciders:** Phase 13 planning

## Context

The District Demo Portal deploys as a static site to GitHub Pages for v1.0.0.
The long-term target is AWS Amplify SSR (dev/staging/production environments,
real API connections, branch-based deploys). [...]

## Decision

Keep `ssr: true` + `nuxi generate` for v1.0.0. The `nuxt.config.ts` deployment
block is structured so the switch to Amplify requires only 3 changes [...]

## Migration Steps (3-line switch)

1. In `nuxt.config.ts`: remove `app: { baseURL: '/district-demo/' }`
2. In `nuxt.config.ts`: change `nitro: { preset: 'github_pages' }` to `nitro: { preset: 'aws-amplify' }`
3. Add `amplify.yml` to the repo root [skeleton below]

The `ssr: true` line in `nuxt.config.ts` does not need to change — it is already true.

## Consequences

- GitHub Pages: static HTML, no server, free hosting, ~1-2 min deploy
- AWS Amplify: SSR on each request, Lambda-backed, supports real APIs, branch envs

## Alternatives Considered

- Vercel: simpler deploy, but requires vendor account; Amplify stays on AWS ecosystem
- Netlify: similar tradeoff
- Manual GitHub Actions → node-server: more config, less automation than Amplify preset
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | smoke.mjs (global `fetch`) | ✓ | 24.14.0 (CLAUDE.md) | — |
| `gh-pages` CLI | `npm run deploy` | ✓ | 6.3.0 (devDep installed) | — |
| `nuxi generate` | static build | ✓ | Nuxt 4.4.6 (installed) | — |
| Git remote `origin` | `gh-pages` push | ✓ | `https://github.com/deluxeismassive/district-demo` (verified in CONTEXT.md D-04) | — |
| GitHub Pages enabled on repo | live URL | assumed ✓ | — | Enable via repo Settings → Pages |

**Missing dependencies with no fallback:** None — all tooling is installed.

**Assumption to verify before executing:** GitHub Pages is enabled on `deluxeismassive/district-demo` and set to serve from the `gh-pages` branch. This can be verified via `https://github.com/deluxeismassive/district-demo/settings/pages` or checked by attempting the first deploy.

---

## Validation Architecture

> `workflow.nyquist_validation` key not present in config — treating as enabled.

### Test Framework

Phase 13 is a deployment infrastructure phase with no unit-testable logic. The validation model is artifact-verification + live-URL curl probes rather than a test runner.

| Property | Value |
|----------|-------|
| Framework | None (no unit tests for deploy config) |
| Config file | N/A |
| Quick run command | See per-task verification below |
| Full suite command | `npm run deploy` (end-to-end: generate → push → smoke) |

### Phase Requirements → Verification Map

| Req ID | Behavior | Verification Type | Command / Artifact |
|--------|----------|-------------------|--------------------|
| DEPLOY-01a | `nuxi generate` completes without error | Build exit code | `npm run generate` exits 0 |
| DEPLOY-01b | `.output/public/` structure correct | File existence grep | `ls .output/public/ | grep -E '(index\.html|404\.html|\.nojekyll|_nuxt)'` |
| DEPLOY-01c | `app.baseURL` baked into HTML assets | Grep generated HTML | `grep 'district-demo/_nuxt' .output/public/index.html` |
| DEPLOY-01d | `npm run deploy` pushes to GitHub Pages | Manual + smoke result | `npm run deploy` (smoke script exit code) |
| DEPLOY-01e | Live URL loads correctly | Live curl probe | `curl -s https://deluxeismassive.github.io/district-demo/ | grep 'Top 8 Vendors'` |
| DEPLOY-02a | Amplify glidepath comment in nuxt.config.ts | Grep source | `grep 'aws-amplify' nuxt.config.ts` |
| DEPLOY-02b | ADR file exists with migration steps | File existence | `ls .planning/adr/AMPLIFY-GLIDEPATH.md` |
| DEPLOY-02c | ADR contains 3-line switch diff verbatim | Grep ADR | `grep 'nitro.preset' .planning/adr/AMPLIFY-GLIDEPATH.md` |

### Per-Task Verification Steps

**Task 1 (nuxt.config.ts update):**
```bash
grep 'baseURL' nuxt.config.ts              # → '/district-demo/'
grep 'github_pages' nuxt.config.ts         # → preset value
grep 'aws-amplify' nuxt.config.ts          # → comment reference
grep 'AMPLIFY-GLIDEPATH' nuxt.config.ts   # → ADR pointer
```

**Task 2 (package.json scripts):**
```bash
grep 'gh-pages' package.json               # → deploy script present
grep 'postdeploy' package.json             # → postdeploy hook present
grep 'nojekyll' package.json               # → --nojekyll flag in deploy script
```

**Task 3 (generate + local verification):**
```bash
npm run generate                           # exits 0
ls .output/public/                         # index.html, 404.html, .nojekyll, _nuxt/
grep '/district-demo/_nuxt' .output/public/index.html   # baseURL baked in
cat .output/public/.nojekyll               # exists (may be empty)
```

**Task 4 (smoke.mjs creation):**
```bash
node scripts/smoke.mjs                     # fails with connection error (not yet deployed — expected)
# Verify script structure:
grep 'Top 8 Vendors' scripts/smoke.mjs    # Dashboard marker present
grep 'process.exit(1)' scripts/smoke.mjs  # exits non-zero on failure
```

**Task 5 (deploy + live verification):**
```bash
npm run deploy                             # runs generate → gh-pages → smoke
# Smoke output shows 5/5 probes passed
curl -s https://deluxeismassive.github.io/district-demo/ | grep 'Top 8 Vendors Needing Attention'
```

**Task 6 (ADR):**
```bash
ls .planning/adr/AMPLIFY-GLIDEPATH.md    # exists
grep 'aws-amplify' .planning/adr/AMPLIFY-GLIDEPATH.md   # preset name present
grep 'amplify.yml' .planning/adr/AMPLIFY-GLIDEPATH.md   # amplify.yml skeleton present
```

### Phase Gate

DEPLOY-01 and DEPLOY-02 are both closed when:
1. `npm run generate` exits 0 with the full 5-route pre-render visible in build output
2. Live URL `https://deluxeismassive.github.io/district-demo/` returns HTTP 200 with pre-rendered content
3. `scripts/smoke.mjs` reports 5/5 probes passed
4. `.planning/adr/AMPLIFY-GLIDEPATH.md` exists with the verbatim 3-line switch
5. A developer reading `nuxt.config.ts` can find the Amplify comment without opening the ADR

---

## Sources

### Primary (HIGH confidence — source code read directly)
- `node_modules/nitropack/dist/presets/_static/preset.mjs` — `github_pages` preset source: crawlLinks, .nojekyll hook, prerender routes `/` and `/404.html`
- `node_modules/nitropack/dist/presets/aws-amplify/preset.mjs` — Amplify preset: output dir `.amplify-hosting/`, extends `node-server`
- `node_modules/gh-pages/bin/gh-pages.js` — v6.3.0 CLI: `--nojekyll` flag verified, `--dotfiles` scope clarified
- `app/pages/index.vue`, `app/pages/risk.vue`, `app/pages/dpa.vue`, `app/pages/discovery.vue`, `app/pages/tags.vue` — smoke probe markers sourced from static strings in page templates

### Secondary (HIGH — official Nuxt 4 docs)
- https://nuxt.com/docs/4.x/getting-started/prerendering — `useFetch` data baked into `_payload.json` at build time; API routes run once at generate time
- https://nitro.build/deploy/providers/aws-amplify — Amplify preset configuration, `amplify.yml` shape

### Tertiary (MEDIUM — verified against primary sources above)
- https://github.com/nuxt/nuxt/issues/21232 — `.nojekyll` history; confirmed fixed by preset compiled hook (read in source)
- https://github.com/nuxt/nuxt/discussions/17657 — `ssr: true` + `nuxi generate` is correct; `ssr: false` produces hollow SPA
- Community sources re: GitHub Pages CDN propagation timing (1-20 min range); used to calibrate smoke retry interval

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all tooling verified against installed source code
- Architecture patterns: HIGH — config shape derived from preset source + existing project patterns
- Pitfalls: HIGH (`.nojekyll`) / MEDIUM (CDN timing) — major pitfall verified by source; timing range from community reports
- Smoke probe markers: HIGH — sourced from static `<h1>` text in page templates; not data-driven

**Research date:** 2026-05-22
**Valid until:** 2026-08-22 (90 days — Nitro preset API is stable; gh-pages CLI is stable)
