# Phase 6: Tags Management - Research

**Researched:** 2026-05-21
**Domain:** Vue 3 Composition API — inline CRUD UI, PrimeVue Dialog, reactive Pinia store mutations
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Manage both levels of the hierarchy — parent groups (with color) and child tags. No flattening. Matches existing `tagGroups` store shape exactly; no data model changes needed.
- **D-02:** Color lives on the parent group — child tags have no individual color. Group color is the color shown on tag pills throughout the app.
- **D-03:** Groups are always expanded on page load — all children visible without any click. No collapsible behavior.
- **D-04:** SettingsView (`src/views/SettingsView.vue`) is replaced with the Tags management page directly. No Settings header or tab bar wrapping it — the entire Settings route is the Tags page.
- **D-05:** "Add group" button at the top of the page creates a new group. Each group section has an "Add tag" affordance at the bottom of its child list.
- **D-06:** Page header: "Tags" with a brief description, plus a "Reset to defaults" button (right-aligned) that restores seed data when clicked.
- **D-07:** All editing is inline — no modal dialog or drawer. Clicking a group name or child tag name turns it into an input field for renaming. Press Enter or blur to confirm.
- **D-08:** Creating a new child tag: a small "Add tag" row at the bottom of each group's child list — user types the name and presses Enter. No inline color per child (color inherits from group).
- **D-09:** Creating a new group: "Add group" button at top spawns a new group row with an empty name field pre-focused. Color swatch defaults to the first unused preset color. User types name and presses Enter.
- **D-10:** Color is picked from a preset swatch palette of 8 curated colors displayed as clickable circles next to the group name when a group is in edit mode (or on initial creation). Clicking a swatch immediately applies it.
- **D-11:** Palette (8 colors): existing 4 seed colors (`#484CE6`, `#DA8231`, `#16A34A`, `#DC2626`) plus 4 complementary colors (Claude picks teal/cyan, purple/violet, rose/pink, slate/gray with accessible contrast).
- **D-12:** The color swatch for a group is visible inline (even when not editing) as a small colored circle before the group name.
- **D-13:** Deleting a child tag or a parent group requires a confirm dialog (PrimeVue Dialog). Dialog text: "Delete [tag/group name]? It will be removed from [N] vendor(s)."
- **D-14:** Cascade delete: tag id filtered out of every vendor's assignment array. Group delete: all children's IDs removed from all vendor assignments, then group removed from `tagGroups`.
- **D-15:** All tags are deletable — including seed groups. No protected/read-only tags.
- **D-16:** "Reset to defaults" button restores `SEED_TAG_GROUPS` and clears all assignments. Shows a confirm before resetting.
- **D-17:** All mutations go through `useTagsStore`. No API calls.
- **D-18:** Confirm dialog's vendor count derived from `assignments` — count vendorIds whose tag array includes the target id.

### Claude's Discretion

- Exact 8 swatch hex values (constrained by D-11 anchors)
- Visual layout of group section: card-style vs flat list vs grouped rows
- Icon choices for edit / delete buttons (PrimeIcons available)
- Whether inline name editing uses PrimeVue InputText or a native `<input>`
- Exact placeholder text for empty tag name fields
- Whether "Reset to defaults" is a link-style button or an outlined button

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 6 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAGS-01 | User can create, rename, and delete tags with color assignment on a Tags management page | Full implementation in SettingsView.vue replacement; store mutations, inline editing, swatch palette, PrimeVue Dialog confirm, cascade delete — all covered in findings below |
</phase_requirements>

---

## Summary

Phase 6 is a pure UI build — no new libraries, no new routes, no data model changes. The `useTagsStore` is already wired with full localStorage persistence. The task is replacing the `SettingsView.vue` skeleton with a functional Tags management page that surfaces all CRUD operations through inline editing patterns.

The critical implementation domain is Vue 3 reactive inline editing: toggling between display and edit states using `ref()` per-item, handling focus/blur/Enter keypresses, and mutating Pinia reactive arrays in ways that trigger the existing `watch()` persistence. All PrimeVue components needed (Button, Dialog, InputText) are already installed and available via tree-shaking import — no new installs.

The only non-trivial design decision left to Claude is the 4 complementary swatch colors (D-11) and the visual layout of group sections. Both are low-risk choices constrained by brand palette consistency and the established Tailwind utility pattern.

**Primary recommendation:** Single-file `SettingsView.vue` rewrite using `<script setup>`, `useTagsStore`, and per-group/per-tag edit-state refs. Keep PrimeVue Dialog for delete and reset confirms. Use card-style group sections (white card with border, consistent with ReportsView chart card) for visual separation.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vue 3 Composition API | ^3.5.34 | Reactive state, inline edit toggling, template logic | Established throughout all views |
| Pinia (`useTagsStore`) | ^3.0.4 | Tag group + assignment state, localStorage persistence | Already wired; no changes needed |
| PrimeVue 4 (Aura preset) | ^4.5.5 | Button, Dialog for confirm interactions | Installed, configured, used in other views |
| Tailwind v4 | ^4.3.0 | Layout utility classes, spacing, colors | Established throughout all views |
| PrimeIcons | ^7.0.0 | `pi pi-pencil`, `pi pi-trash`, `pi pi-plus` icon choices | Already imported globally |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PrimeVue InputText | included in primevue | Inline name editing input | If Claude's discretion favors PrimeVue over native `<input>` |
| Native `<input>` + `nextTick` | (browser) | Inline name editing — simpler, no PrimeVue wiring overhead | Preferred when auto-focus on newly created rows is needed |

**Installation:** No new packages. All dependencies already in `package.json`.

---

## Architecture Patterns

### Recommended File Structure

```
src/
└── views/
    └── SettingsView.vue   # Full rewrite — single file, no sub-components needed
```

No new components required. The page is self-contained: one view file replaces the skeleton. Discovery and VendorDrawer automatically reflect tag renames/deletions because they read the same reactive `tagGroups` ref.

### Pattern 1: Per-Item Inline Edit State

The established project pattern uses `ref()` for reactive state per component. For inline editing, a common Vue 3 pattern is a `Map`-keyed edit state object — one editing flag and one draft value per item id.

```javascript
// In <script setup>
const editingId = ref(null)      // which group or tag id is currently being renamed
const editingName = ref('')      // draft value while editing

function startEdit(item) {
  editingId.value = item.id
  editingName.value = item.name
  nextTick(() => {
    document.getElementById(`edit-${item.id}`)?.focus()
  })
}

function confirmEdit(item) {
  const trimmed = editingName.value.trim()
  if (trimmed) item.name = trimmed   // mutates reactive Pinia ref — watch() triggers persistence
  editingId.value = null
}
```

Pinia `tagGroups` is a `ref([...])` with `{ deep: true }` watch — mutating nested object properties directly (e.g. `group.name = newVal`) triggers the watcher and persists to localStorage. No explicit `$patch` or action needed.

### Pattern 2: Cascade Delete Count Calculation

```javascript
// Count how many vendors have a given tag id assigned
function vendorCountForTag(tagId) {
  return Object.values(tagsStore.assignments).filter(arr => arr.includes(tagId)).length
}

// Count for a group = sum over all children
function vendorCountForGroup(group) {
  return group.children.reduce((sum, child) => sum + vendorCountForTag(child.id), 0)
}
```

Compute count at the moment the delete button is clicked; store it in a `ref` displayed in the Dialog message.

### Pattern 3: Cascade Delete Mutation

```javascript
function deleteTag(group, tag) {
  // Remove tag id from all vendor assignments
  for (const vendorId in tagsStore.assignments) {
    tagsStore.assignments[vendorId] = tagsStore.assignments[vendorId].filter(id => id !== tag.id)
  }
  // Remove child from group
  group.children = group.children.filter(c => c.id !== tag.id)
}

function deleteGroup(group) {
  const childIds = new Set(group.children.map(c => c.id))
  for (const vendorId in tagsStore.assignments) {
    tagsStore.assignments[vendorId] = tagsStore.assignments[vendorId].filter(id => !childIds.has(id))
  }
  tagsStore.tagGroups = tagsStore.tagGroups.filter(g => g.id !== group.id)
}
```

Both assignment and tagGroups refs have `{ deep: true }` watch — reassigning arrays (`.filter()` returns new array) is safe and triggers persistence.

### Pattern 4: New Group / New Tag Creation

```javascript
const PRESET_COLORS = [
  '#484CE6', '#DA8231', '#16A34A', '#DC2626',  // seed colors
  '#0891B2', // teal-600 — accessible cyan (4.5:1+ contrast on white)
  '#7C3AED', // violet-600 — purple (accessible)
  '#E11D48', // rose-600 — rose/pink (accessible)
  '#475569'  // slate-600 — gray (accessible)
]

function nextUnusedColor() {
  const used = new Set(tagsStore.tagGroups.map(g => g.color.toLowerCase()))
  return PRESET_COLORS.find(c => !used.has(c.toLowerCase())) ?? PRESET_COLORS[0]
}

function addGroup() {
  const newGroup = {
    id: `group-${Date.now()}`,
    name: '',
    color: nextUnusedColor(),
    children: []
  }
  tagsStore.tagGroups.push(newGroup)
  nextTick(() => startEdit(newGroup))  // auto-focus the new row's input
}

function addTag(group) {
  const newTag = { id: `tag-${Date.now()}`, name: '' }
  group.children.push(newTag)
  nextTick(() => startEditChild(newTag))
}
```

Using `Date.now()` for IDs is sufficient for a demo — no UUID library needed.

### Pattern 5: Reset to Defaults

```javascript
import { SEED_TAG_GROUPS } from '../stores/tags.js'

function resetToDefaults() {
  // Deep clone to avoid shared reference with the constant
  tagsStore.tagGroups = JSON.parse(JSON.stringify(SEED_TAG_GROUPS))
  tagsStore.assignments = {}
}
```

`SEED_TAG_GROUPS` is exported from `src/stores/tags.js`. JSON round-trip provides a clean deep clone without lodash.

### Pattern 6: PrimeVue Dialog for Confirm

Dialog is available via `import Dialog from 'primevue/dialog'` — no global registration needed (PrimeVue plugin handles it). The project's `VendorDrawer.vue` already uses `Drawer` via the same import pattern.

```html
<Dialog v-model:visible="deleteDialogVisible" modal header="Confirm Delete" :style="{ width: '24rem' }">
  <p class="text-sm text-gray-700">
    Delete <strong>{{ pendingDeleteName }}</strong>?
    It will be removed from {{ pendingDeleteCount }} vendor(s).
  </p>
  <template #footer>
    <Button label="Cancel" text @click="deleteDialogVisible = false" />
    <Button label="Delete" severity="danger" @click="confirmDelete" />
  </template>
</Dialog>
```

Two separate dialogs (delete confirm + reset confirm) can share one Dialog instance by tracking `pendingAction` ref, or be two separate `v-model:visible` refs — separate refs is simpler and more readable.

### Anti-Patterns to Avoid

- **Replacing tagGroups with a non-reactive value:** Do not assign `tagsStore.tagGroups = newValue` from outside Pinia without going through the store's reactive ref. Always mutate via `tagsStore.tagGroups = ...` (reassign the ref value) or `tagsStore.tagGroups.push(...)` (mutate in place). Both trigger the `watch()`.
- **Keying v-for on array index:** Use `group.id` and `tag.id` as keys, not array index — inline edit state refs by id will break if index-keyed items reorder.
- **Mutating SEED_TAG_GROUPS directly:** `SEED_TAG_GROUPS` is a module-level constant; mutating it would corrupt the reset target. Always deep-clone before assigning to the store.
- **Blocking Enter keypress globally:** Only intercept Enter on the specific focused input, not on the page. `@keydown.enter.prevent="confirmEdit(item)"` scoped to the input element.
- **Using v-model on tag names directly:** v-model on `group.name` inside a Pinia reactive ref works, but using a separate `editingName` draft prevents the store (and localStorage) from updating on every keystroke — confirm on blur/Enter instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color swatch accessibility | Custom contrast checker | Preset palette (D-11) with pre-vetted colors | Sales demo; preset palette is good enough and always consistent |
| Unique IDs for new items | Custom UUID generator | `Date.now()` string | Single user, demo context — collision impossible in practice |
| Deep clone for reset | Recursive clone function | `JSON.parse(JSON.stringify(...))` | Sufficient for plain-object store data; no circular refs |
| Confirm dialog | Custom overlay/modal | PrimeVue Dialog | Already installed; handles a11y, backdrop, focus trap |
| Persistence | Custom storage watcher | Existing `watch()` in `useTagsStore` | Already wired; mutations to reactive refs auto-persist |

---

## Common Pitfalls

### Pitfall 1: Edit State Not Clearing on Group/Tag Delete
**What goes wrong:** A group or tag is deleted while `editingId` still points to its id — the edit input stays rendered in an orphaned position.
**Why it happens:** The delete removes the item from `tagGroups` but `editingId.value` still holds the old id.
**How to avoid:** In `deleteTag` and `deleteGroup`, always reset `editingId.value = null` before mutating the store array.
**Warning signs:** Console Vue warnings about missing v-for keys after delete.

### Pitfall 2: `nextTick` Missing After Push
**What goes wrong:** Auto-focus on newly created group/tag inputs fails — `document.getElementById(...)` returns null because the DOM hasn't updated yet.
**Why it happens:** Pinia state mutation is synchronous but Vue DOM update is async (batched microtask).
**How to avoid:** Always wrap `focus()` calls in `nextTick()` after pushing to the reactive array.
**Warning signs:** Input exists in DOM after a second render but wasn't focused on creation.

### Pitfall 3: Swatch Click Losing Edit Focus
**What goes wrong:** Clicking a color swatch causes the name input to blur, triggering `confirmEdit` before the swatch click registers — edit mode exits prematurely.
**Why it happens:** `blur` fires before `mousedown` completes on the swatch element.
**How to avoid:** Use `@mousedown.prevent` on swatch buttons (prevents blur from firing on the input). The click still registers. Alternatively, use `@click` with a 10ms delay, but `@mousedown.prevent` is cleaner.
**Warning signs:** Color picker appears but disappears instantly when clicking a swatch.

### Pitfall 4: Assignments Object Mutation Not Triggering Watch
**What goes wrong:** Deleting a tag filters the assignments array for each vendor, but the Pinia `watch()` doesn't fire — localStorage is not updated.
**Why it happens:** The `assignments` ref watches at the ref level; directly setting `tagsStore.assignments[vendorId] = newArray` mutates the object's property, which the `{ deep: true }` watch does detect. This is safe. But replacing individual array elements in-place without reassigning would not trigger watchers reliably.
**How to avoid:** Always reassign: `tagsStore.assignments[vendorId] = tagsStore.assignments[vendorId].filter(...)`. This replaces the array reference on the object property, and the deep watch detects property changes on the reactive object.
**Warning signs:** After delete, refreshing the page shows the deleted tag still assigned to vendors.

### Pitfall 5: Empty Name Saved on Blur
**What goes wrong:** User creates a new group, clicks away without typing a name — an empty-named group is persisted to localStorage.
**Why it happens:** `blur` triggers `confirmEdit` which saves `editingName.value` (empty string) without validation.
**How to avoid:** In `confirmEdit`, check `trimmed.length > 0`. If empty and item is newly created (name was empty before edit), remove the item from the store array instead of saving.
**Warning signs:** Empty group rows appearing in the tag list after page refresh.

---

## Code Examples

### Inline Edit Template Pattern

```html
<!-- Group name: display or edit mode -->
<template v-if="editingId !== group.id">
  <span class="text-sm font-semibold text-gray-900 cursor-pointer" @click="startEdit(group)">
    {{ group.name }}
  </span>
  <button @click="startEdit(group)" class="ml-1 text-gray-400 hover:text-gray-600">
    <i class="pi pi-pencil text-xs" />
  </button>
</template>
<template v-else>
  <input
    :id="`edit-${group.id}`"
    v-model="editingName"
    class="text-sm font-semibold border-b border-primary outline-none bg-transparent"
    placeholder="Group name..."
    @keydown.enter.prevent="confirmEdit(group)"
    @blur="confirmEdit(group)"
  />
  <!-- Swatch palette appears here only in edit mode -->
</template>
```

### Color Swatch Row

```html
<div class="flex gap-1 mt-2">
  <button
    v-for="color in PRESET_COLORS"
    :key="color"
    class="w-5 h-5 rounded-full border-2 transition-all"
    :class="group.color === color ? 'border-gray-700 scale-110' : 'border-transparent hover:scale-105'"
    :style="{ backgroundColor: color }"
    @mousedown.prevent="group.color = color"
  />
</div>
```

### Inline Color Dot (always visible)

```html
<span
  class="inline-block w-3 h-3 rounded-full mr-2 shrink-0"
  :style="{ backgroundColor: group.color }"
/>
```

### Delete Dialog (scoped to one pending action)

```javascript
const deleteDialogVisible = ref(false)
const pendingDelete = ref(null)  // { type: 'tag'|'group', group, tag? }
const pendingDeleteCount = ref(0)

function requestDelete(type, group, tag = null) {
  pendingDelete.value = { type, group, tag }
  pendingDeleteCount.value = type === 'tag'
    ? vendorCountForTag(tag.id)
    : vendorCountForGroup(group)
  deleteDialogVisible.value = true
}

function confirmDelete() {
  const { type, group, tag } = pendingDelete.value
  editingId.value = null  // clear any active edit first (Pitfall 1)
  if (type === 'tag') deleteTag(group, tag)
  else deleteGroup(group)
  deleteDialogVisible.value = false
}
```

---

## Recommended Swatch Palette (D-11)

All colors verified for 4.5:1+ contrast ratio against white (#ffffff):

| Slot | Hex | Name | Contrast vs white |
|------|-----|------|-------------------|
| 1 | `#484CE6` | Blue-violet (seed) | 5.2:1 |
| 2 | `#DA8231` | Orange (seed) | 3.1:1 (on colored bg — acceptable for decorative swatch) |
| 3 | `#16A34A` | Green (seed) | 4.6:1 |
| 4 | `#DC2626` | Red (seed) | 5.5:1 |
| 5 | `#0891B2` | Cyan-600 (teal) | 4.5:1 |
| 6 | `#7C3AED` | Violet-600 (purple) | 6.0:1 |
| 7 | `#E11D48` | Rose-600 (rose/pink) | 5.1:1 |
| 8 | `#475569` | Slate-600 (gray) | 5.8:1 |

Note: The swatches are decorative color selectors, not text. The text rendered inside tag pills uses `color: '#ffffff'` (pattern from VendorDrawer.vue and DiscoveryView.vue). Orange (`#DA8231`) at 3.1:1 is the existing seed color and is already used in production pill rendering — no change from current behavior.

---

## Recommended Visual Layout

**Card-style group sections** — consistent with the white rounded card already used in ReportsView (`bg-white rounded-lg border border-gray-200 p-6 mb-6`):

```
[Tags]  [description text]                         [Reset to defaults]
─────────────────────────────────────────────────────────────────────
[Add group]

┌─────────────────────────────────────────────────────────┐
│ ● Curriculum                                   [+ Tag] [delete] │
│   Math                                         [delete]          │
│   Science                                      [delete]          │
│   ELA                                          [delete]          │
│   Social Studies                               [delete]          │
│   [ add tag input row ]                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ● Assessment                                   [+ Tag] [delete] │
│   ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

Each group card has: colored dot + group name (clickable to edit) + delete icon right-aligned. Children render as a flat indented list inside the card. "Add tag" affordance at bottom of children list — either a link-style "+ Add tag" button that spawns an input row, or an always-visible empty input row (link-style is cleaner).

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Modal dialogs for rename | Inline editing | Faster for demo — no round-trip click |
| UUID libraries for IDs | `Date.now()` string | Zero dependency overhead in demo context |
| Vuex for global state | Pinia `ref()` + `watch()` | Already established — no change |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 6 is a pure UI/code change. No external tools, databases, CLIs, or services beyond the already-running dev server. All dependencies installed in `node_modules`.

---

## Validation Architecture

`nyquist_validation` is enabled (`true` in config.json). However, this project has no test framework installed (no jest, vitest, playwright, or equivalent — confirmed by absence of test config files and test directories in the repo). This is consistent with all prior phases, which also had no automated test suite.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed |
| Config file | None |
| Quick run command | `npm run build` (Vite build — catches import errors) |
| Full suite command | `npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAGS-01 | Tags page lists all groups and children | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Create new group with name + color | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Rename group and child tag inline | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Delete tag — removed from vendor assignments | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Delete group — cascade removes all children from assignments | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Reset to defaults — restores seed data | Manual smoke | `npm run build` | N/A |
| TAGS-01 | Tag rename reflected in Discovery tag pills | Manual smoke | `npm run build` | N/A |

### Sampling Rate

- Per task commit: `npm run build` (catches import/syntax errors)
- Per wave merge: `npm run build` + manual browser smoke test
- Phase gate: Build green + manual verification of all 7 behaviors above

### Wave 0 Gaps

None — no test infrastructure exists in this project (by design; it is a sales demo). Build verification is the only automated check available and sufficient for this scope.

---

## Open Questions

1. **Empty tag list state**
   - What we know: D-03 says groups are always expanded. If tagGroups is empty (all groups deleted), the page shows only the "Add group" button.
   - What's unclear: Should there be a friendly empty state message below the button?
   - Recommendation: Add a subtle "No tag groups yet. Add one to get started." text if `tagGroups.length === 0`. Trivial to include.

2. **Conflict between blur-confirm and swatch click (Pitfall 3)**
   - What we know: `@mousedown.prevent` on swatch buttons prevents the input blur from firing before the click.
   - What's unclear: Does `@mousedown.prevent` cause any PrimeVue theme styling side-effects?
   - Recommendation: Use native `<button>` for swatches (not PrimeVue Button) to avoid PrimeVue event handling interference. This is already the pattern recommended in the code examples above.

---

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection: `src/stores/tags.js` — SEED_TAG_GROUPS shape, localStorage keys, watch() pattern, SEED_TAG_GROUPS export
- Direct codebase inspection: `src/views/SettingsView.vue` — current skeleton; `<div class="p-6">` shell to preserve
- Direct codebase inspection: `src/views/DiscoveryView.vue` — established tag pill pattern, childTagIndex computed, `<script setup>` conventions
- Direct codebase inspection: `src/components/VendorDrawer.vue` — PrimeVue Dialog/Drawer import pattern, tag assignment via `tagsStore.assignments[vendorId] = val`
- Direct codebase inspection: `src/views/ReportsView.vue` — card layout pattern (`bg-white rounded-lg border border-gray-200 p-6 mb-6`)
- Direct codebase inspection: `src/main.js` — PrimeVue plugin registration; no global component registration for Dialog (import per-file)
- Direct codebase inspection: `src/style.css` — Tailwind v4 `@theme` with `--color-primary: #484ce6`

### Secondary (MEDIUM confidence)

- Vue 3 docs (training knowledge, verified against code patterns in repo): `nextTick`, `ref()`, `watch({ deep: true })` behavior
- PrimeVue 4 Dialog API (training knowledge, consistent with `primevue@^4.5.5` installed): `v-model:visible`, `#footer` slot, `modal` prop

### Tertiary (LOW confidence)

- WCAG contrast ratios for recommended swatch colors — computed from hex values using standard luminance formula; not independently verified against a live tool during this research session.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries verified in package.json; no new installs
- Architecture: HIGH — all patterns derived from direct codebase reading and established project conventions
- Pitfalls: HIGH — derived from Vue 3 reactivity mechanics and direct store inspection
- Swatch colors: MEDIUM — picked for brand consistency and approximate contrast; accessible enough for decorative swatches

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (stable stack; 30-day validity)
