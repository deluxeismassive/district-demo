# Phase 13: Deployment - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship the v1.0.0 District Demo Portal to a live, public GitHub Pages URL using `nuxi generate` static output, and leave `nuxt.config.ts` structured so the future Amplify SSR migration is a 3-line switch with no page-level edits.

**Final v1.0.0 phase.** No new product features — just the deploy infrastructure, smoke verification, and Amplify glidepath documentation.

</domain>

<decisions>
## Implementation Decisions

### Deploy Mechanism

- **D-01:** Manual `npm run deploy` triggered from a developer's machine — same flow as v0.5.0. No GitHub Actions workflow in v1.0.0. Rationale: sales-demo iteration speed favors human-controlled timing; CI adds drift risk for low deploy frequency.
- **D-02:** Compound script: `"deploy": "nuxi generate && gh-pages -d .output/public"` — single command builds and pushes. One mental step.
- **D-03:** `gh-pages` already shipped as a devDep in `package.json:25` (v6.3.0) — no new dependency. Default `gh-pages` branch convention is fine (Claude's discretion to leave unchanged).

### Live URL + Base Path

- **D-04:** Public URL = `https://deluxeismassive.github.io/district-demo/` (resolved from `git remote -v` in this session).
- **D-05:** `app.baseURL: '/district-demo/'` — matches the repo subpath. Already sketched in the `nuxt.config.ts:30-42` deployment-switch comment block.
- **D-06:** `nitro.preset: 'github_pages'` — Nuxt's first-party preset handles the SPA fallback (`200.html` / `404.html`) automatically. No manual fallback HTML required.
- **D-07:** No custom domain in v1.0.0. (Future option: add `public/CNAME` and set baseURL to `/` — captured in Deferred.)

### Post-Deploy Smoke Verification

- **D-08:** Add a `"postdeploy": "node scripts/smoke.mjs"` npm hook that runs automatically after `gh-pages` push completes.
- **D-09:** Script curls the live URL for all 5 routes (`/`, `/discovery`, `/dpa`, `/risk`, `/tags`) and greps each response for a distinctive content marker (e.g., KPI "27" on `/`, "Top 8 Vendors Needing Attention" on `/`, tier UBadge hex `#dc2626` on `/risk`, table headers on `/dpa`). Specific markers and probe count are Claude's discretion.
- **D-10:** Smoke check exits non-zero on any miss; prints the live URL and which probe failed to stderr. Does NOT auto-rollback (gh-pages doesn't easily support that). The deploy is technically live; the script's job is to alert loudly.

### Glidepath Block Depth

- **D-11:** Keep the comment block in `nuxt.config.ts` short and surgical — the 3-line Amplify switch plus a marker pointing readers to the ADR. Replaces the current placeholder block at lines 30-42.
- **D-12:** Create `.planning/adr/AMPLIFY-GLIDEPATH.md` with the expanded migration context: why GH Pages now vs Amplify later, the exact Nitro preset switch (`github_pages` → `aws-amplify`), env-var conventions (`NUXT_PUBLIC_*` prefix), CI/CD differences, rollback plan, and acceptance test for the future switch.
- **D-13:** The 3-line glidepath stays canonical-in-code: `nuxt.config.ts` is the source of truth for the switch; the ADR is the source of truth for the *why*.

### Claude's Discretion

- Exact smoke probe markers (Claude picks 1-2 distinctive strings per route from current SSR output — must be stable across vendor data edits).
- ADR structure (Claude picks a standard Problem / Decision / Alternatives Considered / Consequences format).
- `gh-pages` deploy branch name (default `gh-pages` is fine; no opinion).
- README badge for live URL (Claude's discretion to add if it doesn't blow scope).
- Whether to set `ssr: false` for the static generate, or leave `ssr: true` and let `nuxi generate` prerender all routes (Claude picks the cleanest path during planning research).
- 404 page customization (default Nuxt 404 is acceptable for a demo).
- Public asset additions beyond what already ships in `public/` — skip unless required by the smoke check (e.g., `robots.txt`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project anchors
- `.planning/ROADMAP.md` §"Phase 13: Deployment" — Phase 13 goal + 4 success criteria (lines 132-141)
- `.planning/REQUIREMENTS.md` §"Deployment" — DEPLOY-01, DEPLOY-02 contract definitions (lines 37-38)
- `.planning/STATE.md` §"Key Decisions (v1.0.0 — active)" — `AWS Amplify glidepath` row already records the 3-line switch as a locked decision
- `CLAUDE.md` §"Constraints" — "Deployment: Static GitHub Pages — no server, no SSR, no backend calls"

### Existing deployment infrastructure in repo
- `nuxt.config.ts` lines 30-42 — placeholder comment block for Phase 13 deployment switches (to be filled in)
- `package.json` — `gh-pages: ^6.3.0` already installed; `deploy` script to be added
- `app/app.config.ts` — Nuxt UI brand color config; no deploy-related changes expected

### Nuxt / Nitro documentation
- Nuxt deployment docs (https://nuxt.com/docs/getting-started/deployment) — confirms `nuxi generate` + base path workflow
- Nitro preset docs (https://nitro.build/deploy/providers/github-pages) — `github_pages` preset auto-handles SPA fallback
- Nitro Amplify preset docs (https://nitro.build/deploy/providers/aws-amplify) — for future glidepath ADR

### Stale doc to ignore
- `PROJECT.md` lines 65-66 — DEPLOY-01 / DEPLOY-02 list AWS Amplify Nitro node-server preset. This is **stale** from the original milestone-planning copy; ROADMAP.md + REQUIREMENTS.md (above) are the authoritative current contract. (Will be corrected during `/gsd:complete-milestone` after Phase 13 ships.)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`gh-pages` package (v6.3.0)** — already in `package.json:25`. Use the CLI form (`gh-pages -d .output/public`) in the npm script; no node API needed.
- **`nuxt.config.ts:30-42` placeholder block** — already drafted the deployment-switch structure; rewrite to current decisions rather than discarding.
- **`nuxi generate`, `nuxi build`, `nuxi preview` scripts** — already wired in `package.json:6-13`. Phase 13 only adds `deploy` + `postdeploy`.

### Established Patterns

- **Single source of truth for the switch:** Phase 7-12 STATE.md decisions favor `nuxt.config.ts` as the source of truth for build-time config (Nitro preset, base URL, etc.). Phase 13 continues that — no per-page deploy logic; everything routes through one config block.
- **`shared/utils/*` for cross-server-client logic:** smoke script lives at the project root (`scripts/smoke.mjs`), NOT under `shared/` or `app/` — it's a one-shot node CLI invoked from npm, not a runtime module.
- **Page-level code is deploy-target-agnostic:** all 5 pages use `useFetch('/api/...')` which works under both `nuxi generate` (SSG) and SSR. Phase 13 must not break this.

### Integration Points

- `package.json` scripts → add `deploy` + `postdeploy`
- `nuxt.config.ts` lines 30-42 → replace placeholder with current GH Pages config + Amplify 3-line glidepath comment + ADR pointer
- `.planning/adr/` → new directory + `AMPLIFY-GLIDEPATH.md`
- `scripts/` → new directory + `smoke.mjs`
- No changes to `app/`, `server/`, or `shared/` if the pages already work under SSG (verified by Phase 11 + 12 UAT for routes; `nuxi generate` is the only remaining smoke).

</code_context>

<specifics>
## Specific Ideas

- **Live URL on first deploy is the moment-of-truth.** Sales reps lean on this — the smoke check is not optional polish.
- **The Amplify glidepath is real, not aspirational.** PROJECT.md still references the future Amplify target; the ADR should be detailed enough that a future contributor (possibly months out) can execute the migration without re-deriving the plan.
- **`nuxt.config.ts:30-42` already drafted the right structure** — preserve the spirit of those comments (GH Pages section, Amplify section) when rewriting.
- **No vendor lock-in to `gh-pages` package** — if someone wants to swap to a different deploy tool (Cloudflare Pages, Netlify), the only changes needed are in `package.json scripts` + `nuxt.config.ts` Nitro preset.

</specifics>

<deferred>
## Deferred Ideas

These came up during discussion but belong in other phases or future milestones:

- **GitHub Actions CI/CD workflow** — deferred. v1.0.0 ships manual. Add `.github/workflows/deploy.yml` (push-to-master or `workflow_dispatch`) in v1.1.0+ if deploy frequency grows.
- **Custom domain (`demo.schoolday.com` or similar)** — deferred. Requires `public/CNAME` + DNS work + baseURL change to `/`. Capture as Out-of-Scope candidate or v1.1.0 backlog.
- **README badge for the live URL** — Claude's discretion at plan time; if it fits a 1-line edit, do it.
- **Build-time chunk-splitting / performance tuning** — out of scope; Nuxt defaults are fine for a 5-page demo.
- **Error tracking (Sentry, etc.)** — out of scope; demo has no users to track errors for.
- **Environment-specific runtime config (`NUXT_PUBLIC_*`)** — none needed for v1.0.0 (data is fully synthetic, server-side). Add when real API wiring lands (v1.1.0+).
- **Multi-environment deploys (dev / staging / prod)** — PROJECT.md mentions this for Amplify, but v1.0.0 has one demo URL only. Future Amplify migration will introduce branch-based environments.
- **404 page customization** — default Nuxt 404 is fine for a demo. Custom 404 deferred to v1.1.0.
- **Rollback strategy** — beyond what gh-pages provides natively (force-push older commit). Not in scope for v1.0.0.

</deferred>

---

*Phase: 13-deployment*
*Context gathered: 2026-05-22*
