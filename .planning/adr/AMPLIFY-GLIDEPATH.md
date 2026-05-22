# ADR: AWS Amplify SSR Glidepath

**Status:** Accepted (implementation deferred to v1.1.0+)
**Date:** 2026-05-22
**Deciders:** Phase 13 planning
**Supersedes:** none

## Context

The District Demo Portal (v1.0.0) deploys as a static site to GitHub Pages via `nuxi generate`.
This produces pre-rendered HTML for all 5 routes (`/`, `/discovery`, `/dpa`, `/risk`, `/tags`),
with data baked into `_payload.json` files at build time. No server runs at runtime.

The long-term target is AWS Amplify SSR: branch-based environments (dev/staging/prod), real API
connections replacing synthetic data, and per-request server-side rendering backed by Lambda.
`PROJECT.md` references this Amplify target as the v1.1.0+ milestone.

DEPLOY-02 (from REQUIREMENTS.md) is the gating contract: switching from GitHub Pages to AWS
Amplify SSR MUST require only 3 changes in `nuxt.config.ts` with NO page-level code edits.
Pages use `useFetch('/api/...')` which works under both static generate (SSG) and live SSR — the
page layer is already deploy-target-agnostic.

## Decision

Keep `ssr: true` + `nuxi generate` for v1.0.0. The `nuxt.config.ts` deployment block is
structured so the switch to Amplify requires only 3 changes (see Migration Steps below).

`ssr: true` is kept — do NOT set `ssr: false`:
- `ssr: true` + `nuxi generate` pre-renders pages server-side at build time (correct pattern)
- `ssr: false` would produce a client-only SPA shell with no pre-rendered content
- `ssr: true` preserves the Amplify glidepath: Amplify needs SSR enabled at runtime

`nuxt.config.ts` is the canonical source of truth for the switch. This ADR is the source of
truth for the why. A developer reading `nuxt.config.ts` can locate the Amplify comment and
understand the 3-line switch without opening this file.

## Migration Steps (3-line switch)

1. In `nuxt.config.ts`: remove `app: { baseURL: '/district-demo/' }`
2. In `nuxt.config.ts`: change `nitro: { preset: 'github_pages' }` to `nitro: { preset: 'aws-amplify' }`
3. Add `amplify.yml` to the repo root (skeleton below)

The `ssr: true` line in `nuxt.config.ts` does not need to change — it is already true.

After the switch, use `npm run build` (NOT `npm run generate`) — Amplify SSR builds a live server,
not a static output. Update the `deploy` script in `package.json` accordingly for v1.1.0+.

## amplify.yml skeleton

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

**Notes on the Amplify preset:**
- Output directory is `.amplify-hosting/` (NOT `.output/`) — the `aws-amplify` Nitro preset
  generates this automatically
- Server bundle lands at `.amplify-hosting/compute/default/`
- Static assets land at `.amplify-hosting/static/district-demo/` (baseURL is appended if kept)
- No `amplify.yml` is strictly required — Amplify auto-detects Nuxt and selects the preset via
  zero-config — but providing it explicitly locks the Node version and build commands

## Consequences

### GitHub Pages (current — v1.0.0)

| Property | Value |
|----------|-------|
| Hosting cost | Free |
| Runtime | None — static HTML only |
| Deploy time | ~1-2 min (nuxi generate + gh-pages push + CDN propagation) |
| API calls at runtime | Not possible — data baked at build time |
| Env vars needed | None (synthetic data; no runtime config) |
| Branch envs | Not supported (one `gh-pages` branch = one URL) |
| Rollback | Force-push older commit to `gh-pages` branch |

### AWS Amplify (future — v1.1.0+)

| Property | Value |
|----------|-------|
| Hosting cost | Lambda invocation per request (pay-per-use) |
| Runtime | SSR on each request, Lambda-backed |
| Deploy time | ~3-5 min (build + Amplify deploy pipeline) |
| API calls at runtime | Supported — real API connections possible |
| Env vars | `NUXT_PUBLIC_*` prefix for client-visible config; `NUXT_*` for server-only |
| Branch envs | Native — dev/staging/prod from git branches |
| Rollback | Amplify console → redeploy previous build |

## Alternatives Considered

**Vercel** — Simpler deploy UX and good Nuxt/Nitro support via the `vercel` preset. Rejected
because it introduces a vendor account outside the AWS ecosystem; schoolday's infrastructure
is AWS-centric. If the AWS requirement is dropped, Vercel is the next-best option (zero config,
first-party Nitro preset, branch previews).

**Netlify** — Similar tradeoff to Vercel: excellent static + SSR support, but requires a Netlify
account. Same ecosystem concern as Vercel.

**GitHub Actions + raw node-server** — Would deploy a Node.js server (e.g., on EC2 or ECS)
using the `node-server` Nitro preset. More configuration surface (Dockerfile, CI workflow,
health checks) with no automation advantage over Amplify's preset-aware deploy pipeline.
Rejected for v1.1.0+ in favor of Amplify's managed approach.

**Why Amplify wins for v1.1.0+:** Stays within the AWS ecosystem, the first-party `aws-amplify`
Nitro preset handles the full output structure automatically (`.amplify-hosting/` + routing
manifest), and Amplify natively supports branch-based environments that schoolday's multi-env
requirement needs. Migration from GitHub Pages is a 3-line `nuxt.config.ts` diff (DEPLOY-02).

## Acceptance Test for the Future Migration

A future contributor can verify the migration succeeded by running this checklist:

- [ ] After the 3-line switch, `npm run build` (NOT generate) exits 0 with no TypeScript errors
- [ ] Output directory is `.amplify-hosting/` (NOT `.output/`); both `compute/default/` and `static/` subdirectories exist
- [ ] `amplify.yml` parses without errors (Amplify console validates on first deploy attempt)
- [ ] Live Amplify URL serves all 5 routes with SSR: `curl` responses show fresh `__NUXT__` payload on each request, not a static pre-rendered dump
- [ ] `NUXT_PUBLIC_*` env vars (if any real API wiring was added) are set in the Amplify console under the target branch environment
- [ ] `npm run deploy` script in `package.json` updated from `nuxi generate && gh-pages ...` to `nuxi build` + Amplify's CI pipeline (no longer a manual push)
