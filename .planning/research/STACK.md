# Stack Research: Nuxt 4 Migration

**Project:** District Demo Portal — v1.0.0 Nuxt Migration
**Researched:** 2026-05-21
**Research mode:** Ecosystem (migration-scoped)
**Overall confidence:** HIGH — all version numbers verified against official sources, npm, and live documentation as of research date.

---

## Version Clarification: "Nuxt UI v3" vs Current Reality

The milestone context and PROJECT.md use the label "Nuxt UI v3" but this language is outdated.
The npm package `@nuxt/ui` has a **v4.x** stable release line (current: v4.8.0) that requires Nuxt >= 4.1.0.
The project's existing `package.json` already has `@nuxt/ui: ^4.8.0` installed (added pre-migration).
All references below use the correct current version: **@nuxt/ui v4**.

---

## Core Framework

### Nuxt 4 — `nuxt@^4.4.6`

Nuxt 4 was released July 2025 as a stability-focused major version. It ships all the features previously gated behind `compatibilityVersion: 4`. The `compatibilityVersion` key in `nuxt.config.ts` now signals whether you want Nuxt 4 defaults (value `4`) or opt into upcoming Nuxt 5 experimental features (value `5`).

**Key Nuxt 4 structural changes from Nuxt 3:**

| Concern | Nuxt 3 default | Nuxt 4 default |
|---------|---------------|----------------|
| App code location | project root | `app/` subdirectory |
| `~` alias resolves to | project root | `app/` |
| Server code | `server/` | `server/` (unchanged) |
| Shared code | n/a | `shared/` (new, between app and server) |
| File-based routing | `pages/` | `app/pages/` |
| Layouts | `layouts/` | `app/layouts/` |
| Composables | `composables/` | `app/composables/` |
| Stores (Pinia) | `stores/` | `app/stores/` |

**`nuxt.config.ts` minimum scaffold:**

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
})
```

Note: `compatibilityDate` is required in Nuxt 4 and tells Nitro and modules which API contracts to use. Use a date on or after the Nuxt 4.0 release (July 2025).

**`app/` directory structure for this project:**

```
app/
  assets/
    css/
      main.css          ← @import "tailwindcss"; @import "@nuxt/ui";
  components/
    VendorDrawer.vue
    ...
  composables/
  layouts/
    default.vue         ← persistent sidebar + <NuxtPage />
  pages/
    index.vue           ← redirects to /discovery
    discovery.vue
    dpa.vue
    risk.vue
    tags.vue
  stores/
    tags.ts             ← useTagsStore (Pinia)
  app.vue               ← <UApp><NuxtLayout /></UApp>

server/
  api/
    vendors.get.ts
    dpa.get.ts
    tags.get.ts
    risk.get.ts
  data/
    vendors.ts          ← 27-vendor fixture (replaces src/data/vendors.js)
    dpa.ts
    tags.ts

shared/
  types/
    vendor.ts           ← shared TypeScript interfaces
```

**Install:**

```bash
npm install nuxt@^4.4.6
```

**Confidence:** HIGH — verified against github.com/nuxt/nuxt releases and official Nuxt upgrade guide.

---

## UI Layer

### @nuxt/ui v4 — `@nuxt/ui@^4.8.0`

Nuxt UI v4 is stable, production-ready, and fully open-source (Nuxt UI and Nuxt UI Pro are now unified into one free package). It requires Nuxt >= 4.1.0. It includes Tailwind CSS v4, Reka UI (headless primitives), and automatically registers `@nuxt/icon`, `@nuxt/fonts`, and `@nuxtjs/color-mode` — none of these need separate installation.

**Why @nuxt/ui v4 over alternatives:**
- First-party Nuxt integration with auto-imports for all components
- Tailwind v4 is bundled — no separate `tailwindcss` config file needed
- 125+ components covering all portal needs: tables, badges, drawers/slideovers, modals, dropdowns, navigation menus, toasts
- Color mode (dark/light) included via `@nuxtjs/color-mode`, configurable without extra install
- Replaces PrimeVue entirely — one fewer dependency, consistent design language

**Installation:**

```bash
npm install @nuxt/ui tailwindcss
```

Note: `tailwindcss` must be installed as a peer dependency even though Nuxt UI manages the Tailwind configuration.

**`nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
})
```

**`app/assets/css/main.css`:**

```css
@import "tailwindcss";
@import "@nuxt/ui";
```

**`app/app.vue`:**

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

The `<UApp>` wrapper is required for Toast, Tooltip, and programmatic overlays to function.

**Modules auto-registered by @nuxt/ui (do NOT add manually):**
- `@nuxt/icon` — icon system
- `@nuxt/fonts` — web font loading
- `@nuxtjs/color-mode` — dark/light mode

**Confidence:** HIGH — verified against ui.nuxt.com installation docs and releases page (v4.8.0 confirmed as latest stable on 2026-05-21).

---

## State Management

### @pinia/nuxt — `@pinia/nuxt@^0.11.3` + `pinia@^3.0.4`

`@pinia/nuxt` is the official Pinia module for Nuxt. It handles SSR serialization, hydration, and XSS protection automatically — none of these need manual implementation. In Nuxt 4 the stores directory moves to `app/stores/`.

**Why @pinia/nuxt over raw useState:**
- Tags store requires cross-route mutable state with CRUD operations — `useState` is for read-mostly shared refs
- DevTools support with time-travel debugging
- `storesDirs` auto-imports all stores without manual `import` statements in components
- Existing `useTagsStore` logic migrates directly (same `defineStore` API)

**Installation:**

```bash
npm install pinia @pinia/nuxt
```

Or via nuxi:

```bash
npx nuxi@latest module add pinia
```

**`nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
  pinia: {
    storesDirs: ['app/stores/**'],
  },
})
```

The `storesDirs` entry is required for Nuxt 4 because the default auto-discovery is `stores/**` (project root) — in Nuxt 4's `app/` structure this must be explicitly set.

**SSR hydration behavior:**
- State initialized on the server is serialized to `__pinia_state` in the HTML payload
- Client picks it up automatically during hydration — no `useHydration` boilerplate needed
- For stores that call `useFetch` / `useAsyncData`, data is deduplicated (server fetch result is reused client-side, not re-fetched)
- Avoid browser-only APIs in `state()` initializers; check `import.meta.client` guard if needed

**Store migration pattern (from SPA `src/stores/tags.js` to `app/stores/tags.ts`):**

```typescript
// app/stores/tags.ts
export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([...defaultTags])

  function addTag(name: string, color: string) { ... }
  function removeTag(id: string) { ... }
  function resetToDefaults() { tags.value = [...defaultTags] }

  return { tags, addTag, removeTag, resetToDefaults }
})
```

Setup store syntax (function form) is preferred over options syntax in TypeScript projects — better type inference.

**Confidence:** HIGH — version 0.11.3 verified via nuxt.com/modules/pinia; SSR behavior confirmed via pinia.vuejs.org/ssr/nuxt.

---

## Charts

### nuxt-echarts — `nuxt-echarts@^1.0.1` (wraps `echarts@^6.0.0` + `vue-echarts`)

`nuxt-echarts` is the first-party Nuxt module for Apache ECharts. Version 1.0.1 adds ECharts 6 support (released July 2025) and depends on `vue-echarts` internally — you do not install `vue-echarts` separately when using the module.

**Why nuxt-echarts over raw vue-echarts + `<ClientOnly>`:**
- Module provides `<VChart>`, `<VChartFull>`, `<VChartIsland>`, and `<VChartLight>` with SSR behavior built in
- Tree-shakeable via `echarts` config in `nuxt.config.ts` — only chart types you declare get bundled
- Avoids the manual `<ClientOnly>` wrapper boilerplate

**SSR component selection for this project:**

| Component | Behavior | Use in this project |
|-----------|----------|---------------------|
| `<VChart>` | Client-only render, full ECharts | Use for interactive charts (radar in VendorDrawer) |
| `<VChartFull>` | Server SVG + client hydration | Use for the Risk donut chart (fast initial display) |
| `<VChartIsland>` | Server SVG only, no client ECharts | Avoid — no tooltip interactivity |
| `<VChartLight>` | Server SVG + 4KB lightweight client | Consider for static charts if bundle size matters |

Recommendation: Use `<VChartFull>` for the Risk Position donut (SSR-safe fast display), `<VChart>` for the VendorDrawer radar (interactive, inside a `<ClientOnly>` already mounted lazily with the drawer).

**Installation:**

```bash
npm install nuxt-echarts
```

Note: `echarts` is a peer dependency. The existing `echarts@^6.0.0` in `package.json` satisfies it.

**`nuxt.config.ts`:**

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-echarts'],
  echarts: {
    charts: ['PieChart', 'RadarChart'],
    components: [
      'GridComponent',
      'TooltipComponent',
      'LegendComponent',
      'RadarComponent',
    ],
    features: ['LabelLayout', 'UniversalTransition'],
    renderer: ['canvas'],
  },
})
```

Declare only the chart types and components actually used — the module tree-shakes the rest.

**Confidence:** HIGH — verified against echarts.nuxt.dev installation docs; v1.0.1 confirmed as latest on npm.

---

## Deployment

### Nitro + AWS Amplify — preset: `aws_amplify` (zero-config auto-detected)

Nitro (Nuxt's server engine) detects the AWS Amplify CI/CD environment automatically at build time and selects the `aws_amplify` preset. Output lands in `.amplify-hosting/` rather than `.output/`. You do NOT need to set `preset: 'node-server'` in nuxt.config.ts — Amplify auto-detection is preferred.

**`nuxt.config.ts` (no preset override needed for standard Amplify CI):**

```typescript
export default defineNuxtConfig({
  nitro: {
    // No preset needed — Amplify CI auto-detects
    // Only set this for local testing of the Amplify output:
    // preset: 'aws_amplify',
  },
})
```

**`amplify.yml` (project root):**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 22
        - corepack enable
        - npm install
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

Key points:
- `baseDirectory` must be `.amplify-hosting` (not `.output`) — Nitro writes the Amplify-spec output here
- Node 22 is safe; Nitro defaults to `nodejs22.x` Lambda runtime. Node 24 is also supported (`nvm use 24`).
- No `appRoot` or monorepo variant needed for a single-app repo
- Amplify auto-enables SSR Lambda deployment when it detects the `.amplify-hosting` spec

**`nuxt.config.ts` for multi-environment environments (dev/staging/prod):** AWS Amplify sets `AMPLIFY_APP_ORIGIN` and other env vars at build time. Use `runtimeConfig` to expose environment-specific values:

```typescript
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      appEnv: process.env.APP_ENV ?? 'development',
    },
  },
})
```

**Confidence:** HIGH — verified against nitro.build/deploy/providers/aws-amplify and AWS Amplify official Nuxt docs. Zero-config auto-detection confirmed in AWS documentation.

---

## Module List

Complete `nuxt.config.ts` `modules` array for this project:

```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    '@nuxt/ui',       // UI components + Tailwind v4 + icon + fonts + color-mode (all bundled)
    '@pinia/nuxt',    // SSR-safe Pinia
    'nuxt-echarts',   // Apache ECharts via vue-echarts
  ],

  css: ['~/assets/css/main.css'],

  pinia: {
    storesDirs: ['app/stores/**'],
  },

  echarts: {
    charts: ['PieChart', 'RadarChart'],
    components: ['GridComponent', 'TooltipComponent', 'LegendComponent', 'RadarComponent'],
    features: ['LabelLayout', 'UniversalTransition'],
    renderer: ['canvas'],
  },

  typescript: {
    strict: true,
    typeCheck: false, // enable later once migration is stable; typeCheck=true requires vue-tsc installed
  },

  devtools: { enabled: true },
})
```

Modules NOT needed (handled automatically by @nuxt/ui):
- `@nuxt/icon`
- `@nuxt/fonts`
- `@nuxtjs/color-mode`

Modules from the old SPA to remove entirely:
- `primevue` / `@primeuix/themes` / `primeicons` — replaced by @nuxt/ui
- `vue-router` (standalone) — Nuxt owns routing via file-based pages
- `gh-pages` — replaced by Amplify CI/CD deployment

---

## TypeScript

Nuxt 4 generates TypeScript project references automatically in `.nuxt/`:

| Generated file | Covers |
|----------------|--------|
| `.nuxt/tsconfig.app.json` | `app/` code |
| `.nuxt/tsconfig.server.json` | `server/` code |
| `.nuxt/tsconfig.node.json` | `nuxt.config.ts` and tooling |
| `.nuxt/tsconfig.shared.json` | `shared/` code |

**Root `tsconfig.json` (minimal, do not extend manually):**

```json
{
  "extends": "./.nuxt/tsconfig.json"
}
```

Nuxt generates `.nuxt/tsconfig.json` as the master reference file that includes all four contexts above. Do not edit this file — it is overwritten on every `nuxt prepare` / `nuxt dev` / `nuxt build`.

**Customize via `nuxt.config.ts` only:**

```typescript
typescript: {
  strict: true,
  // typeCheck: true adds vue-tsc to the build pipeline — slower builds,
  // useful once TypeScript migration is complete
  tsConfig: {
    compilerOptions: {
      // project-specific overrides here if needed
    },
  },
},
```

**Migration strategy:** Start with `strict: true` and `typeCheck: false`. This enables strict type inference in the IDE without blocking builds on type errors. Enable `typeCheck: true` after the initial migration compiles cleanly.

**Confidence:** HIGH — verified against nuxt.com/docs/4.x/guide/concepts/typescript.

---

## Version Summary Table

| Package | Version | Role | Notes |
|---------|---------|------|-------|
| `nuxt` | `^4.4.6` | Core framework | Latest stable Nuxt 4 as of 2026-05-21 |
| `@nuxt/ui` | `^4.8.0` | UI components + Tailwind v4 | Already in package.json; requires Nuxt >= 4.1.0 |
| `tailwindcss` | `^4.x` (bundled via @nuxt/ui) | Utility CSS | Install as peer dep alongside @nuxt/ui |
| `pinia` | `^3.0.4` | State primitives | Already in package.json |
| `@pinia/nuxt` | `^0.11.3` | Nuxt SSR module for Pinia | New install; replaces manual Pinia setup |
| `nuxt-echarts` | `^1.0.1` | Nuxt ECharts module | New install; replaces direct vue-echarts usage |
| `echarts` | `^6.0.0` | ECharts core (peer dep) | Already in package.json; ECharts 6 released July 2025 |
| `vue-echarts` | (bundled by nuxt-echarts) | Vue ECharts component | Do NOT install separately |
| `typescript` | (auto by Nuxt) | Type system | Nuxt installs; no explicit dep needed |

**Packages to REMOVE from package.json:**

| Package | Reason |
|---------|--------|
| `primevue` | Replaced by @nuxt/ui |
| `@primeuix/themes` | Replaced by @nuxt/ui |
| `primeicons` | Replaced by @nuxt/icon (auto via @nuxt/ui) |
| `vue` (standalone) | Nuxt owns Vue; no separate dep needed |
| `vue-router` (standalone) | Nuxt owns routing |
| `@vitejs/plugin-vue` | Nuxt owns Vite config |
| `@tailwindcss/vite` | Replaced by @nuxt/ui Tailwind integration |
| `tailwindcss` (devDep) | Move to dep alongside @nuxt/ui |
| `vite` (devDep) | Nuxt owns Vite; no standalone dep |
| `gh-pages` | Replaced by Amplify CI/CD |

---

## Integration Notes and SSR Risks

### Risk 1: ECharts canvas requires browser context
ECharts canvas renderer cannot run on the server. Using `<VChart>` (client-only) or `<VChartFull>` (SSR SVG + client hydration) both handle this correctly. Raw `vue-echarts` `<VChart>` without the nuxt-echarts module would throw SSR errors — always use the module components.

### Risk 2: @nuxt/ui requires `<UApp>` at root
Without `<UApp>` wrapping `<NuxtLayout>`, Toast notifications and programmatic Slideover/Modal components will not render. The `app.vue` template must be:

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

### Risk 3: Pinia storesDirs must target app/stores in Nuxt 4
Default discovery in older @pinia/nuxt versions looked for `stores/` at the project root. In Nuxt 4 the stores live at `app/stores/`. The explicit `storesDirs: ['app/stores/**']` in `nuxt.config.ts` is required — omitting it will silently skip auto-imports.

### Risk 4: compatibilityDate is required in Nuxt 4
Omitting `compatibilityDate` causes a CLI warning in Nuxt 4 and may cause Nitro/module behavior to fall back to Nuxt 3 defaults. Set it to a date on or after the Nuxt 4.0 release.

### Risk 5: vue-echarts manual imports are incompatible with nuxt-echarts
If any migrated component imports from `vue-echarts` directly (e.g., `import VChart from 'vue-echarts'`) alongside the `nuxt-echarts` module, you may get duplicate ECharts registration. Remove all direct `vue-echarts` imports; use only the auto-imported `<VChart>` / `<VChartFull>` from the module.

---

## Sources

- [Nuxt 4 Upgrade Guide](https://nuxt.com/docs/getting-started/upgrade) — directory structure, compatibilityVersion, compatibilityDate
- [Nuxt 4 Announcing Blog Post](https://nuxt.com/blog/v4) — release context, breaking changes
- [Nuxt UI Installation (Nuxt)](https://ui.nuxt.com/docs/getting-started/installation/nuxt) — modules, CSS setup, UApp wrapper
- [Nuxt UI Releases](https://ui.nuxt.com/releases) — v4.8.0 confirmed stable
- [Nuxt UI Migration v3 to v4](https://ui.nuxt.com/docs/getting-started/migration/v4) — breaking changes, version clarification
- [Pinia Nuxt SSR](https://pinia.vuejs.org/ssr/nuxt.html) — SSR hydration, storesDirs, installation
- [@pinia/nuxt Nuxt Modules](https://nuxt.com/modules/pinia) — v0.11.3 confirmed
- [Nuxt ECharts Getting Started](https://echarts.nuxt.dev/getting-started) — installation, v1.0.1
- [Nuxt ECharts SSR Guide](https://echarts.nuxt.dev/guides/ssr) — VChart vs VChartFull vs VChartIsland
- [Nitro AWS Amplify](https://nitro.build/deploy/providers/aws-amplify) — aws_amplify preset, amplify.yml
- [AWS Amplify Nuxt Deploy](https://docs.aws.amazon.com/amplify/latest/userguide/get-started-nuxt.html) — zero-config, baseDirectory
- [Nuxt TypeScript](https://nuxt.com/docs/4.x/guide/concepts/typescript) — tsconfig generation, strict mode
