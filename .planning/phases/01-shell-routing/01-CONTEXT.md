# Phase 1: Shell & Routing - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Build the complete application frame: Vue Router with hash history, persistent fixed sidebar nav (Dashboard / Discovery / Reports / Settings), app shell layout, loading skeleton stubs for all pages, and Pinia store initialization. No real data or feature content — that arrives in Phases 2+.

**Important structural decision:** The nav has 4 top-level routes, not 6. DPA, Risk Position, and 1EdTech are tabs within the Reports page — not separate routes. Tags Management lives under Settings.

</domain>

<decisions>
## Implementation Decisions

### Router & Navigation
- **D-01:** Use `createWebHashHistory` — non-negotiable for GitHub Pages static deployment. No `createWebHistory`.
- **D-02:** Four top-level routes: `/` (Dashboard), `/discovery` (Discovery), `/reports` (Reports), `/settings` (Settings)
- **D-03:** Reports page uses sub-navigation / tabs for DPA, Risk Position, and 1EdTech — single `/reports` route, tab state managed in-page
- **D-04:** Sidebar is fixed, always visible — no collapse behavior

### Layout & Nav Labels
- **D-05:** Nav order: Dashboard → Discovery → Reports → Settings
- **D-06:** Product name "Schoolday" appears in the sidebar header/logo area
- **D-07:** Demo district will be a real-sounding name (e.g. "Lakewood Unified School District") — specific name decided in Phase 2 when mock data is created; district name shown in top header area

### Visual Style
- **D-08:** Clean enterprise aesthetic — dark sidebar, white/light content area
- **D-09:** Component library: PrimeVue + Tailwind CSS
- **D-10:** Primary color: `#484CE6` (blue-violet) — used for active nav state, buttons, primary actions
- **D-11:** Accent color: `#DA8231` (orange) — used for highlights, badges, key callouts
- **D-12:** No additional brand colors specified — build a neutral gray/white content surface around these two anchors

### Dashboard
- **D-13:** Dashboard shows overview/summary stats — key numbers at a glance (vendor count, DPA coverage, risk summary). Stub initially, content filled in when data layer exists in Phase 2+.

### Stub Pages
- **D-14:** All stub pages display loading skeletons — gray placeholder rows/blocks that look like data is about to load. Realistic in a demo context.

### State Management
- **D-15:** Pinia store initialized in Phase 1 — single `useTagsStore` for shared tag state, accessible from all pages. Empty store at this stage; populated in Phase 2.

### Claude's Discretion
- Specific PrimeVue theme preset to use (Lara / Aura / Nora) — choose whichever pairs best with `#484CE6` as primary
- Icon set for sidebar nav items — any clean icon library (Heroicons, Lucide, PrimeIcons) that fits PrimeVue
- Exact sidebar width and padding
- Skeleton row count and shape per page type (table skeletons vs card skeletons)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — v1 requirements; Phase 1 covers FOUND-01, FOUND-02, FOUND-04

### Research
- `.planning/research/STACK.md` — Stack recommendations including Vue Router hash history rationale, PrimeVue + Tailwind install guidance, Pinia patterns
- `.planning/research/ARCHITECTURE.md` — `src/data/` structure, `router.meta.nav` sidebar pattern, Pinia tag store with localStorage pattern
- `.planning/research/PITFALLS.md` — GitHub Pages 404 pitfall (hash history), mock data in components pitfall, Pinia tags state pitfall

### Codebase
- `.planning/codebase/STACK.md` — Current installed packages; Vue Router and Pinia are NOT yet installed
- `.planning/codebase/CONVENTIONS.md` — PascalCase components, 2-space indent, no TypeScript, no linter configured

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/App.vue` — Currently just renders `<HelloWorld />`. Will be replaced with `<AppShell>` wrapper + `<RouterView />`
- `src/style.css` — Global CSS with CSS custom properties. Can be extended with PGC brand color variables or replaced with Tailwind + PrimeVue theming

### Established Patterns
- Vue 3 `<script setup>` Composition API throughout — maintain this pattern
- 2-space indentation, PascalCase component names
- No TypeScript — keep plain JavaScript
- No path aliases configured — use relative paths or set up `@/` alias in `vite.config.js`

### Integration Points
- `src/main.js` — Where Vue Router and Pinia plugins get registered (`app.use(router)`, `app.use(pinia)`)
- `src/App.vue` → becomes `<RouterView />` wrapper
- New: `src/router/index.js` — route definitions
- New: `src/stores/tags.js` — Pinia tags store
- New: `src/components/AppShell.vue` — persistent layout wrapper
- New: `src/components/SidebarNav.vue` — navigation component
- New: `src/views/` — stub page components (DashboardView, DiscoveryView, ReportsView, SettingsView)

</code_context>

<specifics>
## Specific Ideas

- Product name "Schoolday" in sidebar — treat it as the app logo/brand mark
- Nav structure change from roadmap: Reports consolidates DPA + Risk + 1EdTech as tabs. This simplifies the routing and is the canonical structure for all downstream phases.
- District name is real-sounding but fictional — decided in Phase 2 when vendor fixture data is created

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-shell-routing*
*Context gathered: 2026-05-13*
