---
phase: 5
slug: risk-position-view
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — no test framework in project |
| **Config file** | none |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + visual smoke test in browser
- **Before `/gsd:verify-work`:** Full `npm run build` green + browser smoke test
- **Max feedback latency:** ~5 seconds (build) + manual visual check

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 5-01-01 | 01 | 1 | RISK-01, RISK-02 | build | `npm run build` | ✅ | ⬜ pending |
| 5-02-01 | 02 | 1 | RISK-01, RISK-02 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test scaffolding needed — this project has no automated test framework.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 27 vendors show a risk tier badge (High/Medium/Low) | RISK-01 | No test framework; visual component rendering | Navigate to `/reports`, verify all 27 vendors show a colored tier badge |
| Donut chart shows 3 slices with correct counts | RISK-02 | Visual chart rendering; no test framework | Chart shows High(2), Medium(7), Low(18) slices; hover tooltip shows count + percent |
| Default sort is Risk Tier descending (High first) | RISK-01 | Table sort order is visual | High-risk vendors appear at top of table on initial load |
| 1EdTech certified vendor reduces tier by one level | RISK-01 | Formula correctness is data-dependent | Find a vendor with Signed DPA but Certified 1EdTech — verify it shows lower tier than formula base |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
