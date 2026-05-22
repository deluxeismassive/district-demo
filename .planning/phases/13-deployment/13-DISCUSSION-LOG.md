# Phase 13: Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 13-deployment
**Areas discussed:** Deploy mechanism, Live URL + base path, Post-deploy smoke verification, Glidepath block depth

---

## Gray Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Deploy mechanism (Recommended) | Manual `npm run deploy` vs GH Actions vs hybrid. Biggest decision — affects who/when triggers deploys. | ✓ |
| Live URL + base path | Confirm public-facing URL pattern + baseURL setting. | ✓ |
| Post-deploy smoke verification | Automated smoke check (curl + grep) vs manual checklist. | ✓ |
| Glidepath block depth | How much of the Amplify switch lives in nuxt.config.ts comments vs separate doc. | ✓ |

**User's choice:** All four.

---

## Deploy Mechanism

### Question 1: How should deploys to GitHub Pages be triggered?

| Option | Description | Selected |
|--------|-------------|----------|
| Manual `npm run deploy` (Recommended) | Dev runs locally when ready. Same as v0.5.0. Lowest friction. | ✓ |
| GitHub Actions on push to master | Auto-deploys every master push. Slight risk: every commit goes live. | |
| Hybrid: CI on push + manual override | GH Actions auto, but manual still works. More flexible, more drift surface. | |
| Manual + on-demand CI | Default manual + `workflow_dispatch` for ad-hoc triggers from GitHub UI. | |

**User's choice:** Manual `npm run deploy`.
**Notes:** Matches v0.5.0 pattern and the sales-demo's same-day iteration preference.

### Question 2: How should the `npm run deploy` script be wired?

| Option | Description | Selected |
|--------|-------------|----------|
| Compound script (Recommended) | Single `"deploy": "nuxi generate && gh-pages -d .output/public"`. | ✓ |
| Separate generate + deploy | Two scripts; build once, deploy multiple times. Adds a step. | |
| Compound + predeploy hook | npm's `predeploy` runs generate; `deploy` runs gh-pages. Same UX, different convention. | |

**User's choice:** Compound script.
**Notes:** Single mental step — type one thing, ship.

---

## Live URL + Base Path

### Question: What's the public-facing URL pattern for the v1.0.0 demo?

| Option | Description | Selected |
|--------|-------------|----------|
| github.io subdomain (Recommended) | `<user>.github.io/district-demo/` — baseURL `/district-demo/`. Zero DNS. | ✓ |
| Custom domain (CNAME) | `demo.schoolday.com` via `public/CNAME`. baseURL `/`. DNS work needed. | |
| User/org root site | Repo renamed to `<user>.github.io`. baseURL `/`. Not recommended unless primary site. | |

**User's choice:** github.io subdomain.
**Notes:** Resolved from `git remote -v`: `https://deluxeismassive.github.io/district-demo/`. baseURL stays `/district-demo/`.

---

## Post-Deploy Smoke Verification

### Question: How should we catch deploy regressions before they're seen in a meeting?

| Option | Description | Selected |
|--------|-------------|----------|
| Postdeploy curl + grep (Recommended) | `"postdeploy": "node scripts/smoke.mjs"` hook curls live URL, greps for key strings, exits non-zero on miss. | ✓ |
| Manual checklist | `docs/DEPLOY.md` checklist. No automation; weakest safety net. | |
| Local preview gate before deploy | `"predeploy": "nuxi generate && nuxi preview && curl ..."`. Catches issues pre-push but slower locally. | |
| No smoke check | Trust gh-pages + local tests. Static generate makes regressions unlikely. | |

**User's choice:** Postdeploy curl + grep.
**Notes:** Sales reps lean on this live; need a loud failure mode if a deploy goes sideways.

---

## Glidepath Block Depth

### Question: How much of the Amplify glidepath belongs in `nuxt.config.ts` vs a separate doc?

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal inline + ADR doc (Recommended) | Short comment block in `nuxt.config.ts` (the 3-line switch). Expanded context in `.planning/adr/AMPLIFY-GLIDEPATH.md`. | ✓ |
| Inline-only (expanded) | All glidepath context in `nuxt.config.ts` comments. One file, more growth. | |
| Inline-only (minimal, existing comments) | Keep current lines 30-42 as-is. Fastest; least documented. | |

**User's choice:** Minimal inline + ADR doc.
**Notes:** Inline = quick switch recipe; ADR = full migration reasoning for a future contributor.

---

## Claude's Discretion

User explicitly deferred these to Claude during planning:
- Exact smoke probe content strings per route (must be stable across data edits)
- ADR structure (standard Problem/Decision/Alternatives/Consequences format)
- `gh-pages` deploy branch name (default is fine)
- README badge for live URL (add if it doesn't blow scope)
- Static-generate `ssr: false` vs `ssr: true` + prerender (Claude picks during research)
- 404 page customization (default Nuxt 404 acceptable)

## Deferred Ideas

Noted for future phases / milestones (none in scope for v1.0.0):
- GitHub Actions CI/CD workflow (v1.1.0+ if deploy frequency grows)
- Custom domain (deferred — needs DNS work)
- Environment-specific runtime config (lands with real API wiring)
- Multi-environment deploys (lands with Amplify migration)
- Build-time performance tuning, error tracking, custom 404 page

## Wrap-Up

**User's final choice:** "I'm ready for context" — proceed to `/gsd:plan-phase 13`.
