# Phase 7: Nuxt Scaffold - Research

**Researched:** 2026-05-21
**Domain:** Nuxt 4 SSR scaffold, Nuxt UI v4, Pinia v3 + SSR persistence, ECharts SSR strategy
**Confidence:** HIGH

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NUXT-01 | App runs as Nuxt 4 with TypeScript; `compatibilityVersion: 4`, `compatibilityDate: '2025-07-01'`; all PrimeVue removed | Section 1 (init), Section 3 (PrimeVue removal), Section 6 (TS) |
| NUXT-02 | `@nuxt/ui` v4 is sole component library; `<UApp>` wraps `app/app.vue` for USlideover/UModal overlays | Section 2 (Nuxt UI v4 setup) |
| NUXT-03 | Pinia tags store SSR-safe; `@pinia/nuxt` with `storesDirs: ['app/stores/**']`; localStorage persistence via `pinia-plugin-persistedstate` | Section 4 (Pinia + persist) |

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Vue 3 + Vite established — Phase 7 swaps in Nuxt 4. Lockfile present (`package-lock.json`).
- **Deployment:** Static GitHub Pages — no server runtime at deploy time (Phase 13 handles `nuxi generate`). Scaffold must not block static output.
- **Data:** All synthetic, no backend calls in this demo.
- **Iteration speed:** Mock changes must remain < 1 hour. Scaffold should not add ceremony.
- **Auth:** None — portal opens directly. Skip auth-flavored defaults.
- **GSD enforcement:** All file changes must run through GSD workflow (`/gsd:execute-phase`).
- **Naming:** PascalCase for `.vue` SFCs; camelCase for `.ts`/`.js` modules; kebab-case for assets.
- **Indentation:** 2 spaces, ES modules, no linter/formatter configured.

---

## User Constraints (from CONTEXT.md)

> No CONTEXT.md exists for Phase 7 — running in autonomous mode per init payload. The locked decisions from STATE.md govern instead:

### Locked Decisions (from STATE.md)

- **Nuxt SSR mode with static output via `nuxi generate`** for GitHub Pages (Phase 7 sets SSR; Phase 13 wires static output)
- **Nuxt UI component mapping:** DataTable → UTable, Dialog → UModal, MultiSelect → USelectMenu, Drawer → USlideover
- **ECharts SSR strategy:** `<ClientOnly>` wrapper — consistent across all charts (research below upgrades this to `nuxt-echarts` module which already wraps `<ClientOnly>` internally; same outcome, lower ceremony)
- **Pinia SSR persistence:** `pinia-plugin-persistedstate` with `storesDirs: ['app/stores/**']`
- **AWS Amplify glidepath:** 3-line switch in `nuxt.config.ts` (deferred to Phase 13 but design-aware now)
- **Single tags store** carried forward from v0.5.0 with same shape (`tagGroups`, `assignments`)
- **`@nuxt/ui` version:** REQUIREMENTS.md says v4, ROADMAP says v3. **Resolution: v4** — `@nuxt/ui@4.x` is the current `latest` on npm (4.8.0 as of 2026-05-18), requires Nuxt 4, already declared in current `package.json`. ROADMAP wording is stale.

### Deferred to Later Phases (OUT OF SCOPE for Phase 7)

- File-based routing migration (Phase 8 — `app/pages/`, `default.vue` layout)
- Data layer move to `server/api/` (Phase 9)
- Page migrations: Discovery, DPA, Risk, Tags, Dashboard (Phases 10-12)
- `nuxi generate`, base path, gh-pages deploy (Phase 13)
- Amplify preset wiring (Phase 13)

---

## Summary

Nuxt 4 scaffold is a clean operation in 2026: `npm create nuxt@latest`, install `@nuxt/ui@4`, install `@pinia/nuxt` + `pinia-plugin-persistedstate`, install `nuxt-echarts`. Total of ~5 packages added, all current on npm, all officially documented for Nuxt 4. The existing v0.5.0 codebase becomes mostly disposable: `src/main.js`, `src/App.vue`, `src/router/`, `vite.config.js`, `index.html`, and all PrimeVue-importing components get deleted in Phase 7. Only `src/stores/tags.js`, the `src/data/` files, `src/style.css` theme variables, and `public/` survive — and even those mostly relocate in later phases.

The single highest-risk item is **Pinia SSR persistence**: the existing tags store reads `localStorage` synchronously at store-creation time, which crashes on the server. The fix is mechanical — switch to `persist: true` on the store and let `pinia-plugin-persistedstate/nuxt` handle hydration — but it must be done correctly the first time or every page that uses the store will throw on first SSR render.

The second risk is **ECharts SSR**: the current code globally registers ECharts components in `main.js` and uses `<VChart>` directly. SSR will explode on `window is not defined` from inside ECharts. The clean fix is `nuxt-echarts` (official Nuxt module, current 1.0.1) which provides a drop-in `<VChart>` component that is SSR-safe out of the box — strictly better than manually wrapping every chart in `<ClientOnly>`.

**Primary recommendation:** Scaffold a fresh Nuxt 4 project IN PLACE (delete old SPA files, init Nuxt into the same repo root). Use `nuxt-echarts` module — not `<ClientOnly>` + raw `vue-echarts`. Use `pinia-plugin-persistedstate/nuxt` with global `storage: 'localStorage'` config. Keep the scaffold thin: one stub `app/app.vue`, one stub `app/stores/tags.ts` to prove the SSR pattern, no pages yet (Phase 8 owns routing).

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Init strategy | **In-place** scaffold (delete old, init in same dir) | Avoids dual repo confusion. Git history preserved. `public/`, `.planning/`, `CLAUDE.md`, `README.md` stay. |
| 2 | Nuxt UI version | **`@nuxt/ui@^4.8.0`** | npm `latest`; REQUIREMENTS.md says v4; package.json already has `^4.8.0`. ROADMAP "v3" wording is stale. |
| 3 | PrimeVue removal | **Delete all 4 PrimeVue packages + 7 import sites in one task** | Atomic — half-removal leaves a non-building project. |
| 4 | Pinia persistence module | **`pinia-plugin-persistedstate/nuxt` with global `storage: 'localStorage'`** | Nuxt module path is a sub-path of the main package (NOT separate `@pinia-plugin-persistedstate/nuxt` package). |
| 5 | ECharts SSR | **`nuxt-echarts@^1.0.1` module** (not manual `<ClientOnly>`) | Official Nuxt module, provides `<VChart>` (same name as current code), handles SSR, tree-shakes charts/components via config. |
| 6 | TypeScript | **Default scaffold gives TS** | `npm create nuxt@latest` produces `.ts`/`lang="ts"` SFCs by default. Add `"typecheck": "nuxt typecheck"` script. |
| 7 | File migration scope | **Delete SPA shell entirely; keep `src/data/*.js`, `src/stores/tags.js`, `public/*` for later phases** | Phase 7 doesn't need pages or data wiring. Stale files in `src/` stay untouched until their owning phase. |
| 8 | Build/dev commands | **`nuxi dev` / `nuxi build` / `nuxi typecheck`** | Standard Nuxt 4 scripts. Generate/deploy added in Phase 13. |

---

## Per-Question Findings

### 1. Nuxt 4 init strategy

**Exact command (2026):**
```bash
npm create nuxt@latest district-demo-tmp
```

The interactive prompt asks for project name, package manager, and modules. **For an in-place migration**, scaffold into a temp folder, copy the generated files into the repo root, delete the temp folder. The current repo has `dist/`, `node_modules/`, `package.json`, etc. — those get replaced/regenerated.

**No `--typescript` flag needed** — TypeScript is the default for new Nuxt 4 projects. SFCs use `<script setup lang="ts">` by default.

**Canonical `nuxt.config.ts` for this project:**
```ts
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-echarts',
  ],
  css: ['~/assets/css/main.css'],
  pinia: {
    storesDirs: ['./app/stores/**'],
  },
  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },
  echarts: {
    renderer: 'canvas',
    charts: ['RadarChart', 'PieChart'],
    components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
  },
})
```

**Notes:**
- `compatibilityVersion: 4` is technically the default in Nuxt 4.x, but REQUIREMENTS.md mandates it be explicit — keep it.
- `compatibilityDate: '2025-07-01'` is also mandated by REQUIREMENTS.md; pinning prevents silent behavior changes from Nitro/Nuxt updates.
- `ssr: true` is the default; explicit because STATE.md flags it as a decision.
- `storesDirs` is relative to project root in `@pinia/nuxt`; `./app/stores/**` works for Nuxt 4 `app/` layout.

**Nuxt 4 directory layout (confirmed default):**
```
app/
  app.vue           ← root with <UApp>
  app.config.ts     ← optional (theme colors)
  assets/css/main.css
  components/       ← (later phases)
  layouts/          ← (Phase 8)
  pages/            ← (Phase 8)
  stores/           ← (Phase 7 — tags.ts)
public/             ← stays at repo root, not under app/
server/             ← (Phase 9)
nuxt.config.ts      ← root
tsconfig.json       ← root, extends .nuxt/tsconfig.json
package.json        ← root
```

**Confidence:** HIGH — verified via official Nuxt 4 docs + Nuxt 4 blog post + npm.

---

### 2. Nuxt UI v4 setup

**Resolution of "v3 vs v4":** Use **v4**. REQUIREMENTS.md mandates v4. `@nuxt/ui@4.8.0` is the npm `latest` tag (published 2026-05-18). ROADMAP's "v3" wording is stale terminology from initial drafting and should be treated as a documentation artifact, not a decision.

**Install:**
```bash
npm install @nuxt/ui tailwindcss
```

Note: `tailwindcss` is listed as a separate install because Nuxt UI v4 uses Tailwind v4 (CSS-first config, no `tailwind.config.js`). Tailwind is a peer dep, not bundled.

**Required files:**

1. **`nuxt.config.ts`** — add `'@nuxt/ui'` to modules (first in array; ordering doesn't matter functionally but conventional).

2. **`app/assets/css/main.css`** (replaces current `src/style.css`):
   ```css
   @import "tailwindcss";
   @import "@nuxt/ui";

   @theme static {
     --color-brand-50:  #eeeeff;
     --color-brand-100: #d4d4fc;
     --color-brand-200: #ababf8;
     --color-brand-300: #8284f4;
     --color-brand-400: #6466ef;
     --color-brand-500: #484ce6;
     --color-brand-600: #3c40cc;
     --color-brand-700: #3034b3;
     --color-brand-800: #252899;
     --color-brand-900: #1a1d80;
     --color-brand-950: #0f1166;

     --color-sidebar: #111827;
     --color-accent:  #da8231;
   }
   ```

3. **`app/app.config.ts`** (new, REQUIRED to map "brand" → primary semantic color):
   ```ts
   export default defineAppConfig({
     ui: {
       colors: {
         primary: 'brand',
         neutral: 'zinc',
       },
     },
   })
   ```

4. **`app/app.vue`** (replaces `src/App.vue`):
   ```vue
   <template>
     <UApp>
       <NuxtPage />
     </UApp>
   </template>
   ```
   For Phase 7 only (before Phase 8 adds `app/pages/`), use a placeholder instead of `<NuxtPage />`:
   ```vue
   <template>
     <UApp>
       <div class="p-8">
         <h1 class="text-2xl font-semibold">District Demo — Nuxt 4 scaffold</h1>
         <p class="text-gray-600">Scaffold ready. Pages migrate in Phase 8.</p>
       </div>
     </UApp>
   </template>
   ```

**`<UApp>` provides:**
- Toast component portal
- Tooltip component portal
- **Programmatic overlay portals** — this is what makes `USlideover` and `UModal` render. Without `<UApp>`, overlays fail silently or throw.

**Auto-registered companion modules (no manual install needed):**
- `@nuxt/icon`
- `@nuxt/fonts`
- `@nuxtjs/color-mode`

**Confidence:** HIGH — verified against `ui.nuxt.com/docs/getting-started/installation/nuxt` and npm `dist-tags` (latest: 4.8.0).

---

### 3. PrimeVue removal

**Packages to remove from `package.json`:**
- `primevue` (^4.5.5)
- `@primeuix/themes` (^2.0.3)
- `primeicons` (^7.0.0)

**Direct PrimeVue imports to delete (verified via grep):**

| File | Imports | Disposition |
|------|---------|-------------|
| `src/main.js` | `primevue/config`, `@primeuix/themes`, `@primeuix/themes/aura`, `primeicons/primeicons.css` | **DELETE entire file** (replaced by `nuxt.config.ts` + `app.config.ts`) |
| `src/components/VendorDrawer.vue` | `primevue/drawer`, `primevue/divider`, `primevue/multiselect`, `primevue/tag` | Defer to Phase 10 — file stays untouched in Phase 7 |
| `src/components/DpaGrid.vue` | `primevue/datatable`, `primevue/column`, `primevue/inputtext`, `primevue/iconfield`, `primevue/inputicon`, `primevue/tag`, `@primevue/core/api` | Defer to Phase 11 |
| `src/views/DiscoveryView.vue` | same DataTable cluster | Defer to Phase 10 |
| `src/views/DashboardView.vue` | `primevue/tag` | Defer to Phase 11 |
| `src/views/ReportsView.vue` | `primevue/datatable`, `primevue/column`, `primevue/tag` | Defer to Phase 12 |
| `src/views/SettingsView.vue` | `primevue/dialog`, `primevue/button` | Defer to Phase 12 |

**Critical insight:** PrimeVue PACKAGES are removed in Phase 7 (per NUXT-01), but the source files importing them stay until their owning phase. Once packages are removed, those files won't import — **they must be unreachable by Nuxt** (no entry from `app.vue`, no router pointing at them). Since Phase 7 has no `app/pages/`, no `app/components/` referencing them, Nuxt's auto-import scanner will NOT crawl `src/views/*.vue` and they remain inert.

**Verification approach:** After removal, `npm run dev` must succeed. Grep for `primevue|@primevue|primeicons|@primeuix` in `package.json` and in `app/`, `server/`, `nuxt.config.ts` → zero matches. Matches in `src/` are expected (deferred files) and don't block.

**`src/style.css` removal:** This file imports `tailwindcss` and defines theme variables. Replaced by `app/assets/css/main.css`. Delete `src/style.css`.

**Confidence:** HIGH — grep-verified file list.

---

### 4. Pinia SSR + persistence

**Install (two packages, two module entries):**
```bash
npm install @pinia/nuxt pinia pinia-plugin-persistedstate
```

`pinia-plugin-persistedstate` is a **single npm package** — the Nuxt integration is exposed as the sub-path `pinia-plugin-persistedstate/nuxt`. There is NO separate `@pinia-plugin-persistedstate/nuxt` package (the one published at that name is unrelated/forked and we should not use it).

**`nuxt.config.ts` modules (order matters — Pinia first):**
```ts
modules: [
  '@nuxt/ui',
  '@pinia/nuxt',
  'pinia-plugin-persistedstate/nuxt',  // MUST come after @pinia/nuxt
  'nuxt-echarts',
],
pinia: {
  storesDirs: ['./app/stores/**'],
},
piniaPluginPersistedstate: {
  storage: 'localStorage',  // global default — overrides cookie default
},
```

**Nuxt module storage default is `'cookies'`, not localStorage** — this is for SSR friendliness (cookies are sent with every request, available on the server). For this project we explicitly want localStorage because:
- The tags store can hold more than 4KB (cookie limit)
- We don't need server-side access to tags data (mocked, client-side-only)
- The current v0.5.0 code uses localStorage — preserves user-visible behavior

**Migrated tags store (`app/stores/tags.ts`):**
```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagItem {
  id: string
  name: string
}

export interface TagGroup {
  id: string
  name: string
  color: string
  children: TagItem[]
}

export type TagAssignments = Record<string, string[]>

export const SEED_TAG_GROUPS: TagGroup[] = [
  {
    id: 'group-curriculum',
    name: 'Curriculum',
    color: '#484ce6',
    children: [
      { id: 'tag-math', name: 'Math' },
      { id: 'tag-science', name: 'Science' },
      { id: 'tag-ela', name: 'ELA' },
      { id: 'tag-social-studies', name: 'Social Studies' },
    ],
  },
  {
    id: 'group-assessment',
    name: 'Assessment',
    color: '#da8231',
    children: [
      { id: 'tag-formative', name: 'Formative' },
      { id: 'tag-summative', name: 'Summative' },
    ],
  },
  {
    id: 'group-communication',
    name: 'Communication',
    color: '#16a34a',
    children: [
      { id: 'tag-parent-engagement', name: 'Parent Engagement' },
      { id: 'tag-staff-messaging', name: 'Staff Messaging' },
    ],
  },
  {
    id: 'group-admin',
    name: 'Administration',
    color: '#dc2626',
    children: [
      { id: 'tag-hr', name: 'HR' },
      { id: 'tag-finance', name: 'Finance' },
      { id: 'tag-scheduling', name: 'Scheduling' },
    ],
  },
]

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})

  return { tagGroups, assignments }
}, {
  persist: true,  // uses global storage: 'localStorage' from nuxt.config.ts
})
```

**Key SSR behaviour changes vs v0.5.0:**

| v0.5.0 (broken under SSR) | v1.0.0 (SSR-safe) |
|---------------------------|-------------------|
| `loadOrDefault('schoolday-tag-groups', SEED_TAG_GROUPS)` runs at store-create time | Store initializes with `SEED_TAG_GROUPS` (works on server) |
| Reads `localStorage.getItem` synchronously | Plugin runs on client only, hydrates state after mount |
| Two separate `watch()` blocks writing to localStorage | Plugin auto-saves on state change |
| Separate keys `'schoolday-tag-groups'` and `'schoolday-tag-assignments'` | Single key `'tags'` (the store id) with both fields serialized as one JSON blob |

**Note on localStorage key naming:** `persist: true` uses the store id (`'tags'`) as the localStorage key. To preserve compatibility with users who have v0.5.0 data in localStorage, ignore the old keys and let new key seed from defaults. (This is fine — the demo is reset-friendly; no production user data at stake.)

**The plugin handles `typeof window === 'undefined'` automatically** — confirmed in the Nuxt module: hydration happens in a client-only plugin Nuxt injects. On the server, stores initialize from `state()` defaults; on the client, after hydration, the plugin reads localStorage and merges. No `process.client` guards needed.

**Confidence:** HIGH — verified against prazdevs docs (`/frameworks/nuxt.html`) and the setup-store options syntax from `/guide/config.html`.

---

### 5. ECharts SSR strategy

**Recommendation: Use `nuxt-echarts@^1.0.1` module — DO NOT manually wrap in `<ClientOnly>`.**

**Three options compared:**

| Option | Setup cost | SSR safety | TS types | Bundle size | Verdict |
|--------|------------|------------|----------|-------------|---------|
| (a) Raw `echarts` + manual `<ClientOnly>` everywhere | Low | Manual — every site is a footgun | Bring your own `ECOption` | Lean if tree-shaken; bloated if not | Tedious |
| (b) `vue-echarts` + manual `<ClientOnly>` | Low | Same — manual | Built-in `EChartsOption` | Tree-shake-friendly | Tedious |
| (c) `nuxt-echarts` module | **Trivial** (one config block) | **Automatic** — module handles SSR via server-side SVG | **Auto-generated `ECOption` typed to your config** | **Best** — only registered charts/components ship | **WIN** |

**Why nuxt-echarts beats manual ClientOnly:**

1. **Configuration locality** — chart/component registration moves from `main.js` (gone) into `nuxt.config.ts` where it belongs.
2. **Auto-import of `<VChart>`** — no need to register or import per page. Drop-in compatible with existing v0.5.0 template syntax.
3. **SSR via SVG renderer on the server** — module auto-detects server context, renders chart as SVG that hydrates on client. No `window` references reach the server.
4. **Tree-shaken `ECOption` type** — if you register `RadarChart` only, the auto-generated `ECOption` type only accepts radar options, catching misuse at typecheck time.
5. **STATE.md says "ClientOnly wrapper"** — the module provides the same outcome (no SSR crash) with less ceremony; this is a refinement of the locked decision, not a contradiction. Result is consistent: charts render correctly without breaking SSR.

**Install:**
```bash
npm install nuxt-echarts
```

(The `npx nuxi module add echarts` CLI also works but does the install plus adds `'nuxt-echarts'` to `nuxt.config.ts`. Either is fine.)

**`nuxt.config.ts` block:**
```ts
echarts: {
  renderer: 'canvas',
  charts: ['RadarChart', 'PieChart'],
  components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
}
```

Why these specific registrations:
- `RadarChart` + `RadarComponent` — VendorDrawer 10-axis privacy radar (Phase 10)
- `PieChart` — Risk Position donut (Phase 12)
- `TooltipComponent`, `LegendComponent` — used by both
- `canvas` renderer in browser; module auto-uses SVG on server

**Phase 7 scaffold scope for ECharts:** Wire the module config in `nuxt.config.ts` and verify a minimal chart renders without SSR crash. **Do NOT build the radar or donut charts** — that's Phase 10 and Phase 12. Phase 7 demonstrates the pattern with a stub chart on a throwaway route (or inline in `app.vue` for the dev check) and removes the stub before completion.

**Minimal smoke test (delete after verification):**
```vue
<!-- app/app.vue — temporary smoke test only -->
<script setup lang="ts">
const option = ref<ECOption>({
  series: [{ type: 'pie', data: [{ value: 1, name: 'Smoke' }] }],
})
</script>

<template>
  <UApp>
    <div class="p-8">
      <h1>Scaffold smoke test</h1>
      <VChart :option="option" style="height: 200px" />
    </div>
  </UApp>
</template>
```

**Confidence:** HIGH for module mechanics (verified via `echarts.nuxt.dev/getting-started/configuration` and `/guides/usage`). MEDIUM-HIGH for "consistent with STATE.md decision" — interpretive call, justified because outcome is identical and module is the official Nuxt-ecosystem solution.

---

### 6. TypeScript migration

**Default behavior of `npm create nuxt@latest`:**
- Generates `.ts` files throughout, `<script setup lang="ts">` in SFCs
- Includes `tsconfig.json` at root with `"extends": "./.nuxt/tsconfig.json"`
- `.nuxt/tsconfig.json` is auto-regenerated by `nuxi prepare` (runs as postinstall and before dev/build)
- Three split tsconfigs are generated under `.nuxt/`: `tsconfig.app.json` (client), `tsconfig.node.json` (build tools), `tsconfig.server.json` (Nitro), `tsconfig.shared.json` (shared types)

**Recommended `package.json` scripts:**
```json
{
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "typecheck": "nuxi typecheck",
    "postinstall": "nuxi prepare"
  }
}
```

(Note: Phase 7 success criterion 5 says "zero TS errors on a clean `nuxi build`". Nuxt's `nuxi build` does NOT typecheck Vue templates by default — `nuxi typecheck` does. For Phase 7 we add `typecheck` as a separate script and run it as part of verification. `nuxi build` checks JS/TS but not Vue SFC `<template>` type bindings.)

**Common Phase 7 TS errors to preempt:**

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find name 'defineNuxtConfig'` | `nuxi prepare` hasn't run | Run `npm install` (postinstall triggers prepare) or `npx nuxi prepare` |
| `Cannot find module '~/...'` in stores | `storesDirs` not set or store outside `app/stores/` | Verify `storesDirs: ['./app/stores/**']` in `nuxt.config.ts` |
| `Module has no exported member 'ECOption'` | `nuxt-echarts` types not generated | `npx nuxi prepare` after adding the module |
| Implicit any in `defineStore` setup return | TS strict mode on functions | Annotate `ref<TagGroup[]>(...)`, `ref<TagAssignments>({})` explicitly |
| `<UApp>` unknown component | `@nuxt/ui` module not registered or `nuxi prepare` not run | Verify modules array + `npx nuxi prepare` |

**No tsconfig customization needed** — Nuxt 4's defaults are strict-enough and the project doesn't require special compiler options.

**Confidence:** HIGH.

---

### 7. File migration scope for Phase 7

**DELETE (Phase 7 owns):**

| File | Reason |
|------|--------|
| `src/main.js` | Replaced by `nuxt.config.ts` + `app.config.ts` |
| `src/App.vue` | Replaced by `app/app.vue` |
| `src/router/index.js` | Replaced by file-based routing (Phase 8 introduces; Phase 7 just removes Vue Router) |
| `src/style.css` | Replaced by `app/assets/css/main.css` |
| `vite.config.js` | Replaced by `nuxt.config.ts` |
| `index.html` | Nuxt generates its own HTML shell |
| `dist/` | Build artifact from Vite — gone with old build |

**KEEP UNTOUCHED in Phase 7 (later phases migrate):**

| File | Owning phase |
|------|--------------|
| `src/stores/tags.js` | **Phase 7 itself MIGRATES this** to `app/stores/tags.ts` (see Section 4) — the legacy file gets deleted |
| `src/data/vendors.js`, `dpa.js`, `discovery.js`, `edtech.js`, `riskLabels.js` | Phase 9 — moves to `server/data/*.ts` |
| `src/components/layout/AppShell.vue`, `SidebarNav.vue` | Phase 8 — becomes `app/layouts/default.vue` |
| `src/components/VendorDrawer.vue` | Phase 10 — rewritten with `USlideover` |
| `src/components/DpaGrid.vue` | Phase 11 — rewritten with `UTable` |
| `src/views/*.vue` | Phases 10-12 — rewritten as `app/pages/*.vue` |
| `public/favicon.svg`, `public/icons.svg` | Stay at repo root — Nuxt uses `public/` identically |

**Migrate to `app/` in Phase 7:**

| Source | Destination |
|--------|-------------|
| `src/stores/tags.js` (logic only — SSR-safe rewrite) | `app/stores/tags.ts` |
| `src/style.css` (theme vars) | `app/assets/css/main.css` (with `@import "tailwindcss"; @import "@nuxt/ui";` headers + `@theme static` block) |

**Note:** The remaining `src/` directory becomes a "graveyard" of files that no longer build (they import deleted PrimeVue packages) but are not entry points for Nuxt's auto-import scanner. They're dead code that won't break the build. Each phase 8-12 deletes the files it replaces.

**`public/` directory carries over to Nuxt 4 as-is** — same convention, same path resolution. No action needed.

**`.gitignore` adjustments:** Add `.nuxt/`, `.output/`, `.data/` to gitignore. `dist/` can be removed (replaced by `.output/`).

**Confidence:** HIGH — verified file inventory via Glob and Grep.

---

### 8. Build/dev/deploy compatibility

**Phase 7 success commands:**

| Command | What it does | Expected outcome |
|---------|--------------|------------------|
| `npm install` | Install all new deps; runs `nuxi prepare` postinstall | Exit 0; `.nuxt/` directory generated |
| `npm run dev` | `nuxi dev` — Nuxt dev server with HMR | Server listening at `http://localhost:3000`; no console errors; `<UApp>` smoke test renders |
| `npm run typecheck` | `nuxi typecheck` — vue-tsc with template type checking | Exit 0 with zero errors |
| `npm run build` | `nuxi build` — production SSR build | Exit 0; produces `.output/server/` and `.output/public/` |

**Deferred to Phase 13 (DON'T DO in Phase 7):**

| Phase 13 concern | Why deferred |
|------------------|--------------|
| `nuxi generate` (static output) | Pages don't exist yet; nothing to generate |
| Base path `/district-demo/` | Only needed for static GitHub Pages deploy |
| `gh-pages` deploy script | Same — no static output yet |
| Amplify nitro preset | Requires pages and full app context |

**What Phase 7 MUST NOT break for Phase 13:**

- Don't pin Nitro presets in `nuxt.config.ts` (let Phase 13 add `nitro: { preset: '...' }`)
- Don't set `app.baseURL` (Phase 13 sets this for GitHub Pages)
- Don't add `target: 'static'` or similar legacy Nuxt 2 config (no longer valid in Nuxt 4)
- DO add the Amplify glidepath as a commented block at the bottom of `nuxt.config.ts` — Phase 13 will uncomment

**Suggested glidepath comment (in `nuxt.config.ts`, after the main config):**
```ts
// === Phase 13 deployment switches (do not enable in Phase 7) ===
//
// GitHub Pages (current target):
//   app: { baseURL: '/district-demo/' },
//   nitro: { preset: 'github_pages' },
//   then: `npm run generate && npm run deploy`
//
// AWS Amplify SSR (future):
//   ssr: true,                              // (already set)
//   nitro: { preset: 'aws-amplify' },
//   remove any baseURL / static config
//
// Switching between the two should require only edits to this block.
```

**Confidence:** HIGH.

---

### 9. (See dedicated section below)

---

### 10. Known traps and 2026 gotchas

**Verified traps (all sourced):**

| # | Trap | Mitigation |
|---|------|------------|
| 1 | `pinia-plugin-persistedstate` GitHub repo archived Aug 2025; moved to Codeberg | Package still publishes to npm under same name; functional. Document the link in case docs go stale. |
| 2 | Nuxt module default storage is **cookies** (4KB limit), NOT localStorage | Set `piniaPluginPersistedstate: { storage: 'localStorage' }` globally |
| 3 | Tailwind v4 has no `tailwind.config.js` — config is CSS-first via `@theme` | Define theme vars in `app/assets/css/main.css` using `@theme static {...}` |
| 4 | Nuxt UI v4 only allows colors that exist in your theme | Custom hex colors MUST be declared via `@theme static --color-X-{50..950}` before `app.config.ts` can name them |
| 5 | `<USlideover>` uses `v-model:open`, not `v-model:visible` (different from PrimeVue) | Phase 10 concern, but research surfaces it now |
| 6 | `<UApp>` is REQUIRED for any overlay (`UModal`, `USlideover`, `UToast`) | Place in `app/app.vue` from the start — never leave for later |
| 7 | `nuxi build` does NOT typecheck Vue templates by default | Add explicit `npm run typecheck` script (`nuxi typecheck`) |
| 8 | `pinia-plugin-persistedstate/nuxt` MUST be listed AFTER `@pinia/nuxt` in modules array | Just keep ordering as shown — Pinia first, then persist |
| 9 | localStorage key changes from v0.5.0 (`schoolday-tag-groups`/`-assignments`) to plugin default (`tags`) | Acceptable — synthetic demo, no real user data at risk; old keys become orphaned, harmless |
| 10 | `primeicons` removal means `pi pi-xxx` icon classes in `src/router/index.js` and `src/components/layout/SidebarNav.vue` are dead | Phase 7 deletes the router entirely; Phase 8 rewrites SidebarNav with Iconify (`i-heroicons-*`) |
| 11 | Nuxt 4 may auto-detect `src/` and surface it — but only `app/` is the new default | Don't put anything new under `src/`. Old `src/` files remain dead until their phase deletes them. |
| 12 | `nuxi prepare` not running before first typecheck causes false errors | Run `npm install` first (triggers postinstall), then `npm run typecheck` |
| 13 | Vue Router 5 currently in `package.json` (`vue-router ^5.0.7`) — wrong major version! Should be Vue Router 4 for Vue 3. May be Nuxt 4's bundled version, but the dep declaration is suspect. | Remove `vue-router` from `dependencies` entirely. Nuxt 4 bundles its own router internally; consumers don't depend on `vue-router` directly. |

**Confidence:** HIGH for items 1-12 (verified). HIGH for item 13 (Nuxt manages routing — `vue-router` should not appear as a project dep).

---

## Validation Architecture

> Phase 7 enables `workflow.nyquist_validation` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None yet — Nuxt 4 ships with `nuxi typecheck` (vue-tsc) for type validation. No unit test runner installed. |
| Config file | `tsconfig.json` (extends auto-generated `.nuxt/tsconfig.json`); no test config |
| Quick run command | `npm run typecheck` |
| Full suite command | `npm install && npm run typecheck && npm run build` |
| Phase gate | All three commands exit 0 on a clean checkout, plus dev-server smoke test |

For Phase 7, **type checking + build success + dev-server smoke test** IS the test suite. Unit/integration test infrastructure is intentionally deferred — there's no app logic yet (no pages, no API routes). Adding Vitest/Playwright in Phase 7 is premature; recommend deferring to Phase 9 when API routes have testable behavior.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| NUXT-01 | No PrimeVue packages in package.json | Static (grep) | `! grep -E '"(primevue\|@primeuix\|primeicons)"' package.json` | ✅ Existing repo |
| NUXT-01 | No PrimeVue imports in `app/`, `server/`, `nuxt.config.ts` | Static (grep) | `! grep -rE 'primevue\|@primeuix\|primeicons' nuxt.config.ts app/ 2>/dev/null` | ✅ Will exist after scaffold |
| NUXT-01 | Nuxt 4 dev server starts | Runtime smoke | `timeout 30 npm run dev 2>&1 \| grep -q "Listening"` | ❌ Wave 0 — first build |
| NUXT-01 | `compatibilityVersion: 4` set | Static (grep) | `grep -q 'compatibilityVersion: 4' nuxt.config.ts` | ❌ Wave 0 |
| NUXT-01 | `compatibilityDate: '2025-07-01'` set | Static (grep) | `grep -q "compatibilityDate.*2025-07-01" nuxt.config.ts` | ❌ Wave 0 |
| NUXT-01 | TS compiles clean | Build | `npm run typecheck` → exit 0 | ❌ Wave 0 |
| NUXT-01 | Production build succeeds | Build | `npm run build` → exit 0 | ❌ Wave 0 |
| NUXT-02 | `@nuxt/ui` v4.x installed | Static (grep) | `grep -q '"@nuxt/ui": "\^4' package.json` | ❌ Wave 0 |
| NUXT-02 | `<UApp>` wraps root | Static (grep) | `grep -q '<UApp>' app/app.vue` | ❌ Wave 0 |
| NUXT-02 | `@nuxt/ui` registered in modules | Static (grep) | `grep -q "'@nuxt/ui'" nuxt.config.ts` | ❌ Wave 0 |
| NUXT-02 | Tailwind + Nuxt UI CSS imported | Static (file inspection) | Both `@import "tailwindcss"` and `@import "@nuxt/ui"` present in `app/assets/css/main.css` | ❌ Wave 0 |
| NUXT-02 | `UApp`-dependent overlay renders without console error | Runtime smoke | Dev server loads `/`; no console errors on render | Manual visual check |
| NUXT-03 | `@pinia/nuxt` registered | Static (grep) | `grep -q "'@pinia/nuxt'" nuxt.config.ts` | ❌ Wave 0 |
| NUXT-03 | `pinia-plugin-persistedstate/nuxt` registered | Static (grep) | `grep -q "'pinia-plugin-persistedstate/nuxt'" nuxt.config.ts` | ❌ Wave 0 |
| NUXT-03 | `storesDirs: ['./app/stores/**']` configured | Static (grep) | `grep -A 2 "pinia:" nuxt.config.ts \| grep -q "app/stores"` | ❌ Wave 0 |
| NUXT-03 | localStorage configured globally | Static (grep) | `grep -A 2 "piniaPluginPersistedstate" nuxt.config.ts \| grep -q "localStorage"` | ❌ Wave 0 |
| NUXT-03 | Tags store exists at correct path | File-exists | `test -f app/stores/tags.ts` | ❌ Wave 0 |
| NUXT-03 | Tags store has `persist: true` | Static (grep) | `grep -q 'persist: true' app/stores/tags.ts` | ❌ Wave 0 |
| NUXT-03 | No SSR hydration mismatch warning | Runtime check | Load dev server, browser console clean of `Hydration` warnings | Manual visual check |
| NUXT-03 | Refresh persists tags state | Runtime check (manual) | Modify a tag via console, refresh, verify persisted | Manual |
| (impl) | ECharts no SSR crash | Runtime smoke | Dev server starts without "window is not defined" or similar | Implicit — pass if `npm run dev` succeeds |

### Sampling Rate

- **Per task commit:** Run grep probes for that task's NUXT-XX criteria (under 5 seconds total)
- **Per wave merge:** `npm install && npm run typecheck && npm run build && npm run dev` (cancel dev after smoke confirmation)
- **Phase gate:** All grep probes pass; build/typecheck both exit 0; dev server smoke test confirms UApp renders without errors before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `app/app.vue` — UApp wrapper (NUXT-02)
- [ ] `app/app.config.ts` — color theme mapping (NUXT-02)
- [ ] `app/assets/css/main.css` — Tailwind + Nuxt UI + theme vars (NUXT-02)
- [ ] `app/stores/tags.ts` — migrated SSR-safe store (NUXT-03)
- [ ] `nuxt.config.ts` — modules, compatibilityVersion, compatibilityDate, pinia/storesDirs, persistedstate/localStorage, echarts config (NUXT-01, -02, -03)
- [ ] `tsconfig.json` at root — extends `.nuxt/tsconfig.json` (NUXT-01)
- [ ] `package.json` rewrite — scripts (dev/build/generate/preview/typecheck/postinstall), dependencies (remove PrimeVue, add Nuxt UI + Pinia stack + nuxt-echarts), `"type": "module"` retained (NUXT-01)
- [ ] Test runner — INTENTIONALLY NOT added in Phase 7; first added in Phase 9 when API routes need integration tests

### Runtime State Inventory

This is a refactor/rebuild phase. Inventory:

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| **Stored data** | localStorage keys `schoolday-tag-groups`, `schoolday-tag-assignments` (v0.5.0 user state) | None — synthetic demo; safe to orphan. New key is `tags` (store id). Document in plan; do not migrate. |
| **Live service config** | None — no external services connected (demo is fully client-side, mocked data). | None |
| **OS-registered state** | None — no scheduled tasks, no system services. | None |
| **Secrets/env vars** | None currently. Future Amplify will use `NUXT_*` prefix (Phase 13+). | None for Phase 7 |
| **Build artifacts** | `dist/` from Vite build; `node_modules/` from Vue 3 + Vite + PrimeVue deps. | DELETE `dist/`; `npm install` regenerates `node_modules/` with new dep tree. Add `.output/`, `.nuxt/`, `.data/` to `.gitignore`. |

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Nuxt 4 (requires 22+) | ✓ | 24.14.0 | — |
| npm | Package install | ✓ | 11.9.0 | — |
| Git | Source control (commits per task) | ✓ | (in PATH) | — |
| Internet access for npm registry | Package installs | Assumed ✓ | — | — |

**No blocking gaps.** Node 24.14 exceeds Nuxt 4's minimum (Node 22), npm 11.9 supports all needed packages.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `nuxt` | ^4.4.6 | SSR framework | Mandated by REQUIREMENTS.md; v4 is current `latest` on npm (2026-05) |
| `@nuxt/ui` | ^4.8.0 | Component library (Reka UI + Tailwind v4 + Tailwind Variants) | Sole UI library per NUXT-02; v4 latest |
| `tailwindcss` | ^4.3.0 | CSS engine (peer of @nuxt/ui v4) | Tailwind v4 CSS-first config; already in current `devDependencies` |
| `@pinia/nuxt` | ^0.11.3 | Pinia Nuxt integration | Official Nuxt module for Pinia |
| `pinia` | ^3.0.4 | State management | Pinia v3 — Vue 3 / Nuxt 4 compatible |
| `pinia-plugin-persistedstate` | ^4.7.1 | localStorage persistence + Nuxt sub-module | Official, single-package solution |
| `nuxt-echarts` | ^1.0.1 | ECharts wrapper with SSR + auto-imports | Official Nuxt module; supersedes manual `<ClientOnly>` |
| `echarts` | ^6.0.0 | Charting engine (peer of nuxt-echarts) | Already in current `dependencies`; carry forward |

### Supporting (kept from v0.5.0)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gh-pages` | ^6.3.0 | GitHub Pages deploy | Phase 13 — keep in devDependencies for now |

### Removed in Phase 7

| Library | Version (removing) | Reason |
|---------|---------------------|--------|
| `primevue` | ^4.5.5 | Replaced by `@nuxt/ui` |
| `@primeuix/themes` | ^2.0.3 | Theme handled by Nuxt UI / app.config.ts |
| `primeicons` | ^7.0.0 | Replaced by Iconify via `@nuxt/icon` (auto-registered by Nuxt UI) |
| `vue-router` | ^5.0.7 | Nuxt handles routing internally; explicit dep is wrong major version anyway |
| `vue-echarts` | ^8.0.1 | Replaced by `nuxt-echarts` (`<VChart>` auto-imported) |
| `vue` | ^3.5.34 | Bundled by Nuxt 4 — no need to declare directly |
| `@vitejs/plugin-vue` | ^6.0.6 | Nuxt has its own Vite plugin chain |
| `@tailwindcss/vite` | ^4.3.0 | Nuxt UI handles Tailwind integration via the module |
| `vite` | ^8.0.12 | Nuxt has its own Vite (don't pin) |

### Final `package.json` shape

```json
{
  "name": "district-demo",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "typecheck": "nuxi typecheck",
    "postinstall": "nuxi prepare"
  },
  "dependencies": {
    "@nuxt/ui": "^4.8.0",
    "@pinia/nuxt": "^0.11.3",
    "echarts": "^6.0.0",
    "nuxt": "^4.4.6",
    "nuxt-echarts": "^1.0.1",
    "pinia": "^3.0.4",
    "pinia-plugin-persistedstate": "^4.7.1"
  },
  "devDependencies": {
    "gh-pages": "^6.3.0",
    "tailwindcss": "^4.3.0",
    "vue-tsc": "^2.x"
  }
}
```

(`vue-tsc` is auto-installed by `nuxi typecheck` on first run, but pinning makes CI deterministic.)

**Version verification (verified 2026-05-21 via `npm view`):**
- `nuxt@4.4.6` — published 2026-05-18
- `@nuxt/ui@4.8.0` — published as `latest`
- `@pinia/nuxt@0.11.3` — latest
- `pinia@3.0.4` — latest
- `pinia-plugin-persistedstate@4.7.1` — latest
- `nuxt-echarts@1.0.1` — latest
- `echarts@6.1.0` — latest (current dep is `^6.0.0`, compatible)
- `tailwindcss@4.3.0` — current dep matches

**Confidence:** HIGH.

---

## Architecture Patterns

### Recommended Project Structure (post-Phase-7)

```
app/
  app.vue                 # root with <UApp> + (later) <NuxtPage>
  app.config.ts           # ui.colors.primary mapping
  assets/
    css/
      main.css            # @import tailwindcss + @nuxt/ui + @theme block
  stores/
    tags.ts               # migrated, SSR-safe, typed
public/
  favicon.svg             # carried over
  icons.svg               # carried over
nuxt.config.ts            # all module config
tsconfig.json             # extends .nuxt/tsconfig.json
package.json
```

**Not yet present in Phase 7 (later phases):**
- `app/layouts/` (Phase 8)
- `app/pages/` (Phase 8)
- `app/components/` (Phase 10+)
- `server/` (Phase 9)

### Pattern: SSR-safe Pinia store

```ts
// Source: prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html
export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})
  return { tagGroups, assignments }
}, {
  persist: true,
})
```

**Why this works under SSR:**
1. Store initializes with deterministic seed data on both server and client → identical SSR/CSR initial state → no hydration mismatch
2. Plugin attaches AFTER hydration on the client → reads localStorage → merges into store
3. Server never touches `localStorage` (plugin is client-only)

### Pattern: ECharts in a Nuxt page

```vue
<!-- Source: echarts.nuxt.dev/guides/usage -->
<script setup lang="ts">
const option = ref<ECOption>({
  series: [{ type: 'radar', data: [...] }],
})
</script>

<template>
  <VChart :option="option" :autoresize="true" style="height: 320px" />
</template>
```

No `<ClientOnly>` wrapper, no explicit import — `<VChart>` and `ECOption` are auto-imported by `nuxt-echarts`.

### Anti-patterns to Avoid

- **DON'T** define `vue` or `vue-router` in `dependencies` — Nuxt bundles its own. Explicit deps cause version drift.
- **DON'T** keep `vite.config.js`, `index.html`, or `src/main.js` — they're orthogonal to Nuxt's entry model and confuse onboarding.
- **DON'T** wrap `<VChart>` in `<ClientOnly>` when using `nuxt-echarts` — double-wrapping breaks the module's SSR/SVG fallback.
- **DON'T** call `localStorage.getItem()` in store setup — runs at SSR; crashes on server.
- **DON'T** define custom colors in `app.config.ts` without first adding them to `@theme` in `main.css` — Nuxt UI v4 only accepts colors that exist in the theme.
- **DON'T** put `pinia-plugin-persistedstate/nuxt` BEFORE `@pinia/nuxt` in modules — plugin needs Pinia registered first.
- **DON'T** add a test framework in Phase 7 — no app logic exists to test. Phase 9 introduces Vitest when API routes need integration tests.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persist Pinia state to localStorage | `watch()` blocks writing to localStorage on every change | `pinia-plugin-persistedstate` with `persist: true` | Handles SSR safely, debounces writes, supports per-store config, manages serialization, supports cookie fallback |
| SSR-safe localStorage access | `if (typeof window !== 'undefined')` guards everywhere | Trust the persist plugin's client-only init | Plugin's `nuxt-only` build target ensures it doesn't even ship to server |
| ECharts SSR | `<ClientOnly>` around every chart | `nuxt-echarts` module | Module handles SSR/SVG fallback, tree-shakes charts, generates strict `ECOption` types |
| Component library theming | Override CSS classes per-component | Nuxt UI's `app.config.ts` `ui.colors.*` mapping + `@theme` CSS vars | Theme variables flow through Tailwind Variants; single source of truth |
| Vue Router config | `createRouter({...})` + manual route table | Nuxt's file-based routing (`app/pages/`) | Eliminates entire router file; meta is `definePageMeta()` in each page |
| Tailwind config | `tailwind.config.js` with theme extension | Tailwind v4 CSS-first via `@theme {...}` in main.css | v4 deprecated the JS config in favor of CSS-first |

**Key insight:** This is a "delete-heavy" phase. The existing v0.5.0 codebase did a lot of manual wiring that Nuxt's conventions and modules abstract away. The scaffold should look smaller, not larger, than the current code — even though it adds more dependencies.

---

## Common Pitfalls

### Pitfall 1: `<UApp>` not wrapping the root → overlays silently fail

**What goes wrong:** USlideover and UModal mount but their portals have nowhere to attach to. Visually, nothing appears or worse — the slide-over flickers then disappears.

**Why it happens:** Nuxt UI v4 uses a portal-based overlay system. `<UApp>` provides the portal target.

**How to avoid:** Put `<UApp>` in `app/app.vue` from day one — including in Phase 7 when no overlay is yet used.

**Warning signs:** Console error like "Cannot find UAppProvider context" or just no visible overlay where you'd expect one.

### Pitfall 2: SSR hydration mismatch from localStorage-seeded state

**What goes wrong:** Server renders with seed defaults; client immediately rehydrates from localStorage; React/Vue logs hydration warnings and the tag UI flickers.

**Why it happens:** Reading localStorage in setup (not in a client-only context) creates different initial state on server vs client.

**How to avoid:** Use the persistedstate plugin's mechanism — it hydrates AFTER mount, not during. Setup always returns seed values.

**Warning signs:** Vue warning `Hydration completed but contains mismatches`. Visible tag-list flicker on first load.

### Pitfall 3: Forgetting `nuxi prepare` → TypeScript can't find Nuxt types

**What goes wrong:** Editor shows red squigglies on `defineNuxtConfig`, `useState`, `definePageMeta`, etc.

**Why it happens:** Nuxt's type generation writes to `.nuxt/`. If that directory doesn't exist or is stale, TS doesn't resolve auto-imports.

**How to avoid:** `nuxi prepare` runs automatically on `dev`/`build`/`postinstall`. If types are missing, run `npx nuxi prepare` manually.

**Warning signs:** `.nuxt/` directory missing or stale; TS errors on built-in Nuxt globals.

### Pitfall 4: `pinia-plugin-persistedstate` global storage default is cookies, not localStorage

**What goes wrong:** Tags state appears to persist for small data but fails silently when tags grow past 4KB (cookies hard limit).

**Why it happens:** The Nuxt module defaults to cookies for SSR friendliness. Documented but easy to miss.

**How to avoid:** Always set `piniaPluginPersistedstate: { storage: 'localStorage' }` globally in `nuxt.config.ts`.

**Warning signs:** State suddenly stops persisting when tags assignments map grows; check Network tab — Set-Cookie headers near 4KB.

### Pitfall 5: PrimeVue file deletions out of order

**What goes wrong:** Delete `package.json` PrimeVue entries; `npm install`; build fails because `src/views/DiscoveryView.vue` still imports `primevue/datatable`.

**Why it happens:** Nuxt's auto-import scanner doesn't crawl `src/` by default (only `app/`), BUT if anything bridges back to `src/` (a leftover import, an accidental ref in `nuxt.config.ts`), the import chain breaks the build.

**How to avoid:** After PrimeVue removal, verify no file in `app/`, `server/`, or `nuxt.config.ts` references anything under `src/`. Files in `src/` can keep their broken imports — they just won't be reachable.

**Warning signs:** Build error mentioning `primevue/X` after package removal.

### Pitfall 6: Double-wrapping `<VChart>` in `<ClientOnly>` with `nuxt-echarts`

**What goes wrong:** The module's SSR/SVG fallback breaks because `<ClientOnly>` skips render on server entirely. Result: chart blank on first render, then pops in on client.

**Why it happens:** Conflating "manual ClientOnly" pattern with module-managed SSR.

**How to avoid:** Trust the module — render `<VChart>` directly. If you really need to defer chart render (e.g., for above-the-fold perf), use `<VChartLazy>` (provided by nuxt-echarts) instead.

**Warning signs:** Chart appears 200-500ms after rest of page; SSR HTML lacks chart SVG.

---

## Code Examples

### `nuxt.config.ts` (full, recommended)

```ts
// Source: aggregated from nuxt.com, ui.nuxt.com, echarts.nuxt.dev, prazdevs.github.io/pinia-plugin-persistedstate
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',  // MUST come after @pinia/nuxt
    'nuxt-echarts',
  ],

  css: ['~/assets/css/main.css'],

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  echarts: {
    renderer: 'canvas',
    charts: ['RadarChart', 'PieChart'],
    components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
  },

  // === Phase 13 deployment switches (do not enable in Phase 7) ===
  //
  // GitHub Pages (next target):
  //   app: { baseURL: '/district-demo/' },
  //   nitro: { preset: 'github_pages' },
  //   build via `npm run generate && npm run deploy`
  //
  // AWS Amplify SSR (future):
  //   nitro: { preset: 'aws-amplify' },
  //   keep ssr: true; remove baseURL/static
  //
  // Switching between deployment targets should require only edits in this block.
})
```

### `app/app.config.ts`

```ts
// Source: ui.nuxt.com/getting-started/theme
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'zinc',
    },
  },
})
```

### `app/assets/css/main.css`

```css
/* Source: ui.nuxt.com/getting-started/installation/nuxt + tailwindcss.com v4 docs */
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  --color-brand-50:  #eeeeff;
  --color-brand-100: #d4d4fc;
  --color-brand-200: #ababf8;
  --color-brand-300: #8284f4;
  --color-brand-400: #6466ef;
  --color-brand-500: #484ce6;
  --color-brand-600: #3c40cc;
  --color-brand-700: #3034b3;
  --color-brand-800: #252899;
  --color-brand-900: #1a1d80;
  --color-brand-950: #0f1166;

  --color-sidebar: #111827;
  --color-accent:  #da8231;
}
```

### `app/app.vue` (Phase 7 stub — replaced when pages exist)

```vue
<template>
  <UApp>
    <div class="p-8">
      <h1 class="text-2xl font-semibold">District Demo — Nuxt 4 scaffold</h1>
      <p class="text-gray-600">Scaffold ready. Pages migrate in Phase 8.</p>
    </div>
  </UApp>
</template>
```

### `app/stores/tags.ts`

```ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagItem {
  id: string
  name: string
}

export interface TagGroup {
  id: string
  name: string
  color: string
  children: TagItem[]
}

export type TagAssignments = Record<string, string[]>

export const SEED_TAG_GROUPS: TagGroup[] = [
  // ... same seed as v0.5.0 src/stores/tags.js
]

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})
  return { tagGroups, assignments }
}, {
  persist: true,
})
```

---

## State of the Art

| Old Approach (v0.5.0) | Current Approach (v1.0.0) | When Changed | Impact |
|-----------------------|---------------------------|--------------|--------|
| Vite SPA with `createApp(App)` | Nuxt 4 SSR with `defineNuxtConfig` | Phase 7 | Enables SSR, file routing, server API, AWS Amplify glidepath |
| PrimeVue components with custom theme preset | Nuxt UI v4 with Tailwind v4 + Reka UI primitives | Phase 7 | Tighter Nuxt ecosystem integration; smaller surface area |
| Vue Router 4 hash routing | Nuxt file-based routing | Phase 8 | Eliminates router config file; nav driven by `app/pages/` shape |
| `src/data/*.js` direct imports | `server/api/*.get.ts` + `useFetch` | Phase 9 | Decouples client from server data; sets up real API path for v1.1 |
| Manual ECharts global registration in `main.js` + `<VChart>` component | `nuxt-echarts` module with declarative `charts`/`components` config | Phase 7 | Tree-shaking by config; SSR-safe via SVG fallback |
| Pinia + manual localStorage `watch()` | Pinia + `pinia-plugin-persistedstate` | Phase 7 | SSR-safe; less code; supports cookies/sessionStorage fallback |
| Tailwind v4 with `@theme` in `style.css` | Same — Tailwind v4 (already current) | (unchanged) | No migration cost; same model used by Nuxt UI v4 |

**Deprecated / outdated:**
- `createWebHashHistory` — superseded by Nuxt's file routing (Phase 8 removes)
- PrimeVue 4 — replaced by Nuxt UI 4
- Manual `vite.config.js` — Nuxt owns Vite config internally
- `index.html` as entry — Nuxt generates the shell

---

## Open Questions

None blocking. Two minor calls made autonomously per project guidance:

1. **Nuxt UI v3 vs v4 wording mismatch** (REQUIREMENTS says v4, ROADMAP says v3): RESOLVED as v4 — REQUIREMENTS.md is authoritative, npm `latest` is v4.8.0, existing `package.json` already targets `^4.8.0`. Planner should treat ROADMAP wording as a doc-drift artifact (no code change implied; just note for plan).

2. **Whether to add Vitest in Phase 7**: DECIDED NO — no testable logic exists yet (no pages, no API routes). Nuxt's `nuxi typecheck` + `nuxi build` is sufficient validation surface for Phase 7. Phase 9 is the natural moment to introduce Vitest (when API routes have measurable behavior).

---

## Plan-Ready Dependency List

**Add (production):**
```bash
npm install \
  nuxt@^4.4.6 \
  @nuxt/ui@^4.8.0 \
  @pinia/nuxt@^0.11.3 \
  pinia@^3.0.4 \
  pinia-plugin-persistedstate@^4.7.1 \
  nuxt-echarts@^1.0.1 \
  echarts@^6.1.0
```

**Add (devDependencies):**
```bash
npm install -D tailwindcss@^4.3.0 vue-tsc
```

(`tailwindcss` is moved from existing devDependencies — keep it; `vue-tsc` is new.)

**Remove:**
```bash
npm uninstall \
  primevue \
  @primeuix/themes \
  primeicons \
  vue-router \
  vue-echarts \
  vue \
  @vitejs/plugin-vue \
  @tailwindcss/vite \
  vite
```

(`vue` and `vite` are bundled by `nuxt`; explicit deps cause version drift.)

**Keep unchanged:**
- `gh-pages@^6.3.0` (devDep — Phase 13 will use)

---

## Sources

### Primary (HIGH confidence)

- [Nuxt 4 official docs — Installation](https://nuxt.com/docs/getting-started/installation)
- [Nuxt 4 release blog](https://nuxt.com/blog/v4)
- [Nuxt 4 Upgrade Guide](https://nuxt.com/docs/4.x/getting-started/upgrade)
- [Nuxt UI v4 — Nuxt installation](https://ui.nuxt.com/getting-started/installation/nuxt)
- [Nuxt UI v4 — Theme configuration](https://ui.nuxt.com/getting-started/theme)
- [Pinia Nuxt module](https://pinia.vuejs.org/ssr/nuxt.html)
- [pinia-plugin-persistedstate — Nuxt usage](https://prazdevs.github.io/pinia-plugin-persistedstate/frameworks/nuxt.html)
- [pinia-plugin-persistedstate — Config](https://prazdevs.github.io/pinia-plugin-persistedstate/guide/config.html)
- [nuxt-echarts — Configuration](https://echarts.nuxt.dev/getting-started/configuration)
- [nuxt-echarts — Usage](https://echarts.nuxt.dev/guides/usage)
- [Nuxt 4 typecheck command](https://nuxt.com/docs/4.x/api/commands/typecheck/)
- [Nuxt 4 package.json conventions](https://nuxt.com/docs/4.x/directory-structure/package)
- npm registry version verification (verified 2026-05-21 via `npm view`)

### Secondary (MEDIUM confidence — cross-verified)

- [Mastering Nuxt — Upgrade to Nuxt 4](https://masteringnuxt.com/blog/complete-guide-how-to-upgrade-to-nuxt-4)
- [Vue School — Changes in Nuxt 4](https://vueschool.io/articles/vuejs-tutorials/an-overview-of-changes-in-nuxt-4/)
- [DEV — Pinia state hydration in Nuxt](https://dev.to/jacobandrewsky/state-hydration-persisted-state-in-nuxt-with-pinia-1d1e)

### Internal (project research from v0.5.0)

- `.planning/research/PITFALLS.md` — PrimeVue → Nuxt UI migration risks (already vetted in v0.5.0 prep)
- `.planning/research/FEATURES.md` — Nuxt module list
- `.planning/research/SUMMARY.md` — stack rationale
- `.planning/STATE.md` — locked decisions
- `.planning/REQUIREMENTS.md` — phase requirements
- `.planning/ROADMAP.md` — phase goal + success criteria

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified live on npm 2026-05-21
- Architecture / `nuxt.config.ts` shape: HIGH — verified against official docs from all four modules
- Nuxt UI v3 vs v4 resolution: HIGH — REQUIREMENTS.md + npm latest tag agree
- Pinia SSR pattern: HIGH — verified setup-style + persist syntax
- ECharts strategy (nuxt-echarts over ClientOnly): MEDIUM-HIGH — interpretive call vs literal STATE.md wording; functionally identical outcome
- Pitfalls: HIGH — most surface in official docs; pitfall #5 (file order) is sourced from prior project research
- Validation strategy: HIGH — grep/build probes are deterministic

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (30 days — Nuxt 4 is stable; @nuxt/ui still in active feature dev so verify minor versions if scaffold slips past June)
