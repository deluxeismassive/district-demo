# Phase 6: Tags Management - Context

**Gathered:** 2026-05-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the SettingsView skeleton with a fully functional Tags management page. Users can create, rename, delete, and color-assign tags from a dedicated settings page. The `useTagsStore` (hierarchical tag groups + localStorage persistence) is already wired — Phase 6 is purely the UI to manage it.

The Tags page lives at the existing `/settings` route — no new route needed.

</domain>

<decisions>
## Implementation Decisions

### Tag Model: Hierarchy Preserved
- **D-01:** Manage both levels of the hierarchy — parent groups (with color) and child tags (children are what get assigned to vendors). No flattening. Matches the existing `tagGroups` store structure exactly; no data model changes needed.
- **D-02:** Color lives on the parent group — child tags have no individual color. The group color is the color shown on tag pills throughout the app.
- **D-03:** Groups are always expanded on page load — all children visible without any click. No collapsible behavior.

### Page Layout
- **D-04:** SettingsView (`src/views/SettingsView.vue`) is replaced with the Tags management page directly. No Settings header or tab bar wrapping it — the entire Settings route is the Tags page.
- **D-05:** "Add group" button at the top of the page creates a new group. Each group section has an "Add tag" affordance at the bottom of its child list.
- **D-06:** Page header: "Tags" with a brief description, plus a "Reset to defaults" button (right-aligned) that restores seed data when clicked.

### Edit Interaction: Inline
- **D-07:** All editing is inline — no modal dialog or drawer. Clicking a group name or child tag name turns it into an input field for renaming. Press Enter or blur to confirm.
- **D-08:** Creating a new child tag: a small "Add tag" row at the bottom of each group's child list — user types the name and presses Enter. No inline color per child (color inherits from group).
- **D-09:** Creating a new group: "Add group" button at top spawns a new group row with an empty name field pre-focused. Color swatch defaults to the first unused preset color. User types name and presses Enter.

### Color Selection: Preset Swatches
- **D-10:** Color is picked from a preset swatch palette of 8 curated colors displayed as clickable circles next to the group name when a group is in edit mode (or on initial creation). Clicking a swatch immediately applies it.
- **D-11:** Palette (Claude to finalize exact values, guided by these anchors):
  - Existing 4 seed colors: `#484CE6` (blue-violet), `#DA8231` (orange), `#16A34A` (green), `#DC2626` (red)
  - 4 additional complementary colors: teal/cyan, purple/violet, rose/pink, slate/gray — Claude picks accessible contrast values that complement the brand palette
- **D-12:** The color swatch for a group is visible inline (even when not editing) as a small colored circle before the group name.

### Delete Behavior
- **D-13:** Deleting a child tag or a parent group requires a confirm dialog (PrimeVue Dialog). Dialog text: "Delete [tag/group name]? It will be removed from [N] vendor(s)." One "Delete" button to confirm, one "Cancel" to dismiss.
- **D-14:** Cascade delete: when a tag is deleted, its `id` is filtered out of every vendor's assignment array in the store. When a group is deleted, all its children's IDs are removed from all vendor assignments, then the group is removed from `tagGroups`. No orphaned IDs.
- **D-15:** All tags are deletable — including seed groups. No protected/read-only tags.
- **D-16:** "Reset to defaults" button on the page header restores the original `SEED_TAG_GROUPS` from `tags.js` and clears all assignments. Should also show a confirm before resetting.

### Store Integration
- **D-17:** All mutations go through `useTagsStore`. Tags.js already exports `tagGroups` and `assignments` with `watch()` persistence to localStorage. Page reads and mutates reactive state directly — no API calls.
- **D-18:** Computed stat: the confirm dialog's vendor count is derived from `assignments` — count how many vendorIds have the target tag id in their array.

### Claude's Discretion
- Exact 8 swatch hex values (constrained by D-11 anchors)
- Visual layout of group section: card-style vs flat list vs grouped rows
- Icon choices for edit / delete buttons (PrimeIcons available)
- Whether inline name editing uses PrimeVue InputText or a native `<input>`
- Exact placeholder text for empty tag name fields
- Whether "Reset to defaults" is a link-style button or an outlined button

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — v1 requirements; Phase 6 covers TAGS-01

### Prior Phase Context
- `.planning/phases/02-data-layer-discovery/02-CONTEXT.md` — Tag system structure (D-20 through D-26): group hierarchy, store shape, localStorage keys, and the decision that tag creation lives in Settings not Discovery
- `.planning/phases/01-shell-routing/01-CONTEXT.md` — Visual style (dark sidebar, #484CE6 primary, #DA8231 accent), PrimeVue + Tailwind setup

### Codebase — Must Read
- `src/stores/tags.js` — SEED_TAG_GROUPS shape, localStorage keys (`schoolday-tag-groups`, `schoolday-tag-assignments`), loadOrDefault helper, watch() persistence pattern
- `src/views/SettingsView.vue` — Current skeleton being replaced
- `src/router/index.js` — `/settings` route (no change needed)

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/stores/tags.js` — `useTagsStore` already exports `tagGroups` (reactive, localStorage-backed) and `assignments` (reactive, localStorage-backed). The `SEED_TAG_GROUPS` constant is available for the "Reset to defaults" feature.
- `src/views/SettingsView.vue` — Replace entirely. Keep the `<div class="p-6">` shell pattern.
- PrimeVue Dialog — Used in DpaGrid/other components; available for the delete confirmation and reset confirmation dialogs.

### Established Patterns
- `<script setup>` Composition API — maintained throughout all views
- PrimeVue 4 (Aura preset, `#484CE6` primary) — Button, Dialog available without additional install
- Tailwind v4 for layout and utility classes
- 2-space indentation, no TypeScript, relative imports (no `@/` alias)
- Cascade join pattern: `Object.fromEntries(map)` by vendorId — used across views; same approach for counting assignment impact

### Integration Points
- `useTagsStore` — import and use directly in the new Tags page component
- `src/main.js` — No new registrations needed for Phase 6 (Dialog already registered globally via PrimeVue plugin)
- Discovery tab (DiscoveryView + VendorDrawer) — automatically reflects tag renames/deletions because both read from the same reactive `tagGroups` store; no separate update needed

</code_context>

<specifics>
## Specific Ideas

- **Inline edit pattern:** The user confirmed they want inline editing (no drawer/modal for rename). The color swatch palette should appear inline when the group is in edit mode — floating below or beside the group name row.
- **Cascade delete detail:** The confirm dialog needs to compute `N` vendor(s) at the moment the delete button is clicked. For a child tag: `Object.values(assignments).filter(arr => arr.includes(tagId)).length`. For a group: sum across all children.
- **Reset to defaults:** Confirmed all tags deletable + a reset safety net. Reset should also confirm before nuking current state.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 6 scope.

</deferred>

---

*Phase: 06-tags-management*
*Context gathered: 2026-05-21*
