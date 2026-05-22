---
phase: 11
slug: dpa-dashboard
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 11 — Validation Strategy

> Per-phase validation contract.
> Source of truth for probes: `11-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (build + grep + curl + typecheck + manual visual UAT) |
| **Config file** | none |
| **Quick run command** | `npm run typecheck` (~5s) |
| **Full suite command** | `npm run build` (~30s) |
| **Estimated runtime** | typecheck ~5s; build ~30s; curl probes ~10s; manual UAT ~3 min |

---

## Sampling Rate

- **After every task commit:** `npm run typecheck` (5s).
- **After Plan 11-01:** `npm run build` + grep panel for `<UBadge :style`, sort headers, useDebounce filter, no semantic color classes for status badges.
- **After Plan 11-02:** `npm run build` + curl `/` returns SSR HTML with the Top-8 vendor list and `Top 8 Vendors` heading.
- **Before `/gsd:verify-work`:** Build + dev-server visual walkthrough.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Status |
|---------|------|------|-------------|-----------|--------|
| 11-01-* | 01 | 1 | PAGE-02 | grep + typecheck + curl | ⬜ pending |
| 11-02-* | 02 | 2 | PAGE-05 | grep + typecheck + curl | ⬜ pending |

---

## Wave 0 Requirements

*None* — no new dependencies; everything builds on Phases 7-10.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DPA status badges show correct color per status | PAGE-02 SC#1, SC#2 | Visual — colors must match `riskLabels.ts` hex values | `npm run dev` → `/dpa`. Confirm Signed (green hex), Unsigned (orange/red), Expired (red), Pending (gray/blue) per `shared/utils/riskLabels.ts`. |
| Sort by status / signed date / expiry reorders rows | PAGE-02 SC#3 | Interaction | Click each column header. Confirm ascending → descending → unsorted cycle. |
| Filter narrows DPA rows in real time | PAGE-02 SC#3 | Interaction | Type "google" → matching rows only; clear → all return. |
| Top-8 card lists exactly 8 vendors needing attention | PAGE-05 SC#4 | Visual | `/` shows Top-8 card with 8 rows. Each row is unsigned/expired/has-risk-label per the derivation. |
| Top-8 row click opens VendorDrawer | PAGE-05 SC#4 (UX) | Interaction | Click a row in the card. Drawer slides in with vendor detail + radar chart. |
| DPA row click opens VendorDrawer | PAGE-02 (UX) | Interaction | Click a DPA row. Same drawer opens. |

---

## Nuxt UI v4 Type-Verify-At-Execute Pitfalls

(Carry-forward from Phase 10 memory.)

The executor MUST read installed component types/themes before authoring templates. Known divergences from generic snippets:
- `TableColumn.meta.class` requires `{ th?, td? }`, not a plain string.
- `@pinia/nuxt@0.11.3` does NOT auto-import store factories — explicit `import { useTagsStore }` required if any page uses it (Phase 11 pages may not).
- Implicit `any` on `.map`/`.filter`/`.sort` callbacks fails TS strict.
- `UCard` slot keys: `root`/`header`/`title`/`description`/`body`/`footer` (NOT `content`).
- `USelectMenu :ui` trigger slot key is `base`, not `trigger` (not used in Phase 11 but reference).

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 N/A (no setup)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (typecheck) / 60s (build)
- [ ] `nyquist_compliant: true` set after green run

**Approval:** pending.
