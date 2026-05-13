---
phase: 1
slug: shell-routing
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — visual demo portal; all validation is manual browser verification |
| **Config file** | None — no automated test setup in scope for Phase 1 |
| **Quick run command** | `npm run dev` (manual browser click-through) |
| **Full suite command** | `npm run build && npm run preview` |
| **Estimated runtime** | ~30s build; 5 min manual walkthrough |

---

## Sampling Rate

- **After every task commit:** Run `npm run dev` — open browser, click all 4 nav links, verify active highlight and page titles render
- **After every plan wave:** Run `npm run build` — confirms no import errors in production bundle
- **Before `/gsd:verify-work`:** Full manual walkthrough of all 4 routes (dev) + `npm run build` green

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | FOUND-01, FOUND-02 | Manual smoke | `npm run build` (import errors) | ✅ after task | ⬜ pending |
| 1-01-02 | 01 | 1 | FOUND-01, FOUND-02 | Manual smoke | `npm run build` | ✅ after task | ⬜ pending |
| 1-01-03 | 01 | 1 | FOUND-04 | Manual + console | `npm run build` | ✅ after task | ⬜ pending |
| 1-02-01 | 02 | 2 | FOUND-01, FOUND-02 | Manual smoke | `npm run build` | ✅ after task | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- None — no test framework to install. Phase 1 validation is entirely manual browser verification.

*Existing infrastructure covers all phase requirements via manual smoke testing.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All 4 routes navigate without page reload | FOUND-01 | No automated router test framework | Open `npm run dev`, click Dashboard → Discovery → Reports → Settings; confirm browser URL hash changes, no full reload |
| Sidebar visible and consistent on every route | FOUND-02 | Visual layout check | Navigate all 4 routes; sidebar must remain visible with correct active highlight |
| Browser refresh on `/#/reports` stays on Reports | FOUND-02 | Hash history behavior; requires actual browser refresh | Hard-refresh (Ctrl+R) on each route; confirm correct view loads |
| `useTagsStore()` accessible from any component | FOUND-04 | No unit test framework | Import store in a view component, call `useTagsStore()` in script setup, confirm no console errors |
| GitHub Pages refresh stability | FOUND-02 | Requires live deployment | Run `npm run deploy`, open `https://<org>.github.io/district-demo/#/reports`, hard-refresh |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 300s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
