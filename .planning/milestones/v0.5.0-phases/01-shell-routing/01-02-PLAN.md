---
phase: 01-shell-routing
plan: 02
type: execute
wave: 2
depends_on:
  - "01-shell-routing/01"
files_modified:
  - src/App.vue
  - src/components/layout/AppShell.vue
  - src/components/layout/SidebarNav.vue
  - src/views/DashboardView.vue
  - src/views/DiscoveryView.vue
  - src/views/ReportsView.vue
  - src/views/SettingsView.vue
autonomous: false
requirements:
  - FOUND-01
  - FOUND-02
must_haves:
  truths:
    - "Opening the app in a browser shows a dark sidebar on the left with `Schoolday` brand header and four nav items in order: Dashboard, Discovery, Reports, Settings"
    - "Clicking each nav link changes the route hash (`/#/`, `/#/discovery`, `/#/reports`, `/#/settings`) and renders the matching stub view"
    - "The active nav item has `#484CE6` (`bg-primary`) background and white text"
    - "The Dashboard nav item is highlighted only when on `/`, not on every page (exact-active-class works)"
    - "The top header shows the district name `Lakewood Unified School District` left-aligned"
    - "Each stub view displays a page title (`Dashboard`, `Discovery`, `Reports`, `Settings`) and PrimeVue Skeleton placeholders shaped per UI-SPEC"
    - "The Reports view shows three clickable tabs (`DPA`, `Risk Position`, `1EdTech`) with `DPA` active by default; clicking a tab updates the underline without a route change"
    - "Browser hard-refresh on `/#/reports` (or any route) stays on that route — no 404"
    - "`useTagsStore()` is callable from any view component without throwing (Pinia integration confirmed)"
  artifacts:
    - path: "src/App.vue"
      provides: "Root that mounts AppShell"
      contains: "<AppShell"
    - path: "src/components/layout/AppShell.vue"
      provides: "Persistent shell: sidebar + top header + RouterView content area"
      contains: "<RouterView"
    - path: "src/components/layout/SidebarNav.vue"
      provides: "Dynamic nav driven by router meta.nav"
      contains: "router.getRoutes"
    - path: "src/views/DashboardView.vue"
      provides: "Dashboard stub with 4-card skeleton grid"
      contains: "Skeleton"
    - path: "src/views/DiscoveryView.vue"
      provides: "Discovery stub with table skeleton"
      contains: "Skeleton"
    - path: "src/views/ReportsView.vue"
      provides: "Reports stub with interactive tab bar + table skeleton"
      contains: "activeTab"
    - path: "src/views/SettingsView.vue"
      provides: "Settings stub with list row skeletons"
      contains: "Skeleton"
  key_links:
    - from: "src/App.vue"
      to: "AppShell.vue"
      via: "import + mount"
      pattern: "<AppShell"
    - from: "src/components/layout/AppShell.vue"
      to: "vue-router (RouterView)"
      via: "<RouterView /> in main content area"
      pattern: "<RouterView"
    - from: "src/components/layout/SidebarNav.vue"
      to: "vue-router (RouterLink + getRoutes)"
      via: "useRouter + RouterLink active-class"
      pattern: "RouterLink|active-class"
    - from: "src/views/ReportsView.vue"
      to: "in-page tab state"
      via: "ref('DPA') + @click handlers"
      pattern: "activeTab"
---

<objective>
Build the visible app: replace the Vue starter HelloWorld page with the production AppShell. Render the persistent dark sidebar with Schoolday branding and four nav items, the top header with the district placeholder name, and the four stub views — each showing PrimeVue Skeleton placeholders per the UI-SPEC. Reports view includes a functional in-page tab bar (DPA / Risk Position / 1EdTech) since Reports tabs are the only Phase 1 interactive element.

Purpose: Make FOUND-01 (sidebar nav routes), FOUND-02 (consistent shell), and the visual baseline of the demo portal real. This plan is the user's first opportunity to see the project come alive — every subsequent phase fills content into this shell.

Output: New `AppShell.vue`, `SidebarNav.vue`, four view files (`DashboardView.vue`, `DiscoveryView.vue`, `ReportsView.vue`, `SettingsView.vue`), updated `App.vue`. Delete or ignore the existing `HelloWorld.vue` (it is no longer referenced — leave it on disk for now; cleanup is a tiny non-blocking concern).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/01-shell-routing/01-CONTEXT.md
@.planning/phases/01-shell-routing/01-RESEARCH.md
@.planning/phases/01-shell-routing/01-UI-SPEC.md
@.planning/phases/01-shell-routing/01-VALIDATION.md
@.planning/phases/01-shell-routing/01-01-SUMMARY.md
@CLAUDE.md

<interfaces>
<!-- Foundation contracts established in Plan 01 (Wave 1). Executor consumes these. -->

Router (from Plan 01, `src/router/index.js`):
```javascript
// 4 routes, each with meta { nav: true, label: string, icon: 'pi pi-*' }
// Path | Name | Label | Icon
// '/' | dashboard | 'Dashboard' | 'pi pi-home'
// '/discovery' | discovery | 'Discovery' | 'pi pi-search'
// '/reports' | reports | 'Reports' | 'pi pi-chart-bar'
// '/settings' | settings | 'Settings' | 'pi pi-cog'
```

Pinia store (from Plan 01, `src/stores/tags.js`):
```javascript
export const useTagsStore = defineStore('tags', () => {
  const tags = ref([])
  const assignments = ref({})
  return { tags, assignments }
})
```

Tailwind v4 utility classes available (from Plan 01, `src/style.css`):
- `bg-primary` / `text-primary` / `border-primary` → `#484CE6`
- `bg-accent` / `text-accent` → `#DA8231`
- `bg-sidebar` → `#111827`
- Standard Tailwind classes: `bg-gray-50/100/200/.../900`, `text-gray-300/400/.../700/900`, `w-64`, `h-screen`, `flex`, `flex-1`, `p-6`, `gap-4`, `rounded-lg`, etc.

PrimeVue Skeleton (must be imported per component):
```javascript
import Skeleton from 'primevue/skeleton'
// Usage: <Skeleton width="200px" height="1rem" />
// Optional: border-radius="9999px" for pills
```

PrimeIcons (CSS loaded globally in `main.js`):
- `<i class="pi pi-home" />`, etc.

Current `src/App.vue` (will be replaced):
```vue
<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <HelloWorld />
</template>
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build AppShell.vue and SidebarNav.vue; replace App.vue</name>
  <files>src/components/layout/AppShell.vue, src/components/layout/SidebarNav.vue, src/App.vue</files>
  <read_first>
    - src/App.vue (current — only mounts HelloWorld; about to be replaced)
    - src/router/index.js (from Plan 01 — sidebar reads `router.getRoutes()` to drive nav from this file's meta)
    - .planning/phases/01-shell-routing/01-RESEARCH.md (Pattern 3 AppShell layout; Pattern 4 SidebarNav verbatim)
    - .planning/phases/01-shell-routing/01-UI-SPEC.md (Layout Contract → AppShell, Sidebar, Sidebar Brand Header, Nav Items, Top Header Bar, Main Content Area sections)
    - .planning/phases/01-shell-routing/01-CONTEXT.md (D-04 fixed sidebar; D-06 Schoolday brand; D-07 district name; D-08 dark sidebar / white content)
  </read_first>
  <action>
    Step 1 — Create directory `src/components/layout/` if not present.

    Step 2 — Write `src/components/layout/SidebarNav.vue` verbatim:
    ```vue
    <script setup>
    import { useRouter } from 'vue-router'

    const router = useRouter()
    const navRoutes = router.getRoutes().filter(r => r.meta?.nav)
    </script>

    <template>
      <nav class="flex flex-col w-64 h-screen bg-sidebar text-white shrink-0">
        <div class="px-6 py-6 border-b border-gray-700">
          <span class="text-lg font-semibold tracking-wide">Schoolday</span>
        </div>

        <ul class="flex-1 py-4 px-3 space-y-1">
          <li v-for="route in navRoutes" :key="route.name">
            <RouterLink
              :to="route.path"
              class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
              active-class="bg-primary text-white"
              exact-active-class="bg-primary text-white"
            >
              <i :class="route.meta.icon" class="text-base" />
              <span>{{ route.meta.label }}</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </template>
    ```

    Notes:
    - `bg-sidebar` resolves to `#111827` via the Tailwind `@theme` token from Plan 01.
    - Width is `w-64` (256px) per UI-SPEC Layout Contract → Sidebar.
    - `border-b border-gray-700` is the brand header bottom separator (`#374151` per UI-SPEC).
    - Default link text color `text-gray-400` (`#9CA3AF`), hover text `text-white`, hover bg `bg-gray-800` per UI-SPEC Nav Items table.
    - Both `active-class` and `exact-active-class` are set to the SAME value (`bg-primary text-white`) — this is intentional and documented in UI-SPEC; it makes the Dashboard route NOT match as a prefix on `/discovery` etc.
    - Nav list `py-4 px-3 space-y-1` per UI-SPEC.
    - Brand header padding `px-6 py-6` per UI-SPEC.
    - Each item padding `px-3 py-2`, gap `gap-3`, radius `rounded-lg`, label size `text-sm font-medium` per UI-SPEC.

    Step 3 — Write `src/components/layout/AppShell.vue` verbatim:
    ```vue
    <script setup>
    import SidebarNav from './SidebarNav.vue'
    </script>

    <template>
      <div class="flex h-screen overflow-hidden">
        <SidebarNav />
        <div class="flex flex-col flex-1 overflow-hidden">
          <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
            <span class="text-sm text-gray-700">Lakewood Unified School District</span>
          </header>
          <main class="flex-1 overflow-y-auto bg-gray-50">
            <RouterView />
          </main>
        </div>
      </div>
    </template>
    ```

    Notes:
    - Outer `flex h-screen overflow-hidden` per UI-SPEC AppShell.
    - Top header is `h-14` (56px), white bg, bottom border, `pl-6` left padding, `text-sm text-gray-700` per UI-SPEC Top Header Bar.
    - District name literal `Lakewood Unified School District` is the Phase 1 placeholder per UI-SPEC + RESEARCH.md open question resolution.
    - Main content area `bg-gray-50` (`#F9FAFB`) per UI-SPEC.
    - `<RouterView />` is the route outlet — without this, all content is blank (RESEARCH.md Pitfall 6).
    - The right-side `<div class="flex flex-col flex-1 overflow-hidden">` wraps header + main so the header stays put and only main scrolls.

    Step 4 — REPLACE entire contents of `src/App.vue` with:
    ```vue
    <script setup>
    import AppShell from './components/layout/AppShell.vue'
    </script>

    <template>
      <AppShell />
    </template>
    ```

    Notes:
    - The HelloWorld component is no longer imported. Leave the file `src/components/HelloWorld.vue` on disk (deletion is a Phase 1 cleanup deferred to plan summary — it does not affect the app since nothing imports it).
    - Do NOT add any wrapping divs around `<AppShell />` — AppShell is the full root and `#app` mount point styling is now controlled entirely by Tailwind utility classes inside AppShell.
  </action>
  <verify>
    <automated>npm run build</automated>
    Build must exit 0 with NO warnings about unresolved view imports (the view files are created in Task 2 but Vite's lazy-import does not fail the build for missing dynamic targets — and Task 2 runs before this task can be verified at the plan level. Acceptable order: build after both Task 1 and Task 2 are complete).
  </verify>
  <acceptance_criteria>
    - File `src/components/layout/AppShell.vue` exists
    - `AppShell.vue` contains literal `<RouterView />` (or `<RouterView/>` or `<router-view`) — exact pattern grep: `RouterView|router-view`
    - `AppShell.vue` contains literal `Lakewood Unified School District`
    - `AppShell.vue` contains class `h-14` (top header height)
    - `AppShell.vue` contains `bg-gray-50` (main content bg)
    - File `src/components/layout/SidebarNav.vue` exists
    - `SidebarNav.vue` contains `router.getRoutes()` and `.filter(r => r.meta?.nav)`
    - `SidebarNav.vue` contains literal `Schoolday`
    - `SidebarNav.vue` contains `w-64` (sidebar width)
    - `SidebarNav.vue` contains `bg-sidebar` (sidebar bg token)
    - `SidebarNav.vue` contains `active-class="bg-primary text-white"`
    - `SidebarNav.vue` contains `exact-active-class="bg-primary text-white"`
    - `src/App.vue` contains literal `<AppShell />` (or `<AppShell/>`)
    - `src/App.vue` does NOT contain `HelloWorld` (grep returns 0 matches)
    - `npm run build` exits 0
  </acceptance_criteria>
  <done>
    AppShell renders the persistent sidebar + top header + RouterView content area. SidebarNav reads its links from router meta and applies the active-class highlight from `#484CE6`. App.vue mounts AppShell as the root. Browser preview is not yet verified — verification happens after Task 2 creates the view files.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create four stub view files with PrimeVue Skeleton placeholders</name>
  <files>src/views/DashboardView.vue, src/views/DiscoveryView.vue, src/views/ReportsView.vue, src/views/SettingsView.vue</files>
  <read_first>
    - src/router/index.js (confirms these four files are the route component targets)
    - .planning/phases/01-shell-routing/01-UI-SPEC.md ("Loading Skeleton Contract" section — DashboardView, DiscoveryView, ReportsView, SettingsView sub-sections — specifies exact widths, heights, row counts)
    - .planning/phases/01-shell-routing/01-RESEARCH.md (Pattern 7 PrimeVue Skeleton + "ReportsView.vue — Tab Stub Pattern" code example)
    - .planning/phases/01-shell-routing/01-CONTEXT.md (D-03 Reports tabs in-page; D-13 Dashboard summary stats; D-14 skeletons for all stubs)
  </read_first>
  <action>
    Step 1 — Create directory `src/views/` if not present.

    Step 2 — Write `src/views/DashboardView.vue` verbatim (4-card grid skeleton + 2 secondary rows per UI-SPEC):
    ```vue
    <script setup>
    import Skeleton from 'primevue/skeleton'
    </script>

    <template>
      <div class="p-6">
        <h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>

        <div class="grid grid-cols-4 gap-4 mb-8">
          <Skeleton v-for="i in 4" :key="i" width="100%" height="96px" border-radius="8px" />
        </div>

        <div class="space-y-3">
          <Skeleton width="60%" height="1rem" />
          <Skeleton width="60%" height="1rem" />
        </div>
      </div>
    </template>
    ```

    Step 3 — Write `src/views/DiscoveryView.vue` verbatim (table skeleton: 1 header row + 8 data rows per UI-SPEC):
    ```vue
    <script setup>
    import Skeleton from 'primevue/skeleton'
    </script>

    <template>
      <div class="p-6">
        <h1 class="text-xl font-semibold mb-6 text-gray-900">Discovery</h1>

        <div class="flex gap-4 mb-3">
          <Skeleton width="200px" height="1rem" />
          <Skeleton width="120px" height="1rem" />
          <Skeleton width="100px" height="1rem" />
          <Skeleton width="100px" height="1rem" />
        </div>

        <div v-for="i in 8" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
          <Skeleton width="200px" height="1rem" />
          <Skeleton width="120px" height="1rem" />
          <Skeleton width="100px" height="1rem" />
          <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
        </div>
      </div>
    </template>
    ```

    Step 4 — Write `src/views/ReportsView.vue` verbatim (real interactive tab bar + 6 skeleton rows per UI-SPEC):
    ```vue
    <script setup>
    import { ref } from 'vue'
    import Skeleton from 'primevue/skeleton'

    const tabs = ['DPA', 'Risk Position', '1EdTech']
    const activeTab = ref('DPA')
    </script>

    <template>
      <div class="p-6">
        <h1 class="text-xl font-semibold mb-4 text-gray-900">Reports</h1>

        <div class="flex gap-1 border-b border-gray-200 mb-6">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
            :class="activeTab === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
          >
            {{ tab }}
          </button>
        </div>

        <div v-for="i in 6" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
          <Skeleton width="200px" height="1rem" />
          <Skeleton width="100px" height="1rem" />
          <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
        </div>
      </div>
    </template>
    ```

    Notes for ReportsView:
    - Tab bar is REAL (not skeleton) per UI-SPEC.
    - Default active tab is `'DPA'` per UI-SPEC.
    - Active tab styling: `border-primary text-primary border-b-2` per UI-SPEC.
    - Inactive tab styling: `border-transparent text-gray-500 hover:text-gray-700` per UI-SPEC.
    - Tabs `['DPA', 'Risk Position', '1EdTech']` are the labels — exact strings, D-03.
    - Skeleton content is the SAME regardless of active tab in Phase 1; real per-tab content arrives in Phases 3/4/5.

    Step 5 — Write `src/views/SettingsView.vue` verbatim (6 list rows, label + value per UI-SPEC):
    ```vue
    <script setup>
    import Skeleton from 'primevue/skeleton'
    </script>

    <template>
      <div class="p-6">
        <h1 class="text-xl font-semibold mb-6 text-gray-900">Settings</h1>

        <div>
          <div v-for="i in 6" :key="i" class="flex justify-between py-3 border-b border-gray-100">
            <Skeleton width="140px" height="1rem" />
            <Skeleton width="200px" height="1rem" />
          </div>
        </div>
      </div>
    </template>
    ```

    All four files:
    - Use `<script setup>` Composition API per CLAUDE.md
    - Use 2-space indent per CLAUDE.md
    - Use PascalCase component name per CLAUDE.md
    - Import `Skeleton` directly: `import Skeleton from 'primevue/skeleton'` (per-component import — PrimeVue is not auto-registered, RESEARCH.md Pitfall 4)
    - Page title styling `text-xl font-semibold text-gray-900` with `mb-6` (DiscoveryView/SettingsView/DashboardView) or `mb-4` (ReportsView — has tab bar following with its own `mb-6`)
  </action>
  <verify>
    <automated>npm run build</automated>
    Build must exit 0 with NO warnings about unresolved imports. After this task, Vite can resolve the lazy-import targets from `router/index.js`.
  </verify>
  <acceptance_criteria>
    - File `src/views/DashboardView.vue` exists
    - DashboardView contains `import Skeleton from 'primevue/skeleton'`
    - DashboardView contains literal `>Dashboard<` (page title h1)
    - DashboardView contains `grid-cols-4` (4-column stat card grid)
    - DashboardView contains `height="96px"` (stat card height)
    - File `src/views/DiscoveryView.vue` exists
    - DiscoveryView contains `import Skeleton from 'primevue/skeleton'`
    - DiscoveryView contains literal `>Discovery<`
    - DiscoveryView contains `v-for="i in 8"` (8 data rows)
    - DiscoveryView contains `border-radius="9999px"` (pill-shaped badge)
    - File `src/views/ReportsView.vue` exists
    - ReportsView contains `const tabs = ['DPA', 'Risk Position', '1EdTech']` (exact array)
    - ReportsView contains `const activeTab = ref('DPA')` (default active)
    - ReportsView contains `border-primary text-primary` (active tab styling)
    - ReportsView contains `v-for="i in 6"` (6 skeleton rows)
    - File `src/views/SettingsView.vue` exists
    - SettingsView contains `import Skeleton from 'primevue/skeleton'`
    - SettingsView contains literal `>Settings<`
    - SettingsView contains `v-for="i in 6"` (6 list rows)
    - SettingsView contains `justify-between` (label/value row layout)
    - `npm run build` exits 0 with NO warnings about missing route component imports
  </acceptance_criteria>
  <done>
    All four view files exist with proper PrimeVue Skeleton shapes per UI-SPEC. ReportsView has functional tab state. Production build is clean.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: Manual browser smoke test of full app shell + all routes + Reports tabs</name>
  <files>(no files modified — verification only)</files>
  <read_first>
    - .planning/phases/01-shell-routing/01-VALIDATION.md (Manual-Only Verifications table — full list of behaviors to check)
    - .planning/phases/01-shell-routing/01-UI-SPEC.md (Reports Tabs Interaction Contract; Sidebar Nav Items state table)
  </read_first>
  <action>
    This is a CHECKPOINT task — Claude does NOT modify code here. Run  and walk through the verification steps listed in <verify> below, then pause and wait for the user to type "approved" (per <resume-signal>).
  </action>
  <what-built>
    The complete Phase 1 visible app:
    - Dark sidebar (`#111827`) on the left, width 256px, with `Schoolday` brand header
    - Four nav items in order: Dashboard, Discovery, Reports, Settings — each with a PrimeIcons icon
    - White top header bar (56px tall) with `Lakewood Unified School District` placeholder text
    - Light gray main content area (`#F9FAFB`) showing the current route's stub view
    - Active nav item is highlighted with `#484CE6` background + white text
    - Each stub view shows PrimeVue Skeleton placeholders shaped per the UI-SPEC
    - Reports view has three clickable tabs (DPA, Risk Position, 1EdTech) with `DPA` active by default
  </what-built>
  <how-to-verify>
    Step 1 — Start the dev server:
    ```bash
    npm run dev
    ```
    Open the printed local URL (typically `http://localhost:5173/district-demo/`).

    Step 2 — Visual baseline (FOUND-02 sidebar consistent on every route):
    - Confirm: Dark left sidebar visible with "Schoolday" at top
    - Confirm: Four nav items (Dashboard, Discovery, Reports, Settings) each with an icon and label
    - Confirm: Top header shows "Lakewood Unified School District"
    - Confirm: Main content area is off-white (`#F9FAFB`), not pure white
    - Confirm: Dashboard view is rendered by default (URL bar shows `/#/` or `/#/district-demo/` style hash)

    Step 3 — Nav highlight (Pitfall 2 check — Dashboard exact-active-class):
    - Confirm: On `/`, the "Dashboard" nav item has blue-violet (`#484CE6`) background with white text
    - Click "Discovery" → URL becomes `.../#/discovery`; the Discovery nav item is now blue-violet; Dashboard is NOT highlighted anymore
    - Click "Reports" → URL becomes `.../#/reports`; Reports highlighted, others not
    - Click "Settings" → URL becomes `.../#/settings`; Settings highlighted, others not
    - Click "Dashboard" → returns to `/`; Dashboard highlighted again

    Step 4 — Stub view rendering (per UI-SPEC):
    - Dashboard: 4 wide skeleton cards in a row, then 2 narrower lines below
    - Discovery: 1 row of header skeleton blocks, then 8 data rows each with 4 skeleton blocks (last one is pill-shaped)
    - Reports: Tab bar (DPA / Risk Position / 1EdTech) with DPA underlined in primary color, then 6 skeleton rows below
    - Settings: 6 rows of label-skeleton + value-skeleton pairs

    Step 5 — Reports tab interaction (D-03):
    - On `/reports`, confirm DPA tab is underlined in `#484CE6`
    - Click "Risk Position" → underline moves to Risk Position; DPA underline disappears; skeleton content below stays the same shape
    - Click "1EdTech" → underline moves to 1EdTech
    - Click "DPA" → underline returns to DPA

    Step 6 — Hash-history refresh (FOUND-02, Pitfall 1 — `createWebHashHistory`):
    - Navigate to `/reports`
    - Hard-refresh the browser (Ctrl+R / Cmd+R)
    - Confirm: Page reloads but stays on Reports view (no 404, no redirect to Dashboard)
    - Hard-refresh on `/settings` → stays on Settings
    - Hard-refresh on `/discovery` → stays on Discovery

    Step 7 — Pinia store availability (FOUND-04):
    - Open browser devtools console
    - There should be NO console errors mentioning "getActivePinia" or "no active Pinia"
    - Optional: install Vue Devtools and confirm the `tags` store appears with empty `tags` array and empty `assignments` object

    Step 8 — Production build:
    ```bash
    npm run build
    ```
    Confirm: Exit code 0, no errors.

    Optional GitHub Pages smoke (out of scope for plan acceptance but valuable):
    ```bash
    npm run preview
    ```
    Repeat steps 2–7 against the production preview server.

    If any step fails, describe the failure mode. Common failures and fixes:
    - All Tailwind classes do nothing → `@tailwindcss/vite` missing from `vite.config.js` OR `@import "tailwindcss"` missing from `style.css` (Plan 01 errors)
    - Nav icons render as empty boxes → `import 'primeicons/primeicons.css'` missing from `main.js` (Plan 01 error)
    - Blank content area → `<RouterView />` missing from `AppShell.vue`
    - Console "getActivePinia" error → `app.use(createPinia())` missing or after first store call
    - Dashboard stays highlighted on all routes → `exact-active-class` not set on RouterLink in SidebarNav
    - 404 after browser refresh → `createWebHistory` used instead of `createWebHashHistory` in router
  </how-to-verify>
  <resume-signal>
    Type "approved" to mark Phase 1 complete and proceed to Phase 2 planning.
    If issues: describe the failure and which step exposed it; revise the relevant task and re-verify.
  </resume-signal>
  <verify>
    Manual browser walkthrough (see <how-to-verify> above for the full 8-step procedure). Summary:
    1.  — open localhost URL
    2. Confirm sidebar, brand, header, 4 nav items visible
    3. Click each nav link — verify active highlight follows + URL hash updates + no full reload
    4. Verify each stub view renders the correct skeleton shape per UI-SPEC
    5. On /reports, click each tab — underline follows, no route change
    6. Hard-refresh on each route — stays on that route (no 404)
    7. Check devtools console — zero Pinia/router errors
    8.  — exit 0
  </verify>
  <done>
    User has typed "approved" after completing all 8 verification steps. Phase 1 (Shell & Routing) is observably complete: FOUND-01, FOUND-02, FOUND-04 all satisfied in a live browser.
  </done>
</task>

</tasks>

<verification>
After Task 1 and Task 2 (before checkpoint Task 3):
1. `npm run build` exits 0 with no missing-import warnings — all route component targets resolve.
2. `grep -c "<RouterView" src/components/layout/AppShell.vue` returns ≥ 1.
3. `grep -c "router.getRoutes" src/components/layout/SidebarNav.vue` returns ≥ 1.
4. All four `src/views/*.vue` files exist (`ls src/views/*.vue | wc -l` ≥ 4).
5. `src/App.vue` no longer references `HelloWorld` (`grep -c HelloWorld src/App.vue` = 0).

Task 3 (manual checkpoint) provides the end-to-end behavior verification that no automated test in this project can cover.
</verification>

<success_criteria>
- Persistent dark sidebar (`#111827`) visible on every route with `Schoolday` brand and 4 nav items in declared order
- Top header shows `Lakewood Unified School District`
- All four routes (`/`, `/discovery`, `/reports`, `/settings`) navigate without page reload and render their respective stub view with PrimeVue Skeleton shapes per UI-SPEC
- Active nav item is highlighted with `#484CE6` background; Dashboard is highlighted only on `/`, not on other routes
- Reports view has working tab bar with DPA default-active; clicking tabs updates the underline without route change
- Browser hard-refresh on `/#/reports`, `/#/discovery`, `/#/settings` stays on that route (no 404 — confirms `createWebHashHistory`)
- No console errors related to Pinia, PrimeVue, or router on any route
- `npm run build` and `npm run dev` both succeed cleanly
</success_criteria>

<output>
After completion, create `.planning/phases/01-shell-routing/01-02-SUMMARY.md` capturing:
- Files created (full list with line counts)
- Browser smoke test result for each verification step (1–7)
- Any deviations from UI-SPEC (with rationale)
- Note on `src/components/HelloWorld.vue` — left on disk (not imported anywhere); cleanup is Phase 2 housekeeping
- Phase 1 wrap-up: confirm FOUND-01, FOUND-02, FOUND-04 are all observably satisfied
- Note next steps: Phase 2 (Data Layer + Discovery) — STATE.md todos for pending decisions before Phase 2 planning
</output>
