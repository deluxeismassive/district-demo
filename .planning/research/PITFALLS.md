# Pitfalls Research

**Project:** District Demo Portal
**Domain:** Edtech sales demo SPA (Vue 3 + Vite, GitHub Pages, mock data)
**Researched:** 2026-05-13
**Confidence:** HIGH — based on direct analysis of codebase, project constraints, and established Vue 3/GitHub Pages patterns

---

## Common Mistakes

### 1. Using `history` mode router on GitHub Pages without a 404 fallback

**What goes wrong:** Vue Router defaults to `createWebHistory`. GitHub Pages serves a real 404 for any URL that is not `index.html`. When a sales rep shares a direct link to `/discovery` or refreshes mid-demo, the user hits a GitHub Pages 404 page — a fatal demo-kill.

**Why it happens:** Developers test only via `npm run dev` where Vite's dev server handles all routes. The problem is invisible until deployed.

**Prevention:** Use `createWebHashHistory` for GitHub Pages deployments. Hash-based routing (`/#/discovery`) requires no server-side fallback. Alternatively, copy `index.html` to `404.html` in the `dist` output and add the GitHub Pages SPA redirect script — but this is more fragile than hash routing for a demo.

**Confidence:** HIGH — this is a well-documented, reproducible GitHub Pages constraint.

---

### 2. Hardcoding the base path without accounting for `createWebHistory` base option

**What goes wrong:** `vite.config.js` already has `base: '/district-demo/'`. If `createWebHistory()` is used without passing the same base (`createWebHistory('/district-demo/')`), router links resolve to `/discovery` instead of `/district-demo/discovery`, causing 404s only on the deployed site.

**Why it happens:** The base path setting in Vite and the base option in Vue Router are separate concerns that must be kept in sync. Easy to set one and forget the other.

**Prevention:** If using hash history, this issue disappears entirely. If using web history, always pass `import.meta.env.BASE_URL` (which Vite populates from the `base` config) as the base argument to `createWebHistory`.

---

### 3. No `vue-router` in `package.json` yet — installing it late causes structural rework

**What goes wrong:** Routing is added after components are built. Components already use `<a href>` tags or direct imports for navigation instead of `<RouterLink>`. Retrofitting routing requires touching every navigation element.

**Prevention:** Install `vue-router` and establish the router structure in the first phase, before any page components are built. All navigation uses `<RouterLink>` from day one.

---

### 4. Monolithic `App.vue` accumulates layout that should be in a layout component

**What goes wrong:** The persistent sidebar/header nav gets built directly into `App.vue`. As pages grow, `App.vue` becomes a large mixed file. Changing the nav for a specific demo requires untangling layout from routing logic.

**Prevention:** Create a `AppLayout.vue` or `DefaultLayout.vue` component immediately. `App.vue` should contain only `<RouterView>` wrapped in the layout shell. This keeps the nav/sidebar isolated and easy to change same-day.

---

### 5. Tags CRUD state managed locally in a single component

**What goes wrong:** Tags are the only interactive CRUD operation. If tag state lives in a page component's `ref()`, navigating away and back resets all tags. Two pages that both display tags (Discovery and DPA both reference vendor tags) show inconsistent state.

**Prevention:** Tags state must live in a shared Pinia store or a module-level reactive singleton from the first time tags are implemented. This is not premature optimization — it is a routing requirement.

---

## Mock Data Pitfalls

### 1. Mock data defined inside `.vue` files

**What goes wrong:** A developer hardcodes vendor arrays as `const vendors = [...]` inside `<script setup>` of `DiscoveryPage.vue`. When sales needs a data change two hours before a demo, the developer must locate the component, understand the component logic, edit data inline, rebuild, and redeploy. High cognitive load under time pressure.

**Why it happens:** Feels faster during initial build. "I'll move it later" never happens.

**Prevention:** Establish a `src/data/` directory before writing any page. All mock datasets are plain JS or JSON files (e.g., `src/data/vendors.js`, `src/data/dpaStatus.js`). Components `import { vendors } from '@/data/vendors.js'` and contain zero hardcoded data. This is a structural rule enforced at project setup, not at cleanup time.

**Confidence:** HIGH — this is the central same-day iteration requirement from PROJECT.md.

---

### 2. Mock data structure does not match what the UI actually needs

**What goes wrong:** Discovery page needs `{ vendorName, domain, usageFrequency, lastSeen, studentCount, userCount, tags }`. Developer creates `{ name, freq, date, students }` because it felt right at the time. Components end up with transformation logic (`item.name || item.vendorName`) that accumulates and breaks when data is restructured for the DPA page.

**Prevention:** Define a canonical data schema before writing any component. Write it as a comment or JSDoc type at the top of each data file. DPA data, Discovery data, and Risk data all reference a shared vendor identifier so cross-page joins are deterministic. Schema decisions: establish once, update the data file when changing.

---

### 3. Separate data files that silently drift out of sync

**What goes wrong:** `vendors.js` has 12 vendors. `dpaStatus.js` references 10 of them by name (with slightly different casing). The Risk page tries to join them — 2 vendors have no DPA record, 1 has a name mismatch. The demo shows blank cells next to real data, which looks like a bug to a district admin.

**Prevention:** Use a single vendor ID as the join key across all data files. `VENDOR_ACME` not `"Acme"`. The Risk page can then safely join `vendors[id]` and `dpa[id]` without string-matching. Add a data validation helper (can be as simple as a `console.warn` on startup) that checks all referenced IDs exist in the vendor master list.

---

### 4. Tags stored only in component state, lost on navigation

**What goes wrong:** Tags assigned to a vendor on the Discovery page disappear when the user clicks to the DPA page and comes back. In front of a district admin, this makes the product look broken.

**Prevention:** Tags must be stored in a reactive store (Pinia) that persists for the session. Since this is a demo with no backend, in-memory Pinia state is sufficient — tags survive navigation within the session. Do not persist to localStorage unless explicitly required (adds complexity for no demo benefit).

---

### 5. Mock data volume that doesn't support the story

**What goes wrong:** The demo has 3 vendors. The Discovery page's usage metrics, the DPA status grid, the Risk visualization — all of them look sparse and unconvincing. District admins manage hundreds of vendors. A 3-vendor demo fails to communicate the scale of the problem the product solves.

**Prevention:** Seed mock data with enough records to feel realistic — 20-40 vendors minimum, with a spread across DPA statuses (signed, expired, missing, pending), risk levels, and 1EdTech certification states. The data volume itself is part of the sales narrative.

---

## Vue Router Pitfalls

### 1. `createWebHistory` on GitHub Pages causes 404 on direct URL or refresh

Covered in Common Mistakes #1. This is the single highest-probability catastrophic failure for a demo. **Use `createWebHashHistory`.**

---

### 2. Router not installed in `main.js` — `<RouterLink>` silently does nothing

**What goes wrong:** `vue-router` is added as a dependency and the router file is created, but `app.use(router)` is forgotten in `main.js`. `<RouterLink>` renders as plain `<a>` tags but does not navigate. No error is thrown.

**Prevention:** The moment `createRouter` is called in a router file, `main.js` must be updated in the same commit. Treat them as an atomic pair.

---

### 3. Route definitions added to the wrong place as the app grows

**What goes wrong:** Routes start in `main.js`. Then a developer creates `router/index.js` but doesn't move the old routes. Duplicate route definitions, conflicting names, and silent navigation failures result.

**Prevention:** Create `src/router/index.js` on day one. Never define routes anywhere else. All page additions require only adding one entry to that file — this is the "easy to add or remove pages without structural rework" requirement from PROJECT.md.

---

### 4. Missing `<RouterView>` in the layout means pages never render

**What goes wrong:** Layout component has nav sidebar and header. Developer forgets to add `<RouterView />` in the content area. All routes are defined and working, but the page area is blank. This is easy to miss if the layout is built before routing is wired up.

**Prevention:** Wire up the router and confirm `<RouterView>` renders a test route before building any page content.

---

### 5. Active route highlighting not wired to router state

**What goes wrong:** Nav sidebar has active state styling but it is driven by a manual `ref` instead of `useRoute().path`. The active highlight stays on the first page no matter where the user navigates. In a demo this looks like a broken UI.

**Prevention:** Nav link active state must use Vue Router's built-in `RouterLink` `active-class` / `exact-active-class`, or derive active state from `useRoute()`. Never track current route manually.

---

## Demo-Specific Risks

### 1. Demo crashes or goes blank mid-presentation

**What goes wrong:** A JavaScript error caused by a null data field, a missing vendor ID, or an undefined property access causes an unhandled exception. The entire SPA goes blank. A white screen in front of a district admin is a deal-killer.

**Why it happens:** Mock data is inconsistently structured. No error boundaries. A field that exists on 11 of 12 vendors is accessed without a null check on the 12th.

**Prevention:** 
- All data access in templates uses optional chaining (`vendor?.dpa?.status ?? 'Unknown'`)
- Add a top-level Vue error handler in `main.js` (`app.config.errorHandler`) that catches rendering errors and displays a fallback message instead of going blank
- Before any demo, run through every page once to confirm no console errors

---

### 2. The demo looks obviously fake

**What goes wrong:** Vendor names are "Vendor A", "Vendor B". Dates are "2024-01-01". All risk scores are the same value. DPA statuses are all "Signed". The district admin's trust in the product's ability to handle real complexity evaporates.

**Prevention:** Mock data must be realistic:
- Use actual ed-tech vendor names (Google Workspace for Education, Canvas, Clever, Seesaw, IXL, etc.)
- Use varied, realistic dates with some expired, some near-expiry, some recent
- Include a spread of statuses: some DPAs signed, some missing, some expired
- Risk distribution should show the problem the product solves — most value comes from the "gap" the product identifies

---

### 3. A sales rep can't make a data change without developer help

**What goes wrong:** Data is in components (covered above) OR data is in JSON files but the sales rep doesn't know which file controls which section, or the file structure is confusing.

**Prevention:** 
- Keep data files flat and obviously named: `src/data/vendors.js`, `src/data/dpa.js`, `src/data/oneEdTech.js`
- Add a comment at the top of each file: `// Edit this file to change what appears on the Discovery page`
- Consider a single `src/data/index.js` that re-exports all datasets — one place to look

Note: "sales rep makes changes" may require a developer for JavaScript files. The goal is that a developer unfamiliar with the codebase can make a data change in under 30 minutes. Sales reps are expected to request changes from a developer, not make them directly.

---

### 4. Page transitions or loading states that look unpolished

**What goes wrong:** Route changes cause a flash of blank content, or the Risk visualization takes a render cycle to appear and shows a layout shift. In a live demo on a projector, these visual artifacts are amplified.

**Prevention:** Keep page transitions simple or absent. No async data loading (everything is synchronous mock data). No spinner states on mock data — spinners on static data look broken. If a chart/visualization needs a render cycle, use `onMounted` with a `v-if` to prevent layout shift, not a loading spinner.

---

### 5. Demo only works on the developer's machine

**What goes wrong:** Demo is tested on localhost. Deployed URL is shared day-of. The `base` path is wrong, assets 404, the router doesn't match, or the gh-pages branch is stale. The sales rep opens the demo URL in front of the client and it fails.

**Prevention:**
- Always test the deployed GitHub Pages URL before any demo, not just localhost
- The `npm run deploy` pipeline must be run and the deployed URL verified as the final step before any sales engagement
- Keep the `gh-pages` branch up to date — stale deployments from a previous demo with different data are a risk

---

### 6. Visual debt accumulates faster than it can be paid

**What goes wrong:** Each phase adds a new page with slightly different styling conventions. The Discovery page uses one card style, the DPA page uses a table, the Risk page uses raw divs. The demo looks like four different products stitched together.

**Prevention:** Define a minimal design system in the first phase — CSS custom properties for color, spacing, and typography; a reusable `DataTable.vue` component; a `StatusBadge.vue` component for the DPA/risk status indicators. Every subsequent page uses the same primitives.

---

## Prevention Strategies

| Risk | Prevention | Effort |
|------|-----------|--------|
| GitHub Pages 404 on refresh | Use `createWebHashHistory` | Low — one-time decision |
| Data in components | Enforce `src/data/` rule from Phase 1 | Low — structural discipline |
| Data drift across files | Use vendor ID as join key, add startup validation | Medium — small validator script |
| Tags lost on navigation | Pinia store for tags, wired at feature start | Low — store is small |
| Demo blank screen on error | `app.config.errorHandler` + optional chaining everywhere | Low — boilerplate |
| Obvious fake data | Use real ed-tech vendor names and varied statuses | Low — copy work |
| Pre-demo not tested on deployed URL | Make deployed URL verification part of deploy checklist | Low — process |
| Inconsistent visual design | Define design tokens + shared components in Phase 1 | Medium — upfront investment |
| Active nav not tracking route | Use `RouterLink` active classes from day one | Low — correct-by-default |
| Tags show inconsistent state | Single Pinia store, never local state for tags | Low — architectural decision |

---

## Phase Mapping

| Phase Topic | Pitfall to Address | Mitigation |
|-------------|-------------------|------------|
| Router + layout setup | `createWebHistory` 404 on GitHub Pages | Use `createWebHashHistory` before any routes are defined |
| Router + layout setup | `<RouterView>` missing | Wire and test `<RouterView>` before building page content |
| Router + layout setup | Active nav state manual tracking | Use `RouterLink` active classes from the start |
| Router + layout setup | Monolithic `App.vue` | Create `AppLayout.vue` in this phase, not later |
| Data layer setup | Mock data in components | Establish `src/data/` structure before any page is built |
| Data layer setup | Data schema mismatch | Define canonical vendor schema with JSDoc before writing components |
| Data layer setup | Data drift / join failures | Choose vendor ID key; add startup validation |
| Data layer setup | Thin, unconvincing data | Seed 20-40 vendors with realistic names and varied statuses |
| Tags feature | Tags lost on navigation | Implement Pinia store as part of tags feature, not as an afterthought |
| Tags feature | Tags state inconsistency across pages | Store is the single source of truth; no local copies |
| Any page with visualization | Layout shift / blank flash | Use `v-if` on `onMounted`, no loading spinners on mock data |
| All pages | Demo crash on null data | Optional chaining in all data access; `app.config.errorHandler` |
| All pages | Visual inconsistency | Use shared components (`StatusBadge`, `DataTable`) from first page built |
| Pre-demo / deployment | Stale or broken deployed URL | Verify deployed GitHub Pages URL after every `npm run deploy` |

---

*Confidence note: All pitfalls derived from direct codebase analysis and established Vue 3 / GitHub Pages / sales demo patterns. No external search sources were available. Confidence is HIGH for Vue Router / GitHub Pages constraints (well-documented, reproducible), HIGH for mock data decoupling (directly stated requirement in PROJECT.md), MEDIUM for demo-specific presentation risks (based on general demo/sales patterns, not edtech-specific research).*
