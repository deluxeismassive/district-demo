---
phase: 8
slug: layout-routing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth for probes: `08-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (no Vitest yet — Phase 8 has no unit-testable logic; verification is shell + dev-server smoke) |
| **Config file** | none |
| **Quick run command** | `npm run typecheck` (~5s) |
| **Full suite command** | `npm run build` (~30s) |
| **Estimated runtime** | typecheck ~5s; build ~30s; full grep + dev-server probe panel ~45s |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck` (5s).
- **After Plan 08-01 completes:** Run `npm run build` plus the full grep panel from RESEARCH § Validation Architecture (22 automatable probes).
- **Before `/gsd:verify-work`:** `npm run build` + `npm run dev` smoke (curl all 5 routes, scan for SSR errors).
- **Max feedback latency:** typecheck after each task (~5s); build at end of plan (~30s).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 08-01-* | 01 | 1 | NUXT-04, LAYOUT-01 | smoke + grep | see Plan 08-01 task `<verify>` blocks | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*None — Phase 8 deliverables are 1 layout + 5 page stubs + 1 type declaration; no test infrastructure setup required.*

Existing infrastructure (typecheck + build + curl) covers all phase requirements.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Active-link highlight color renders correctly on the dark sidebar | LAYOUT-01 | Visual: contrast and brand-color accuracy can only be confirmed by eye | 1. `npm run dev`. 2. Open `http://localhost:3000/discovery`. 3. Confirm "Discovery" link in sidebar has the active-state background (`bg-primary-600` or v0.5.0 `#484ce6`) and contrasts against the dark sidebar bg. 4. Click "DPA" and confirm highlight transfers to that link only (not still on Discovery). |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (N/A — no Wave 0 needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (typecheck) / 60s (build)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — planner fills `<verify>` blocks; checker confirms coverage; executor flips `nyquist_compliant: true` after green run.
