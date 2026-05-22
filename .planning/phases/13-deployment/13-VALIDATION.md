---
phase: 13
slug: deployment
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Phase 13 is a deployment infrastructure phase — verification is artifact-grep + live-URL probes, not unit tests.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None (no unit tests for deploy config — artifact verification only) |
| **Config file** | N/A |
| **Quick run command** | `npm run typecheck && npm run generate` |
| **Full suite command** | `npm run deploy` (end-to-end: generate → gh-pages → postdeploy smoke) |
| **Estimated runtime** | ~90s local (generate ~30s, gh-pages push ~10s, smoke 5x20s retry up to ~100s; total ~2-3 min) |

---

## Sampling Rate

- **After every task commit:** Run the per-task grep panel from RESEARCH.md §"Per-Task Verification Steps"
- **After Task 3 (generate):** Run `npm run generate` → confirm exit 0 + `.output/public/` structure
- **After Task 5 (smoke script):** Run `node scripts/smoke.mjs --help` to confirm CLI structure (real run gated until live URL is up)
- **Before `/gsd:verify-work`:** `npm run deploy` must succeed end-to-end and smoke must report 5/5 probes passed
- **Max feedback latency:** ~30s per task (grep + file check); ~2-3 min for full deploy gate

---

## Per-Task Verification Map

> Task IDs assume a single plan (`13-01-PLAN.md`) with 6 tasks. Adjust if the planner restructures into multiple plans.

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | DEPLOY-01a, DEPLOY-02a | grep | `grep -E 'baseURL.*district-demo' nuxt.config.ts && grep 'github_pages' nuxt.config.ts && grep 'aws-amplify' nuxt.config.ts && grep 'AMPLIFY-GLIDEPATH' nuxt.config.ts` | ✅ | ⬜ pending |
| 13-01-02 | 01 | 1 | DEPLOY-01a | grep | `grep '"deploy"' package.json && grep '"postdeploy"' package.json && grep 'nojekyll' package.json` | ✅ | ⬜ pending |
| 13-01-03 | 01 | 2 | DEPLOY-01a, DEPLOY-01b | build + ls | `npm run generate && ls .output/public/.nojekyll && ls .output/public/404.html && ls .output/public/index.html && grep '/district-demo/_nuxt' .output/public/index.html` | ✅ | ⬜ pending |
| 13-01-04 | 01 | 2 | DEPLOY-01a | grep | `grep "Top 8 Vendors" scripts/smoke.mjs && grep "Risk Position" scripts/smoke.mjs && grep "process.exit(1)" scripts/smoke.mjs && grep -E "retry|backoff" scripts/smoke.mjs` | ✅ | ⬜ pending |
| 13-01-05 | 01 | 3 | DEPLOY-01a, DEPLOY-01b | end-to-end | `npm run deploy` exits 0; smoke output shows `5/5 probes passed`; `curl -s https://deluxeismassive.github.io/district-demo/ \| grep 'Top 8 Vendors'` returns match | ❌ W0 (live URL not up yet) | ⬜ pending |
| 13-01-06 | 01 | 1 | DEPLOY-02b, DEPLOY-02c | file + grep | `ls .planning/adr/AMPLIFY-GLIDEPATH.md && grep 'aws-amplify' .planning/adr/AMPLIFY-GLIDEPATH.md && grep -E '(amplify\.yml\|preset)' .planning/adr/AMPLIFY-GLIDEPATH.md && grep -E 'ssr.*true' .planning/adr/AMPLIFY-GLIDEPATH.md` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Wave assignment rationale:** Tasks 13-01-01, 13-01-02, 13-01-06 are independent file authorship (parallel-safe in Wave 1). Tasks 13-01-03 and 13-01-04 depend on Wave 1 outputs (config + scripts must exist before generate succeeds and smoke probes have something to grep). Task 13-01-05 (live deploy) depends on all prior tasks completing — Wave 3 alone.

---

## Wave 0 Requirements

Phase 13 has no test framework to bootstrap, but **two prerequisites must be in place before Task 13-01-05 (live deploy) can complete:**

- [ ] **GitHub Pages enabled on the repo** — Settings → Pages → Source: `gh-pages` branch / root. If not enabled, the first `gh-pages` push creates the branch but the site won't serve. Per RESEARCH.md §Pitfall 7, attempting the first deploy can also trigger GitHub to auto-create the Pages source on the `gh-pages` branch — but explicit verification is recommended.
- [ ] **GitHub authentication available locally** — `gh-pages` uses `git push` under the hood; the developer must have either HTTPS credentials cached or an SSH key configured.

Neither is code Wave 0 can install — both are repo/account configuration. **The plan should call these out as manual prerequisites in the executor instructions for Task 13-01-05.**

*All other validation infrastructure (grep, curl, node) is already installed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sales-rep usability of the live URL | DEPLOY-01 (criterion 2: "loads correctly") | Subjective UX check the smoke script can't fully cover — confirms charts render, drawers open, no console errors | Visit `https://deluxeismassive.github.io/district-demo/`. Click each of the 5 nav items. Open vendor drawer on Discovery. Verify donut chart renders on Risk. Spot-check Console for errors. |
| Glidepath comment readability | DEPLOY-02 (criterion 4: "developer can identify the Amplify switch without documentation") | "Identify without documentation" is a human-readability assessment; no grep substitute | A fresh reader of `nuxt.config.ts` should locate the Amplify section + understand the switch within 30 seconds without opening the ADR |
| ADR completeness | DEPLOY-02b | ADR quality is judgment-based — does it actually let a future contributor execute the migration? | Read `.planning/adr/AMPLIFY-GLIDEPATH.md` as if you have never seen this project. Could you execute the migration from this doc alone? |

*All other phase behaviors have automated verification via grep/curl/build-exit-code.*

---

## Validation Sign-Off

- [x] All tasks have automated verify commands (grep, file existence, build exit code, curl) or Wave 0 dependencies (GitHub Pages enablement)
- [x] Sampling continuity: every task has an automated probe — no consecutive manual-only tasks
- [x] Wave 0 dependencies documented (GitHub Pages settings, git auth)
- [x] No watch-mode flags — all commands are one-shot
- [x] Feedback latency < 100s for all per-task probes (full deploy is ~2-3 min and runs at phase gate, not per-task)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-22 (auto-approved on phase plan creation; revisit if planner restructures task IDs)

---

## Reference

Full per-task command panels and probe rationale live in:
- `.planning/phases/13-deployment/13-RESEARCH.md` §"Validation Architecture"
- `.planning/phases/13-deployment/13-CONTEXT.md` §"Implementation Decisions"
