---
phase: 12
slug: risk-position-tags
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-22
---

# Phase 12 — Validation Strategy

> Per-phase validation contract.
> Source of truth for probes: `12-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (build + grep + curl + typecheck + manual visual UAT) |
| **Config file** | none |
| **Quick run command** | `npm run typecheck` (~5s) |
| **Full suite command** | `npm run build` (~30s) |
| **Estimated runtime** | typecheck ~5s; build ~30s; curl probes ~10s; manual UAT ~5 min |

---

## Sampling Rate

- **After every task commit:** `npm run typecheck` (5s).
- **After Plan 12-01:** `npm run build` + grep panel (`<VChart`, tier UBadge `:style`, sortHeader); curl `/risk` returns 200 with `<svg>` donut markup in SSR (Option A — no ClientOnly).
- **After Plan 12-02:** `npm run build` + grep panel (new store actions, `<UModal v-model:open`, 8 swatch buttons); curl `/tags` returns 200 with 4 tag group sections.
- **Before `/gsd:verify-work`:** full visual walkthrough.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Status |
|---------|------|------|-------------|-----------|--------|
| 12-01-* | 01 | 1 | PAGE-03 | grep + typecheck + curl | ⬜ pending |
| 12-02-* | 02 | 1 | PAGE-04 | grep + typecheck + curl | ⬜ pending |

Plans 12-01 and 12-02 are **parallel in Wave 1** per research § Wave Assignment — zero file overlap.

---

## Wave 0 Requirements

*None* — no new dependencies. `RISK_TIER_COLORS` already exported from `shared/utils/riskLabels.ts:50-54`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Donut renders with correct slices and colors | PAGE-03 SC#1 | Visual | `/risk` → donut shows High/Medium/Low slices with hex colors from RISK_TIER_COLORS. Tooltip on hover shows tier name + count. Legend matches. |
| No SSR crash | PAGE-03 SC#1 | Inspect dev log | Boot dev server. Open `/risk`. Confirm no "window is not defined" / hydration mismatch in stderr. |
| Tier table sortable by tier, name, usage | PAGE-03 SC#3 | Interaction | Click column headers. Confirm ascending/descending cycle. |
| Tier UBadge colors match riskLabels.ts hex | PAGE-03 SC#2 | Visual | Open table. High = red hex, Medium = amber hex, Low = green hex per RISK_TIER_COLORS. |
| Tags page lists 4 groups, 12 child tags | PAGE-04 SC#4 | Visual | Open `/tags`. Confirm Curriculum / Assessment / Communication / Administration with their seed tags rendered. |
| Inline rename: click tag → edit → blur commits | PAGE-04 SC#4 | Interaction | Click a tag name. Input appears. Type new name. Blur / Enter → name updates. Store mutation reflects across `/discovery` chip cells. |
| 8-swatch color picker | PAGE-04 SC#4 | Visual + interaction | Hover/click swatches per tag group → group color hex changes. |
| Delete tag opens UModal | PAGE-04 SC#5 | Interaction | Click delete on a tag. UModal appears with confirmation text + Cancel / Confirm buttons. |
| Cascade delete cleans vendor assignments | PAGE-04 SC#5 | Cross-page | Assign a tag in /discovery. Navigate /tags. Delete that tag. Navigate back to /discovery. Confirm the tag chip is gone from the row. |
| Reset to defaults | PAGE-04 SC#5 | Cross-page | Delete some tags + assignments. Click "Reset to defaults". Modal confirms. Click confirm. Tags revert to SEED_TAG_GROUPS; all assignments cleared. |

---

## Nuxt UI v4 Type-Verify-At-Execute Pitfalls

(Carry-forward from Phase 10/11 memory + new for Phase 12.)

- `UModal v-model:open` (verified `Modal.vue.d.ts:90`); slots `body` + `footer` receive `{ close: () => void }`.
- `UInput autofocus` — verify via `Input.vue.d.ts` at execute time; fallback to manual `ref.value?.focus()` from `onMounted`.
- `<UButton color="error">` IS allowed (semantic preset on Buttons is fine); the `color="error"` ban is **UBadge tier chips only** (those use `:style` hex).
- TableColumn.meta.class shape: `{ th?, td? }` (Phase 10-01 lesson).
- Explicit type annotations on `.map`/`.filter`/`.sort` (Phase 10-01 lesson).

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 N/A
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (typecheck) / 60s (build)
- [ ] `nyquist_compliant: true` set after green run

**Approval:** pending.
