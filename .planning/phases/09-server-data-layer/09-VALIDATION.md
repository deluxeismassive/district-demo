---
phase: 9
slug: server-data-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth for probes: `09-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (no Vitest yet — Phase 9 verification is build + grep + curl + typecheck) |
| **Config file** | none |
| **Quick run command** | `npm run typecheck` (~5s) |
| **Full suite command** | `npm run build` (~30s) |
| **Estimated runtime** | typecheck ~5s; build ~30s; curl probes against all 3 API routes ~5s |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck` (5s).
- **After Plan 09-01 completes:** Run `npm run typecheck` plus the data-shape grep panel (all 27 vendor records present, edtech orphan reconciled).
- **After Plan 09-02 completes:** Run `npm run build` plus the dev-server curl panel against `/api/vendors`, `/api/dpa`, `/api/edtech`, and one page route that uses useFetch.
- **Before `/gsd:verify-work`:** `npm run build` + dev-server smoke (curl all 3 API routes + the discovery page; confirm JSON content type, valid JSON, expected record counts).
- **Max feedback latency:** typecheck ~5s; build ~30s.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 09-01-* | 01 | 1 | DATA-01 | grep + typecheck | per task `<verify>` blocks in 09-01-PLAN.md | ✅ | ⬜ pending |
| 09-02-* | 02 | 2 | DATA-01, DATA-02 | curl + typecheck + build | per task `<verify>` blocks in 09-02-PLAN.md | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None — Phase 9 deliverables are 3 server/api/ routes + 3 server/data/ files + shared types + 1 useFetch wiring. No test infrastructure setup required.*

Existing infrastructure (typecheck + build + curl) covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DevTools Network tab shows XHR/fetch calls to `/api/...` on page load | DATA-02 | Network-tab inspection requires a real browser session | 1. `npm run dev`. 2. Open `http://localhost:3000/discovery` with DevTools → Network. 3. Confirm at least one `/api/vendors` request fires. 4. Confirm response is JSON with 27 vendor records. |
| Hot-swap: edit `server/data/dpa.ts`, reload, see change | DATA-01 SC#3 | Requires running dev server + page reload | 1. `npm run dev`. 2. Note a DPA status in the response from `/api/dpa`. 3. Edit `server/data/dpa.ts` to flip that status. 4. Reload the page (no rebuild). 5. Confirm the new status appears in the next `/api/dpa` response. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (N/A — no Wave 0 needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (typecheck) / 60s (build)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — planner fills `<verify>` blocks; checker confirms coverage; executor flips `nyquist_compliant: true` after green run.
