# Project Research Summary

**Project:** District Demo Portal
**Domain:** Edtech sales demo SPA -- district compliance and vendor data portal
**Researched:** 2026-05-13
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a multi-section admin portal SPA built as a sales instrument, not a production application. The target audience is district IT administrators watching a guided walkthrough. This context drives every architectural decision: there is no backend, no auth, no real data -- only a credible, data-rich interface that communicates product value. The two most important technical facts are that it deploys to GitHub Pages as a static file bundle and that mock data must be changeable by a developer in under an hour. These constraints, taken together, fully determine the recommended architecture.

The recommended approach is Vue 3 + Vue Router 4 (hash history) + Pinia + PrimeVue 4 + Tailwind CSS 3 + Apache ECharts. This stack gives the project sortable/filterable tables, professional component styling, and a chart library capable of handling the undefined risk visualization -- all in a cohesive, Vue-native package with no external service dependencies. Mock data lives entirely in `src/data/*.js` files, isolated from components. The only mutable runtime state is the tags feature, which belongs in a Pinia store with optional localStorage persistence so demo state can survive page refresh.

The central risk for this project is not technical complexity -- the patterns are all well-established. The risk is demo-kill failure modes: a white screen from a null data access, a 404 on direct URL load from using the wrong router history mode, or mock data so sparse and fake that the district admin loses trust in the product. All of these are preventable with structural decisions made in Phase 1 that are expensive to fix later.

---

## Key Findings

### Recommended Stack

The project already has Vue 3 + Vite configured. The additions needed are routing (Vue Router 4), state (Pinia), a component/table library (PrimeVue 4), charts (ECharts + vue-echarts), and utility CSS (Tailwind 3). PrimeVue is the clear choice over alternatives -- it bundles the DataTable, badges, chips, dialogs, and layout components in a single coherent install, avoiding the two-design-systems problem common when mixing a headless table library with a separate UI kit.

**Core technologies:**

| Library | Purpose | Rationale |
|---------|---------|-----------|
| `vue-router ^4.4` | Multi-page routing | Official Vue router; hash history required for GitHub Pages |
| `pinia ^2.2` | Tag state + cross-route data | Official Vue 3 state library; lighter than Vuex, composable-friendly |
| `primevue ^4.x` + `@primevue/themes` | DataTable, badges, chips, dialogs | Native Vue 3, feature-complete tables, one coherent design system |
| `echarts` + `vue-echarts` | Risk Position visualization | Widest chart type support including heatmap/scatter -- handles undefined risk viz requirement |
| `tailwindcss ^3.4` | Page layout and spacing | Utility-first; fast iteration without growing a CSS file; Tailwind 4 still maturing |
| Heroicons or Lucide Vue | Nav and status icons | Tree-shakeable, Vue 3 native |

**One hard constraint: use `createWebHashHistory`, not `createWebHistory`.** GitHub Pages cannot serve HTML5 pushstate fallbacks. Using web history causes 404 on direct URL load or refresh -- a fatal demo-kill that is invisible during local development.

Verify all version numbers on npm before installing. Training data cutoff is August 2025; confirm PrimeVue 4 and Tailwind 3 are still current before running `npm install`.

### Expected Features

**Must have (table stakes) -- absence makes the portal feel like an unfinished alpha:**
- Vendor list with sortable, filterable table -- column sorting is expected by every IT admin
- DPA status badge per vendor -- color-coded Signed/Unsigned/Expired/Pending pill, not plain text
- Signed date + expiry date columns -- with visual flag for expired or near-expiry (within 90 days)
- Vendor coverage summary headline -- "X of Y vendors have a signed DPA" is the KPI every district tracks
- Clear section navigation with active state -- sidebar with distinct views per domain; active link highlighted
- Empty state handling -- a table that shows nothing during a filter looks broken on a projector
- Usage metrics per vendor -- frequency, last-seen date, student/user count; standard in network monitoring tools
- Per-vendor expandable detail or modal -- admins expect to drill in; flat list reads as incomplete

**Should have (differentiators) -- visibly impressive in a demo:**
- Risk Position converged view -- competing tools show discovery and DPA in silos; a converged view is rare and highly valued
- Risk tier badge per vendor (High/Medium/Low) -- calculated from DPA gap + usage volume
- Summary chart above risk table -- donut or stacked bar showing vendor distribution by tier; the executive posture view
- Addendum presence indicator -- "DPA signed but addendum missing" shows domain expertise
- Version currency indicator -- "DPA on file is outdated" is a subtle but real compliance gap few tools surface
- 1EdTech certification status column -- emerging compliance layer; signals forward-looking coverage
- Tag assignment with inline creation -- mirrors real workflows in mature districts
- Consistent vendor cross-referencing -- same vendor in Discovery, DPA, and 1EdTech with identical naming

**Defer (anti-features -- do not build):**
- Real-time data refresh, loading spinners, or simulated network latency -- fake async looks broken without a backend
- User auth / login screen -- adds friction, no demo benefit
- Bulk CSV/PDF export, audit log, email notifications -- pulls demo focus to operational workflows vs. insight value
- Full CRUD on vendor records -- raises "is this real data?" questions; tag CRUD only
- Mobile responsive layout -- demos happen on desktop
- Multi-district switcher -- one fixture district is the correct demo scope

### Architecture Approach

The canonical pattern for this type of portal is a persistent shell layout with a sidebar nav and a `<RouterView>` content area, one view component per section, all mock data in standalone `src/data/*.js` files, and a single Pinia store for the only mutable state (tags). Views are intentionally "fat" -- they own their own data-joining logic. There is no service layer. The sidebar nav generates its links from `router.meta.nav` so adding a section is a two-file change (route entry + view file) with zero layout changes.

**Major components:**

| Component | Responsibility |
|-----------|---------------|
| `AppShell.vue` + `SidebarNav.vue` | Persistent chrome -- sidebar nav driven by `router.meta.nav`; `<RouterView>` in content area |
| `src/data/*.js` | All mock data -- vendor master, DPA records, 1EdTech records, tag seeds; editable without touching components |
| `stores/tags.js` (Pinia) | Single mutable store -- tag definitions + vendor assignments, persisted to localStorage |
| `DataTable.vue` (shared) | Reusable sortable/filterable table wrapper around PrimeVue DataTable |
| `StatusBadge.vue` (shared) | Color-coded status pill -- used in DPA, Risk, and 1EdTech views |
| `TagChip.vue` / `TagAssigner.vue` (shared) | Tag display and assignment -- reads/writes tags store directly |
| View components (one per route) | Page layout, data joining via `computed()`, local filtering state |

The data join key across all files must be a stable vendor ID string (e.g. `vendor-google-classroom`), not a display name. String-name joins will silently fail when casing or spacing drifts between files.

### Critical Pitfalls

1. **`createWebHistory` on GitHub Pages** -- Causes 404 on direct URL load or refresh; invisible during local dev. Use `createWebHashHistory` with the `/district-demo/` base from the first line of `router/index.js`. Non-negotiable.

2. **Mock data defined inside `.vue` component files** -- Makes same-day data changes require a component edit under demo time pressure. Establish `src/data/` as the only place data lives before writing any view. Cannot be retrofitted cleanly.

3. **Data files that drift out of sync** -- `vendors.js` with 20 vendors and `dpa.js` referencing 17 of them causes blank cells that read as bugs. Use a stable `vendorId` join key across all data files and add a startup `console.warn` that validates all referenced IDs exist in the vendor master.

4. **Tags state managed locally in a component** -- Tags assigned on Discovery disappear when navigating to DPA and back. Fatal to demo credibility. Tags must be in a Pinia store from the first time tags are implemented -- not retrofitted.

5. **Demo crashes to a white screen on null data access** -- A missing field on one of 25 vendor objects causes an unhandled exception and a blank SPA. Use optional chaining everywhere (`vendor?.dpa?.status ?? "Unknown"`) and add `app.config.errorHandler` in `main.js` to display a fallback rather than going blank.

**Bonus pitfall -- thin, obviously fake data:** Three vendors with placeholder names fails to communicate the scale of the problem the product solves. Seed 20-40 vendors with real edtech brand names and a realistic spread across DPA statuses, expiry dates, and risk tiers.

---

## Implications for Roadmap

### Phase 1: Shell, Routing, and Design Foundation
**Rationale:** Every subsequent phase hangs off the router and layout. Shared components (DataTable, StatusBadge, design tokens) must be established here to prevent visual debt accumulating across phases.
**Delivers:** Working SPA with sidebar nav, all routes resolving to stub views, `src/data/` directory created, shared component shells wired up.
**Addresses:** Navigation requirement; section flexibility requirement (add/remove pages without structural rework).
**Avoids:** `createWebHistory` 404 pitfall; monolithic `App.vue` pitfall; visual inconsistency across phases.
**Research flag:** Standard patterns -- skip phase research. Vue Router + AppShell pattern is canonical and well-documented.

### Phase 2: Mock Data Layer + Discovery View
**Rationale:** Discovery is the broadest section (vendor list + usage metrics + tag assignment) and exercises the most shared component patterns. Proving DataTable and TagAssigner here makes DPA and 1EdTech views largely copy-paste. All `src/data/*.js` schemas must be defined in this phase before later phases write any data access code.
**Delivers:** Populated `src/data/` with 20-40 realistic vendors; working Discovery view with sortable/filterable table, usage metrics, tag assignment; DataTable and TagChip production-ready.
**Addresses:** Discovery page requirement; tag assignment requirement; same-day iteration requirement; data in files not components rule.
**Avoids:** Mock data in components; data schema mismatch; thin fake data.
**Research flag:** Standard patterns -- PrimeVue DataTable integration is well-documented.

### Phase 3: DPA View
**Rationale:** DPA is structurally similar to Discovery but adds StatusBadge, date-aware display logic, and expiry flagging. Builds directly on DataTable from Phase 2. StatusBadge created here is reused in Risk and 1EdTech.
**Delivers:** DPA view with signed/expiry dates, version currency, addendum indicator, color-coded status badges, expiry warning for records within 90 days, "N vendors need DPA review" headline stat.
**Addresses:** DPA page requirement.
**Avoids:** Data drift -- DPA records must reference vendor IDs from Phase 2 master list.
**Research flag:** Standard patterns -- DPA display conventions are well-established in edtech compliance tools.

### Phase 4: 1EdTech View
**Rationale:** Structurally the simplest section -- a table with certification status badges. Reuses DataTable and StatusBadge from Phases 2-3. Low-effort phase that completes the data coverage story before tackling the undefined Risk view.
**Delivers:** 1EdTech view with certification level, certified date, and product name columns.
**Addresses:** 1EdTech certification requirement.
**Research flag:** Standard patterns -- skip phase research.

### Phase 5: Risk Position View
**Rationale:** Deliberately last among data views. By Phase 5, all underlying data shapes (vendor + DPA + 1EdTech) are proven and the risk tier calculation can be implemented as a single `computed()` without guessing at field names. Risk tier logic: High = active usage + no/expired DPA; Medium = signed DPA but outdated or missing addendum; Low = current DPA + addendum present.
**Delivers:** Risk Position view with donut/summary chart showing vendor distribution by tier + sortable risk table with tier badges and contributing-factor annotations. Clickable chart segments filter the table.
**Addresses:** Risk Position requirement; converged discovery + DPA view; visualization approach decision.
**Recommendation:** Option B (summary chart + risk table) from FEATURES.md -- donut chart above risk table with clickable segment filtering.
**Avoids:** Layout shift on chart render (use `v-if` on `onMounted`); data join failures.
**Research flag:** Design decision required before Phase 5 planning -- confirm chart type. If heatmap/scatter matrix is wanted, ECharts is required. If donut/bar is sufficient, Chart.js is lighter. Log decision in PROJECT.md first.

### Phase 6: Tags Management View
**Rationale:** Pinia store and TagChip/TagAssigner exist from Phase 2. This phase only adds the Tags settings page (list all tags, edit name/color, delete with confirmation). Building last validates the full tag lifecycle -- consumption before administration.
**Delivers:** Tags view with create/edit/delete; localStorage persistence so demo state survives refresh; Reset Demo affordance to wipe localStorage back to seed state.
**Addresses:** Tags management requirement.
**Avoids:** Tags state in local component state; inconsistent tag display across pages.
**Research flag:** Standard patterns -- Pinia + localStorage watch is well-documented.

### Phase Ordering Rationale

- Shell first because every phase needs working routes and shared components. Building Discovery before the router exists means retrofitting RouterLink into every nav element.
- Data layer in Phase 2 because `src/data/*.js` schemas must be defined before any component writes data access code. Retrofitting this separation after data is in components is the most painful correction this project can face.
- DPA before 1EdTech because DPA introduces StatusBadge (reused in 1EdTech and Risk) and date-aware display logic -- worth sequencing to avoid building StatusBadge twice.
- Risk last among data views because it joins data from all three prior sources and the visualization approach was undefined at research time. Building last avoids building against unproven data shapes.
- Tags management last because tag consumption (assignment in Discovery) must be proven before tag administration UI is built.

### Research Flags

Needs design decision before build:
- **Phase 5 (Risk Position):** Confirm chart type before planning begins. Recommendation is Option B (donut summary chart + risk table). Heatmap/scatter matrix requires ECharts; donut/bar allows lighter Chart.js. Log decision in PROJECT.md before Phase 5 planning.

Standard patterns (skip /gsd:research-phase):
- **Phase 1:** Vue Router + AppShell pattern is canonical Vue 3.
- **Phase 2:** PrimeVue DataTable + `src/data/` file separation are standard.
- **Phase 3:** DPA column conventions are established in edtech compliance tooling.
- **Phase 4:** 1EdTech table is the simplest view in the project.
- **Phase 6:** Pinia + localStorage is a standard persistence pattern.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Vue Router, Pinia, PrimeVue recommendations are architecturally sound. Specific version numbers should be verified on npm before install -- training cutoff August 2025. |
| Features | MEDIUM | Based on analysis of edtech compliance platforms (Lightspeed, GoGuardian, SDPC, Privacy Vaults Online). No live verification. DPA conventions and risk tier patterns are stable; 1EdTech section reflects mid-2024 state. |
| Architecture | HIGH | Vue 3 / Vue Router 4 / Pinia 2 patterns are mature and stable. AppShell + RouterView + src/data separation is the canonical approach for this portal type. |
| Pitfalls | HIGH | createWebHashHistory for GitHub Pages is well-documented and reproducible. Mock data isolation and tag store requirements are directly derivable from PROJECT.md requirements. |

**Overall confidence: MEDIUM-HIGH**

### Gaps to Address

- **Risk visualization design decision** -- Which chart type for the Risk Position page is unresolved. Options A-D are documented in FEATURES.md with trade-offs. Log the decision in PROJECT.md before Phase 5 planning begins.

- **npm version verification** -- Verify current latest on npm for `primevue`, `vue-echarts`, `echarts`, and `tailwindcss` before running `npm install`. All version numbers are from training data (cutoff August 2025).

- **Tag persistence scope** -- ARCHITECTURE.md recommends localStorage persistence for demo continuity; PITFALLS.md notes it adds complexity. Resolve before Phase 2: does the sales workflow require tag assignments to survive page refresh? If yes, include the localStorage watch. If no, skip it.

- **Vendor fixture selection** -- The specific 20-40 vendors to use as mock data are not defined. Choose real edtech brand names before writing Phase 2 data files. The distribution of DPA statuses and risk tiers matters -- enough gaps must be present to make the product value obvious. Suggested names: Google Workspace for Education, Canvas, Clever, Seesaw, IXL, Schoology, Turnitin, DreamBox, Nearpod, Kahoot.

---

## Sources

### Primary (HIGH confidence)
- Vue 3 official documentation (training data) -- composition API, script setup, component patterns
- Vue Router 4 official documentation (training data) -- hash history, createWebHashHistory, router.meta
- Pinia 2 official documentation (training data) -- store patterns, localStorage watch

### Secondary (MEDIUM confidence)
- PrimeVue 4 documentation and community (training data) -- DataTable API, Aura theme, component catalog
- Apache ECharts + vue-echarts documentation (training data) -- tree-shaking import pattern, chart types
- Edtech compliance platform analysis: SDPC, Privacy Vaults Online, Lightspeed Systems, GoGuardian, CoSN privacy toolkit, 1EdTech certification registry (training data, mid-2024 state)

### Tertiary (LOW confidence)
- Tailwind CSS 4 vs 3 guidance -- Tailwind 4 was emerging at training cutoff; recommendation to stay on Tailwind 3 should be verified against current ecosystem state before project start

---
*Research completed: 2026-05-13*
*Ready for roadmap: yes*