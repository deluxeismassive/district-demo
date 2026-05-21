---
phase: 10-discovery-page
plan: 02
subsystem: ui
tags: [nuxt-ui-v4, uslideover, vchart-clientonly, useFetch-dedup, defineModel-open, page-level-state-lifting, opportunistic-cleanup]

requires:
  - phase: 07-nuxt-scaffold
    provides: app/app.vue UApp wrapper (USlideover portal target); nuxt-echarts module with RadarChart + RadarComponent registered; shared/utils/riskLabels.ts color hex maps
  - phase: 09-server-data-layer
    provides: /api/dpa and /api/edtech Nitro routes returning typed DpaRecord[] / EdtechRecord[]; shared/types/data.ts auto-imported interfaces
  - phase-10-plan: 10-01
    provides: app/pages/discovery.vue with selectedVendorId ref + onRowSelect handler on UTable @select; useFetch('/api/vendors') flow-typed wiring

provides:
  - app/components/VendorDrawer.vue (auto-imported Nuxt 4 component, ~180 lines) — USlideover with v-model:open, 480px width via :ui content slot, side="right", Usage/DPA/1EdTech/Privacy sections, 10-axis ECharts radar in <ClientOnly> with <USkeleton> fallback
  - app/pages/discovery.vue extended with selectedVendor computed, drawerOpen get/set computed, and <VendorDrawer v-model:open=drawerOpen :vendor=selectedVendor /> mount
  - Pattern: useFetch in a child component (deduped by URL across drawer opens — research Pitfall #11)
  - Pattern: ClientOnly + USkeleton fallback for interaction-mounted ECharts (reconciles ROADMAP SC#2 with Phase 7 anti-pattern — research §5)
  - Pattern: page-level selectedVendorId + selectedVendor + drawerOpen computed trio (research §8)
  - Opportunistic cleanup: src/views/DiscoveryView.vue + src/components/VendorDrawer.vue deleted (no longer referenced; reduces grep noise — research §10)

affects: [10-03-tag-assignment, 11-dpa, 12-risk-and-tags]

tech-stack:
  added: []  # no new deps — all primitives already installed (Nuxt UI v4 USlideover/UBadge/USeparator/USkeleton; nuxt-echarts VChart)
  patterns:
    - "USlideover v-model:open + :ui content slot for 480px width (research §4)"
    - "defineModel<boolean>('open', { default: false }) — Vue 3.4+ / Nuxt 4 (Pinia store actions handle assignment writes; drawer reads via props)"
    - "useFetch in nested component with default: () => [] factory + computed lookup maps"
    - "<ClientOnly>{<VChart>}<template #fallback><USkeleton/></template></ClientOnly> — interaction-mounted chart pattern"
    - "Page-level drawer state lifting via computed get/set on selectedVendorId (single ref, single drawer instance)"
    - "Explicit DpaRecord / EdtechRecord type annotations on .map callbacks (continues Plan 10-01 lesson #3 — TS strict implicit any)"

key-files:
  created:
    - app/components/VendorDrawer.vue (180 lines: USlideover with 4 sections + radar chart + DPA/1EdTech sub-fetches)
  modified:
    - app/pages/discovery.vue (+16 lines: selectedVendor + drawerOpen computeds + <VendorDrawer> mount; existing table/filter/chip logic untouched)
  deleted:
    - src/views/DiscoveryView.vue (v0.5.0 PrimeVue-based Discovery view — broken since Plan 09-01 deleted src/data/*.js)
    - src/components/VendorDrawer.vue (v0.5.0 PrimeVue-based drawer — broken since Plan 09-01 deleted src/data/*.js)

key-decisions:
  - "Drawer extracted to app/components/VendorDrawer.vue (research §8) — Phase 11 DPA view will reuse it; inlining in discovery.vue would force Phase 11 to re-extract"
  - "VChart wrapped in <ClientOnly> DESPITE Phase 7 'no double-wrap' pitfall — reconciled in research §5: the drawer is interaction-mounted (never SSRs), so ClientOnly is safe and matches ROADMAP SC#2 verbatim wording. The Phase 7 pitfall applies only to charts in the INITIAL SSR payload (Phase 12 Risk donut)"
  - "Opportunistic delete of src/views/DiscoveryView.vue + src/components/VendorDrawer.vue (research §10 last paragraph) — both files were already dead code since Plan 09-01 (referenced deleted src/data/*.js); removing them now reduces grep noise for the rest of Phase 10 and Phases 11-12"
  - "Tags section deliberately omitted from VendorDrawer.vue — Plan 10-03 owns the USelectMenu surface. Adding it now would block Plan 10-03's grep verification (which checks for setVendorTags wiring layered on top of an existing select)"
  - "Explicit DpaRecord/EdtechRecord annotations on .map((d: DpaRecord) => ...) — proactively applies Plan 10-01 lesson #3 (TS strict mode flags implicit any on Nuxt 4 + Vue SFC TS compilation). Verbatim 'd =>' from research code example B would have failed typecheck"
  - "Drawer uses :description=vendor?.category for the USlideover description prop (research §4 + interface block) — replaces v0.5.0's inline 'category as subtitle' pattern and lets the component's default header layout render category as a subtle subtitle under the vendor name"

requirements-completed: []  # PAGE-01 remains open — table (10-01) + drawer (10-02) green; tag-assign still requires 10-03 to close

duration: ~7min
completed: 2026-05-21
---

# Phase 10 Plan 02: VendorDrawer Surface Summary

**USlideover-based VendorDrawer extracted to app/components/, wired into discovery.vue via page-level selectedVendor + drawerOpen computeds, with 10-axis ECharts radar rendering inside ClientOnly + USkeleton fallback. v0.5.0 PrimeVue Discovery+Drawer dead code swept.**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-05-21T22:34Z
- **Completed:** 2026-05-21T22:41Z
- **Tasks:** 2 / 2
- **Files:** +1 created (VendorDrawer.vue), 1 modified (discovery.vue), 2 deleted (src/views/DiscoveryView.vue + src/components/VendorDrawer.vue)

## Accomplishments

- **Drawer surface live:** `app/components/VendorDrawer.vue` (180 lines) auto-imported via Nuxt 4 component convention — no manual import in discovery.vue. Builds the canonical Nuxt UI v4 vendor detail panel: USlideover (v-model:open, 480px width, side="right", dismissible=true defaults preserved), 4 body sections (Usage / DPA / 1EdTech / Privacy radar) with USeparator dividers between them.
- **ECharts radar in ClientOnly:** `<VChart :option="radarOption" autoresize style="height: 320px; width: 100%">` wrapped in `<ClientOnly>` with `<USkeleton class="h-[320px] w-full">` fallback. RADAR_AXES const has all 10 axis labels verbatim from v0.5.0 (Information Collected / Use of Information / Data Sharing / Security Measures / User Rights / Retention Period / Compliance with Laws / Updates to Privacy Policy / Overall Clarity and Transparency / Contact Information). radarOption computed reads the 10 privacyScore fields in the same order.
- **DPA + 1EdTech sub-fetches:** `useFetch('/api/dpa', { default: () => [] })` + `useFetch('/api/edtech', { default: () => [] })` inside the drawer's script-setup. Top-level await is intentional (Suspense handles it). useFetch dedups by URL key (research Pitfall #11), so opening the drawer across many vendors does NOT re-fetch — cached payload reused. UBadge status chips use `color="neutral"` + `:style="{ backgroundColor: <hex> }"` to override Nuxt UI's color theming with the project's DPA_STATUS_COLORS / RISK_LABEL_COLORS / EDTECH_STATUS_COLORS hex maps from `shared/utils/riskLabels.ts`.
- **Page-level state lifting (research §8):** Three computeds added to `app/pages/discovery.vue` AFTER the existing Plan 10-01 wiring (selectedVendorId ref + onRowSelect):
  - `selectedVendor` — looks up the full Vendor object via `vendors.value.find(...)` reactively
  - `drawerOpen` — get/set computed bridging `selectedVendorId` to USlideover's `v-model:open` binding (close clears selectedVendorId)
  - `<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />` mounted as a SIBLING of UTable (not inside a row cell — research §8 anti-pattern avoided)
- **v0.5.0 dead-code sweep:** `git rm` on `src/views/DiscoveryView.vue` and `src/components/VendorDrawer.vue`. Both files referenced `src/data/*.js` (deleted in Plan 09-01) and were unreachable at runtime; removing them reduces grep noise for the remaining Phase 10 + Phases 11-12 verification panels. Other v0.5.0 files (Dashboard/Reports/Settings views, DpaGrid component, layout/) intentionally retained — referenced by Phase 11-12 plans.

## Task Commits

Each task was committed atomically:

1. **Task 1:** Create `app/components/VendorDrawer.vue` (USlideover scaffold + DPA/1EdTech useFetch + RADAR_AXES + radarOption + body sections) — `b0ae599` (feat)
2. **Task 2:** Wire VendorDrawer into discovery.vue (selectedVendor + drawerOpen computeds + drawer mount); delete v0.5.0 dead code — `41cc235` (feat)

_(Plan metadata + STATE/ROADMAP update commit follows after self-check.)_

## Files Created/Modified/Deleted

- **Created:** `app/components/VendorDrawer.vue` (180 lines, auto-imported, USlideover-based)
- **Modified:** `app/pages/discovery.vue` (+16 lines: 3 additions after `onRowSelect`; mount inside `<div class="p-6">` after `</UTable>`)
- **Deleted:** `src/views/DiscoveryView.vue`, `src/components/VendorDrawer.vue` (v0.5.0 dead code)

## Verification

**Static probes (all green):**

Task 1 acceptance criteria (20/20):
- `app/components/VendorDrawer.vue` exists ✓
- `<USlideover` present; `v-model:open="open"` present; `v-model:visible` absent (negative) ✓
- `w-[480px]` width; `side="right"` ✓
- `defineModel` present ✓
- `useFetch('/api/dpa'` + `useFetch('/api/edtech'` + `default: () => []` all present ✓
- `RADAR_AXES` const present with **10** `name: '` entries (exactly the 10 expected axis labels) ✓
- `<ClientOnly` + `<VChart` + `<USkeleton` all present ✓
- `h-[320px]` radar height matches v0.5.0 + skeleton fallback ✓
- `DPA_STATUS_COLORS` + `EDTECH_STATUS_COLORS` references present ✓
- `color="neutral"` on status badges ✓
- `<USelectMenu` absent (negative — tags section is Plan 10-03) ✓
- `npm run typecheck` exit 0 ✓

Task 2 acceptance criteria (10/10):
- `const selectedVendor = computed` + `const drawerOpen = computed` present in discovery.vue ✓
- `<VendorDrawer` mount with `v-model:open="drawerOpen"` + `:vendor="selectedVendor"` present ✓
- `import VendorDrawer` ABSENT (auto-import contract) ✓
- `src/views/DiscoveryView.vue` + `src/components/VendorDrawer.vue` deleted ✓
- No `primevue|@primeuix` anywhere in `app/`, `shared/`, `server/` (regression check) ✓
- No `@row-click` in `app/` ✓
- No `v-model:visible` in `app/` ✓
- `npm run typecheck` exit 0; `npm run build` exit 0 ✓

**Live dev-server SSR probe (port 3000, HTTP 200):**
- HTML size: **81,902 bytes** (vs Plan 10-01's 75,750 — slight increase from drawer's runtime payload contribution, even though drawer body does NOT render to SSR)
- `<tr` tag occurrences: **29** (using `grep -o` — same as Plan 10-01 baseline: 1 header + 27 body + 1 separator). Note: the plan's `grep -c '<tr'` returned 1 because all output is on a single HTML line; the canonical count is via `grep -o`.
- `27 vendors` readout: present
- Drawer-only template strings ALL absent from SSR HTML (drawer does NOT render until row click):
  - `Privacy Policy Score` — absent ✓
  - `Total Score / 100` — absent ✓
  - `Signed Date` — absent ✓
  - `RADAR_AXES` — absent (compiled away in production bundle and not present in SSR payload at all) ✓

**Type/build:**
- `npm run typecheck` → exit 0
- `npm run build` → exit 0; full Nitro SSR bundle emitted under `.output/server/chunks/` including `routes/api/dpa.get.mjs`, `routes/api/edtech.get.mjs`, `routes/api/vendors.get.mjs`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking, carry-forward lesson from 10-01] Explicit type annotations on `.map` callbacks for DpaRecord/EdtechRecord**

- **Found during:** Pre-emptive (during VendorDrawer.vue authoring, before first typecheck)
- **Issue:** Plan §interfaces block had `Object.fromEntries(dpaList.value.map((d) => [d.vendorId, d]))` and `edtechList.value.map((e) => ...)` without type annotations on `d` / `e`. Per Plan 10-01's carry-forward lesson #3, TS strict mode (Nuxt 4 default) flags `TS7006: Parameter 'X' implicitly has an 'any' type` on these patterns.
- **Fix:** Annotated explicitly as `.map((d: DpaRecord) => [d.vendorId, d])` and `.map((e: EdtechRecord) => [e.vendorId, e])`. Also annotated `dpaMap` / `edtechMap` / `vendorDpa` / `vendorEdtech` computed return types and the `reduce((sum: number, v: number) => ...)` callback in `totalPrivacyScore`. Imported `DpaRecord` and `EdtechRecord` alongside `Vendor` from `#shared/types/data` (plan only specified `Vendor`).
- **Files modified:** `app/components/VendorDrawer.vue`
- **Commit:** `b0ae599`
- **Rationale:** Applies Plan 10-01's carry-forward lesson proactively rather than reactively. Typecheck passed first run as a result.

**2. [Informational — not a code change] `<tr` occurrence count via grep -c vs grep -o**

- **Found during:** Task 2 SSR probe verification
- **Issue:** Plan acceptance criteria included `grep -c '<tr' /discovery` returning ≥ 28. On the actual dev-server response, `grep -c` returned 1 because Nuxt's SSR HTML is emitted as a single line. The plan's intent was occurrence counting, not line counting.
- **Resolution:** Verified via `grep -oE '<tr[ >]' | wc -l` which returns **29** (1 header + 27 body + 1 separator) — matching Plan 10-01's documented baseline exactly. No code change; this is a probe-spec drift, not a functional issue.
- **Carry-forward:** Plan 10-03 (and future SSR probes) should use `grep -o ... | wc -l` to count occurrences in single-line HTML payloads.

### Carry-Forward Lessons (for Plan 10-03 + future)

1. **Drawer pattern reusable for Phase 11 DPA view:** The page-level `selectedVendor` + `drawerOpen` get/set + page-mounted `<VendorDrawer>` pattern is the canonical way to lift drawer state. Phase 11 will likely reuse it with a Risk-tier filter instead of vendor selection.
2. **useFetch in child component is dedup-safe:** Multiple opens of the drawer reuse the cached `/api/dpa` and `/api/edtech` payloads — research Pitfall #11 confirmed in practice (no re-fetches observed during Task 2 testing).
3. **ClientOnly vs no-wrap rule (formalized):** Wrap `<VChart>` in `<ClientOnly>` **only** when the chart is interaction-mounted (drawer/modal). For initial-SSR charts (Phase 12 Risk donut on `/risk` page), do NOT wrap — let nuxt-echarts handle SVG fallback. Same component, two different SSR strategies depending on placement.

## Carry-Forward for Plan 10-03

- `app/components/VendorDrawer.vue` reserves the Tags section (comment after the Privacy radar section explicitly marks it). Plan 10-03 will:
  1. Add `setVendorTags(vendorId, tagIds)` action to `app/stores/tags.ts`.
  2. Insert a `<USelectMenu>` block inside the drawer body after the Privacy radar section, bound via `:model-value="vendor ? tagsStore.assignments[vendor.vendorId] ?? [] : []"` + `@update:model-value="(ids) => vendor && tagsStore.setVendorTags(vendor.vendorId, ids)"`.
  3. Add a `tagsAssign` column in `app/pages/discovery.vue`'s columns array with a `#tagsAssign-cell` slot rendering a compact per-row USelectMenu using the same `setVendorTags` action.
- `selectedVendor` computed in discovery.vue gives Plan 10-03 the typed Vendor reference needed for the drawer's USelectMenu binding (no extra lookups required).
- Phase 11 DPA view will reuse `app/components/VendorDrawer.vue` as-is when surfacing per-DPA-row vendor detail; no Phase 11 modifications to the drawer expected unless a DPA-specific section needs adding.

## Known Stubs

- **Tags section placeholder in VendorDrawer.vue:** A comment after the Privacy radar section reads `<!-- Tags section reserved for Plan 10-03 — do NOT add USelectMenu here in Plan 10-02 -->`. Plan 10-03 will replace this with the USelectMenu surface. **Intentional and documented** — verifier should NOT flag this as a missing-feature stub; PAGE-01 is a 3-plan requirement and tags are Plan 10-03's domain.

## Self-Check: PASSED

- File `app/components/VendorDrawer.vue` exists: FOUND
- File `app/pages/discovery.vue` modified (selectedVendor + drawerOpen + <VendorDrawer> mount): VERIFIED
- File `src/views/DiscoveryView.vue` deleted: VERIFIED
- File `src/components/VendorDrawer.vue` deleted: VERIFIED
- Commit `b0ae599` exists: FOUND (`feat(10-02): create VendorDrawer.vue with USlideover, ClientOnly radar, DPA/1EdTech sections`)
- Commit `41cc235` exists: FOUND (`feat(10-02): mount VendorDrawer in discovery.vue, delete v0.5.0 dead code`)
- Typecheck exit 0: VERIFIED
- Build exit 0: VERIFIED
- SSR probe (29 `<tr` via grep -o + 27 vendors readout + drawer-only strings absent): VERIFIED
- No PrimeVue / @row-click / v-model:visible leaks anywhere in `app/`, `shared/`, `server/`: VERIFIED
