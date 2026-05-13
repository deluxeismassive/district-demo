---
phase: 2
slug: data-layer-discovery
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — browser smoke testing only (no vitest/jest/playwright configured) |
| **Config file** | none — no test runner installed |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` + manual browser walkthrough at `/discovery` |
| **Estimated runtime** | ~15 seconds (build) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual browser walkthrough of Discovery page
- **Before `/gsd:verify-work`:** Full browser smoke test — table renders, sort works, filter works, row click opens drawer with radar chart, tag assignment persists after refresh
- **Max feedback latency:** ~15 seconds (build)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| FOUND-03 | 01 | 1 | FOUND-03 | smoke | `npm run build` | ❌ Wave 0 | ⬜ pending |
| DISC-01 | 02 | 1-2 | DISC-01 | manual | Manual browser check at `/discovery` | N/A | ⬜ pending |
| DISC-02 | 03 | 2 | DISC-02 | manual | Manual: assign tag, verify pill appears | N/A | ⬜ pending |
| DISC-03 | 02 | 2 | DISC-03 | manual | Manual: click row, verify drawer opens | N/A | ⬜ pending |
| TAGS-02 | 03 | 2 | TAGS-02 | manual | Manual: assign tag → refresh → verify persisted | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install echarts vue-echarts` — required before any component referencing VChart can build

*No test infrastructure gaps — project uses browser smoke testing as established in Phase 1. No test files to create.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Vendor table renders with sortable columns and real-time filter | DISC-01 | No test framework; UI interaction | Open `/discovery`, click column headers, type in filter input |
| Tag assignment via MultiSelect updates table tag pills | DISC-02 | UI interaction with Pinia state | Open `/discovery`, click tag cell, assign tag, verify pill appears |
| Row click opens Drawer with vendor detail and radar chart | DISC-03 | UI interaction with PrimeVue Drawer | Open `/discovery`, click any row, verify drawer opens with chart |
| Tags persist after page refresh | TAGS-02 | localStorage persistence check | Assign tag → `F5` → verify tag still shown on vendor |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
