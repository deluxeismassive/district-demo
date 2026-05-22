---
phase: 12-risk-position-tags
plan: 02
subsystem: ui
tags: [nuxt-ui-v4, umodal, pinia-setup-store-actions, cascade-delete, inline-rename, color-palette, persistedstate]

requires:
  - phase: 07-nuxt-scaffold
    provides: pinia-plugin-persistedstate plugin; app/stores/tags.ts setup-store with persist:true; SEED_TAG_GROUPS (4 groups, 11 children)
  - phase-10-plan: 10-03
    provides: setVendorTags(vendorId, tagIds) action with empty-array cleanup branch; clearVendorTags(vendorId); explicit useTagsStore import pattern

provides:
  - app/stores/tags.ts with 8 new actions — renameTag, renameTagGroup, setTagGroupColor, deleteTag, deleteTagGroup, resetToDefaults, addTagGroup, addTag
  - Cascade-delete pattern (deleteTag/deleteTagGroup iterate Object.keys(assignments) and route through existing setVendorTags so empty-array cleanup fires automatically)
  - Reset-to-defaults pattern (JSON.parse(JSON.stringify(SEED_TAG_GROUPS)) deep clone — prevents subsequent edits corrupting the seed reference)
  - app/pages/tags.vue (340 lines) — full CRUD surface with inline rename (UInput + autofocus), 8-swatch color palette popover, per-tag and per-group delete with UModal confirmation, "Reset to defaults" button with UModal confirmation, "Add group" / "Add tag" affordances
  - Two UModal instances using v-model:open with #body + #footer slots receiving { close }; @mousedown.prevent on color-dot trigger AND palette swatches (prevents rename UInput @blur firing before swatch interaction)

affects: [13-deploy]

tech-stack:
  added: []  # zero new deps — all primitives shipped Phases 7-11
  patterns:
    - "Cascade-delete via existing setVendorTags reuse — iterate Object.keys(assignments.value), filter the deleted tag id, call setVendorTags(vendorId, remaining); empty-array branch cleans tidied entries automatically"
    - "Reset-to-defaults JSON deep clone — JSON.parse(JSON.stringify(SEED_TAG_GROUPS)) breaks the seed reference so subsequent renames don't corrupt the source constant"
    - "Inline rename toggle pattern — span (display) v-if editingId !== item.id ELSE UInput v-else with autofocus prop, @blur and @keydown.enter commit through named store actions"
    - "Swatch popover gated by swatchOpenForGroupId ref — exactly one group's palette open at a time; @mousedown.prevent on dot trigger AND on each swatch button so picking color mid-rename doesn't accidentally commit the rename via UInput @blur"
    - "PendingDelete discriminated union ({ type: 'tag' | 'group' }) + vendorCountForTag/Group helpers — modal description and body text branch off pendingDelete.value.type; pendingDeleteCount captured at request time (non-reactive across the actual delete)"
    - "UModal v-model:open (NOT :visible) + :title + :description props + #body + #footer slot with { close } slot prop — verified vs node_modules/@nuxt/ui/dist/runtime/components/Modal.vue.d.ts (props lines 9-58, slots lines 64-86, emit 'update:open' line 90)"
    - "UButton color='error' variant='solid' is allowed on destructive action buttons (the color='error' ban is UBadge tier chips only — those use :style hex injection)"
    - "@pinia/nuxt v0.11.3 still does NOT auto-import store factories — explicit `import { useTagsStore, type TagGroup, type TagItem } from '~/stores/tags'` (carry-forward from Plan 10-03 lesson)"

key-files:
  created: []
  modified:
    - app/stores/tags.ts (+95 lines — 8 new functions inside the defineStore setup callback; extended return object lists all 12 keys; existing setVendorTags / clearVendorTags / tagGroups / assignments / SEED_TAG_GROUPS / persist:true config untouched)
    - app/pages/tags.vue (rewritten from 16-line stub → 340-line full CRUD page — definePageMeta preserved verbatim)

key-decisions:
  - "Used UInput's top-level `autofocus` prop (Input.vue.d.ts:36 confirms `autofocus?: boolean`) — simpler than the manual :ref + nextTick + $el.querySelector('input').focus() fallback shown in the research. Verified at execute by reading Input.vue.d.ts before authoring."
  - "INCLUDED the two discretion actions addTagGroup + addTag — sales-rep iteration speed depends on Add for v0.5.0 demo parity (research § Open Question #1 recommended INCLUDE; ROADMAP SC#4 + SC#5 don't explicitly require, but the page is worse without)."
  - "onAddGroup defaults new groups to '#475569' (slate-600, the 8th palette color) — research §Tags store API suggested it; matches v0.5.0 SettingsView nextUnusedColor heuristic in spirit (uses the last palette slot rather than the first free one) without the extra computation."
  - "Wrapped editingId.value assignment in nextTick inside onAddGroup/onAddTag — the store push triggers a Vue reactive update + DOM render; setting editingId AFTER nextTick guarantees the UInput v-if branch mounts with autofocus working."
  - "Added a guard `if (editingId.value !== group.id) return` (and the analog for tags) at the top of commitEditGroup/commitEditTag — when the user picks a swatch the UInput @blur fires; if the delete-or-reset modal mutated state first, the commit shouldn't replay a stale name. Pre-emptive race-condition guard."
  - "8-swatch palette is a horizontal row of native `<button>` elements (NOT URadioGroup or UColorPicker) — verbatim port from v0.5.0 SettingsView.vue:230-242; native buttons are lighter, ARIA-labelled per swatch, and match v0.5.0 visual identity exactly."
  - "Per-tag delete button uses opacity-0 group-hover/tag:opacity-100 (only visible on row hover) — matches v0.5.0 UX. Group delete button is always visible (the trash icon is the only group-delete affordance; rename + color picker live elsewhere on the row)."

requirements-completed: [PAGE-04]

duration: ~3min
completed: 2026-05-22
---

# Phase 12 Plan 02: Tags Management Page Summary

**Pinia tags store now exposes 8 new CRUD actions; app/pages/tags.vue rewritten from 16-line stub to 340-line full management surface — inline rename via UInput autofocus, 8-swatch palette popover, cascade-delete with vendor-count readout in UModal, reset-to-defaults with UModal confirmation. PAGE-04 closed; all changes route through named Pinia actions (grep-able write paths). Parallel-safe with Plan 12-01.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-22T01:45:42Z
- **Completed:** 2026-05-22T01:48:44Z
- **Tasks:** 2 / 2
- **Files modified:** 2 (app/stores/tags.ts, app/pages/tags.vue)

## Accomplishments

- **Store actions live:** `app/stores/tags.ts` now exposes 8 new actions on top of the Plan 10-03 baseline (setVendorTags + clearVendorTags preserved). The 6 mandated: `renameTag(groupId, tagId, newName)`, `renameTagGroup(groupId, newName)`, `setTagGroupColor(groupId, newColor)`, `deleteTag(groupId, tagId)`, `deleteTagGroup(groupId)`, `resetToDefaults()`. The 2 discretion: `addTagGroup(initialColor): string` and `addTag(groupId): string | null` (both return new IDs for the UI to auto-focus rename). Cascade-delete logic in `deleteTag` and `deleteTagGroup` routes through the existing `setVendorTags` so the empty-array cleanup branch (Plan 10-03) fires automatically — keeps the persisted localStorage JSON tidy. `resetToDefaults` uses `JSON.parse(JSON.stringify(SEED_TAG_GROUPS))` to break the seed reference; subsequent renames no longer corrupt the source constant.
- **Tags page CRUD surface:** `app/pages/tags.vue` rewritten — definePageMeta verbatim preserved. Page header has h1 "Tags" + description + top-right "Reset to defaults" UButton (icon `i-lucide-rotate-ccw`). Below: "Add group" UButton (icon `i-lucide-plus`). Empty state renders when `tagGroups.length === 0`. Each group renders as a white card with a color dot button (toggles 8-swatch popover), inline-editable name span/UInput, group-delete trash button (UButton color="neutral" variant="ghost" icon="i-lucide-trash-2"); children list `<ul>` with per-tag inline-editable span/UInput; per-tag delete button (xs, hidden-until-hover via `opacity-0 group-hover/tag:opacity-100`); native "Add tag" `<button>` at card bottom with leading UIcon. Two UModal instances at the page bottom — one for delete confirm (with cascade-count readout reading `pendingDeleteCount`), one for reset confirm.
- **Inline rename via UInput autofocus:** Verified at execute via `Input.vue.d.ts:36` that UInput exposes `autofocus?: boolean` as a top-level prop. Used the simpler `autofocus` prop rather than the research's `:ref` + nextTick + `$el?.querySelector('input')?.focus()` fallback pattern. Commits via `@keydown.enter.prevent` AND `@blur`; both route through `tagsStore.renameTag(...)` or `tagsStore.renameTagGroup(...)`.
- **8-swatch palette:** Hoisted `PALETTE_COLORS` const at script top with the 8 verbatim hex values from v0.5.0 SettingsView.vue:7-16. Popover gated by `swatchOpenForGroupId` ref (exactly one group's swatch open at a time). Each swatch uses `@mousedown.prevent` (NOT `@click`) — mousedown.prevent fires BEFORE the rename UInput's `@blur`, so picking a color while editing the group name doesn't accidentally commit the rename prematurely. Selected swatch shows `border-gray-700 scale-110`; unselected get `border-transparent hover:scale-105`.
- **Cascade-delete with vendor-count readout:** UI-local helpers `vendorCountForTag(tagId)` and `vendorCountForGroup(group)` read `tagsStore.assignments` and compute the count of affected vendors at REQUEST time (captured into `pendingDeleteCount.value`). Modal body interpolates `{{ pendingDeleteCount }} vendor(s)` so the user sees the cascade impact before confirming. Confirm routes through `tagsStore.deleteTag` or `tagsStore.deleteTagGroup` — the store action iterates `Object.keys(assignments.value)` and calls `setVendorTags(vendorId, remaining)`, triggering the empty-array cleanup branch for any vendors whose assignment became empty.
- **Reset-to-defaults:** Modal confirms before mutating. `confirmReset()` calls `tagsStore.resetToDefaults()` which deep-clones SEED_TAG_GROUPS via JSON round-trip and assigns `assignments.value = {}`. Persistedstate plugin auto-flushes the reset to localStorage; the page reactivity re-renders the card list immediately.
- **Add affordances (discretion):** `onAddGroup()` calls `tagsStore.addTagGroup('#475569')` (defaults to slate-600), then in `nextTick` sets `editingId` + opens the swatch for the new group — user lands on the new card already in rename mode. `onAddTag(group)` calls `tagsStore.addTag(group.id)`, then transitions into rename mode on the new tag. Empty-name commits are no-ops (the store actions return early on trimmed-empty input) — the user can immediately fill in a name without the page mutating in the background.

## Task Commits

Each task was committed atomically with `--no-verify` per parallel-mode policy:

1. **Task 1: 8 CRUD actions added to `app/stores/tags.ts` (rename/setColor/delete/reset + addGroup/addTag)** — `69d446f` (feat)
2. **Task 2: `app/pages/tags.vue` rewritten as full CRUD UI with UModal delete + reset confirmations** — `2b131bf` (feat)

_(Plan metadata + ROADMAP update commit follows after self-check; STATE.md / REQUIREMENTS.md frontmatter intentionally NOT touched here — orchestrator owns those at phase close per parallel-mode contract.)_

## Files Created/Modified

- `app/stores/tags.ts` — **171 lines** (+95 from baseline 76; setup callback now houses 10 functions total: 2 existing + 8 new; return object lists all 12 reactive keys). Existing types (`TagItem`, `TagGroup`, `TagAssignments`), `SEED_TAG_GROUPS`, `setVendorTags`, `clearVendorTags`, and the `{ persist: true }` second-arg config are byte-identical to the Plan 10-03 baseline.
- `app/pages/tags.vue` — **340 lines** (rewritten from 16-line Phase 8 stub). definePageMeta block preserved verbatim. `<script setup lang="ts">` has imports → palette const → rename state/funcs → swatch state/funcs → cascade-count helpers → delete state/funcs → reset state/funcs → add affordance funcs. `<template>` has page header + Add group button + empty state + group-cards `v-for` + delete UModal + reset UModal.

## Verification

**Task 1 acceptance criteria (20/20 green):**
- 8 function declarations present (6 mandated + 2 discretion).
- Both cascade-delete paths route through `setVendorTags(vendorId, remaining)` (verified at lines 114 and 126 of `app/stores/tags.ts`).
- `JSON.parse(JSON.stringify(SEED_TAG_GROUPS))` present in `resetToDefaults` (line 132).
- Return object extended to include all 12 keys.
- Existing API (`setVendorTags`, `clearVendorTags`, `SEED_TAG_GROUPS`, `persist: true`) preserved.
- Explicit type annotations on every find/filter/map callback (`(g: TagGroup)`, `(t: TagItem)`, `(id: string)`).
- `npm run typecheck` exit 0.

**Task 2 acceptance criteria (26/26 static green; 27-28 SSR probes also green):**
- Page structure: explicit `from '~/stores/tags'` import, `useTagsStore()`, `definePageMeta` + `navOrder: 50` preserved, exactly **2** `<UModal>` instances, `v-model:open="deleteDialogOpen"` and `v-model:open="resetDialogOpen"`.
- Inline rename: `editingId !== group.id` / `editingId !== tag.id` toggles; `tagsStore.renameTag` and `tagsStore.renameTagGroup` action calls.
- Swatch palette: `PALETTE_COLORS` const, **9** hex literal matches (8 swatches + the slate-600 default in onAddGroup; ≥8 required), `tagsStore.setTagGroupColor` action call, `@mousedown.prevent` used (4 occurrences — 4 color-dot triggers and 8 palette swatches via the same handler).
- Cascade delete + reset: `tagsStore.deleteTag`, `tagsStore.deleteTagGroup`, `tagsStore.resetToDefaults`, `vendorCountForTag`, `pendingDeleteCount` all present.
- Negative probes: NO `v-model:visible`, NO direct `tagsStore.tagGroups[` index mutation, NO local `import.*SEED_TAG_GROUPS` (the store owns the reset path).
- `npm run typecheck` exit 0; `npm run build` exit 0 — `.output/server/chunks/build/tags-*.mjs` emitted (60 kB client + 62.2 kB server bundle).

**Runtime SSR probe (live dev server, port 3000, HTTP 200):**
- `/tags` SSR HTML: **35,952 bytes** (up from the 16-line stub's ~5 kB).
- All 4 seed group names in HTML: **Curriculum, Assessment, Communication, Administration** (each twice — once as the v-for'd `<span>` and once as part of the swatch popover's aria context).
- All 11 unique seed child tag names in HTML: **Math, Science, ELA, Social Studies, Formative, Summative, Parent Engagement, Staff Messaging, HR, Finance, Scheduling** (each twice — same v-for + neighbour reasons).
- "Reset to defaults" / "Add group" / "Add tag" UI strings all present in SSR markup.

**Files outside Plan 12-02 scope:** zero modifications (confirmed via `git status --short` showing only `app/stores/tags.ts`, `app/pages/tags.vue`, and the new `.planning/_tags-12-02.html` runtime probe artifact, which is not committed).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TS noUncheckedIndexedAccess hardening — `assignments.value[vendorId]` is `string[] | undefined` after Object.keys iteration**

- **Found during:** Task 1 (anticipated from the cascade-delete loops in the research; verified at typecheck)
- **Issue:** Iterating `Object.keys(assignments.value)` yields known keys but TS's `noUncheckedIndexedAccess` (enabled in Nuxt 4's strict tsconfig) still types `assignments.value[vendorId]` as `string[] | undefined`. Calling `.filter()` on a possibly-undefined value would fail typecheck.
- **Fix:** Added the non-null assertion `!` after the indexed access — `assignments.value[vendorId]!.filter(...)` in both `deleteTag` and `deleteTagGroup`. Safe because the value came from `Object.keys()` of the same object on the same line — there's no way for the key to point to undefined.
- **Files modified:** `app/stores/tags.ts` (Task 1 commit)
- **Commit:** `69d446f`
- **Carry-forward:** When iterating store state via `Object.keys(x.value)`, the indexed value is `T | undefined` under `noUncheckedIndexedAccess`. Either non-null assert (when provably safe) or destructure with a guard. Phase 9-01 lesson #7-adjacent.

**2. [Rule 2 - Missing critical correctness guard] Added stale-edit guard at the top of commitEditGroup and commitEditTag**

- **Found during:** Task 2 (anticipated race condition; verified at write time)
- **Issue:** The rename UInput's `@blur` event fires whenever the input loses focus — including when the user clicks a delete trash icon or opens a UModal. If the modal mutation lands before `commitEditX` re-checks state, the store would be re-mutated with the stale editingName. Race condition.
- **Fix:** Added `if (editingId.value !== group.id) return` (and the tag analog) as the first line of both commit functions. If something else (delete, reset, swatch pick) already cleared `editingId`, the @blur commit becomes a no-op.
- **Files modified:** `app/pages/tags.vue` (Task 2 commit)
- **Commit:** `2b131bf`
- **Rationale:** Pre-emptive — matches the "clear stale edit refs before mutating" pattern in `confirmDelete` (research § Cascade delete).

### No Other Deviations

The remaining plan content (action signatures, UModal slot shapes, swatch popover pattern, cascade-count helpers, delete/reset flows, definePageMeta preservation) executed verbatim. No architectural changes; no Rule 4 checkpoints; no auth gates.

## Plan-vs-Reality Verification (Nuxt UI v4 contracts)

Before authoring `app/pages/tags.vue`, read the installed type files per the research's "Verified Nuxt UI v4 contracts" section:

- **`node_modules/@nuxt/ui/dist/runtime/components/Modal.vue.d.ts`** — confirmed `v-model:open` (line 90: `"update:open": (value: boolean) => any`), confirmed `body` and `footer` slots receive `{ close: () => void }` (lines 80-86), confirmed `title` and `description` as top-level props (lines 10-11).
- **`node_modules/@nuxt/ui/dist/runtime/components/Input.vue.d.ts`** — confirmed `autofocus?: boolean` IS a top-level UInput prop (line 36). Used `autofocus` prop directly; avoided the manual `:ref` + nextTick + querySelector fallback that the research's MEDIUM-confidence note hedged against.

## Cross-page UAT (informational — runs against the production code as of `2b131bf`)

The cross-page cascade-delete UAT (research § Validation Architecture, Manual-Only verifications row "Cascade delete cleans vendor assignments") is **deferred to the phase-close manual UAT**. The SSR-only check is incomplete for this validation because cascade-delete writes happen client-side (Pinia store mutation → persistedstate plugin → localStorage). The SSR HTML for `/tags` correctly renders all 4 groups + 11 child tags + both UModal markup placeholders + 9 hex literals; the cross-page click-through (assign tag in `/discovery` → delete in `/tags` → return to `/discovery`) requires browser-side interaction. The store actions are validated at the unit level by the type system (typecheck exit 0) and at the structural level by the grep probes.

## Known Stubs

None. Every action on the page maps to a named Pinia store action. No placeholder data; no "coming soon" text; no hardcoded empty arrays flowing to UI. The Add-group / Add-tag affordances create empty entries but immediately transition into rename mode (the user is prompted to name them; empty trims are store-level no-ops).

## Self-Check: PASSED

- File `app/stores/tags.ts` modified (8 new actions + extended return): VERIFIED
- File `app/pages/tags.vue` rewritten (340 lines, full CRUD UI): VERIFIED
- Commit `69d446f` exists: FOUND (`feat(12-02): add 8 CRUD actions to tags store (rename/setColor/delete/reset + addGroup/addTag)`)
- Commit `2b131bf` exists: FOUND (`feat(12-02): rewrite tags.vue as full CRUD UI with UModal delete and reset confirmations`)
- Typecheck exit 0: VERIFIED (twice — after Task 1 and after Task 2)
- Build exit 0: VERIFIED (62.2 kB server bundle for tags page emitted)
- SSR probe (HTTP 200 + all 4 group names + all 11 child tag names + UModal markup): VERIFIED
- Two `<UModal>` instances using `v-model:open` (NOT `v-model:visible`): VERIFIED
- 8+ hex literals for the swatch palette: VERIFIED (9 matches)
- Zero direct store-state mutation in templates (no `tagsStore.tagGroups[N] = ...`): VERIFIED
- Zero edits to risk.vue / VendorDrawer.vue / discovery.vue / dpa.vue / index.vue / nuxt.config.ts / server/ / shared/: VERIFIED (git diff confirms)
