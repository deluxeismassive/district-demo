---
phase: 6
slug: tags-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed (sales demo project — by design) |
| **Config file** | None |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (catches import/syntax errors)
- **After every plan wave:** Run `npm run build` + manual browser smoke test
- **Before `/gsd:verify-work`:** Build green + manual verification of all 7 TAGS-01 behaviors

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 6-01-01 | 01 | 1 | TAGS-01 | build + manual smoke | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework exists in this project (sales demo — by design). Build verification is the only automated check available and sufficient for this scope.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tags page lists all groups and children with color dots | TAGS-01 | No test framework | Navigate to /settings; verify 4 seed groups render with colored dots and all children visible |
| Create new group with name + color | TAGS-01 | No test framework | Click "Add group"; type a name; select a swatch; press Enter; verify group appears in list |
| Rename group inline | TAGS-01 | No test framework | Click group name; edit text; press Enter or blur; verify new name reflected immediately |
| Rename child tag inline | TAGS-01 | No test framework | Click child tag name; edit text; confirm; verify new name in Discovery tag pills |
| Delete tag — removed from vendor assignments | TAGS-01 | No test framework | Delete a tag with vendors assigned; confirm dialog shows count; confirm; verify tag gone from Discovery |
| Delete group — cascade removes all children | TAGS-01 | No test framework | Delete a group with children assigned to vendors; confirm; verify all child tags removed from vendor pills |
| Reset to defaults — restores seed data | TAGS-01 | No test framework | Delete some tags; click "Reset to defaults"; confirm; verify 4 seed groups restored |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
