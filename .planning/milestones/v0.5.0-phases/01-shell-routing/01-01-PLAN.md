---
phase: 01-shell-routing
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - package-lock.json
  - vite.config.js
  - src/main.js
  - src/style.css
  - src/router/index.js
  - src/stores/tags.js
autonomous: true
requirements:
  - FOUND-01
  - FOUND-04
must_haves:
  truths:
    - "Vue Router 4, Pinia 3, PrimeVue 4, @primeuix/themes, Tailwind CSS v4, and primeicons are installed and visible in package.json dependencies"
    - "Running `npm run build` completes with no module-not-found errors and no import errors"
    - "`src/router/index.js` exports a router instance built with `createWebHashHistory('/district-demo/')` and four route definitions (`/`, `/discovery`, `/reports`, `/settings`)"
    - "`src/stores/tags.js` exports `useTagsStore` (a Pinia store) with empty `tags` and `assignments` state"
    - "`src/main.js` registers Pinia, PrimeVue (with custom Aura preset using `#484CE6` primary), and router — in that order — before mounting"
    - "Tailwind v4 `@theme` block defines `--color-primary: #484ce6`, `--color-accent: #da8231`, `--color-sidebar: #111827` in `src/style.css`"
  artifacts:
    - path: "src/router/index.js"
      provides: "Router instance with 4 routes + meta.nav/label/icon"
      contains: "createWebHashHistory"
    - path: "src/stores/tags.js"
      provides: "Pinia tags store stub"
      contains: "useTagsStore"
    - path: "src/main.js"
      provides: "App bootstrap with all plugins registered"
      contains: "createPinia"
    - path: "src/style.css"
      provides: "Tailwind v4 imports + brand color tokens"
      contains: "@import \"tailwindcss\""
    - path: "vite.config.js"
      provides: "Vite config with Tailwind v4 plugin"
      contains: "tailwindcss()"
    - path: "package.json"
      provides: "All Phase 1 dependencies declared"
      contains: "vue-router"
  key_links:
    - from: "src/main.js"
      to: "src/router/index.js"
      via: "import + app.use(router)"
      pattern: "app\\.use\\(router\\)"
    - from: "src/main.js"
      to: "src/stores/tags.js (transitively via Pinia)"
      via: "createPinia() registration"
      pattern: "app\\.use\\(createPinia\\(\\)\\)"
    - from: "vite.config.js"
      to: "@tailwindcss/vite plugin"
      via: "plugins array"
      pattern: "tailwindcss\\(\\)"
    - from: "src/style.css"
      to: "Tailwind v4 + brand tokens"
      via: "@import + @theme block"
      pattern: "@theme"
---

<objective>
Install all Phase 1 dependencies and wire the foundation layer: Vue Router with hash history, Pinia tags store stub, PrimeVue with custom Aura preset (primary `#484CE6`), Tailwind v4 with brand color tokens. After this plan, the app has all plugins registered and four routes defined — but no AppShell or views yet (those come in Plan 02).

Purpose: Establish the foundation so Plan 02 can focus purely on layout components and stub views. Splits the "install + wire" mechanical work from the "build UI" work to keep each plan focused and within context budget.

Output: Updated `package.json`, `vite.config.js`, `src/main.js`, `src/style.css`; new `src/router/index.js` and `src/stores/tags.js`.
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
@CLAUDE.md

<interfaces>
<!-- Current state of the files being modified — executor should read these as starting point -->

Current `package.json` dependencies:
- vue: ^3.5.34
DevDependencies:
- @vitejs/plugin-vue: ^6.0.6
- gh-pages: ^6.3.0
- vite: ^8.0.12

Current `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/district-demo/',
  plugins: [vue()],
})
```

Current `src/main.js`:
```javascript
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
```

Current `src/style.css`: Contains legacy Vue starter CSS with `:root` custom properties (`--text`, `--bg`, `--accent`, etc.), `#app` flex layout for the starter page, `.hero`, `.counter`, `#next-steps`, `#social` etc. This will be REPLACED entirely — no carry-over.

New files this plan creates:
- `src/router/index.js` — Vue Router config with `createWebHashHistory`
- `src/stores/tags.js` — Pinia store stub with `useTagsStore`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Phase 1 dependencies and update vite.config.js</name>
  <files>package.json, package-lock.json, vite.config.js</files>
  <read_first>
    - package.json (to see current declared dependencies)
    - vite.config.js (to see current plugin setup)
    - .planning/phases/01-shell-routing/01-RESEARCH.md (section "Standard Stack" + section "vite.config.js with Tailwind v4 Plugin")
    - .planning/phases/01-shell-routing/01-UI-SPEC.md (Design System table — confirms PrimeVue 4 + Tailwind v4 + PrimeIcons stack)
  </read_first>
  <action>
    Step 1 — Install runtime dependencies in a single npm command:
    ```bash
    npm install vue-router@5.0.7 pinia@3.0.4 primevue@4.5.5 @primeuix/themes@2.0.3 primeicons@7.0.0
    ```

    Step 2 — Install Tailwind v4 dev dependencies:
    ```bash
    npm install -D tailwindcss@4.3.0 @tailwindcss/vite@4.3.0
    ```

    If exact versions above fail to resolve on npm, fall back to `npm install <package>@latest` for that single package and record actual installed version in the plan summary. Do NOT use `--legacy-peer-deps` or `--force` unless the install errors out with peer conflicts — try plain install first.

    Step 3 — Update `vite.config.js` to add the Tailwind v4 plugin. The full new file contents:
    ```javascript
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

    Do NOT add a `resolve.alias` for `@` — keep relative imports throughout this phase per CLAUDE.md ("no path aliases configured"). The RESEARCH.md note about an `@/` alias is explicitly deferred — relative paths are fine for the small file set in Phase 1 and Plan 02.

    Do NOT delete `gh-pages` from devDependencies — it is the deploy tool.

    Do NOT install `@primevue/themes` — that is the legacy alias. The correct package is `@primeuix/themes` (already in the install command).
  </action>
  <verify>
    <automated>npm run build</automated>
    Manual: After install, `cat package.json` shows all six new dependencies. `npm ls vue-router pinia primevue @primeuix/themes tailwindcss @tailwindcss/vite primeicons` returns clean tree (no UNMET PEER DEPENDENCY).
  </verify>
  <acceptance_criteria>
    - `package.json` `dependencies` contains keys: `vue-router`, `pinia`, `primevue`, `@primeuix/themes`, `primeicons`
    - `package.json` `devDependencies` contains keys: `tailwindcss`, `@tailwindcss/vite`
    - `package-lock.json` updated (mtime newer than session start)
    - `vite.config.js` contains the literal string `import tailwindcss from '@tailwindcss/vite'`
    - `vite.config.js` `plugins` array contains a call to `tailwindcss()` (grep: `tailwindcss\(\)`)
    - `vite.config.js` still contains `base: '/district-demo/'`
    - `npm run build` exits 0 (build may produce an empty dist or only-style output at this point — the requirement is exit code 0, NOT visual correctness)
  </acceptance_criteria>
  <done>
    All Phase 1 dependencies are installed and locked. Tailwind v4 plugin is registered with Vite. `npm run build` exits 0.
  </done>
</task>

<task type="auto">
  <name>Task 2: Create router and Pinia tags store; update style.css with Tailwind + brand tokens</name>
  <files>src/router/index.js, src/stores/tags.js, src/style.css</files>
  <read_first>
    - src/style.css (to confirm it will be REPLACED entirely, not appended to)
    - .planning/phases/01-shell-routing/01-RESEARCH.md (Pattern 1 router code; Pattern 5 style.css; Pattern 6 Pinia store)
    - .planning/phases/01-shell-routing/01-UI-SPEC.md ("CSS Token Declarations" section + "Nav item icons per route" table)
    - .planning/phases/01-shell-routing/01-CONTEXT.md (D-01 hash history, D-02 four routes, D-05 nav order, D-15 Pinia store)
  </read_first>
  <action>
    Step 1 — Create directory `src/router/` if not present, then write `src/router/index.js` verbatim:
    ```javascript
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

    Notes:
    - `createWebHashHistory('/district-demo/')` is non-negotiable (D-01). Do NOT use `createWebHistory`.
    - The view component imports point to files that DO NOT YET EXIST — that is correct. They will be created in Plan 02. Vue Router's lazy-import (`() => import(...)`) only resolves at navigation time, so `npm run build` may still succeed if Vite tree-shakes them. If the build complains, that is acceptable — the views will exist after Plan 02.
    - Nav order must be: Dashboard → Discovery → Reports → Settings (D-05). Array order = render order.
    - Icon classes from UI-SPEC: `pi pi-home`, `pi pi-search`, `pi pi-chart-bar`, `pi pi-cog`.

    Step 2 — Create directory `src/stores/` if not present, then write `src/stores/tags.js` verbatim:
    ```javascript
    import { defineStore } from 'pinia'
    import { ref } from 'vue'

    export const useTagsStore = defineStore('tags', () => {
      const tags = ref([])
      const assignments = ref({})

      return { tags, assignments }
    })
    ```

    Notes:
    - This is the empty stub. Phase 2 will add `addTag`, `deleteTag`, `assignTag` actions (D-15).
    - The store id `'tags'` is the canonical id — do not rename it.
    - `assignments` is a `{ vendorId: [tagId, ...] }` map — keyed by vendor ID, value is array of tag IDs (the schema is established here even though it stays empty in Phase 1).

    Step 3 — REPLACE entire contents of `src/style.css` with:
    ```css
    @import "tailwindcss";

    @theme {
      --color-primary: #484ce6;
      --color-accent: #da8231;
      --color-sidebar: #111827;
    }
    ```

    Notes:
    - The existing Vue starter CSS (`:root` custom properties, `#app` layout, `.hero`, `.counter`, `#next-steps`, etc.) is REMOVED entirely. The starter HelloWorld page goes away in Plan 02; its styles go away here.
    - No legacy CSS carries forward. The three brand tokens above are the complete content of Phase 1's `style.css`.
    - Per UI-SPEC, this produces utility classes `bg-primary`, `text-primary`, `border-primary`, `bg-accent`, `text-accent`, `bg-sidebar`.
  </action>
  <verify>
    <automated>npm run build</automated>
    The build may emit warnings about missing view files referenced from router (DashboardView.vue etc.) — that is expected and acceptable; views are created in Plan 02. The critical check is that imports of `vue-router`, `pinia`, and `tailwindcss` all resolve.

    Manual: `grep -c "createWebHashHistory" src/router/index.js` returns ≥ 1. `grep -c "defineStore" src/stores/tags.js` returns ≥ 1. `grep -c "@import \"tailwindcss\"" src/style.css` returns 1.
  </verify>
  <acceptance_criteria>
    - File `src/router/index.js` exists
    - `src/router/index.js` contains literal string `createWebHashHistory('/district-demo/')`
    - `src/router/index.js` contains four route path values: `'/'`, `'/discovery'`, `'/reports'`, `'/settings'` (grep each)
    - `src/router/index.js` contains four label values: `'Dashboard'`, `'Discovery'`, `'Reports'`, `'Settings'`
    - `src/router/index.js` contains four icon values: `'pi pi-home'`, `'pi pi-search'`, `'pi pi-chart-bar'`, `'pi pi-cog'`
    - File `src/stores/tags.js` exists
    - `src/stores/tags.js` contains `defineStore('tags',`
    - `src/stores/tags.js` exports `useTagsStore` (grep `export const useTagsStore`)
    - `src/style.css` first non-blank line is `@import "tailwindcss";`
    - `src/style.css` contains `--color-primary: #484ce6`
    - `src/style.css` contains `--color-accent: #da8231`
    - `src/style.css` contains `--color-sidebar: #111827`
    - `src/style.css` does NOT contain `--text:` or `#next-steps` (legacy starter CSS removed; grep for both must return 0 matches)
  </acceptance_criteria>
  <done>
    Router, Pinia tags store, and Tailwind brand tokens are all in place. `npm run build` exits 0 (view-import warnings are acceptable since those files are Plan 02).
  </done>
</task>

<task type="auto">
  <name>Task 3: Wire all plugins in main.js with custom PrimeVue Aura preset</name>
  <files>src/main.js</files>
  <read_first>
    - src/main.js (current state — only mounts App with style.css import)
    - src/router/index.js (created in Task 2 — will be imported here)
    - src/stores/tags.js (created in Task 2 — Pinia must be registered before store is used)
    - .planning/phases/01-shell-routing/01-RESEARCH.md (section "Complete main.js" — verbatim target)
    - .planning/phases/01-shell-routing/01-UI-SPEC.md ("PrimeVue Theme Configuration" — primary color scale table)
    - .planning/phases/01-shell-routing/01-CONTEXT.md (D-09 PrimeVue + Tailwind, D-10 primary `#484CE6`, D-15 Pinia initialization)
  </read_first>
  <action>
    REPLACE entire contents of `src/main.js` with the following verbatim:
    ```javascript
    import { createApp } from 'vue'
    import { createPinia } from 'pinia'
    import PrimeVue from 'primevue/config'
    import { definePreset } from '@primeuix/themes'
    import Aura from '@primeuix/themes/aura'
    import 'primeicons/primeicons.css'
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

    Notes:
    - Plugin registration order is REQUIRED: Pinia → PrimeVue → router. Do NOT reorder.
    - `darkModeSelector: false` is critical — the portal is intentionally light-mode-only with a structural dark sidebar; enabling PrimeVue dark mode breaks component contrast (RESEARCH.md Anti-Pattern + UI-SPEC).
    - `import 'primeicons/primeicons.css'` is REQUIRED — without it, `pi pi-home` etc. icons render as empty boxes. This is the icon font CSS used by both the sidebar nav AND any future PrimeVue components (DataTable sort icons).
    - The primary color scale steps (50–950) are the canonical scale matching `#484CE6` at the 500 step. Do not change individual hex values — they are pre-derived in research.
    - `'@primeuix/themes/aura'` is the correct import path (PrimeVue 4.x). Do NOT use `'@primevue/themes/aura'` (legacy alias).
  </action>
  <verify>
    <automated>npm run build</automated>
    `npm run build` should now exit 0 with at most "missing chunk" warnings for the four view files (created in Plan 02). All plugin imports must resolve cleanly.

    Manual: `grep -c "createPinia\|PrimeVue\|definePreset\|createApp" src/main.js` returns ≥ 4.
  </verify>
  <acceptance_criteria>
    - `src/main.js` contains literal `import { createPinia } from 'pinia'`
    - `src/main.js` contains literal `import PrimeVue from 'primevue/config'`
    - `src/main.js` contains literal `import { definePreset } from '@primeuix/themes'`
    - `src/main.js` contains literal `import Aura from '@primeuix/themes/aura'`
    - `src/main.js` contains literal `import 'primeicons/primeicons.css'`
    - `src/main.js` contains literal `import router from './router/index.js'`
    - `src/main.js` calls `app.use(createPinia())`
    - `src/main.js` calls `app.use(PrimeVue,` (with theme options object)
    - `src/main.js` calls `app.use(router)` (after both Pinia and PrimeVue)
    - `src/main.js` contains `darkModeSelector: false`
    - `src/main.js` contains `500: '#484ce6'` in the primary color scale
    - `src/main.js` does NOT contain `'@primevue/themes'` (legacy alias forbidden; grep returns 0 matches)
    - `npm run build` exits 0
  </acceptance_criteria>
  <done>
    All four plugins (Pinia, PrimeVue with custom Aura preset, primeicons CSS, router) are registered in `main.js` in correct order. The app is now plug-and-play for Plan 02's AppShell + views work. Build succeeds.
  </done>
</task>

</tasks>

<verification>
After all three tasks:

1. `npm run build` exits 0 — confirms no import errors anywhere in the foundation.
2. `grep "createWebHashHistory" src/router/index.js` returns 1+ match — confirms FOUND-01 hash history requirement.
3. `grep "useTagsStore" src/stores/tags.js` returns 1+ match — confirms FOUND-04 Pinia tags store.
4. `grep "createPinia\|PrimeVue\|router" src/main.js` returns 3+ matches — confirms plugin wiring.
5. `cat package.json | grep -E "vue-router|pinia|primevue|@primeuix/themes|tailwindcss|@tailwindcss/vite|primeicons"` returns 7 lines — confirms all installs.

Manual verification (deferred to end of Plan 02 since `npm run dev` will show nothing until App.vue is updated): No standalone manual smoke test for this plan — it's foundation only.
</verification>

<success_criteria>
- All Phase 1 npm dependencies installed and locked in package-lock.json
- Vite config registers Tailwind v4 plugin
- Router file exists with 4 routes using `createWebHashHistory('/district-demo/')`
- Pinia tags store stub exists with `useTagsStore` export
- `main.js` registers Pinia, PrimeVue (custom Aura preset, `#484CE6` primary, dark mode disabled), primeicons CSS, and router — in that order
- `style.css` is fully replaced with Tailwind v4 import + three brand color tokens
- `npm run build` exits 0
</success_criteria>

<output>
After completion, create `.planning/phases/01-shell-routing/01-01-SUMMARY.md` capturing:
- Installed package versions (actual, not just declared — `npm ls` output)
- Any deviations from planned versions (and why)
- Confirmation that build exits 0
- Note that view files in router config are unresolved imports (deferred to Plan 02)
</output>
