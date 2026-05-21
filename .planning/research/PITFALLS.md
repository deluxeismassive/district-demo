# Pitfalls Research: Nuxt 4 Migration

**Project:** District Demo Portal — v1.0.0 Nuxt Migration
**Domain:** Vue 3 + PrimeVue SPA migrating to Nuxt 4 SSR + Nuxt UI v3 + AWS Amplify
**Researched:** 2026-05-21
**Confidence:** HIGH for SSR fundamentals and Nuxt 4 directory structure; MEDIUM for Amplify-specific limits (verified via official AWS docs); MEDIUM for nuxt-echarts SSR internals (official module docs, but newer feature)

---

## SSR Hydration Mismatches

### What causes them

A hydration mismatch occurs when the HTML Nuxt renders on the server does not match what Vue produces on the first client render. Vue logs a warning and discards the server HTML, re-rendering from scratch — causing a visible flash, layout shift, or broken component state.

The three causes most relevant to this project:

1. **Browser-only API access at module load time.** The tags store in `src/stores/tags.js` calls `localStorage.getItem()` synchronously inside `loadOrDefault()`, which is called at store initialization. On the server, `localStorage` does not exist. This will throw `ReferenceError: localStorage is not defined` and crash the SSR render before any HTML is produced.

2. **Dynamic values that differ between server and client.** `Math.random()`, `new Date()`, and `Date.now()` produce different values on the server and client. Any component that initializes state with these will always mismatch.

3. **Third-party libraries that access `window` or `document` during import.** `echarts` and `vue-echarts` access browser APIs when their modules are loaded. If they are imported at the top level of a component (not inside `<ClientOnly>`), the server import itself will throw before any rendering occurs.

### How to detect

- Run `nuxi build && nuxi preview` locally — SSR hydration mismatches and server crashes appear in the terminal, not just the browser console.
- Browser console shows `[Vue warn] Hydration node mismatch` or `[Vue warn] Hydration completed but contains mismatches`.
- Server terminal shows `ReferenceError: localStorage is not defined` or `ReferenceError: window is not defined` during the first request.

### How to prevent

- **Never access browser APIs at module scope.** Guard all access with `import.meta.client` or move it inside `onMounted()`. See the localStorage section for the specific fix for the tags store.
- **Wrap browser-only libraries in `<ClientOnly>`.** This tells Nuxt to skip SSR for that component entirely. The server sends an empty placeholder; the client renders the real component after hydration.
- **Use `useState` for values that must be consistent between server and client.** `useState` serializes server state into the HTML payload so the client initializes from the same value rather than re-computing.
- **Do not use `Math.random()` or `Date.now()` in templates or reactive initializers.** If a unique ID is needed, use Vue's built-in `useId()` composable, which generates consistent IDs across server and client.

**Confidence:** HIGH — these are documented Nuxt behaviors with official guidance.

---

## ECharts / Browser-only Libraries

### The specific problem

`echarts` and `vue-echarts` access `window`, `document`, and `HTMLCanvasElement` when their ES modules are evaluated. In Nuxt SSR, module evaluation happens on the Node.js server, where none of these exist. The result is one of two failure modes:

- **Crash:** `ReferenceError: window is not defined` kills the SSR render on first import.
- **Silent hydration mismatch:** If the error is caught somewhere, the server renders no chart, but the client renders one — Vue warns about the structural mismatch and discards server HTML.

This project uses ECharts in two places: a radar chart in `VendorDrawer.vue` and a donut chart on the Risk Position page. Both will crash SSR if imported without protection.

### The `<ClientOnly>` pattern — correct use

Wrap the entire chart component (not just the `<VChart>` element) in `<ClientOnly>`. This causes Nuxt to skip SSR for the wrapped subtree entirely.

```vue
<ClientOnly>
  <VChart :option="radarOption" autoresize />
  <template #fallback>
    <div class="chart-placeholder">Loading chart...</div>
  </template>
</ClientOnly>
```

The `#fallback` slot is rendered on the server and during hydration. It should have the same height as the chart to prevent layout shift.

### When NOT to use `<ClientOnly>`

Do not wrap data tables, status badges, or any content that is meaningful to crawlers or that the user sees immediately. `<ClientOnly>` means the server sends nothing for that region — if the chart is the primary content of a page (not the case here; the tables are the primary content), consider the `nuxt-echarts` module instead.

### The `nuxt-echarts` module alternative

The `nuxt-echarts` community module (available at `nuxt.com/modules/echarts`) provides `<VChart>` with built-in SSR handling. It offers `<VChartIsland>` (server-renders a static SVG, zero client JS) and `<VChartFull>` (server-renders SVG, then hydrates with full ECharts client). For this project's demo charts, `<ClientOnly>` wrapping plain `vue-echarts` is simpler and sufficient. The `nuxt-echarts` module is a valid upgrade path if chart SEO or first-paint quality becomes a requirement.

### Import location matters

Even with `<ClientOnly>`, the `import VChart from 'vue-echarts'` statement at the top of a `.vue` file will still execute on the server if the component itself is server-rendered. The import must be deferred:

```ts
// In a component that is itself rendered on the server, use defineAsyncComponent:
const VChart = defineAsyncComponent(() => import('vue-echarts'))
```

Or simpler: place all ECharts usage in a dedicated `ChartRadar.vue` or `ChartDonut.vue` component that is always wrapped in `<ClientOnly>` at its call sites. The encapsulation ensures the import never runs server-side.

**Confidence:** HIGH for `<ClientOnly>` pattern; MEDIUM for `nuxt-echarts` SSR internals (official module but newer feature).

---

## Pinia in SSR

### The cross-request state pollution problem

In a Node.js SSR server, a single process handles multiple concurrent requests. If a Pinia store holds module-level state (a `ref` or `reactive` object defined outside any factory function), that state is shared across all requests. User A's tag assignments can leak into User B's response.

The fix: `@pinia/nuxt` handles this correctly by creating a new Pinia instance per request when installed as a Nuxt module. The critical rule is that stores must be accessed through `useXxxStore()` composables, never through module-level singletons.

### The `useStore()` after `await` problem

This is a subtle, intermittent bug. If a Pinia action or a Nuxt middleware calls `useTagsStore()` after an `await`, the active Pinia instance may have changed between the time the async function was suspended and resumed. The store call binds to the wrong request's Pinia instance.

```ts
// WRONG — useTagsStore() called after an await
async function badAction() {
  const data = await fetch('/api/vendors')
  const store = useTagsStore()  // May bind to wrong Pinia instance under SSR
  store.assignments = data
}

// CORRECT — useTagsStore() called before any await
async function goodAction() {
  const store = useTagsStore()  // Binds to current request's Pinia instance
  const data = await fetch('/api/vendors')
  store.assignments = data
}
```

For this project, Pinia stores are used in components and pages via `useTagsStore()` inside `<script setup>`, which is synchronous and always safe. The risk appears when stores are used in Nuxt server middleware, route plugins, or Pinia actions that make API calls.

### Correct setup for `@pinia/nuxt`

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
})
```

No additional plugin file is needed. `@pinia/nuxt` auto-registers Pinia with correct SSR isolation. Do not manually call `createPinia()` in a plugin unless you need custom plugins (like `pinia-plugin-persistedstate`).

### State hydration

`@pinia/nuxt` automatically serializes Pinia state into the Nuxt payload (`__NUXT__` in the HTML) and rehydrates it on the client. This means initial state set on the server (e.g., from `server/api/` routes) arrives at the client without a second fetch. No manual `pinia.state` serialization is needed.

**Confidence:** HIGH — Pinia's official SSR docs and multiple verified community sources agree on these patterns.

---

## localStorage in SSR

### The specific problem in this codebase

The existing `src/stores/tags.js` has two SSR-fatal patterns:

1. **`loadOrDefault()` is called synchronously at store initialization** — this runs on the server where `localStorage` does not exist. Even with a `try/catch`, the function returns the default value on the server, but the client initializes with a different value (from actual localStorage), causing a hydration mismatch on every page load.

2. **`watch()` callbacks write to `localStorage` directly** — these will throw on the server if the watch fires during SSR (it will).

### The correct migration pattern

The tags store must be rewritten to separate server-safe initialization from client-side persistence:

```ts
// app/stores/tags.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useTagsStore = defineStore('tags', () => {
  // Server-safe initial state — always starts from seed data
  const tagGroups = ref(SEED_TAG_GROUPS)
  const assignments = ref<Record<string, string[]>>({})

  // Client-only localStorage sync — runs after hydration
  if (import.meta.client) {
    const storedGroups = localStorage.getItem('schoolday-tag-groups')
    const storedAssignments = localStorage.getItem('schoolday-tag-assignments')

    if (storedGroups) tagGroups.value = JSON.parse(storedGroups)
    if (storedAssignments) assignments.value = JSON.parse(storedAssignments)

    watch(tagGroups, (val) => localStorage.setItem('schoolday-tag-groups', JSON.stringify(val)), { deep: true })
    watch(assignments, (val) => localStorage.setItem('schoolday-tag-assignments', JSON.stringify(val)), { deep: true })
  }

  return { tagGroups, assignments }
})
```

**Why `import.meta.client` instead of `process.client`:** Nuxt 4 deprecates `process.client` in favor of `import.meta.client`. Use the new form.

### The hydration mismatch tradeoff

With the pattern above, the server renders with seed data and the client immediately replaces it with localStorage data after hydration. For a brief moment (sub-frame on fast hardware, potentially visible on slow devices), the page shows seed tag groups before snapping to the user's saved tags. This is acceptable for a demo portal. If it becomes visible, wrap the tags display in `<ClientOnly>` to suppress the server render of tag-dependent content.

### Alternative: `pinia-plugin-persistedstate`

The `pinia-plugin-persistedstate` package with its Nuxt module handles this pattern automatically. It skips localStorage access on the server and syncs on the client after hydration. It is the recommended production approach if the localStorage behavior is needed across multiple stores.

```ts
// nuxt.config.ts
modules: ['@pinia/nuxt', '@pinia-plugin-persistedstate/nuxt']

// In the store:
export const useTagsStore = defineStore('tags', () => { ... }, {
  persist: true
})
```

**Confidence:** HIGH for the problem; HIGH for the `import.meta.client` guard fix; MEDIUM for `pinia-plugin-persistedstate` SSR specifics (official docs confirm Nuxt support but configuration details should be verified against current version).

---

## Nuxt 4 `compatibilityVersion: 4` Gotchas

### The `app/` directory is the new `src/`

With `compatibilityVersion: 4`, Nuxt sets `srcDir` to `app/` by default. All application code (components, pages, composables, layouts, plugins, middleware, `app.vue`, `app.config.ts`) moves inside `app/`. Server code (`server/`), `nuxt.config.ts`, and `package.json` stay at the root.

The migration from `src/` to `app/` is a filesystem rename, not a code change. But every import path that assumed the old structure will break.

### The `~` alias now points to `app/`, not the project root

In Nuxt 3, `~` (and `@`) resolved to the project root. In Nuxt 4 with `compatibilityVersion: 4`, `~` resolves to `app/`. The `~~` alias still resolves to the project root.

**What breaks:** Any import like `~/server/data/vendors` (pointing to a server-side file from an app component) will silently fail to resolve or resolve to the wrong path. Server data files must be accessed via API routes, never via direct import from `app/` code — which is the correct architecture anyway.

**What also breaks:** If you have shared TypeScript types in a root-level `types/` directory and import them with `~/types/vendor`, those imports break. Move shared types to `app/types/` or use `~~/types/` (double tilde) to reference the root.

### Auto-imports scope to `app/`

Nuxt's auto-import scans `app/components/`, `app/composables/`, `app/utils/`, etc. Files placed outside `app/` (e.g., at `src/composables/`) are not auto-imported. This is a silent failure — the composable just isn't available, and Vue will throw `useTagsStore is not defined` at runtime rather than at build time.

### Server code is strictly separated

Files in `server/` are server-only and cannot import from `app/`. Files in `app/` can call `useFetch('/api/...')` but cannot directly import server modules. Attempting `import { vendors } from '~/server/data/vendors'` from an app component will cause a build error or a runtime crash because server code may reference Node.js APIs unavailable in the browser bundle.

This is correct architecture — the point of the migration is to serve mock data through `server/api/` routes, not through direct imports. The existing `src/data/*.js` files migrate to `server/data/` and are accessed via `server/api/` handlers.

### TypeScript config split

Nuxt 4 generates three tsconfig files: `.nuxt/tsconfig.app.json` (app code), `.nuxt/tsconfig.server.json` (server code), `.nuxt/tsconfig.node.json` (build tooling). IDE path resolution for aliases depends on which tsconfig your editor picks up. If `~/something` resolves incorrectly in the IDE but works at build time (or vice versa), the editor is reading the wrong tsconfig. Configure your IDE to use the root `tsconfig.json` that extends `.nuxt/tsconfig.json`.

### The `window.NUXT` global is removed

Nuxt 4 removes the `window.__NUXT__` global that Nuxt 3 used for payload hydration. Any code that reads `window.__NUXT__` directly (from old plugins or third-party integrations) will break silently. Use `useNuxtApp().payload` instead. This is unlikely to affect this project directly but could appear in older Nuxt plugin snippets copied from community examples.

**Confidence:** HIGH — sourced from official Nuxt 4 upgrade guide and verified Nuxt 4 release announcements.

---

## PrimeVue to Nuxt UI v3 Migration Risks

### No direct component equivalents — this is a full rewrite, not a swap

PrimeVue and Nuxt UI are entirely different component libraries with different APIs, slot conventions, and styling systems. There is no automated migration. Every PrimeVue component import must be replaced with a Nuxt UI equivalent, and the template and prop usage rewritten.

### DataTable → UTable: API is substantially different

PrimeVue `DataTable` and Nuxt UI v3 `UTable` both render sortable/filterable tables, but their APIs are incompatible:

| Concern | PrimeVue DataTable | Nuxt UI v3 UTable |
|---------|-------------------|-------------------|
| Data prop | `:value="vendors"` | `:data="vendors"` |
| Column key | `field="vendorName"` | `accessorKey: 'vendorName'` |
| Column label | `header="Vendor"` | `header: 'Vendor'` |
| Cell slot name | `#vendorName="{ data }"` | `#vendorName-cell="{ row }"` |
| Sort | `sortable` on `<Column>` | TanStack Table sort config |
| Filter | `filterDisplay="menu"` with FilterMatchMode | Client-side filter via `globalFilter` or TanStack Table filter |
| Row click | `@row-click` event | Row slot + `@click` on row element |

Nuxt UI v3 UTable is backed by TanStack Table. This is more powerful than PrimeVue's built-in sort/filter, but requires learning TanStack Table's column definition API. Sorting and filtering behavior that was declarative in PrimeVue requires explicit column `sortingFn` and `filterFn` configuration in Nuxt UI v3.

The Discovery page and DPA page both use heavily configured PrimeVue DataTables with custom sort, filter, and cell slots. These will require the most work in the migration.

### PrimeVue Drawer → Nuxt UI USlideover

`VendorDrawer.vue` uses PrimeVue's `<Drawer>` component (`primevue/drawer`). The Nuxt UI equivalent is `<USlideover>`. Key behavioral differences:

- PrimeVue Drawer uses `v-model="visible"` to control visibility. Nuxt UI USlideover uses `v-model:open` (note the `:open` modifier — missing the modifier causes silent non-reactivity).
- PrimeVue Drawer default slot is the entire drawer body. Nuxt UI USlideover uses a `#content` slot for the body. Placing content in the default slot without `#content` may render but outside the scroll area.
- The global overlay system changed. PrimeVue registers drawers globally; Nuxt UI v3 requires `<UApp>` to be the root wrapper for overlay portals to work. Missing `<UApp>` causes modals, slideovers, and toast notifications to not render.

### PrimeVue MultiSelect → Nuxt UI USelectMenu

PrimeVue MultiSelect allows grouped options. Nuxt UI USelectMenu supports multi-select with the `multiple` prop, but grouped options require structuring the `items` array with group headers. The slot API for displaying selected items differs significantly.

### Form components are no longer full-width by default

PrimeVue form inputs default to `block` display (full width). Nuxt UI v3 form components default to `inline-flex`. Any layout that relied on inputs naturally filling their container will break — inputs will shrink to content width. Fix by adding `class="w-full"` to inputs that should be full-width.

### PrimeVue `Tag` component → Nuxt UI `UBadge`

The status badge pattern used throughout (`DPA_STATUS_COLORS`, `RISK_LABEL_COLORS`, `EDTECH_STATUS_COLORS` in `riskLabels.js`) uses PrimeVue `<Tag :severity="...">`. The Nuxt UI equivalent is `<UBadge :color="..." :variant="...">`. The color system is different: PrimeVue uses named severities (`success`, `danger`, `warning`); Nuxt UI uses Tailwind color names (`green`, `red`, `yellow`) plus variant styles (`solid`, `soft`, `subtle`). The `riskLabels.js` constants module will need to be rewritten with new color/variant values.

### PrimeVue icon prefix (`pi pi-xxx`) does not work in Nuxt UI

The existing `SidebarNav.vue` and router meta use `pi pi-home`, `pi pi-search`, etc. Nuxt UI uses Iconify icon names (e.g., `i-heroicons-home`, `i-lucide-search`). All icon references must be updated. PrimeVue icons are not available in Nuxt UI and the `primeicons` package should be removed.

**Confidence:** HIGH for UTable breaking changes (verified against official Nuxt UI v3 migration guide and changelog); HIGH for USlideover/UApp pattern; MEDIUM for USelectMenu grouped options (docs exist but edge cases unverified).

---

## AWS Amplify Deployment Pitfalls

### Environment variable naming: the `NUXT_` prefix requirement

In production on Amplify, Nuxt's `runtimeConfig` only picks up environment variables prefixed with `NUXT_`. Variables without this prefix are ignored at runtime even if they are set in the Amplify console.

- Private server-side vars: `NUXT_MY_SECRET` → overrides `runtimeConfig.mySecret`
- Public client-side vars: `NUXT_PUBLIC_API_BASE` → overrides `runtimeConfig.public.apiBase`

Variables set in Amplify without the `NUXT_` prefix will appear in the build environment (available to `process.env` during build) but will NOT be injected into the running Nitro server. This is a silent failure — the app builds successfully but reads `undefined` for those values at runtime.

For this project in v1.0.0, all data is mocked and no private API keys are needed. This pitfall becomes critical in v1.1.0+ when real app-catalog API credentials are added.

### Public `runtimeConfig` values are embedded in the client bundle

Any variable in `runtimeConfig.public` is serialized into the page HTML and sent to every browser. Do not put API keys, internal service URLs, or anything sensitive in `runtimeConfig.public`. For this project's demo data scenario this is low risk, but the pattern must be established correctly before real API keys are added.

### `baseDirectory` must be `.amplify-hosting`

When Nitro's `aws-amplify` preset builds the project, the output goes to `.amplify-hosting/`, not `.output/`. If `amplify.yml` specifies `baseDirectory: .output`, Amplify will deploy an empty or incorrect build artifact. The correct configuration:

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .amplify-hosting
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

Nitro auto-detects the Amplify CI/CD environment and selects the `aws-amplify` preset without explicit configuration in `nuxt.config.ts`, but it is safer to set it explicitly: `nitro: { preset: 'aws-amplify' }`.

### SSR Lambda function size limit: 50 MB

Amplify deploys SSR server functions as Lambda functions with a 50 MB package size limit. A Nuxt app with heavy dependencies (large UI library, ECharts bundled server-side) can approach this limit. The `<ClientOnly>` pattern for ECharts is important for this reason too — it keeps ECharts out of the server bundle entirely.

Check the `.amplify-hosting/compute/default/` directory after build to see the server function package size. If it approaches 40 MB, audit for large server-side dependencies.

### Lambda response payload limit: 1 MB

CloudFront/Lambda@Edge has a 1 MB response body limit. Server-rendered pages that inline large amounts of data (e.g., all 27 vendors serialized into Pinia state payload) could exceed this. The mitigation is using `server/api/` routes for data so pages fetch data client-side after hydration, keeping the initial HTML payload small.

### Node.js version

Effective September 2025, Amplify blocks deployment of SSR apps using Node.js 14.x, 16.x, or 18.x. Use Node.js 20 or 22. Set this explicitly:

```ts
// nuxt.config.ts
nitro: {
  awsAmplify: { runtime: 'nodejs22.x' }
}
```

### No direct file system access from Lambda

Nitro Lambda functions cannot read files from the build directory at runtime via `fs.readFileSync`. Any mock data served through `server/api/` routes must either be bundled into the server code (imported as a module) or served through Amplify's static file hosting. The recommended pattern: `server/data/vendors.ts` is a TypeScript module that exports an array, imported directly into `server/api/vendors.get.ts`. This bundles the data into the Lambda at build time, which is correct for mock data.

**Confidence:** MEDIUM — AWS Amplify docs confirmed the `baseDirectory` and Lambda size limits; `NUXT_` prefix behavior confirmed via Nuxt official docs; Lambda file system restriction is a general AWS Lambda constraint.

---

## Build Order Risks

### Scaffold must come before any page migration

Do not migrate individual pages before the Nuxt scaffold is working end-to-end. If you migrate the Discovery page first and the scaffold is broken, you cannot know if errors are from the page or the scaffold. The correct order:

1. Nuxt scaffold compiles and serves an empty page (no errors)
2. Nuxt UI is installed and a single `<UButton>` renders correctly
3. Layout (`app/layouts/default.vue`) renders with sidebar and `<NuxtPage>`
4. Routing works (navigating between stub pages shows the correct page component)
5. Pinia store initializes without SSR errors
6. Then migrate pages one at a time

Attempting to migrate everything in one commit makes debugging impossible.

### Data layer before page components

The same rule that applied in v0.5.0 applies here: establish `server/data/*.ts` files and their corresponding `server/api/*.get.ts` routes before writing any page component. A page that cannot fetch its data cannot be tested, and a broken data route looks identical to a broken page component during debugging.

The current `src/data/*.js` files must be converted to TypeScript and moved to `server/data/*.ts` as part of the scaffold phase, not the page migration phases.

### ECharts import before `<ClientOnly>` wrapping causes build-time failures

If a component imports `vue-echarts` at the top level and is rendered as part of the SSR tree (no `<ClientOnly>` ancestor), the Vite/Rollup build may succeed but the SSR runtime will crash on first request. This mirrors the v0.5.0 Vite 8 / rolldown issue where stub files had to exist before router registration. The equivalent here: create `ChartRadar.vue` and `ChartDonut.vue` as client-only wrappers before wiring them into the pages that use them.

### PrimeVue must be fully removed before Nuxt UI is wired

Running both PrimeVue and Nuxt UI simultaneously in the same Nuxt 4 app is not a valid intermediate state. Both install global component registrations, both use Tailwind, and both provide components with identical names (e.g., `Button`). The result is unpredictable: whichever is registered last wins, but the other's styles are still in the bundle. Remove PrimeVue from `package.json` and all imports before installing Nuxt UI.

The migration of each page from PrimeVue to Nuxt UI components should happen component-by-component within the same commit, not across separate commits, to avoid a state where a page references both libraries simultaneously.

### TypeScript errors during migration will block the build

Nuxt 4 with TypeScript runs type checking as part of `nuxi build`. A `.vue` file with a TypeScript error that would be a runtime warning in the old Vite SPA will now be a build failure. During migration, if type errors from partially-migrated files block the build, use `// @ts-nocheck` at the top of the file as a temporary escape hatch — but track each instance and remove them before the phase is considered complete.

**Confidence:** HIGH for scaffold-first order (directly established by v0.5.0 experience with stub views); HIGH for PrimeVue + Nuxt UI conflict (both libraries touch the same global registration surfaces); MEDIUM for TypeScript build-blocking (behavior depends on tsconfig `strict` settings).

---

## Phase Mapping

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Nuxt scaffold setup | `~` alias breaks after moving to `app/` | Set aliases explicitly in `nuxt.config.ts`; use `~~` for root references |
| Nuxt scaffold setup | `window.NUXT` removed — old community plugin snippets break | Do not copy Nuxt 3 plugin boilerplate directly; verify against Nuxt 4 docs |
| Nuxt scaffold setup | TypeScript errors block first build | Start with `strict: false`, tighten incrementally |
| Layout + routing | `<UApp>` missing — overlays never render | `app/app.vue` must wrap content in `<UApp>` |
| Layout + routing | `meta.icon` uses PrimeVue `pi pi-` prefix | Convert all icon names to Iconify format before wiring sidebar |
| Tags store migration | `localStorage` called at server init | Rewrite with `import.meta.client` guard or `pinia-plugin-persistedstate` |
| Tags store migration | `useTagsStore()` after `await` in middleware | Always call `useTagsStore()` before any `await` in async contexts |
| Data layer | `server/data/` files imported directly from `app/` | Never import `server/` from `app/`; use `useFetch('/api/...')` instead |
| Data layer | Lambda cannot read files at runtime | Bundle data as TypeScript imports, not file system reads |
| Discovery page | PrimeVue DataTable column slots renamed | Use `#accessorKey-cell` not `#accessorKey-data` |
| Discovery page | MultiSelect grouped options API differs | Test grouped tag select with Nuxt UI USelectMenu before full page migration |
| ECharts charts | `vue-echarts` imported server-side → crash | Create `ChartRadar.vue` and `ChartDonut.vue` as isolated components always wrapped in `<ClientOnly>` |
| ECharts charts | Chart renders at zero height after hydration | Set explicit `height` on `<ClientOnly>` wrapper or chart container |
| AWS Amplify | `baseDirectory: .output` in `amplify.yml` | Use `.amplify-hosting` |
| AWS Amplify | Env vars without `NUXT_` prefix silently ignored | Audit all environment variables; enforce `NUXT_` prefix convention from day one |
| AWS Amplify | Server bundle exceeds 50 MB | Audit `.amplify-hosting/compute/default/` size; keep ECharts client-only |

---

*Sources:*
- *Nuxt 4 Upgrade Guide: https://nuxt.com/docs/4.x/getting-started/upgrade*
- *Nuxt and Hydration Best Practices: https://nuxt.com/docs/4.x/guide/best-practices/hydration*
- *Pinia SSR docs: https://pinia.vuejs.org/ssr/*
- *Pinia SSR Nuxt guide: https://pinia.vuejs.org/ssr/nuxt.html*
- *Nuxt UI v3 Migration Guide: https://ui.nuxt.com/docs/getting-started/migration/v3*
- *Nuxt Deploy to AWS Amplify: https://nuxt.com/deploy/aws-amplify*
- *Nitro AWS Amplify preset: https://nitro.build/deploy/providers/aws-amplify*
- *AWS Amplify SSR Troubleshooting: https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting-SSR.html*
- *nuxt-echarts module: https://echarts.nuxt.dev/*
- *Nuxt 4 runtime config: https://nuxt.com/docs/4.x/guide/going-further/runtime-config*
- *Pinia state leaking issue (verified): https://github.com/vuejs/pinia/discussions/2159*
