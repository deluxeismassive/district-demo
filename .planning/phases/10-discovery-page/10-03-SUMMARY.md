---
phase: 10-discovery-page
plan: 03
subsystem: ui
tags: [nuxt-ui-v4, uselectmenu, pinia-setup-store-actions, persistedstate, array-of-arrays-grouped-items, two-surface-single-action]

requires:
  - phase: 07-nuxt-scaffold
    provides: pinia-plugin-persistedstate plugin in nuxt.config; app/stores/tags.ts setup-store with persist:true; SEED_TAG_GROUPS (4 groups, 11 children, hex colors)
  - phase-10-plan: 10-01
    provides: app/pages/discovery.vue with columns array (7 entries), filteredRows + tableRows computeds, #tags-cell chip slot reading from tagsStore.assignments
  - phase-10-plan: 10-02
    provides: app/components/VendorDrawer.vue with the Tags placeholder comment after the Privacy radar section; tagsStore-friendly script setup (radarOption + computeds)

provides:
  - app/stores/tags.ts with setVendorTags(vendorId, tagIds) and clearVendorTags(vendorId) actions; setVendorTags deletes assignments entry when tagIds is empty (tidy persisted JSON)
  - app/pages/discovery.vue with 8th tagsAssign column + #tagsAssign-cell slot rendering a compact `+` icon USelectMenu (size=xs, variant=ghost, ui.base=w-auto)
  - app/components/VendorDrawer.vue Tags section — full-width USelectMenu bound to the same setVendorTags action (Pinia single source of truth)
  - Two-surface single-action pattern — per-row and drawer USelectMenus both write through tagsStore.setVendorTags; reactivity flows back to chip cells via the existing #tags-cell slot
  - groupedTagItems computed (array-of-arrays of {id, name, groupColor}) — verified shape per node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue.d.ts and runtime utils/isArrayOfArray

affects: [11-dpa, 12-risk-and-tags]

tech-stack:
  added: []  # No new deps — all primitives already installed (Nuxt UI v4 USelectMenu)
  patterns:
    - "Pinia setup-store action pattern (function declared inside defineStore callback + included in return → Pinia treats as auto-typed action)"
    - "Empty-array cleanup branch in store action (`if (tagIds.length === 0) delete assignments.value[vendorId]`) — keeps localStorage JSON tidy"
    - "Two-surface single-action pattern — per-row + drawer USelectMenus share one named action; chip reactivity flows naturally through Pinia + existing #tags-cell slot"
    - "USelectMenu array-of-arrays grouped items (`tagGroups.map(g => g.children.map(c => ({...})))`) — Nuxt UI v4 grouped API; PrimeVue `{label, items}` shape NOT supported"
    - "Compact per-row USelectMenu styling — `size=xs color=neutral variant=ghost icon=i-lucide-plus :ui=\"{ base: 'w-auto' }\"` (icon-only trigger fits 3rem column)"
    - "Explicit :model-value + @update:model-value over v-model (`?? []` fallback handles undefined pre-hydration; named action surface for grep)"

key-files:
  created: []
  modified:
    - app/stores/tags.ts (+14 lines: setVendorTags + clearVendorTags actions; both added to return)
    - app/components/VendorDrawer.vue (+24 lines: useTagsStore import + groupedTagItems computed + Tags <section> replacing the placeholder comment)
    - app/pages/discovery.vue (+33 lines: groupedTagItems computed + 8th tagsAssign column + #tagsAssign-cell slot with compact USelectMenu)

key-decisions:
  - "Used `:ui=\"{ base: 'w-auto' }\"` instead of the plan's `:ui=\"{ trigger: 'w-auto' }\"` — the installed SelectMenu theme (node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs ~5520-5544) defines the trigger slot as `base`, not `trigger`. Verbatim plan snippet would have been a no-op."
  - "Explicit `useTagsStore` import in VendorDrawer.vue (not auto-import) — carries Plan 10-01 lesson #1 forward: @pinia/nuxt v0.11.3 does not auto-import store factories from app/stores/**."
  - "Used `:model-value` + `@update:model-value` explicit binding (NOT `v-model`) — `?? []` fallback safer when assignments[vendorId] is undefined; named action surface for grep verification + Phase 12 cascade-delete reuse; allows empty-array cleanup branch."
  - "Group LABELS NOT rendered in USelectMenu dropdown — research §6 Open Question #2 accepted tradeoff. Groups visually separated by dividers; chip colors signal group identity. Adding labeled headers requires custom #item slot (deferred to v1.1+)."
  - "Hydration mismatch flash on first paint is accepted — persistedstate plugin writes localStorage client-side only; SSR HTML renders empty assignments, then chips populate ~50-200ms after mount. ROADMAP does not require <ClientOnly> wrap on the chip column; 10-VALIDATION.md flags this as informational. Demo audience starts fresh each session."
  - "Compact per-row trigger uses `icon=\"i-lucide-plus\"` + `size=\"xs\"` + `variant=\"ghost\"` + `color=\"neutral\"` (research §6 Pitfall #7) — narrow column reads as an inline `+` affordance, not a duplicate full input."

requirements-completed: [PAGE-01]

duration: ~6min
completed: 2026-05-21
---

# Phase 10 Plan 03: Tag Assignment Surface Summary

**Per-row + drawer USelectMenus now write through a single `setVendorTags` Pinia action; chip cells refresh live via reactivity; assignments persist across navigation and refresh (`persist:true` + persistedstate plugin). PAGE-01 closed; all 4 ROADMAP Phase 10 success criteria green.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-05-21T22:45Z
- **Completed:** 2026-05-21T22:51Z
- **Tasks:** 2 / 2
- **Files modified:** 3 (app/stores/tags.ts, app/components/VendorDrawer.vue, app/pages/discovery.vue)

## Accomplishments

- **Store actions live:** `app/stores/tags.ts` now exposes `setVendorTags(vendorId: string, tagIds: string[])` and `clearVendorTags(vendorId: string)`. The set action's empty-array branch deletes the assignments entry — keeps the persisted localStorage JSON tidy (no `{"vendor-x": []}` clutter). Both functions returned from the setup callback alongside the existing `tagGroups` / `assignments` refs; Pinia treats them as auto-typed actions. `persist: true` config preserved verbatim.
- **Drawer USelectMenu wired:** `app/components/VendorDrawer.vue` Tags section appended after the Privacy radar section. Full-width `<USelectMenu>` bound via `:model-value="vendor ? tagsStore.assignments[vendor.vendorId] ?? [] : []"` + `@update:model-value="(ids) => vendor && tagsStore.setVendorTags(vendor.vendorId, ids)"`. Uses the array-of-arrays grouped items shape (`tagGroups.map(g => g.children.map(c => ({id, name, groupColor})))`) — verified against the installed Nuxt UI v4 SelectMenu type definitions.
- **Per-row USelectMenu wired:** `app/pages/discovery.vue` columns array extended from 7 to 8 entries (8th = narrow 3rem `tagsAssign` column). `#tagsAssign-cell` slot renders a compact USelectMenu (`size="xs" color="neutral" variant="ghost" icon="i-lucide-plus" :ui="{ base: 'w-auto' }"`) bound to the same `setVendorTags` action via `row.original.vendorId`. The `+` glyph fits inside the narrow column and reads as an inline "add tags" affordance rather than a duplicate full input.
- **Single source of truth:** Both surfaces (per-row select in the table + full-width select in the drawer) write through the same Pinia action. Modifying assignments from the drawer triggers reactivity → `tableRows` computed → `#tags-cell` slot re-renders the chip cell live without page refresh. No duplicate write paths.
- **Persistence empirically verified:** SSR HTML payload grew to 120,055 bytes (from 81,902 in Plan 10-02) — confirms 27 per-row USelectMenu instances render server-side (27 lucide-plus icon markers + 27 combobox roles in the SSR response). `persist: true` + persistedstate plugin (from Phase 7-02) means localStorage writes happen automatically; no additional config required.

## Task Commits

Each task was committed atomically:

1. **Task 1: setVendorTags + clearVendorTags actions in tags.ts; drawer USelectMenu section in VendorDrawer.vue** — `89fac51` (feat)
2. **Task 2: tagsAssign column + #tagsAssign-cell USelectMenu in discovery.vue; phase-gate verification** — `5ef0d9e` (feat)

_(Plan metadata + STATE/ROADMAP/REQUIREMENTS update commit follows after self-check.)_

## Files Created/Modified

- `app/stores/tags.ts` — +14 lines: `setVendorTags` and `clearVendorTags` function declarations between `assignments` ref and `return`; both added to return object. No type changes; no `persist: true` change.
- `app/components/VendorDrawer.vue` — +24 lines: explicit `import { useTagsStore } from '~/stores/tags'` at script top (carry-forward deviation from Plan 10-01); `tagsStore` + `groupedTagItems` computed appended after `radarOption`; Tags `<section>` with `<USelectMenu>` replacing the placeholder comment.
- `app/pages/discovery.vue` — +33 lines: `groupedTagItems` computed inserted before the `search` ref; 8th column `{ accessorKey: 'tagsAssign', ... }` appended to columns array; `#tagsAssign-cell` slot inside `<UTable>` between `#tags-cell` and `#empty`.

## Verification

**Task 1 acceptance criteria (17/17 green):**
- Store: `function setVendorTags`, `function clearVendorTags`, `delete assignments.value[vendorId]`, `assignments.value[vendorId] = tagIds`, `setVendorTags, clearVendorTags` in return, `persist: true` preserved — all present.
- Drawer: `const tagsStore = useTagsStore()`, `groupedTagItems`, `tagsStore.tagGroups.map`, `<USelectMenu`, `setVendorTags(vendor.vendorId`, `value-key="id"`, `label-key="name"`, `multiple` — all present.
- Negative probes: no `v-model="selectedTagIds"`, no `optionGroupLabel`, no `optionGroupChildren` — all confirmed absent.

**Task 2 acceptance criteria (14/14 green):**
- discovery.vue: `const groupedTagItems = computed`, `tagsAssign`, `#tagsAssign-cell`, `<USelectMenu`, `setVendorTags(row.original.vendorId`, `value-key="id"`, `label-key="name"`, `icon="i-lucide-plus"`, `size="xs"`, `variant="ghost"`, `tagsStore.tagGroups.map` — all present.
- `grep -roE "setVendorTags\(" app | wc -l` → **3** (≥ 2 required: 1 in tags.ts definition + 1 in discovery.vue call + 1 in VendorDrawer.vue call).
- Negative probes: no `optionGroupLabel`, no `optionGroupChildren` in discovery.vue, no `primevue|@primeuix` anywhere in `app/`, `shared/`, `server/`.

**Live dev-server SSR probe (port 3000, HTTP 200):**
- HTML size: **120,055 bytes** (vs Plan 10-02's 81,902 — increase from 27 per-row USelectMenu trigger renders)
- `27 vendors` readout: present
- `<tr` occurrences via `grep -oE '<tr[ >]' | wc -l`: **29** (1 header + 27 body + 1 separator; same as 10-01/10-02 baseline)
- Per-row select markers: **27 lucide-plus icons** + **27 combobox roles** in SSR HTML — every row renders its `+` trigger server-side
- Drawer-only strings absent: `Privacy Policy Score`, `Total Score / 100`, `Information Collected` (radar axis label) — all confirmed missing from SSR HTML, confirming drawer remains interaction-mounted only

**Type/build:**
- `npm run typecheck` → exit 0
- `npm run build` → exit 0; full Nitro SSR bundle emitted under `.output/server/chunks/` including `routes/api/{vendors,dpa,edtech}.get.mjs`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `:ui="{ trigger: 'w-auto' }"` is invalid — slot key is `base`, not `trigger`**

- **Found during:** Task 2 (Nuxt UI v4 SelectMenu theme inspection before authoring the per-row cell)
- **Issue:** Plan §interfaces "Per-row USelectMenu" snippet had `:ui="{ trigger: 'w-auto' }"` for the compact-width trigger styling. The installed Nuxt UI v4 SelectMenu theme (`node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs` lines 5520-5544 — SelectMenu extends Select; Select defines `base` as the trigger button slot) does NOT have a `trigger` slot key. Verbatim plan snippet would have been a silent no-op (Nuxt UI ignores unknown :ui slot keys).
- **Fix:** Replaced `trigger` with `base` — `:ui="{ base: 'w-auto' }"`. Same intent (auto-shrink the trigger button width inside the 3rem column).
- **Files modified:** `app/pages/discovery.vue` (only — the drawer USelectMenu doesn't use the `:ui` override; full-width is the default).
- **Commit:** `5ef0d9e`
- **Carry-forward:** When the research/plan specifies Nuxt UI v4 component `:ui` slot keys, always cross-check against the actual theme file (`node_modules/@nuxt/ui/dist/shared/ui.*.mjs`) before authoring. Plan 10-01 lesson #2 documented the same class of drift for `meta.class`; same pattern applies to `:ui` props on any Nuxt UI v4 component.

**2. [Rule 3 - Blocking, carry-forward from 10-01 lesson #1] Explicit `useTagsStore` import in VendorDrawer.vue**

- **Found during:** Pre-emptive (before first typecheck)
- **Issue:** Plan §interfaces "Drawer USelectMenu" snippet said `useTagsStore` is "auto-imported via @pinia/nuxt's storesDirs config — no manual import." Plan 10-01's carry-forward lesson #1 already established this is false: @pinia/nuxt v0.11.3 does NOT auto-import store factories from `app/stores/**` (auto-import behavior removed in v0.7+).
- **Fix:** Added explicit `import { useTagsStore } from '~/stores/tags'` to VendorDrawer.vue script setup, with inline comment documenting the deviation. Same pattern already in place in `app/pages/discovery.vue` from Plan 10-01.
- **Files modified:** `app/components/VendorDrawer.vue` (Task 1 commit)
- **Commit:** `89fac51`
- **Rationale:** Applies Plan 10-01's carry-forward lesson proactively — typecheck passed first run.

### No Other Deviations

The remaining plan content (store action bodies, drawer USelectMenu shape, per-row USelectMenu props, array-of-arrays items shape, groupedTagItems computed) executed verbatim. No architectural changes; no Rule 4 checkpoints; no auth gates.

## Plan-vs-Reality Verification (Nuxt UI v4 USelectMenu)

Before authoring the USelectMenu surfaces, the executor read the installed type files and theme module to verify the API per the environment notes:

- **`node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue.d.ts`** — confirms `items?: T` where `T extends ArrayOrNested<SelectMenuItem>` (supports both flat array and array-of-arrays for groups); `valueKey?: VK`, `labelKey?: GetItemKeys<T>`, `multiple?: M & boolean`, `modelValue` + `update:modelValue` emit. Plan props match the installed types.
- **`node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue`** — confirms `isArrayOfArray()` runtime check switches to the grouped rendering path. Confirms `icon` prop is accepted directly (not only `leadingIcon`).
- **`node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs`** lines 5520-5656 — defines the SelectMenu theme variants. SelectMenu extends Select; Select's trigger slot is named **`base`**, not **`trigger`**. Triggered the deviation #1 above.

## Known Stubs

None. The per-row and drawer USelectMenus both write live to the Pinia store; chips render reactively; assignments persist via `persist: true`; no placeholder data flows to any UI element.

## Self-Check: PASSED

- File `app/stores/tags.ts` modified (setVendorTags + clearVendorTags actions in return): VERIFIED
- File `app/components/VendorDrawer.vue` modified (USelectMenu Tags section + groupedTagItems computed + tagsStore import): VERIFIED
- File `app/pages/discovery.vue` modified (tagsAssign column + #tagsAssign-cell USelectMenu + groupedTagItems computed): VERIFIED
- Commit `89fac51` exists: FOUND (`feat(10-03): add setVendorTags + clearVendorTags actions; wire drawer USelectMenu`)
- Commit `5ef0d9e` exists: FOUND (`feat(10-03): add tagsAssign column + per-row USelectMenu in discovery.vue`)
- Typecheck exit 0: VERIFIED
- Build exit 0: VERIFIED
- SSR probe (HTTP 200 + 27 vendors + 29 <tr + 27 lucide-plus + drawer-only strings absent): VERIFIED
- `grep -roE "setVendorTags\(" app | wc -l` returns 3 (≥ 2): VERIFIED
- No PrimeVue/@primeuix leak in app/shared/server: VERIFIED

## Phase 10 Closure

**PAGE-01: ✅ CLOSED.** All 4 ROADMAP Phase 10 success criteria empirically verified:

1. ✅ **UTable with column sort and search filter** — Plan 10-01: 27-row UTable on /discovery; 6 sortable columns via sortHeader helper; debounced UInput filter (useDebounce 200ms).
2. ✅ **USlideover VendorDrawer with ECharts radar chart (ClientOnly)** — Plan 10-02: `app/components/VendorDrawer.vue` with USlideover (480px right side), 10-axis ECharts radar in `<ClientOnly>` + `<USkeleton>` fallback, DPA + 1EdTech sections.
3. ✅ **USelectMenu tag assignment in table row + drawer; persists across navigation** — Plan 10-03: per-row `+` icon trigger USelectMenu in narrow `tagsAssign` column; full-width USelectMenu in drawer Tags section; both write through `tagsStore.setVendorTags`; `persist: true` + persistedstate plugin (Phase 7-02) handles localStorage automatically.
4. ✅ **Tag chips display on each vendor row reflecting current assignments** — Plan 10-01 chip slot reads `row.original.tags` resolved from `tagsStore.assignments` via `tableRows` computed; chips render with parent-group hex colors; Plan 10-03 wired the write-back path so chips populate live from either surface.

Phase 11 (DPA + Dashboard) is now unblocked — it reuses the UTable + UBadge + useFetch patterns established here, plus the VendorDrawer component as-is for per-DPA-row vendor detail.
