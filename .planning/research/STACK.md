# Stack Research: Vue 3 SPA Data Portal

**Project:** District Demo Portal
**Researched:** 2026-05-13
**Research mode:** Ecosystem
**Overall confidence:** MEDIUM — web search and WebFetch were unavailable; findings are drawn from training knowledge (cutoff August 2025). Version numbers should be verified against npm before install.

---

## Recommended Stack

| Layer | Library | Version (approx) | Rationale |
|-------|---------|-----------------|-----------|
| Routing | vue-router | ^4.4.x | Official Vue router, ships with Vue 3 ecosystem |
| State | Pinia | ^2.2.x | Official Vue state library; lighter than Vuex, composable-friendly |
| UI framework | PrimeVue | ^4.x | Richest Vue 3 native component set including DataTable; no React dependency |
| Tables | PrimeVue DataTable | (bundled) | Built-in sorting, filtering, pagination — no second install |
| Charts | Chart.js + vue-chartjs | Chart.js ^4.x / vue-chartjs ^5.x | Lightweight, well-maintained Vue 3 wrapper; covers bar, line, doughnut, radar |
| Styling | Tailwind CSS | ^3.4.x | Utility-first; fast layout iteration without growing a CSS file |
| Icons | Heroicons or Lucide Vue | latest | Both Vue 3 native, tree-shakeable, good for sidebar/status icons |

---

## Vue Router Setup

**Use `createWebHashHistory` for GitHub Pages, not `createWebHistory`.**

GitHub Pages serves static files and cannot handle HTML5 pushstate fallbacks — any direct navigation to `/district-demo/discovery` returns a 404 because there is no server rewriting the path. Hash history (`/#/discovery`) requires zero server configuration and works identically on GitHub Pages.

The alternative is a 404.html redirect hack (copy `dist/index.html` to `dist/404.html`). This works but is fragile and breaks on hard refresh in some CDN edge cases. Hash history is simpler and has no downsides for a guided sales demo.

**Recommended router structure:**

```
src/
  router/
    index.js          ← createRouter + route definitions
  views/
    DiscoveryView.vue
    DpaView.vue
    RiskView.vue
    EdtechView.vue
    TagsView.vue
  layouts/
    DefaultLayout.vue ← persistent sidebar + <RouterView />
```

`App.vue` renders `<DefaultLayout />`. The layout owns the sidebar nav. `<RouterView />` renders inside the content area. This means the sidebar never remounts on navigation — critical for smooth demo feel.

**Route definition pattern:**

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/discovery' },
  { path: '/discovery', component: () => import('../views/DiscoveryView.vue') },
  { path: '/dpa', component: () => import('../views/DpaView.vue') },
  { path: '/risk', component: () => import('../views/RiskView.vue') },
  { path: '/edtech', component: () => import('../views/EdtechView.vue') },
  { path: '/tags', component: () => import('../views/TagsView.vue') },
]

export default createRouter({ history: createWebHashHistory('/district-demo/'), routes })
```

Lazy imports (`() => import(...)`) are free with Vite and slightly improve initial load, but for a demo with 5 routes it is not critical. Include anyway as a habit.

**Adding/removing sections:** Adding a page = one route entry + one view file. No layout changes. This satisfies the "section structure flexible" requirement.

**Confidence:** HIGH — Vue Router 4 + hash history for GitHub Pages is a well-established pattern with no known alternatives.

---

## State Management

**Recommendation: Pinia, not raw composables.**

For a mock-data SPA with 4-5 data domains (vendors, DPA records, risk scores, 1EdTech status, tags), Pinia is the right call over standalone composables for these reasons:

1. **Cross-page data sharing is trivial.** Risk page needs both discovery data and DPA data to compute a converged view. With composables, you either pass props through layout or duplicate the import chain. With Pinia, both stores are imported directly where needed.

2. **Mock data loading pattern is cleaner.** Store action loads mock JSON on first access; all pages read from the same reactive state. No prop drilling, no event bus.

3. **Vue Devtools integration.** Pinia stores appear in Vue Devtools with full state inspection and time-travel. For iterating a demo, this is valuable.

4. **Tags management requires shared mutable state.** Tags created on the Tags page need to be usable on the Discovery page. This cross-route reactive dependency is exactly what a store solves.

Composables are fine for UI-local state (modal open/close, selected row, active filter). Use composables for that. Use Pinia for data that crosses route boundaries.

**Recommended store layout:**

```
src/
  stores/
    vendors.js    ← discovery/domain data
    dpa.js        ← DPA status records
    tags.js       ← tag definitions + assignments (mutable)
    edtech.js     ← 1EdTech certification data
```

Risk page derives its view from `vendors` + `dpa` stores via computed properties — no separate risk store needed unless the computation gets heavy.

**Mock data pattern:**

```js
// src/data/vendors.js  ← editable by sales rep
export const vendorData = [ ... ]

// src/stores/vendors.js
import { defineStore } from 'pinia'
import { vendorData } from '../data/vendors.js'

export const useVendorStore = defineStore('vendors', {
  state: () => ({ vendors: vendorData }),
  getters: { /* filtered views */ }
})
```

Sales rep edits `src/data/vendors.js` only — never touches a store or component.

**Confidence:** HIGH — Pinia is the official Vue 3 state library; this pattern is standard.

---

## Data Display

**Recommendation: PrimeVue DataTable.**

The project needs sortable, filterable tables for vendor lists, DPA records, and 1EdTech status. Options considered:

| Option | Verdict | Reason |
|--------|---------|--------|
| PrimeVue DataTable | Use this | Native Vue 3, feature-complete out of the box, same install as UI components |
| TanStack Table v8 (headless) | Avoid for this project | Headless — requires building all UI chrome; justified for design-system products, overkill here |
| AG Grid Community | Avoid | Heavy (600KB+), React-first mental model, licensing complexity |
| Vuetify v-data-table | Avoid | Vuetify's Material Design opinion conflicts with a clean enterprise portal look; installing Vuetify for tables alone is wasteful |
| vue3-easy-data-table | Avoid | Small community, less maintained, fewer features |

PrimeVue DataTable supports:
- Column sorting (client-side, instant)
- Column filtering
- Pagination
- Row selection
- Exportable to CSV (useful for sales demo credibility)
- Conditional row/cell styling (needed for risk color coding)

The deciding factor is that PrimeVue ships both the table component AND the surrounding UI components (buttons, badges, chips, dropdowns) in one coherent package. This avoids the "mixing two design systems" problem.

**PrimeVue theming:** Use Aura theme (introduced in PrimeVue 4) or Lara. Both produce a clean, professional enterprise look appropriate for district admins. Avoid the Material theme.

**Confidence:** HIGH for PrimeVue as a category recommendation. MEDIUM for specific version (PrimeVue 4 was current at training cutoff; verify ^4.x is still latest on npm).

---

## Visualization

**Recommendation: Apache ECharts via vue-echarts.**

For a risk dashboard, the chart needs to communicate converged risk across multiple vendors — this points toward a heatmap, scatter plot, or matrix visualization rather than simple bar/line charts.

| Option | Verdict | Reason |
|--------|---------|--------|
| Apache ECharts + vue-echarts | Use this | Richest chart type library including heatmap, scatter, treemap, gauge — exactly the types useful for a risk position view |
| Chart.js + vue-chartjs | Good fallback | Well-maintained, lighter, but limited to bar/line/pie/doughnut/radar — no heatmap or scatter matrix |
| Recharts | Avoid | React only |
| D3.js | Avoid | Raw D3 in a Vue SPA is engineering overhead not justified for a sales demo |
| Highcharts | Avoid | Commercial license required for non-open-source use |
| ApexCharts + vue3-apexcharts | Acceptable alternative | Feature-rich, Vue 3 wrapper maintained, but ECharts has better heatmap support |

**Why ECharts over Chart.js for this project specifically:** The Risk Position page visualization is explicitly undefined and needs flexibility. ECharts supports ~20+ chart types with consistent API. If the team decides risk should be a heatmap grid (vendor × risk dimension), a scatter plot (likelihood × impact), or a gauge, ECharts handles all three without swapping libraries. Chart.js would require a plugin or a library swap for heatmaps.

**vue-echarts install pattern:**

```bash
npm install echarts vue-echarts
```

```vue
<script setup>
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])
</script>
```

The tree-shaking import pattern keeps bundle size reasonable (import only the chart types you use).

**Confidence:** MEDIUM — ECharts + vue-echarts is well-established. The specific recommendation over Chart.js is driven by the undefined risk visualization requirement; if the team decides risk = bar chart only, Chart.js would be lighter.

---

## UI Component Library

**Recommendation: PrimeVue 4 with Tailwind CSS for layout.**

PrimeVue provides the component library (tables, dropdowns, badges, chips, dialogs, tooltips). Tailwind handles page layout, spacing, and sidebar structure. They coexist without conflict — PrimeVue Aura/Lara themes are CSS variables-based, and Tailwind prefixes do not collide.

**Why not Vuetify:**
- Opinionated Material Design aesthetic looks dated for an enterprise SaaS portal
- Installing Vuetify replaces your entire design language; harder to match a product's brand

**Why not Naive UI:**
- Solid library but smaller community; fewer enterprise-quality table features

**Why not Quasar:**
- Full framework that wants to own routing, build, and deployment; conflicts with existing Vite setup

**Why not Element Plus:**
- Heavy, aging aesthetic, Vue 3 support added later (less idiomatic)

**Tailwind version note:** Use Tailwind 3.x. Tailwind 4 (released early 2025) dropped the `tailwind.config.js` approach in favor of CSS-only configuration. Tailwind 3 has more documentation, more community examples, and cleaner Vite integration at this time. Re-evaluate at Tailwind 4.1+.

**Confidence:** HIGH for PrimeVue recommendation. MEDIUM for Tailwind 3 vs 4 guidance (Tailwind 4 ecosystem was still maturing at training cutoff — verify current state).

---

## What NOT to Use

| Library | Reason to Avoid |
|---------|----------------|
| Vuex | Superseded by Pinia; Vue team officially recommends Pinia for new projects |
| createWebHistory | Breaks on GitHub Pages without a server rewrite rule; use createWebHashHistory instead |
| Nuxt | SSR framework; this is a static SPA with no server — Nuxt adds build complexity for zero benefit |
| AG Grid | 600KB+, commercial features gated, React-first; overkill for a demo portal |
| D3.js | Low-level; requires significant engineering to integrate cleanly with Vue reactive data |
| Highcharts | Commercial license — not appropriate for a demo without a license in place |
| Vuetify | Material Design aesthetic wrong for enterprise portal; installs a full design system that fights the project's needs |
| React libraries (any) | Vue 3 and React do not share component ecosystems; any library requiring React is incompatible |
| Axios | No backend calls in this project; fetch() or static JS imports handle all data loading |
| Vue 2 libraries | Vue 2 EOL was December 2023; any library requiring Vue 2 is incompatible with Vue 3.5 |

---

## Confidence Levels

| Area | Level | Basis |
|------|-------|-------|
| Vue Router 4 + hash history for GitHub Pages | HIGH | Official pattern, well-documented, no known contradictions |
| Pinia for cross-route state | HIGH | Official Vue state library, standard recommendation |
| PrimeVue DataTable | HIGH (category), MEDIUM (version) | Strong 2024 ecosystem position; version ^4.x should be verified on npm |
| ECharts + vue-echarts | MEDIUM | Training knowledge; vue-echarts was actively maintained through 2024, verify current release |
| Tailwind CSS 3.x | MEDIUM | Tailwind 4 was emerging at training cutoff; recommendation to stay on 3.x should be verified |
| PrimeVue over Vuetify/Element Plus | HIGH | Architectural rationale is sound regardless of minor version differences |

---

## Installation Summary

```bash
# Routing + state
npm install vue-router pinia

# UI + table components
npm install primevue @primevue/themes primeicons

# Charts
npm install echarts vue-echarts

# Utility CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Verify versions on npm before running** — training knowledge does not guarantee these are current latest.
