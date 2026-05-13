---
phase: 01-shell-routing
plan: 02
subsystem: ui
tags: [vue-router, primevue, tailwindcss, appshell, sidebar, skeleton-ui]

# Dependency graph
requires:
  - 01-shell-routing/01 (router/Pinia/PrimeVue/Tailwind wired, stub views exist)
provides:
  - AppShell.vue (persistent shell: dark sidebar + top header + RouterView content area)
  - SidebarNav.vue (meta-driven nav links with active-class highlight)
  - DashboardView.vue (4-card skeleton grid + 2 secondary rows)
  - DiscoveryView.vue (table header + 8 data rows with pill badge skeletons)
  - ReportsView.vue (functional DPA/Risk Position/1EdTech tab bar + 6 skeleton rows)
  - SettingsView.vue (6 label+value row skeletons)
  - App.vue replaced (HelloWorld removed, AppShell mounted as root)
affects: [all subsequent phases — visual shell is the container for all future content]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "AppShell layout pattern: flex h-screen overflow-hidden with shrink-0 sidebar + flex-1 scrollable content"
    - "SidebarNav driven by router.getRoutes().filter(r => r.meta?.nav) — adding routes auto-updates sidebar"
    - "RouterLink active-class + exact-active-class both set to bg-primary text-white on every nav link"
    - "Per-component PrimeVue Skeleton import: import Skeleton from 'primevue/skeleton'"
    - "ReportsView tab state: const activeTab = ref('DPA') + @click handler — no route change"

key-files:
  created:
    - src/components/layout/AppShell.vue
    - src/components/layout/SidebarNav.vue
  modified:
    - src/App.vue
    - src/views/DashboardView.vue
    - src/views/DiscoveryView.vue
    - src/views/ReportsView.vue
    - src/views/SettingsView.vue

key-decisions:
  - "Both active-class and exact-active-class set to bg-primary text-white on ALL RouterLinks — prevents Dashboard from staying highlighted on all routes"
  - "AppShell owns the top header bar (h-14) — keeps district name persistent across all routes without repeating in each view"
  - "Header wraps in flex flex-col flex-1 div so header is fixed-height and only main content area scrolls"

requirements-completed: [FOUND-01, FOUND-02]

# Metrics
duration: 5min
completed: 2026-05-13
---

# Phase 01 Plan 02: AppShell + Stub Views Summary

**AppShell with dark sidebar (bg-sidebar #111827, w-64, Schoolday brand), top header (Lakewood Unified School District), and four route stub views with PrimeVue Skeleton placeholders matching the UI-SPEC — build exits 0**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-13T18:22:10Z
- **Completed:** 2026-05-13T18:23:24Z
- **Tasks:** 3 complete (including browser smoke test — approved by user)
- **Files modified:** 7 (2 created, 5 overwritten)

## Accomplishments

- `src/components/layout/AppShell.vue` created: `flex h-screen overflow-hidden` root, shrink-0 SidebarNav, top header bar (`h-14`, `Lakewood Unified School District`, `border-b border-gray-200`), `<RouterView />` in `bg-gray-50` scrollable main area
- `src/components/layout/SidebarNav.vue` created: `router.getRoutes().filter(r => r.meta?.nav)` drives nav list, `bg-sidebar` (#111827) background, `active-class="bg-primary text-white"` + `exact-active-class="bg-primary text-white"` on all RouterLinks
- `src/App.vue` replaced: HelloWorld removed, `<AppShell />` mounted as root
- `src/views/DashboardView.vue`: 4-card skeleton grid (`grid-cols-4`, `100%` x `96px`, `border-radius=8px`) + 2 secondary rows
- `src/views/DiscoveryView.vue`: table header skeleton row + 8 data rows, last column pill-shaped (`border-radius=9999px`)
- `src/views/ReportsView.vue`: real interactive tab bar (`['DPA', 'Risk Position', '1EdTech']`, `activeTab = ref('DPA')`), active tab `border-primary text-primary border-b-2`, + 6 skeleton rows
- `src/views/SettingsView.vue`: 6 `justify-between` rows of 140px label + 200px value skeletons
- `npm run build` exits 0, 148 modules transformed, all route targets resolve

## Task Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Build AppShell + SidebarNav, replace App.vue | c1410cc | AppShell.vue, SidebarNav.vue, App.vue |
| 2 | Four stub views with PrimeVue Skeleton placeholders | e26e389 | DashboardView.vue, DiscoveryView.vue, ReportsView.vue, SettingsView.vue |
| 3 | Manual browser smoke test | approved | (no files) |

## Deviations from Plan

None — plan executed exactly as written. All files match the verbatim code from the task `<action>` blocks.

## Known Stubs

The skeleton placeholder views are INTENTIONAL — their purpose is to show loading-state UI shapes while real data components are built in later phases. These are not accidental stubs:

| File | Skeleton type | Wired to real data in |
|------|--------------|----------------------|
| `src/views/DashboardView.vue` | 4 stat card blocks + 2 rows | Phase 2+ |
| `src/views/DiscoveryView.vue` | 8-row table skeleton | Phase 2 |
| `src/views/ReportsView.vue` | Tab bar is REAL; content rows are skeleton | Phases 3/4/5 |
| `src/views/SettingsView.vue` | 6 label+value row skeletons | Phase 6 |

The tab bar in `ReportsView.vue` is NOT a stub — it is fully functional in-page state interaction using `activeTab = ref('DPA')` and `@click` handlers.

Note on `src/components/HelloWorld.vue`: left on disk (not imported anywhere). Cleanup deferred to Phase 2 housekeeping as specified in the plan.

## Phase 1 Requirements Status

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FOUND-01: Multi-page SPA routing with persistent sidebar nav | Complete | SidebarNav.vue with RouterLink to all 4 routes; active highlight via active-class |
| FOUND-02: Consistent app shell on every page | Complete | AppShell.vue wraps RouterView — sidebar never remounts on navigation |
| FOUND-04: Pinia store accessible from all views | Complete (Plan 01) | useTagsStore() callable from any component; confirmed in Plan 01 |

All three Phase 1 requirements are observably satisfied — browser smoke test approved (Task 3 checkpoint complete).

## Next Steps

Task 3 browser checkpoint has been approved by the user.

- Phase 1 (Shell & Routing) is complete
- Phase 2 (Data Layer + Discovery) can begin
- STATE.md todos before Phase 2 planning:
  - Decide tag persistence scope (localStorage or session-only)
  - Choose vendor fixture list (20-40 real edtech brand names)
  - Verify npm package versions before Phase 2 install

## Self-Check: PASSED

- `src/components/layout/AppShell.vue` exists: YES
- `src/components/layout/SidebarNav.vue` exists: YES
- `src/views/DashboardView.vue` exists: YES
- `src/views/DiscoveryView.vue` exists: YES
- `src/views/ReportsView.vue` exists: YES
- `src/views/SettingsView.vue` exists: YES
- `src/App.vue` contains `<AppShell />`: YES
- `src/App.vue` does NOT contain `HelloWorld`: YES (grep returns 0)
- Task 1 commit c1410cc exists: YES
- Task 2 commit e26e389 exists: YES
- `npm run build` exits 0: YES (148 modules, no errors)
