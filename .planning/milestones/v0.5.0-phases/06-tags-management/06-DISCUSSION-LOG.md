# Phase 6: Tags Management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-21
**Phase:** 06-tags-management
**Areas discussed:** Tag model scope, Edit interaction, Color selection, Delete safety

---

## Tag Model Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Manage both levels | Groups (with color) + child tags listed beneath, matching existing store model | ✓ |
| Flat — each tag has its own color | Collapse to single level, every tag has name + color | |
| Groups only — children implicit | Only manage groups; children via inline chip editor | |

**Follow-up — expand/collapse:**

| Option | Description | Selected |
|--------|-------------|----------|
| Always expanded | All groups open on page load, children always visible | ✓ |
| Collapsible groups | Each group can expand/collapse via toggle | |

**User's choice:** Manage both levels, always expanded.
**Notes:** Matches existing `tagGroups` store structure exactly — no data model changes needed.

---

## Edit Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Inline editing | Click to rename in place; "Add tag" row per group; "Add group" button at top | ✓ |
| Modal dialog per item | PrimeVue Dialog with form for each create/rename action | |
| Side drawer (slide-over) | Drawer per group showing all group details and children | |

**User's choice:** Inline editing.
**Notes:** Fast and demo-friendly. No modal required for the happy path.

---

## Color Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Preset swatches — 6-8 curated colors | Row of clickable color circles | ✓ |
| Hex input field | Text input for hex color | |
| Full color picker (HSL/RGB) | PrimeVue ColorPicker or native color input | |

**Follow-up — who picks the colors:**

| Option | Description | Selected |
|--------|-------------|----------|
| Claude picks | 4 existing seed colors + 4 complementary additions | ✓ |
| Just the 4 existing colors | Lock to #484CE6, #DA8231, #16A34A, #DC2626 | |

**User's choice:** Claude picks 8 curated colors.
**Notes:** Keep demo visually clean; preset prevents garish combos during a live demo.

---

## Delete Safety

| Option | Description | Selected |
|--------|-------------|----------|
| Confirm dialog with impact count | "Delete [name]? It will be removed from N vendor(s)." | ✓ |
| Delete immediately — no confirm | Instant delete, no confirmation | |
| Soft delete with undo toast | Immediate with toast "Undo" button | |

**Follow-up — seed tag protection:**

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — all tags deletable | All groups/tags deletable; "Reset to defaults" as safety net | ✓ |
| No — protect seed groups | Seed groups read-only | |
| No protection, no reset | All deletable, no reset option | |

**User's choice:** All tags deletable + confirm dialog + "Reset to defaults".
**Notes:** User raised the important edge case of cascade delete — what happens to vendor assignments when a tag is deleted. Claude recommended cascade purge: deleted tag IDs are filtered from all vendor `assignments` arrays immediately on delete. For group deletion, all children's IDs are removed from all assignments. No orphaned tag IDs.

---

## Claude's Discretion

- Exact 8 swatch hex values (constrained by existing 4 seed colors + 4 complementary picks)
- Visual layout of group sections (card vs flat list vs grouped rows)
- Icon choices for edit/delete buttons (PrimeIcons available)
- Whether inline name editing uses PrimeVue InputText or native `<input>`
- Exact placeholder text for empty name fields
- Whether "Reset to defaults" is link-style or outlined button

## Deferred Ideas

None — discussion stayed within Phase 6 scope.
