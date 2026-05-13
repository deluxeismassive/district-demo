# Phase 1: Shell & Routing - Research

**Researched:** 2026-05-13
**Domain:** Vue Router 4, Pinia, PrimeVue 4, Tailwind CSS v4, SPA shell layout
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Use `createWebHashHistory` — non-negotiable for GitHub Pages static deployment. No `createWebHistory`.
- **D-02:** Four top-level routes: `/` (Dashboard), `/discovery` (Discovery), `/reports` (Reports), `/settings` (Settings)
- **D-03:** Reports page uses sub-navigation / tabs for DPA, Risk Position, and 1EdTech — single `/reports` route, tab state managed in-page
- **D-04:** Sidebar is fixed, always visible — no collapse behavior
- **D-05:** Nav order: Dashboard → Discovery → Reports → Settings
- **D-06:** Product name "Schoolday" appears in the sidebar header/logo area
- **D-07:** Demo district will be a real-sounding name — specific name decided in Phase 2; district name shown in top header area
- **D-08:** Clean enterprise aesthetic — dark sidebar, white/light content area
- **D-09:** Component library: PrimeVue + Tailwind CSS
- **D-10:** Primary color: `#484CE6` (blue-violet) — used for active nav state, buttons, primary actions
- **D-11:** Accent color: `#DA8231` (orange) — used for highlights, badges, key callouts
- **D-12:** No additional brand colors specified — build a neutral gray/white content surface around these two anchors
- **D-13:** Dashboard shows overview/summary stats — stub initially, content filled in Phase 2+
- **D-14:** All stub pages display loading skeletons — gray placeholder rows/blocks that look like data is about to load
- **D-15:** Pinia store initialized in Phase 1 — single `useTagsStore` for shared tag state, accessible from all pages. Empty store at this stage.

### Claude's Discretion
- Specific PrimeVue theme preset to use (Lara / Aura / Nora) — choose whichever pairs best with `#484CE6` as primary
- Icon set for sidebar nav items — any clean icon library (Heroicons, Lucide, PrimeIcons) that fits PrimeVue
- Exact sidebar width and padding
- Skeleton row count and shape per page type (table skeletons vs card skeletons)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within Phase 1 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | App has multi-page SPA routing with a persistent sidebar nav linking all sections | Vue Router 4 with `createWebHashHistory` + `<RouterLink>` active classes; sidebar driven by `router.meta.nav` pattern |
| FOUND-02 | Every page renders inside a consistent app shell (header, nav, content area) | `AppShell.vue` layout component wrapping `<RouterView />`; sidebar never remounts on navigation |
| FOUND-04 | Pinia store manages shared tag state accessible across all pages | `useTagsStore` defined in `src/stores/tags.js`; registered in `main.js`; stub at Phase 1 with empty state |
</phase_requirements>

---

## Summary

Phase 1 installs Vue Router 4, Pinia 3, PrimeVue 4, and Tailwind CSS v4 — then wires up the full app shell: a persistent dark sidebar with "Schoolday" branding, four route stubs (Dashboard, Discovery, Reports, Settings), and the Pinia tags store. No real data. All views show loading skeleton placeholders.

The major complexity in this phase is the three-way integration of PrimeVue 4 theming (CSS variables), Tailwind v4 (also CSS variables via `@theme`), and the project's existing `style.css`. All three systems work via CSS custom properties and do not conflict, but the initialization order in `main.js` and the CSS import order in `style.css` matters.

The route structure diverges from the prior research docs: the canonical Phase 1 structure has four top-level routes (Dashboard `/`, Discovery `/discovery`, Reports `/reports`, Settings `/settings`), not the six-route layout from `.planning/research/ARCHITECTURE.md`. The Reports route hosts DPA, Risk, and 1EdTech as in-page tabs — this simplifies routing substantially.

**Primary recommendation:** Install packages first, wire router + Pinia in `main.js`, build `AppShell.vue` + `SidebarNav.vue`, create four stub view files, then add the PrimeVue Skeleton component to each stub. Validate navigation and active highlight before moving to visual polish.

---

## Standard Stack

### Core — verified against npm registry 2026-05-13

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| vue-router | 5.0.7 | SPA routing with hash history | Official Vue router; `createWebHashHistory` required for GitHub Pages |
| pinia | 3.0.4 | Global state management | Official Vue state library; Composition API native; Vue Devtools integration |
| primevue | 4.5.5 | UI component library (tables, skeleton, badges, dialogs) | Richest Vue 3-native component set; DataTable ships without extra install |
| @primeuix/themes | 2.0.3 | PrimeVue theme presets (Aura, Lara, Nora) | Required companion package; imports via `@primeuix/themes/aura` etc. |
| tailwindcss | 4.3.0 | Utility CSS for layout, spacing, sidebar structure | v4 is current latest; no config file needed; CSS-only configuration |
| @tailwindcss/vite | 4.3.0 | Tailwind v4 Vite plugin | Replaces postcss/autoprefixer pipeline; required for v4 Vite integration |

**Note on `@primevue/themes` vs `@primeuix/themes`:** The npm registry has both packages. PrimeVue 4.x official docs (primevue.org) specify `@primeuix/themes` as the correct import path. The `@primevue/themes` package (4.5.4) is a legacy alias. Use `@primeuix/themes`.

**Note on primeicons:** PrimeIcons (v7.0.0 on npm) is the companion icon font for PrimeVue. If PrimeIcons is chosen as the icon set, install separately: `npm install primeicons`. If using Lucide or Heroicons instead, skip this package.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| primeicons | 7.0.0 | Icon font (pi-home, pi-chart-bar, etc.) | If PrimeIcons chosen for sidebar nav icons |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tailwind v4 | Tailwind v3.4.19 (v3-lts tag) | v3 has more community examples and `tailwind.config.js` — lower cognitive load, but v4 is current latest and simpler Vite setup |
| PrimeIcons | Lucide Vue Next | Lucide is tree-shakeable SVGs (no font file); PrimeIcons works out-of-box with PrimeVue components; either is fine |
| PrimeIcons | Heroicons | Same tradeoff as Lucide — SVG-only, works without font; requires installing `@heroicons/vue` |

**Installation:**

```bash
# Routing + state
npm install vue-router pinia

# UI components + theme presets
npm install primevue @primeuix/themes

# Tailwind v4 (Vite-native)
npm install -D tailwindcss @tailwindcss/vite

# Icons (if using PrimeIcons)
npm install primeicons
```

**Version verification (run before installing):**
```bash
npm view vue-router version      # 5.0.7
npm view pinia version           # 3.0.4
npm view primevue version        # 4.5.5
npm view @primeuix/themes version  # 2.0.3
npm view tailwindcss version     # 4.3.0
npm view @tailwindcss/vite version # 4.3.0
```

---

## Architecture Patterns

### Phase 1 Project Structure

This is the structure after Phase 1 completes. Only files with a `+` are created in this phase.

```
src/
├── main.js                      # MODIFIED: add router, pinia, primevue plugins
├── App.vue                      # MODIFIED: replace HelloWorld with <AppShell />
├── style.css                    # MODIFIED: add Tailwind import, CSS tokens

├── router/
│   └── index.js                 # + Route definitions (4 routes)

├── stores/
│   └── tags.js                  # + Pinia tags store (empty stub)

├── components/
│   └── layout/
│       ├── AppShell.vue         # + Persistent shell: sidebar + <RouterView>
│       └── SidebarNav.vue       # + Nav link list from router meta

└── views/
    ├── DashboardView.vue        # + Stub with skeleton cards
    ├── DiscoveryView.vue        # + Stub with skeleton table rows
    ├── ReportsView.vue          # + Stub with tab nav + skeleton content
    └── SettingsView.vue         # + Stub with skeleton list rows
```

Files NOT in Phase 1 (created in later phases):
- `src/data/` — Phase 2
- `src/components/shared/` — Phase 2+
- `src/stores/vendors.js`, `dpa.js` etc. — Phase 2+

### Pattern 1: Router with Hash History + Route Meta for Nav

**What:** Declare all four routes in `src/router/index.js` using `createWebHashHistory`. Add `meta.nav: true` to routes that appear in the sidebar. `SidebarNav.vue` reads this at runtime.

**When to use:** Always. This is the canonical pattern for static-hosted Vue SPAs.

```javascript
// Source: official Vue Router docs + primevue.org/vite
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { nav: true, label: 'Dashboard', icon: 'pi pi-home' }
  },
  {
    path: '/discovery',
    name: 'discovery',
    component: () => import('../views/DiscoveryView.vue'),
    meta: { nav: true, label: 'Discovery', icon: 'pi pi-search' }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { nav: true, label: 'Reports', icon: 'pi pi-chart-bar' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { nav: true, label: 'Settings', icon: 'pi pi-cog' }
  }
]

export default createRouter({
  history: createWebHashHistory('/district-demo/'),
  routes
})
```

The base `/district-demo/` matches `vite.config.js`'s `base` setting.

### Pattern 2: main.js Plugin Registration Order

**What:** Register Pinia before PrimeVue; register router last. This ensures Pinia stores are available if PrimeVue plugins ever need reactive state.

```javascript
// Source: official primevue.org/vite installation guide
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import router from './router/index.js'
import './style.css'
import App from './App.vue'

const SchoolDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#eeeeff',
      100: '#d4d4fc',
      200: '#ababf8',
      300: '#8284f4',
      400: '#6466ef',
      500: '#484ce6',   // brand primary
      600: '#3c40cc',
      700: '#3034b3',
      800: '#252899',
      900: '#1a1d80',
      950: '#0f1166'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: SchoolDayPreset,
    options: {
      darkModeSelector: false   // disable dark mode — enterprise demo is light-mode only
    }
  }
})
app.use(router)

app.mount('#app')
```

**Why `darkModeSelector: false`:** The portal uses a dark sidebar with a light content area — this is a layout pattern, not a CSS dark mode toggle. Disabling PrimeVue's dark mode system keeps component styling predictable without `.dark` class management.

### Pattern 3: AppShell Layout (Sidebar + RouterView)

**What:** One layout component owns the persistent chrome. `App.vue` mounts it unconditionally. `<RouterView />` renders the current page inside the content area.

```vue
<!-- src/components/layout/AppShell.vue -->
<script setup>
import SidebarNav from './SidebarNav.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <SidebarNav />
    <main class="flex-1 overflow-y-auto bg-white">
      <RouterView />
    </main>
  </div>
</template>
```

```vue
<!-- src/App.vue — replace HelloWorld with AppShell -->
<script setup>
import AppShell from './components/layout/AppShell.vue'
</script>

<template>
  <AppShell />
</template>
```

The `flex h-screen overflow-hidden` + `flex-1 overflow-y-auto` pattern is the standard Tailwind approach for a fixed-height sidebar with a scrollable content area.

### Pattern 4: SidebarNav with Active Route Highlighting

**What:** Use `router.getRoutes()` filtered by `meta.nav` to generate nav links dynamically. Use Vue Router's `RouterLink` with `active-class` for automatic active state — no manual tracking.

```vue
<!-- src/components/layout/SidebarNav.vue -->
<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const navRoutes = router.getRoutes().filter(r => r.meta?.nav)
</script>

<template>
  <nav class="flex flex-col w-64 h-screen bg-gray-900 text-white shrink-0">
    <!-- Brand header -->
    <div class="px-6 py-5 border-b border-gray-700">
      <span class="text-lg font-semibold tracking-wide">Schoolday</span>
    </div>

    <!-- Nav links -->
    <ul class="flex-1 py-4 space-y-1 px-3">
      <li v-for="route in navRoutes" :key="route.name">
        <RouterLink
          :to="route.path"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          active-class="bg-primary text-white"
          exact-active-class="bg-primary text-white"
        >
          <i :class="route.meta.icon" class="text-base" />
          <span class="text-sm font-medium">{{ route.meta.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
```

**Active class approach:** `active-class` on `RouterLink` tells Vue Router which CSS class to apply when the route matches. Since `#484CE6` is defined as `--color-primary` in Tailwind's `@theme`, the class `bg-primary` resolves correctly.

**Important:** `/` (Dashboard) needs `exact-active-class` not just `active-class` — otherwise Dashboard stays highlighted on all routes since `/` is a prefix of everything. Using both `active-class` and `exact-active-class` on all links is safe; the distinction only matters for the root route.

### Pattern 5: Tailwind v4 Configuration in style.css

**What:** Tailwind v4 uses a single `@import "tailwindcss"` directive plus `@theme` blocks for custom tokens. No `tailwind.config.js`. Custom colors defined in `@theme` generate utility classes automatically.

```css
/* src/style.css */
@import "tailwindcss";

@theme {
  --color-primary: #484ce6;
  --color-accent: #da8231;

  /* Sidebar background token for consistency */
  --color-sidebar: #111827;  /* gray-900 equivalent */
}
```

After this, classes like `bg-primary`, `text-primary`, `bg-accent`, `border-primary` are available everywhere.

**vite.config.js addition for Tailwind v4:**

```javascript
// src/vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/district-demo/',
  plugins: [
    vue(),
    tailwindcss(),   // add this
  ],
})
```

### Pattern 6: Pinia Tags Store (Empty Stub)

**What:** Define the store fully in Phase 1 but with empty state. Phase 2 populates it. All downstream components can import and use it without changes.

```javascript
// Source: official pinia.vuejs.org docs
// src/stores/tags.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref([])
  const assignments = ref({})

  return { tags, assignments }
})
```

Phase 2 adds `addTag`, `deleteTag`, `assignTag` etc. to this store without breaking any existing imports.

### Pattern 7: PrimeVue Skeleton in Stub Views

**What:** Use PrimeVue's `Skeleton` component to render believable loading placeholders. Each view gets a plausible skeleton shape for its content type.

```vue
<!-- Example: DiscoveryView.vue stub — table skeleton -->
<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Discovery</h1>

    <!-- Simulated table header -->
    <div class="flex gap-4 mb-3">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="120px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
    </div>

    <!-- Simulated table rows -->
    <div v-for="i in 8" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="120px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
    </div>
  </div>
</template>
```

**Skeleton shapes per view:**
- `DashboardView` — 3-4 stat cards (`width="100%" height="6rem"`) in a grid
- `DiscoveryView` — table header row + 8 data rows (columns of varying width)
- `ReportsView` — tab bar + table skeleton below; tabs are real buttons (not skeleton)
- `SettingsView` — list rows with label + value skeleton pairs

### Anti-Patterns to Avoid

- **`createWebHistory` instead of `createWebHashHistory`:** GitHub Pages returns 404 on hard refresh. Non-negotiable.
- **Routes defined in `main.js`:** Puts route config in the wrong file. Always use `src/router/index.js`.
- **`<RouterView>` forgotten in `AppShell`:** App renders blank — easy miss when building layout before testing routing.
- **Manual `ref` for active nav state:** Use `RouterLink active-class` — never track current route in a reactive variable.
- **`tailwind.config.js` with Tailwind v4:** v4 drops the config file. Custom colors go in `@theme {}` in the CSS file.
- **Dark mode selector conflict:** Don't set `darkModeSelector: 'system'` in PrimeVue — it causes PrimeVue component variants to switch based on OS preference, which looks broken against the intentionally split dark/light layout.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active nav highlighting | Manual `currentRoute` ref + conditional class | `RouterLink active-class` prop | Router knows active state; manual tracking desynchronizes on programmatic navigation |
| Loading skeleton placeholders | CSS `background: linear-gradient` shimmer animation | PrimeVue `<Skeleton>` | Ships with correct animation timing, dark mode awareness, and accessible aria attributes |
| Color utility classes for brand colors | Inline `style="color: #484CE6"` everywhere | Tailwind `@theme --color-primary` | Generates `bg-primary`, `text-primary`, `border-primary` — consistent, refactorable |
| PrimeVue theme customization | CSS overrides that target internal PrimeVue class names | `definePreset()` API | Internal PrimeVue classes are not stable across patch releases; `definePreset` is the supported extension point |
| Route list in sidebar | Hardcoded `<RouterLink to="/discovery">Discovery</RouterLink>` list | `router.getRoutes().filter(r => r.meta?.nav)` | Adding a route automatically updates the sidebar; no two-file sync required |

**Key insight:** The router meta pattern (`meta.nav`, `meta.label`, `meta.icon`) is the single most important structural decision in this phase. It ensures the sidebar never needs to be edited when routes change — a direct enabler of the "section structure flexible" requirement.

---

## Common Pitfalls

### Pitfall 1: `createWebHistory` on GitHub Pages
**What goes wrong:** Direct URL load (`/district-demo/reports`) or browser refresh returns GitHub Pages 404.
**Why it happens:** Tested only on `npm run dev` where Vite handles all URLs. Works locally; fails on deploy.
**How to avoid:** Use `createWebHashHistory('/district-demo/')`. The `/district-demo/` base must match `vite.config.js base`.
**Warning signs:** Works on localhost but breaks after `npm run deploy`.

### Pitfall 2: Dashboard Route Active on All Pages
**What goes wrong:** `/` matches as a prefix of `/discovery`, `/reports`, etc. The Dashboard nav item stays highlighted everywhere.
**Why it happens:** `RouterLink active-class` uses prefix matching by default.
**How to avoid:** The Dashboard `RouterLink` needs `exact-active-class` (not just `active-class`). Alternatively, redirect `/` to `/dashboard` and use a named non-root path.
**Warning signs:** Dashboard link always appears highlighted regardless of current page.

### Pitfall 3: Tailwind v4 `@theme` Not Generating Utility Classes
**What goes wrong:** `bg-primary` class has no effect.
**Why it happens:** `@tailwindcss/vite` plugin not added to `vite.config.js`, or `@import "tailwindcss"` missing from `style.css`, or the `style.css` is not imported in `main.js`.
**How to avoid:** Three things must all be true: (1) `@tailwindcss/vite` in `plugins[]` in vite config, (2) `@import "tailwindcss"` at top of `style.css`, (3) `import './style.css'` in `main.js`.
**Warning signs:** No Tailwind utility classes work at all, or `@theme` block has no effect.

### Pitfall 4: PrimeVue Component Not Rendering
**What goes wrong:** `<Skeleton>` renders as empty or throws "Component not found" warning.
**Why it happens:** PrimeVue requires either auto-import configuration or explicit per-component import. No auto-import is configured in this project.
**How to avoid:** Import each PrimeVue component explicitly: `import Skeleton from 'primevue/skeleton'`. Do not assume global registration without setup.
**Warning signs:** Component renders nothing or Vue warns about unknown component.

### Pitfall 5: Pinia Store Used Before Plugin Registration
**What goes wrong:** Calling `useTagsStore()` outside a component (e.g., at module level) throws "getActivePinia() was called with no active Pinia."
**Why it happens:** Pinia stores can only be instantiated after `app.use(createPinia())`.
**How to avoid:** Only call `useTagsStore()` inside `<script setup>` or inside lifecycle hooks — never at module top level. Register Pinia in `main.js` before any component mounts.
**Warning signs:** Console error referencing "getActivePinia" or "no active Pinia."

### Pitfall 6: `<RouterView>` Not Rendering (Blank Content Area)
**What goes wrong:** The app shell shows the sidebar but the content area is always blank.
**Why it happens:** `<RouterView />` is missing from `AppShell.vue`, or `app.use(router)` was skipped in `main.js`.
**How to avoid:** After wiring up routing, navigate to `/` and confirm a stub view renders. Do this before building any view content.
**Warning signs:** Content area blank; no Vue warnings (this failure is silent).

---

## Code Examples

### Complete main.js

```javascript
// src/main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import router from './router/index.js'
import './style.css'
import App from './App.vue'

const SchoolDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#eeeeff',
      100: '#d4d4fc',
      200: '#ababf8',
      300: '#8284f4',
      400: '#6466ef',
      500: '#484ce6',
      600: '#3c40cc',
      700: '#3034b3',
      800: '#252899',
      900: '#1a1d80',
      950: '#0f1166'
    }
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: SchoolDayPreset,
    options: {
      darkModeSelector: false
    }
  }
})
app.use(router)

app.mount('#app')
```

### vite.config.js with Tailwind v4 Plugin

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/district-demo/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
```

### style.css with Tailwind v4 + Brand Tokens

```css
/* src/style.css */
@import "tailwindcss";

@theme {
  --color-primary: #484ce6;
  --color-accent: #da8231;
}
```

Existing styles in `style.css` (Vue defaults) can be cleared or kept below `@theme` — they do not conflict.

### ReportsView.vue — Tab Stub Pattern

The Reports view hosts three tabs (DPA, Risk Position, 1EdTech) without sub-routes. Tab state lives in the component.

```vue
<!-- src/views/ReportsView.vue -->
<script setup>
import { ref } from 'vue'
import Skeleton from 'primevue/skeleton'

const tabs = ['DPA', 'Risk Position', '1EdTech']
const activeTab = ref('DPA')
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4 text-gray-900">Reports</h1>

    <!-- Tab bar -->
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

    <!-- Skeleton content — same shape regardless of active tab at this stage -->
    <div v-for="i in 6" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
    </div>
  </div>
</template>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` + postcss/autoprefixer | `@tailwindcss/vite` plugin + `@import "tailwindcss"` in CSS | Tailwind v4 (Jan 2025) | Simpler setup, no config file; custom colors via `@theme {}` not `theme.extend.colors` |
| `@primevue/themes` | `@primeuix/themes` | PrimeVue 4.x (2024) | Theme presets moved to the primeuix umbrella package; old package is a legacy alias |
| `vue-router` with 5 routes (discovery, dpa, risk, edtech, tags) | 4 top-level routes with reports as tabbed page | Phase 1 context decision | Simpler routing, fewer view files, cleaner nav |
| Vuex | Pinia | Vue 3 ecosystem (2021-2022) | Official recommendation; no more mutations/actions boilerplate |

**Deprecated/outdated:**
- `createWebHistory` for GitHub Pages: use `createWebHashHistory`
- `@primevue/themes` import path: use `@primeuix/themes`
- Tailwind `tailwind.config.js` in v4: use `@theme {}` in CSS

---

## Open Questions

1. **PrimeIcons vs Lucide for sidebar icons**
   - What we know: PrimeIcons (v7.0.0) ships icon classes like `pi pi-home`; works without explicit imports — just add the `primeicons/primeicons.css` import. Lucide requires per-icon SVG component imports (tree-shakeable, no CSS font).
   - What's unclear: Whether PrimeVue internal components (like `DataTable` sort icons) use PrimeIcons class names that require the font to be loaded anyway.
   - Recommendation: Use PrimeIcons. If PrimeVue DataTable and other components use PrimeIcon glyphs internally, the font is being loaded regardless. Consolidating on PrimeIcons avoids a mixed icon ecosystem.

2. **Exact sidebar width**
   - What we know: Standard enterprise admin sidebars range from 220-280px. Tailwind `w-64` = 256px is the most common.
   - What's unclear: Whether 256px fits all four nav labels comfortably with icon + label layout.
   - Recommendation: Use `w-64` (256px). If "Risk Position" or "Settings" labels feel crowded, adjust to `w-72` (288px).

3. **District name placeholder in top header**
   - What we know: District name is decided in Phase 2 (D-07). Phase 1 builds the header area.
   - Recommendation: Use "Lakewood Unified School District" as the Phase 1 placeholder — it is mentioned in the CONTEXT.md specifics and can be replaced in Phase 2 without structural change.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm installs, Vite dev server | Yes | v24.14.0 | — |
| npm | Package installation | Yes | bundled with Node | — |
| vue-router | SPA routing (FOUND-01) | No (not installed) | — | No fallback — must install |
| pinia | Tags store (FOUND-04) | No (not installed) | — | No fallback — must install |
| primevue | UI components, Skeleton | No (not installed) | — | No fallback — must install |
| @primeuix/themes | PrimeVue theming | No (not installed) | — | No fallback — must install |
| tailwindcss | Layout utilities | No (not installed) | — | Could use manual CSS but Tailwind is locked decision |
| @tailwindcss/vite | Tailwind v4 Vite integration | No (not installed) | — | Could use postcss pipeline if v3, but v4 uses this plugin |
| GitHub Pages | Static deployment target | Yes (existing) | — | — |

**Missing dependencies with no fallback:**
- `vue-router`, `pinia`, `primevue`, `@primeuix/themes`, `tailwindcss`, `@tailwindcss/vite` — all must be installed via `npm install` before implementation begins. All are available on npm and verified above.

---

## Validation Architecture

### Test Framework

No automated test framework is installed in this project. The project has no `pytest.ini`, `jest.config.*`, `vitest.config.*`, or `tests/` directory. This is a visual demo portal — all validation for Phase 1 is manual browser verification.

| Property | Value |
|----------|-------|
| Framework | None installed; Vite's built-in dev server only |
| Config file | None — see Wave 0 gap below |
| Quick run command | `npm run dev` (manual browser check) |
| Full suite command | `npm run build && npm run preview` (verifies production build) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-01 | Sidebar nav links navigate without page reload; all 4 routes resolve | Manual smoke | — | N/A |
| FOUND-01 | Hash URL in browser bar updates on navigation (e.g., `/#/discovery`) | Manual smoke | — | N/A |
| FOUND-02 | Sidebar visible and consistent on every route | Manual smoke | — | N/A |
| FOUND-02 | Refreshing browser on `/#/reports` returns to Reports view, not 404 | Manual smoke | — | N/A (GitHub Pages test requires deployment) |
| FOUND-04 | `useTagsStore()` importable from any component without error | Manual + console | `npm run build` — build error indicates broken import | N/A |

### Sampling Rate

- **Per task commit:** `npm run dev` — open browser, click all 4 nav links, verify active highlight, verify page titles render
- **Per wave merge:** `npm run build` — confirms no import errors in production bundle
- **Phase gate:** Manual walkthrough of all 4 routes in browser (dev) + `npm run build` green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] No automated test framework — Phase 1 validation is entirely manual. Vitest could be added later if needed, but is out of scope for this phase given the visual/routing nature of the work.
- [ ] GitHub Pages smoke test (FOUND-02 refresh scenario) requires `npm run deploy` + browser verification on the live URL — cannot be automated without a CI environment.

---

## Project Constraints (from CLAUDE.md)

These directives from `CLAUDE.md` constrain all planning decisions:

| Directive | Impact on Phase 1 |
|-----------|------------------|
| **Tech stack: Vue 3 + Vite — no conflicting frameworks** | All new libraries must be Vue 3 native. PrimeVue 4 and Pinia 3 satisfy this. |
| **Deployment: Static GitHub Pages — no SSR, no backend** | Enforces `createWebHashHistory`. No server-side anything. |
| **Data: All data mocked/synthetic — no API connections** | Stub views only; no fetch calls. Skeleton UI is appropriate. |
| **Iteration speed: Mock data changeable in under an hour** | `src/data/` structure established in Phase 2, not Phase 1. Phase 1 must not put data in views. |
| **Auth: None** | No auth guards on routes. |
| **No TypeScript** | All files `.js` not `.ts`. No type annotations. |
| **2-space indentation** | All generated files use 2-space indent. |
| **PascalCase component files** | `AppShell.vue`, `SidebarNav.vue`, `DashboardView.vue` etc. |
| **camelCase JS modules** | `router/index.js`, `stores/tags.js` — camelCase filenames. |
| **`<script setup>` Composition API** | No Options API. All components use `<script setup>`. |
| **Relative imports (no path aliases configured)** | Use `../components/layout/AppShell.vue` not `@/components/...` unless `@/` alias is added to vite.config.js in this phase. |

**Path alias decision:** The existing codebase has no `@/` alias. The research docs reference `@/` in patterns. For Phase 1, either: (a) use relative paths throughout, or (b) add `resolve.alias: { '@': '/src' }` to `vite.config.js` in the same wave as the router install. Option (b) is recommended — it cleans up deep relative paths like `../../../../components/layout/SidebarNav.vue` as the project grows, and adding it is a one-line vite.config change with no downsides.

---

## Sources

### Primary (HIGH confidence)
- `primevue.org/installation/` — PrimeVue 4 Vite setup; `@primeuix/themes` import path confirmed
- `primevue.org/theming/styled/` — `definePreset` API and primary color customization
- `primevue.org/skeleton/` — Skeleton component props and usage
- `tailwindcss.com/docs/installation/using-vite` — Tailwind v4 Vite plugin install
- `tailwindcss.com/docs/theme` — `@theme {}` custom color configuration
- npm registry — verified current versions of all 6 packages (2026-05-13)
- `.planning/research/ARCHITECTURE.md` — canonical patterns for this project
- `.planning/research/STACK.md` — stack rationale and pitfall context
- `.planning/research/PITFALLS.md` — GitHub Pages, router, and tag state pitfalls

### Secondary (MEDIUM confidence)
- `.planning/phases/01-shell-routing/01-CONTEXT.md` — locked decisions (D-01 through D-15)
- Training knowledge on Vue Router 4 hash history + GitHub Pages constraint (well-established, corroborates official docs)
- Training knowledge on Pinia `defineStore` composition API form (corroborates official docs)

### Tertiary (LOW confidence)
- Specific hex color scale for `#484CE6` primary palette (50–950) — manually derived; not from an official palette generator. May need adjustment for contrast ratios in actual component usage.

---

## Metadata

**Confidence breakdown:**
- Standard stack versions: HIGH — verified against npm registry live
- `createWebHashHistory` for GitHub Pages: HIGH — official constraint, corroborated by docs and pitfalls research
- PrimeVue `@primeuix/themes` import path: HIGH — confirmed via official primevue.org docs
- Tailwind v4 `@tailwindcss/vite` setup: HIGH — confirmed via official tailwindcss.com docs
- Architecture patterns (AppShell, SidebarNav, router meta): HIGH — standard Vue 3 admin SPA patterns corroborated across multiple research docs
- Primary color hex scale: MEDIUM — manually derived, needs visual validation

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (stable libraries; version numbers should be re-verified if more than 30 days pass)
