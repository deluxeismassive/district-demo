---
phase: 10-discovery-page
plan: 01
subsystem: ui
tags: [nuxt-ui-v4, utable, tanstack-table, vueuse, useDebounce, pinia, vue3-composition]

requires:
  - phase: 07-nuxt-scaffold
    provides: app/app.config.ts brand colors; app/app.vue UApp wrapper; tags Pinia store with SEED_TAG_GROUPS + persist:true
  - phase: 08-layout-and-routing
    provides: definePageMeta nav metadata contract (navOrder gap convention); page-meta.d.ts type augmentation
  - phase: 09-server-data-layer
    provides: server/api/vendors.get.ts (27 typed Vendor records); useFetch('/api/vendors') flow-typed wiring on discovery.vue

provides:
  - 27-row UTable on /discovery, server-side rendered as a single payload (header + 27 body rows = 29 <tr tags in SSR HTML)
  - Sortable column headers (6 of 7 columns) via render-function sortHeader helper calling column.toggleSorting()
  - Debounced search filter (UInput + VueUse useDebounce 200ms) filtering on vendor name + category
  - Tag chip cell slot rendering UBadge chips with parent-group hex colors via :style override
  - Row-select stub (@select → selectedVendorId ref) — drawer mount handed off to Plan 10-02
  - @vueuse/core hoisted from transitive peer to explicit dependency

affects: [10-02-drawer, 10-03-tag-assignment, 11-dpa, 12-risk-and-tags]

tech-stack:
  added: ["@vueuse/core@^14.3.0 (hoisted from transitive @nuxt/ui peer to explicit dep)"]
  patterns:
    - "sortHeader render-function helper (closure returns ({column}) => h(UButton,...))"
    - "useDebounce + manual computed filter (instead of UTable's v-model:global-filter)"
    - "UBadge color=neutral + :style hex injection (lets style override neutral theming)"
    - "@select handler signature (event, row) with row.original.<field> read pattern"
    - "Page-level selectedVendorId ref as drawer-state-lifting anchor (drawer mount in 10-02)"

key-files:
  created: []
  modified:
    - app/pages/discovery.vue (13 lines → 155 lines: full UTable + filter + chip slot + @select stub)
    - package.json (+1 dep: @vueuse/core)
    - package-lock.json (no version change — was already at 14.3.0 transitively)

key-decisions:
  - "TableColumn<any>[] over TableColumn<VendorRow>[] — row shape extends Vendor with a `tags` array; using `any` avoids a separate row-shape type (research §1 Open Question #4)"
  - "Explicit @vueuse/core install over transitive peer — guards against future @nuxt/ui upgrades that might drop @vueuse/core from peers (research §9 + Pitfall #13)"
  - "tagsAssign column reserved for Plan 10-03 — NOT added in 10-01 to keep this plan's surface minimal (research §6, ROADMAP SC#3)"
  - "VendorDrawer mount deferred to Plan 10-02 — selectedVendorId ref is wired and updated by @select, but no drawer component is mounted yet (plan §interfaces stub note)"
  - "TagChip type alias declared inline in discovery.vue rather than exported from shared/types — single use, narrow type-narrowing scope; if Plan 10-02 needs it, promote to shared/types/data.ts then"

patterns-established:
  - "sortHeader(label) helper: closes over UButton (resolveComponent), returns ({column}) => h() — keeps the columns array a one-liner-per-column. Phase 11 DPA table will reuse verbatim."
  - "Manual debounced filter: const search = ref('') + useDebounce(search, 200) + filteredRows computed reading debouncedSearch — explicit, grep-able, exposes filteredRows.length for the count readout."
  - "UBadge color='neutral' variant='solid' + :style={{backgroundColor: hex, color: '#fff'}} — the only way to override Nuxt UI's color presets with a project-specific hex. Phase 11 DPA status badges will reuse this pattern with DPA_STATUS_COLORS map."
  - "Drawer state lifting via selectedVendorId at page level (single ref) — drawer is mounted ONCE at page level, never inside table row slot (avoids portal-mount-per-row anti-pattern)."

requirements-completed: []  # PAGE-01 is multi-plan; remains open until 10-02 + 10-03 close drawer + tag-assign.

duration: ~25min
completed: 2026-05-21
---

# Phase 10 Plan 01: Discovery Table Surface Summary

**UTable with 27 vendor rows now SSRs on /discovery, with sortable headers, debounced name+category filter, tag-chip cells reading from Pinia, and a row-select stub ready for the Plan 10-02 drawer hand-off.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-05-21T22:06Z (approx)
- **Completed:** 2026-05-21T22:31Z
- **Tasks:** 2 / 2
- **Files modified:** 3 (app/pages/discovery.vue, package.json, package-lock.json)

## Accomplishments

- **Table surface live:** /discovery SSRs all 27 vendors in a single payload (29 `<tr` tags total: 1 header + 27 body + 1 separator). No `<ClientOnly>` wrap; no hydration flicker for the table chrome itself.
- **Filter works:** UInput v-model bound to a `search` ref, debounced via `useDebounce(search, 200)`, feeds a `filteredRows` computed filtering on `name` + `category` (lowercase-includes). `27 vendors` count readout in the page header reflects `filteredRows.length`.
- **Sortable headers (6 of 7):** Vendor Name / Category / Frequency / Last Seen / Users / Students all sortable via `sortHeader(label)` render-function helper invoking `column.toggleSorting()`. Default sort = name asc.
- **Chip slot in place:** `#tags-cell` slot renders `UBadge` chips with parent-group hex backgrounds (`#484ce6` Curriculum / `#da8231` Assessment / `#16a34a` Communication / `#dc2626` Administration). Initial assignments empty (Pinia persist plugin hydrates client-side); chips will populate once Plan 10-03 wires the write-back path.
- **Dependency hoisted:** `@vueuse/core@^14.3.0` moved from transitive `@nuxt/ui` peer to explicit `dependencies` in `package.json` — guards against future Nuxt UI peer-dep changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify-then-install @vueuse/core + script-setup rewire** — `dad1345` (feat)
2. **Task 2: Template rewrite with UInput + UTable + slots + SSR probe** — `f1c2602` (feat)

_(Plan metadata + STATE/ROADMAP update commit follows after self-check.)_

## Files Created/Modified

- `app/pages/discovery.vue` — expanded from the Phase 9 minimal demo (13 lines) into the canonical Discovery table host (155 lines): imports `h`, `resolveComponent`, `useDebounce`, `TableColumn`, `useTagsStore`; defines `sortHeader`, `columns`, `filteredRows`, `tableRows`, `childTagIndex`, `selectedVendorId`, `onRowSelect`; template renders `UInput` + `UTable` (with `#tags-cell` + `#empty` slots).
- `package.json` — added `"@vueuse/core": "^14.3.0"` to `dependencies`.
- `package-lock.json` — no semver change (already at 14.3.0 as a transitive peer of `@nuxt/ui@4.8.0`); npm only updated the lockfile's top-level dep pointer.

## Verification

**Static probes (all green):**
- `useFetch('/api/vendors'` preserved (Phase 9 wiring): 1 occurrence
- `useDebounce`: 2 occurrences (import + usage)
- `sortHeader`: 7 occurrences (1 fn def + 6 column refs)
- `@select="onRowSelect"`: 1 occurrence (UTable binding)
- `#tags-cell`: 1 occurrence (slot definition)
- `@vueuse/core` in package.json dependencies: present (^14.3.0)
- Negative probes: NO `@row-click`, NO `<ClientOnly`, NO `sortable: true`, NO `<VendorDrawer`, NO `tagsAssign`

**Live dev-server SSR probe (port 3000, HTTP 200):**
- HTML size: 75,750 bytes
- `<tr` tag count: **29** (≥28 target — 1 header + 27 body + 1 separator)
- `27 vendors` readout: present (proves `filteredRows.length === 27` at SSR time)
- Sample vendor names (Google Classroom, Khan Academy, Quizlet): all 3 present

**Type/build:**
- `npm run typecheck` → exit 0
- `npm run build` → exit 0; SSR chunks emitted under `.output/server/chunks/`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] useTagsStore not auto-imported**
- **Found during:** Task 1 (typecheck)
- **Issue:** Plan §interfaces block said `useTagsStore` is "auto-imported via @pinia/nuxt — DO NOT redeclare", but typecheck surfaced `TS2552: Cannot find name 'useTagsStore'`. @pinia/nuxt v0.11.3 does NOT auto-import store factories from `app/stores/**` — that auto-import behavior was removed in v0.7+ in favor of explicit imports.
- **Fix:** Added explicit `import { useTagsStore } from '~/stores/tags'`. Inline comment in the file documents the deviation.
- **Files modified:** `app/pages/discovery.vue` (line 10)
- **Commit:** `dad1345`

**2. [Rule 3 - Blocking] meta.class string shape rejected by TableColumn type**
- **Found during:** Task 1 (typecheck)
- **Issue:** Plan §interfaces "Exact column array" snippet had `meta: { class: 'min-w-[12rem]' }` (string), but Nuxt UI v4's `ColumnMeta` interface (`node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts` lines 10-13) requires `class: { th?: string, td?: string }`. Verbatim copy of the plan snippet produced 7 typecheck errors (`Type 'string' has no properties in common with type ...`).
- **Fix:** Rewrote all 7 column `meta.class` entries as `{ th: '<classes>', td: '<classes>' }` — width classes applied to both header and body cells for visual consistency. Inline comment in the file documents the deviation.
- **Files modified:** `app/pages/discovery.vue` (lines 89-101)
- **Commit:** `dad1345`

**3. [Rule 3 - Blocking] Implicit `any` on map/sort callbacks**
- **Found during:** Task 1 (typecheck — strict mode)
- **Issue:** Plan §interfaces "childTagIndex + tableRows computed" snippet used `.map((id) => ...)` / `.filter((t) => ...)` / `.sort((a, b) => ...)`. Under TS strict mode (Nuxt 4 default), these callback params surface `TS7006: Parameter 'X' implicitly has an 'any' type`.
- **Fix:** Declared inline `type TagChip = { id: string; name: string; parentColor: string; parentId: string }` plus explicit annotations: `.map((id: string) => ...)`, `.filter((t): t is TagChip => Boolean(t.name))` (type predicate narrows to non-undefined name), `.sort((a: TagChip, b: TagChip) => ...)`. Inline comment documents the deviation.
- **Files modified:** `app/pages/discovery.vue` (lines 26-27, 40-52)
- **Commit:** `dad1345`

**4. [Informational — not a code change] Build artifact path differs from plan claim**
- **Found during:** Task 2 (build verification)
- **Issue:** Plan claimed `npm run build` produces `.output/server/chunks/routes/_/discovery.html`. Actual Nuxt 4.4.6 SSR build emits all routes through a single `.output/server/chunks/routes/renderer.mjs` chunk plus per-API-route `.output/server/chunks/routes/api/*.mjs` — there is NO pre-rendered HTML file at the claimed path because Nuxt's default Nitro SSR strategy is on-demand render, not static prerender.
- **Resolution:** SSR was verified live via `curl http://localhost:3000/discovery` against `npm run dev` (the actual canonical SSR-probe pattern for non-prerendered routes). HTML payload contained all 27 vendor rows. No file change needed.
- **Phase 13 note:** When `nuxi generate` is enabled (Phase 13 deployment), per-page `.html` files WILL appear under `.output/public/` — that's a different code path from `nuxi build`. The plan's path assumption conflated `generate` with `build`.

### Carry-Forward Lesson (for Plan 10-02 + 10-03 + future research-vs-reality)

The plan's `<interfaces>` block was a verbatim copy from `10-RESEARCH.md` snippets. Three of the seven snippets diverged from the actual installed type definitions / runtime behavior — same class of drift the Phase 9 carry-forward lesson predicted ("don't trust counts inferred from comments — sample actual files"). For Plan 10-02 and 10-03:

1. **Don't trust auto-import claims for non-Nuxt-builtin libraries.** @pinia/nuxt, @vueuse/core, etc. each have their own auto-import policy; verify against `.nuxt/imports.d.ts` or fail-forward via typecheck.
2. **Don't trust TableColumn `meta` shapes from research notes.** Read the Nuxt UI v4 component d.ts file directly (`node_modules/@nuxt/ui/dist/runtime/components/<Comp>.vue.d.ts`) before authoring options arrays. Plan 10-02 USlideover and 10-03 USelectMenu likely have similar gotchas — read the d.ts files first.
3. **Don't assume `.output/server/chunks/routes/<page>.html` exists for `nuxi build`.** Only `nuxi generate` emits per-page HTML. SSR probes should curl `localhost:<port>` against `npm run dev`, not grep build artifacts.

## Carry-Forward for Plan 10-02

- `selectedVendorId: Ref<string | null>` is wired and updated by `@select` on UTable.
- `onRowSelect(_event, row)` handler captures `row.original.vendorId`.
- Plan 10-02 layers on top of this by adding:
  - `const selectedVendor = computed(() => vendors.value.find((v) => v.vendorId === selectedVendorId.value) ?? null)`
  - `const drawerOpen = computed({ get: () => selectedVendorId.value !== null, set: (v) => { if (!v) selectedVendorId.value = null } })`
  - `<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />` mount inside the page-level `<div class="p-6">` (after `</UTable>`).
- VendorDrawer component itself extracts to `app/components/VendorDrawer.vue` per research §8 and ROADMAP Phase 10 SC#2.

## Known Stubs

- **`selectedVendorId` ref is set but not consumed visually** — clicking a row updates it, but nothing renders in response yet. Intentional: drawer mount is Plan 10-02's responsibility. Not a bug.
- **Tag chip cells initially empty** — `tagsStore.assignments` starts at `{}` (Pinia persist plugin is client-only, hydrates after first paint). When a user first visits, no chips appear. After Plan 10-03 lands the per-row USelectMenu, this becomes the assignment surface.

## Self-Check: PASSED

- File `app/pages/discovery.vue` exists: FOUND (155 lines)
- Commit `dad1345` exists: FOUND
- Commit `f1c2602` exists: FOUND
- `@vueuse/core` in package.json dependencies: FOUND (^14.3.0)
- Typecheck exit 0: VERIFIED
- Build exit 0: VERIFIED
- SSR probe (29 `<tr` tags + "27 vendors" + 3 sample names): VERIFIED
