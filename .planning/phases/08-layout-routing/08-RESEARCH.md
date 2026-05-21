# Phase 8: Layout & Routing - Research

**Researched:** 2026-05-21
**Domain:** Nuxt 4 file-based routing, `NuxtLayout`/`NuxtPage`/`NuxtLink`, `definePageMeta`, Nuxt UI v4 navigation primitives, Iconify icons, dark-sidebar Tailwind styling
**Confidence:** HIGH

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NUXT-04 | All 5 demo sections resolve via file-based routing in `app/pages/`; no manual Vue Router config remains; hash history (`createWebHashHistory`) removed | Section 1 (file-based routing), Section 2 (`<NuxtPage />`), Section 9 (anti-patterns: no router/index.ts) |
| LAYOUT-01 | Persistent app shell implemented as `app/layouts/default.vue` with dark sidebar nav; `NuxtLink` replaces `RouterLink`; active route highlighting works on all pages | Section 3 (`app.vue` → `NuxtLayout` → `default.vue` chain), Section 4 (NuxtLink active classes), Section 6 (color migration), Section 7 (icon strategy) |

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Vue 3 + Vite (Phase 7 swapped to Nuxt 4). Do not introduce conflicting frameworks.
- **Deployment:** Static GitHub Pages — no server runtime in deploy. Phase 8 must remain compatible with `nuxi generate` (Phase 13).
- **Data:** Synthetic only — Phase 8 stub pages render placeholder content, no API calls.
- **Iteration speed:** Mock changes < 1 hour. Layout + routing should not add ceremony — adding a 6th demo section in v1.1 should mean "create one `app/pages/X.vue` file" with no router edits.
- **Auth:** None — sidebar nav has no auth-gated items.
- **GSD enforcement:** All file changes through `/gsd:execute-phase`.
- **Naming:** PascalCase for `.vue` SFCs; camelCase for `.ts` modules; kebab-case for assets. Page filenames are kebab-case (Nuxt convention turns them into kebab-case routes).
- **Indentation:** 2 spaces, ES modules, no linter/formatter configured.

---

## User Constraints (from CONTEXT.md)

> **No CONTEXT.md exists for Phase 8** — running in autonomous mode per init payload. The locked decisions from STATE.md and ROADMAP govern instead:

### Locked Decisions (from STATE.md + ROADMAP + REQUIREMENTS)

- **File-based routing in `app/pages/`** — no manual `vue-router` config (NUXT-04)
- **5 routes:** `/`, `/discovery`, `/dpa`, `/risk`, `/tags` — exact paths per ROADMAP Success Criterion 1
- **Persistent app shell as `app/layouts/default.vue`** — not inlined in `app.vue` (LAYOUT-01 explicit)
- **Dark sidebar nav** — visual continuity with v0.5.0 SidebarNav (LAYOUT-01)
- **`NuxtLink` replaces `RouterLink`** — auto-active highlighting (LAYOUT-01)
- **`definePageMeta` drives nav label and icon** — no hardcoded route → label/icon table in sidebar (ROADMAP Success Criterion 4)
- **No `router/index.ts` file anywhere** — file-routing only (ROADMAP Success Criterion 3)

### Claude's Discretion

- **Navigation iteration mechanism** (manual route table in layout vs `useRouter().options.routes` vs `pages:extend` hook) — Section 2 below recommends `useRouter().options.routes` filtered by `meta.nav`; **but the actual recommendation is a hybrid** that uses `pages:extend` to add nav metadata reliably (see Section 2).
- **Nuxt UI navigation primitive** (handrolled `<NuxtLink>` list vs `UNavigationMenu` vertical vs `USidebar`) — Section 5 recommends **handrolled `<NuxtLink>` list** for this dark-themed sidebar with 5 fixed routes.
- **Sidebar header content** (just "Schoolday" word vs. logo + district name) — v0.5.0 used just "Schoolday"; recommend matching verbatim for Phase 8.
- **Whether to keep the v0.5.0 white header bar with "Lakewood Unified School District"** — yes, recommend keeping for visual continuity; it lives in the layout, not in pages.

### Deferred to Later Phases (OUT OF SCOPE for Phase 8)

- Real data on the pages (Phase 9 — `server/api/` + `useFetch`)
- VendorDrawer or any drill-down UI (Phase 10)
- ECharts charts (radar in Phase 10, donut in Phase 12)
- Dashboard "Top 8" card content (Phase 11)
- DPA table, Risk table, Tags CRUD (Phases 11-12)
- Mobile-responsive sidebar collapse (out of v1.0.0 scope per REQUIREMENTS.md "Mobile optimization" deferred row)
- Page transitions / animations
- Breadcrumbs, header search, user menu

---

## Summary

Phase 8 is a clean two-file scaffold operation followed by five tiny stub pages. **Total new files: 7.** Nuxt 4's file-based routing + `<NuxtLayout>`/`<NuxtPage>` conventions make this a sub-100-line phase, mostly markup.

The five highest-leverage decisions:

1. **`app/app.vue` becomes `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>`** — Nuxt 4 does NOT auto-wrap pages in the default layout; you must explicitly include `<NuxtLayout>`. The current `app/app.vue` (which has the Phase 7 placeholder paragraph) gets replaced.

2. **`app/layouts/default.vue` holds the entire shell** — sidebar + header + `<slot />` for page content. This is the persistent piece that doesn't unmount on route changes (Vue Router preserves the layout instance and swaps the slotted page).

3. **Handrolled `<NuxtLink>` list inside the sidebar — NOT `UNavigationMenu`** — UNavigationMenu v4 does NOT auto-detect active routes (you'd have to drive `active` via a `useRoute()` computed). NuxtLink's built-in `router-link-active`/`router-link-exact-active` classes (overridable via `active-class`/`exact-active-class` props) give zero-state active highlighting. This is also the v0.5.0 pattern, ported 1:1.

4. **Nav metadata comes from `definePageMeta` in each page; sidebar reads it via `useRouter().options.routes`** — this works because Nuxt auto-extracts `definePageMeta` at build time and merges it into the route record's `meta`. Alternative: pass a static `NAV_ROUTES` const into the sidebar — simpler but fails ROADMAP Success Criterion 4 ("without hardcoding route names"). The router-driven path is the prescribed one.

5. **Icons via `@nuxt/icon` with the Lucide set** — auto-registered companion module of `@nuxt/ui` (no install needed). Use the `i-lucide-*` shorthand class in the `<UIcon>` component or as the `name` prop. Five icons map cleanly: `i-lucide-home`, `i-lucide-search`, `i-lucide-file-text`, `i-lucide-alert-triangle`, `i-lucide-tag`. (PrimeIcons `pi pi-*` classes from v0.5.0 are gone — those references were already deleted in Phase 7's `package.json` rewrite.)

The single highest-risk pitfall is **`definePageMeta` being a build-time macro**: it cannot use runtime variables, imports, or composables. The values must be literal. Surrounding string concatenation or computed props inside `definePageMeta({...})` will silently produce `undefined` at runtime.

**Primary recommendation:** Create `app/layouts/default.vue` first with the sidebar shell (`<slot />` placeholder for the content area), create the 5 page stubs with `definePageMeta`, then wire `app/app.vue` to use `<NuxtLayout>`. Verify the dev server renders all 5 paths in sequence before considering Phase 8 done.

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Where does shared shell UI live? | **`app/layouts/default.vue`** — not inlined in `app.vue` | LAYOUT-01 explicit; gives Phase 10+ flexibility to add a `print.vue` or `bare.vue` layout if ever needed |
| 2 | `app.vue` contents | **`<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>`** | Nuxt 4 requires explicit `<NuxtLayout>`; `<UApp>` stays at outermost for overlay portals |
| 3 | Page filenames | **`index.vue`, `discovery.vue`, `dpa.vue`, `risk.vue`, `tags.vue`** — all flat, no subdirectories | Matches URLs exactly; no `pages/dashboard.vue` (would resolve to `/dashboard`, not `/`) |
| 4 | Nav iteration source | **`useRouter().options.routes`** filtered by `meta.nav === true` and sorted by `meta.navOrder` | Satisfies ROADMAP Success Criterion 4 ("without hardcoding route names"); single source of truth in each page's `definePageMeta` |
| 5 | Nav rendering | **Handrolled `<NuxtLink>` list** (not `UNavigationMenu`) | Auto-active via NuxtLink defaults; matches v0.5.0 pattern verbatim; dark sidebar styling needs full Tailwind control anyway |
| 6 | Active highlighting | **`exact-active-class` prop on each `<NuxtLink>`** with brand-coloured background | `exact-active-class` only fires on EXACT path match — `/discovery` doesn't accidentally activate `/` (root). `active-class` would, because `/` is a prefix of every path. |
| 7 | Icons | **Lucide via `i-lucide-*` shorthand** in `<UIcon>` | Lucide is Nuxt UI's de facto default; matches the visual feel of the v0.5.0 PrimeIcons set (clean line icons); already locally bundled per Phase 7 init log |
| 8 | Page meta typing | **Type augmentation in `app/types/page-meta.d.ts`** declaring `nav`, `navLabel`, `navIcon`, `navOrder` on `PageMeta` | Enables editor autocomplete + typecheck catches typos; one-time setup cost |
| 9 | Type augmentation module | **`declare module '#app' { interface PageMeta { ... } }`** | Nuxt 4 docs-recommended path |
| 10 | Header bar | **Keep the v0.5.0 white header with "Lakewood Unified School District"** in `default.vue` | Visual continuity; not a page-level concern |
| 11 | Page stub content | **Each page gets `<h1>` + one-line `<p>` placeholder** | Phase 8 verifies routing/layout, not content. Phase 10-12 replace these. |
| 12 | First demo section route | **`/` is Dashboard, not redirected from `/dashboard`** | `app/pages/index.vue` IS the dashboard; no aliasing |

---

## Per-Question Findings

### 1. Nuxt 4 file-based routing mechanics

**File → URL mapping is purely positional.** Nuxt scans `app/pages/` at build time and generates routes from filenames:

| File | URL | Component |
|------|-----|-----------|
| `app/pages/index.vue` | `/` | Dashboard (was `DashboardView.vue` in v0.5.0) |
| `app/pages/discovery.vue` | `/discovery` | Discovery (was `DiscoveryView.vue`) |
| `app/pages/dpa.vue` | `/dpa` | DPA (new — was the "DPA" tab inside DiscoveryView in v0.5.0) |
| `app/pages/risk.vue` | `/risk` | Risk Position (was `ReportsView.vue`) |
| `app/pages/tags.vue` | `/tags` | Tags Management (was `SettingsView.vue`) |

**Key v0.5.0 → v1.0.0 route changes:**

- v0.5.0 had only 4 routes (`/`, `/discovery`, `/reports`, `/settings`); v1.0.0 splits DPA out to its own route, renames `/reports` → `/risk`, and renames `/settings` → `/tags`.
- v0.5.0 used `createWebHashHistory('/district-demo/')` — gone. Nuxt 4 uses HTML5 history by default; base path (`/district-demo/`) is added in Phase 13 via `app: { baseURL: ... }`.

**Triggering the router:** Simply having `app/pages/` with at least one `.vue` file makes Nuxt enable Vue Router internally. **Without** `app/pages/`, Nuxt skips Vue Router entirely. (Source: Nuxt 4 docs, `directory-structure/app/pages`.)

**`<NuxtPage />` is the mount point** — it's the analogue of `<RouterView />`. Inside the layout (or `app.vue` if no layout), wherever you place `<NuxtPage />` is where the current route's page component renders.

**Where `<NuxtLink>` lives matters for persistence.** Routes shift the contents of `<NuxtPage />` but everything OUTSIDE `<NuxtPage />` persists (no unmount/remount). The sidebar `<NuxtLink>` list goes in `default.vue` ABOVE/BESIDE `<slot />` — never inside a page — so it persists across route changes.

**Naming pitfalls:**
- `pages/Dashboard.vue` → `/dashboard` (not `/`). The filename is the URL. Use `index.vue` for root.
- `pages/Discovery.vue` (capital D) works on Windows/macOS (case-insensitive FS) but breaks on Linux (case-sensitive) — and AWS Amplify/Vercel/Netlify build servers ARE Linux. **Always lowercase page filenames.**
- `pages/_discovery.vue` is treated as a private file (underscore prefix). Don't use leading underscores.
- `pages/discovery/index.vue` and `pages/discovery.vue` both resolve to `/discovery`. Don't have both — Nuxt warns and one shadows the other.

**Source:** Nuxt 4 docs `directory-structure/app/pages`; verified via the Nuxt skill `core-routing.md` reference.

**Confidence:** HIGH.

---

### 2. `definePageMeta` API and nav metadata

**`definePageMeta` is a compile-time macro.** Nuxt's build process extracts the literal object passed to `definePageMeta({...})` at build time and stores it as the route record's `meta` field. **You cannot use runtime references inside it** — no composables, no imported vars beyond literals, no string concatenation of runtime values. This is the same restriction as `defineProps`/`defineEmits`.

**Built-in fields** (Nuxt 4): `name`, `path`, `alias`, `props`, `redirect`, `validate`, `pageTransition`, `layoutTransition`, `viewTransition`, `key`, `keepalive`, `layout`, `middleware`, `groups`, `scrollToTop`.

**Custom fields:** Arbitrary keys are supported. Per the docs: "Apart from the above properties, you can also set custom metadata." Custom keys land in `route.meta.{key}`.

**Recommended custom keys for this project:**

```ts
definePageMeta({
  nav: true,              // boolean — include in sidebar?
  navLabel: 'Discovery',  // string — display text
  navIcon: 'i-lucide-search',  // string — Iconify name
  navOrder: 20,           // number — sidebar position (sort ascending)
})
```

**Type augmentation (for editor autocomplete + typecheck):**

Create `app/types/page-meta.d.ts`:

```ts
// Source: nuxt.com/docs/4.x/directory-structure/app/pages#typing-custom-metadata
declare module '#app' {
  interface PageMeta {
    nav?: boolean
    navLabel?: string
    navIcon?: string
    navOrder?: number
  }
}

// Required: import or export something to make this a module
export {}
```

The augmentation must use `declare module '#app'` (NOT `'vue-router'` or `'#imports'`). The empty `export {}` at the bottom is required to make TS treat the file as a module (otherwise the `declare module` is ignored).

**Reading at runtime — three options compared:**

| Option | API | When to use | Verdict |
|--------|-----|-------------|---------|
| (a) `useRoute().meta` | Current route only | Inside a page to read its OWN meta | Not useful for sidebar (sidebar needs ALL routes) |
| (b) `useRouter().options.routes` | All registered routes (incl. meta) — preserves the route tree shape | Inside layouts/components to iterate routes | **Recommended** — gives the full route record array with `path`, `name`, `meta` |
| (c) `pages:extend` Nuxt config hook | Build-time hook that gets the route table | When you need to MUTATE routes (rename, restrict) | Overkill for read-only nav use case |

**Recommended sidebar code (concrete):**

```vue
<!-- app/layouts/default.vue (excerpt) -->
<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'

const router = useRouter()

const navRoutes = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav === true)
    .sort((a, b) => (a.meta?.navOrder ?? 999) - (b.meta?.navOrder ?? 999))
)
</script>

<template>
  <nav>
    <NuxtLink v-for="route in navRoutes" :key="route.path" :to="route.path" ...>
      <UIcon :name="(route.meta?.navIcon as string) ?? 'i-lucide-circle'" />
      <span>{{ route.meta?.navLabel ?? route.name }}</span>
    </NuxtLink>
  </nav>
</template>
```

**Critical SSR note:** `router.options.routes` is identical on server and client — it's the static route table generated at build time. Iterating it does NOT cause hydration mismatches. The thing that COULD cause a mismatch (the active-link styling) is handled entirely by NuxtLink's internals, which are also SSR-consistent. (See Pitfall 2 in Common Pitfalls.)

**Source:** Nuxt 4 docs `api/utils/define-page-meta`, `api/composables/use-router`, `directory-structure/app/pages#typing-custom-metadata`.

**Confidence:** HIGH for API mechanics; HIGH for the type augmentation pattern; HIGH for the `router.options.routes` iteration (verified pattern, matches v0.5.0's `router.getRoutes()` approach 1:1 in spirit).

---

### 3. Layout pattern: `app/app.vue` → `app/layouts/default.vue` → `app/pages/<name>.vue`

**The full chain, top to bottom:**

```
app/app.vue
  └─ <UApp>                          ← overlay portal target (Phase 7)
       └─ <NuxtLayout>               ← reads useRoute().meta.layout (default if unset)
            └─ default.vue           ← app/layouts/default.vue mounts here
                 ├─ <aside>          ← persistent sidebar
                 └─ <main>
                      └─ <slot />    ← <NuxtPage> content lands here
                           └─ pages/<name>.vue
```

**`app/app.vue` — final shape (replaces the Phase 7 placeholder):**

```vue
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

That's it. No `<script>` block. No imports (everything auto-imported by Nuxt).

**Why explicit `<NuxtLayout>` is required:** Nuxt 4 does NOT auto-wrap pages in the default layout. Without `<NuxtLayout>` in `app.vue`, `default.vue` never mounts. (Verified via Nuxt 4 docs `directory-structure/app/layouts`.)

**Why not skip `default.vue` and put the shell inside `app.vue`?** The Nuxt docs DO suggest this for single-layout apps as a simplification. **We reject that suggestion** because:
1. LAYOUT-01 explicitly mandates `app/layouts/default.vue`.
2. Future flexibility — Phase 10 might want a `print.vue` layout for printable risk reports; phase 13+ might want a `landing.vue` with no sidebar. Adding a second layout to an `app.vue`-shelled project means a big refactor; adding it to a layout-shelled project is one new file.
3. The shell is non-trivial (~60 lines of markup + sidebar logic) — pulling it out of `app.vue` keeps `app.vue` semantically about "app-wide concerns" (overlay portal, layout wiring) and `default.vue` semantically about "shell appearance."

**`app/layouts/default.vue` — the shell (concrete structure):**

```vue
<script setup lang="ts">
const router = useRouter()
const navRoutes = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav === true)
    .sort((a, b) => (a.meta?.navOrder ?? 999) - (b.meta?.navOrder ?? 999))
)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="flex flex-col w-64 h-screen bg-[var(--color-sidebar)] text-white shrink-0">
      <div class="px-6 py-6 border-b border-gray-700">
        <span class="text-lg font-semibold tracking-wide">Schoolday</span>
      </div>
      <ul class="flex-1 py-4 px-3 space-y-1">
        <li v-for="route in navRoutes" :key="String(route.name ?? route.path)">
          <NuxtLink
            :to="route.path"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            active-class="!bg-primary-600 !text-white"
            exact-active-class="!bg-primary-600 !text-white"
          >
            <UIcon :name="(route.meta?.navIcon as string) ?? 'i-lucide-circle'" class="text-base" />
            <span>{{ route.meta?.navLabel ?? route.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </aside>

    <!-- Main column -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
        <span class="text-sm text-gray-700">Lakewood Unified School District</span>
      </header>
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>
```

**Why `!important` (`!bg-primary-600`) on the active class:** Without it, the base classes (`text-gray-400`) win the cascade because they appear later in the rendered class list (Tailwind orders by source order, not specificity). The `!` makes the active state unambiguously override. This matches the v0.5.0 pattern (which used `active-class="bg-primary text-white"` against `text-gray-400` and got the same result by Vue Router's class-merging order — but in Nuxt the class merge order is sometimes flipped, so explicit `!` is safer).

**Page stub template (all 5 pages share this shape):**

```vue
<!-- app/pages/discovery.vue (example) -->
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">App and domain usage across the district. (Phase 10 wires data.)</p>
  </div>
</template>
```

**Source:** Nuxt 4 docs `directory-structure/app/layouts`, `directory-structure/app/pages`, `api/components/nuxt-link`.

**Confidence:** HIGH.

---

### 4. `NuxtLink` active-state styling

**Default class names** (Vue Router defaults, inherited by NuxtLink):
- `router-link-active` — applied when the current URL matches the link path OR starts with it (prefix match)
- `router-link-exact-active` — applied only when the current URL exactly matches the link path

**Override via props:**

```vue
<NuxtLink
  to="/discovery"
  active-class="bg-primary-600 text-white"
  exact-active-class="bg-primary-600 text-white"
>
  Discovery
</NuxtLink>
```

**Why use `exact-active-class` for ALL nav links, not `active-class`:** The default `active-class` does a prefix match — so `/` (the root path) would match EVERY URL because `/` is a prefix of `/discovery`, `/dpa`, etc. Result: the "Dashboard" link would always look active, no matter which page you're on. Using `exact-active-class` (which only fires on full-path match) fixes this — exactly the same fix v0.5.0 used (its router config also set `exact-active-class`).

**Source:** Nuxt 4 docs `api/components/nuxt-link`; verified via the nuxt skill `features-components.md` reference.

**Tailwind v4 utility application in a Nuxt UI v4 context:**

The brand palette (`--color-brand-50` through `--color-brand-950`) is defined in `app/assets/css/main.css` (Phase 7) and mapped to Nuxt UI's `primary` semantic color via `app.config.ts`. This means Tailwind utility classes like `bg-primary-600` resolve to `var(--ui-primary-600)` which resolves to `var(--color-brand-600)` → `#3c40cc`. **Using `bg-primary-600` is preferred over `bg-brand-600`** because it preserves the option to swap the brand color globally via `app.config.ts`.

For the dark sidebar background, the `--color-sidebar` CSS var (`#111827`) defined in main.css is used directly via the Tailwind v4 arbitrary-value syntax: `bg-[var(--color-sidebar)]`.

**Nuxt UI v4 + Tailwind v4 caveat:** Tailwind v4 is CSS-first — there's no `tailwind.config.js`. Color tokens declared in `@theme` blocks in CSS are auto-available as utilities (`--color-brand-500` becomes `bg-brand-500`, `text-brand-500`, etc.). Custom vars NOT in a `@theme` block (like `--color-sidebar`) can be used via arbitrary values (`bg-[var(--color-sidebar)]`) but are NOT available as plain utilities (`bg-sidebar` would fail).

**Important:** The current `app/assets/css/main.css` already has `--color-sidebar: #111827;` inside `@theme static` — so Tailwind v4 SHOULD make `bg-sidebar` work as a utility. But `bg-sidebar` only generates if Tailwind sees a `--color-sidebar-{shade}` family — a single ungraded `--color-sidebar` may not be picked up as a utility. **Safest pattern: use `bg-[var(--color-sidebar)]` explicitly.** This is verified to work; the utility-shortcut form may not.

**Confidence:** HIGH for NuxtLink active classes; HIGH for the `exact-active-class`-on-all pattern; MEDIUM-HIGH for the Tailwind v4 `bg-sidebar` utility question (recommendation is the conservative arbitrary-value form).

---

### 5. Handrolled `<NuxtLink>` list vs `UNavigationMenu` vs `USidebar`

**Three viable Nuxt UI v4 options compared:**

| Option | Active state | Dark theming | Code volume | NuxtLink integration | Verdict |
|--------|--------------|--------------|-------------|----------------------|---------|
| (a) Handrolled `<NuxtLink>` list | **Automatic** via `exact-active-class` | Full Tailwind control | ~15 lines markup | Direct | **WIN** |
| (b) `UNavigationMenu orientation="vertical"` | **Manual** — must drive `active:` per item via `computed(() => route.path === ...)` | Component defaults to light theme — heavy `:ui` overrides needed | ~30 lines + computed | Via `to:` prop on items | Tedious |
| (c) `USidebar` + `UNavigationMenu` (v4.6+) | Same manual `active:` problem | Same theme overrides + responsive mobile baggage we don't need | ~40 lines | Same | Overkill |

**Why handrolled wins for this project:**

1. **5 routes, fixed forever** (Dashboard + 4 sections). No dynamic nav, no collapsible groups, no nesting. Adding a Nuxt UI component adds dependency bloat.
2. **Dark sidebar is bespoke** — v0.5.0's sidebar bg `#111827` (gray-900) with `#484ce6` (brand-500) active state is a specific design choice. UNavigationMenu's default styling assumes a light surface; making it dark requires fighting the component's `:ui` slot tokens. Skipping the component skips that fight entirely.
3. **NuxtLink does the active work** — the whole reason UNavigationMenu's manual `active:` exists is for components that AREN'T using NuxtLink (custom routers, hash routing in non-Nuxt apps). We have NuxtLink, we have file-based routing, the auto-active path is open.
4. **v0.5.0 parity** — the v0.5.0 SidebarNav.vue was already a handrolled `<RouterLink>` list. Replacing `<RouterLink>` with `<NuxtLink>` is a literal mechanical port (the prop names are identical).
5. **Iteration speed (CLAUDE.md constraint)** — a developer changing the sidebar at 5pm before a 6pm demo finds a flat 15-line `<NuxtLink>` list far easier to modify than a `:items` array with `:ui` overrides.

**When you WOULD use `UNavigationMenu`:** If you had dynamic nav with nested groups loaded from a CMS (e.g., 30+ doc-site sections), the component's keyboard nav, focus management, and badge/icon slot conventions become valuable. None of that applies here.

**When you WOULD use `USidebar`:** If you needed mobile responsiveness (collapse to drawer/sheet on small screens). REQUIREMENTS.md explicitly defers mobile optimization. Don't pay the complexity cost now.

**Source:** Nuxt UI v4 docs `components/navigation-menu`, `components/sidebar`; verified `active` is manually-driven in v4.

**Confidence:** HIGH.

---

### 6. Migrating v0.5.0 sidebar visual style

**Source (v0.5.0 `src/components/layout/SidebarNav.vue`, recovered from git commit `15d021c~1`):**

```vue
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

**Source (v0.5.0 `src/components/layout/AppShell.vue`):**

```vue
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

**Source (v0.5.0 `src/style.css`):**

```css
@theme {
  --color-primary: #484ce6;
  --color-accent: #da8231;
  --color-sidebar: #111827;
}
```

**Exact colors used in the v0.5.0 sidebar (extracted from above):**

| Element | v0.5.0 Tailwind class | Resolved color | v1.0.0 equivalent |
|---------|----------------------|----------------|-------------------|
| Sidebar background | `bg-sidebar` | `#111827` (gray-900) | `bg-[var(--color-sidebar)]` — var already defined in Phase 7 main.css |
| Sidebar divider | `border-gray-700` | `#374151` | `border-gray-700` (unchanged — Tailwind palette is built-in) |
| Brand name text | `text-white` | `#ffffff` | `text-white` |
| Inactive link text | `text-gray-400` | `#9ca3af` | `text-gray-400` |
| Inactive link hover bg | `hover:bg-gray-800` | `#1f2937` | `hover:bg-gray-800` |
| Inactive link hover text | `hover:text-white` | `#ffffff` | `hover:text-white` |
| Active link bg | `bg-primary` (= `#484ce6`) | `#484ce6` (brand-500) | `!bg-primary-600` — NOTE shade shift (see below) |
| Active link text | `text-white` | `#ffffff` | `!text-white` |
| Header bar bg | `bg-white` | `#ffffff` | `bg-white` |
| Header bottom border | `border-gray-200` | `#e5e7eb` | `border-gray-200` |
| Main content bg | `bg-gray-50` | `#f9fafb` | `bg-gray-50` |

**Active-link color shade decision — `primary-500` vs `primary-600`:**

- v0.5.0's `--color-primary` was a single hex value `#484ce6`, no shades — equivalent to brand-500 in the new palette.
- v1.0.0's brand palette has 11 shades (50-950). `brand-500` = `#484ce6` (exact v0.5.0 value), `brand-600` = `#3c40cc` (one step darker).
- **Recommend `primary-600` for active link** because:
  - Slightly darker = better contrast against white text on dark sidebar (improves accessibility from ~4.0:1 to ~5.2:1).
  - Differentiates the active state from any future brand-500 usage elsewhere on the page (logo, primary CTA buttons).
  - The visual delta vs v0.5.0 is small (`#484ce6` → `#3c40cc`) and likely imperceptible at the small sidebar pill size.
- **Alternative: keep `primary-500` for exact v0.5.0 parity.** This is a low-cost reversal; either is defensible. **Recommend primary-600 with a one-line PR comment justifying the choice** so it's traceable.

**`text-base` for the icon:** v0.5.0 used `<i :class="route.meta.icon" class="text-base" />` with PrimeIcons. In v1.0.0 the icon is `<UIcon :name="..." class="text-base" />`. UIcon defaults to `1em` font-size and inherits from parent text; `text-base` (=16px) is fine but optional.

**Confidence:** HIGH (colors verified verbatim from git source).

---

### 7. Icon strategy for sidebar nav

**Module:** `@nuxt/icon` is auto-registered as a companion module by `@nuxt/ui` v4 — no separate install needed (verified in Phase 7 RESEARCH Section 2).

**Mode confirmed:** From the Phase 7-02 dev-server log, "Nuxt Icon server bundle mode is set to local" — icons are bundled at build time from the Iconify JSON sets, no runtime CDN fetch. This is the right mode for the static GitHub Pages target.

**Icon set:** Lucide — same family as `@nuxt/ui`'s internal defaults, ensures visual consistency with any built-in icons used by UButton/UModal/etc. in later phases.

**Iconify name format:**
- Native Iconify: `lucide:home`
- Nuxt UI shorthand: `i-lucide-home` (this works as a class on any element, or as `name` prop on `<UIcon>`)
- We use `i-lucide-*` shorthand throughout because that's the Nuxt UI convention.

**Icon mapping for the 5 sections** (semantically chosen):

| Route | navLabel | navIcon | navOrder | Rationale |
|-------|----------|---------|----------|-----------|
| `/` | Dashboard | `i-lucide-home` | 10 | "Home" → dashboard convention; matches v0.5.0 `pi pi-home` |
| `/discovery` | Discovery | `i-lucide-search` | 20 | Discovery = finding/exploring apps; matches v0.5.0 `pi pi-search` |
| `/dpa` | DPA | `i-lucide-file-text` | 30 | Data Privacy Agreement = document; v0.5.0 had no dedicated DPA route, this is new |
| `/risk` | Risk Position | `i-lucide-alert-triangle` | 40 | Risk/warning semantics; matches v0.5.0 `pi pi-chart-bar` (Reports) but more accurate to the page's purpose |
| `/tags` | Tags | `i-lucide-tag` | 50 | Direct semantic match; matches v0.5.0 `pi pi-cog` (Settings) but more accurate |

**`navOrder` gaps of 10:** Leaves room to insert future v1.1+ sections (e.g., a "1EdTech" route between Discovery and DPA at navOrder 25) without renumbering.

**Verification icons exist:** All 5 are core Lucide icons present in the `@iconify-json/lucide` package (1700+ icons). Confirmed via lucide.dev/icons. If any icon fails to resolve, Nuxt UI renders a small empty placeholder — silent failure, easy to miss. (See Pitfall 5.)

**Source:** lucide.dev/icons; Nuxt UI v4 docs `getting-started/icons`; Phase 7-02 dev-server log.

**Confidence:** HIGH for module mechanics + naming convention; HIGH for icon name spelling (all 5 are verified).

---

### 8. Phase 8-specific pitfalls and gotchas

**Verified pitfalls (all sourced):**

| # | Pitfall | Mitigation |
|---|---------|------------|
| 1 | `definePageMeta` is a build-time MACRO — runtime values silently become `undefined` | Only pass literal strings/numbers/booleans. No imported constants, no template strings with vars, no composables. |
| 2 | SSR hydration mismatch from time-dependent active-class | NuxtLink's active classes are computed from `route.path`, which is identical on server and client during SSR. No mismatch in normal use. Mismatches CAN happen if you read `window.location.pathname` directly in setup — DON'T do that; use `useRoute().path` which is universal. |
| 3 | Default `active-class` does prefix match → root `/` link is always active | Use `exact-active-class` on the root link (and ideally on all links). v0.5.0 already did this. |
| 4 | Page filename casing breaks on Linux build servers | Always lowercase page filenames. `pages/discovery.vue`, not `pages/Discovery.vue`. |
| 5 | Iconify icon name typo silently renders blank | Test each icon by eye after first render. If an icon space is empty, it's almost certainly a typo (e.g., `i-lucide-file_text` instead of `i-lucide-file-text` — Lucide uses dashes, not underscores). |
| 6 | Tailwind v4 utility `bg-sidebar` may not generate from a single non-graded CSS var | Use `bg-[var(--color-sidebar)]` explicitly for the sidebar background. (`bg-primary-600` works because primary is graded.) |
| 7 | Forgetting `<NuxtLayout>` in `app.vue` → `default.vue` never mounts | `app.vue` MUST contain `<NuxtLayout>` somewhere inside the template. With just `<UApp><NuxtPage /></UApp>`, the layout system is bypassed. |
| 8 | `router.options.routes` includes routes with NO `meta.nav` | Always filter `.filter(r => r.meta?.nav === true)` before sorting/rendering. If you forget, Nuxt's internal routes (e.g., dev-server health checks) might appear. |
| 9 | Type augmentation file silently ignored if it doesn't have `export {}` | Always include `export {}` (or some other top-level import/export) in `app/types/page-meta.d.ts`. Without it, TS treats the file as a script, not a module, and the `declare module` is ignored. |
| 10 | `app.vue` is in Nuxt 4 placed at `app/app.vue` — NOT root | Phase 7 already put it there. Confirm Phase 8 edits go to `app/app.vue`, not a new `app.vue` at repo root. |
| 11 | `<NuxtLink to="/">` matches more aggressively than expected | When using default `active-class` (not `exact-active-class`), `/` is a prefix of every URL → always active. ALWAYS use `exact-active-class` on root links. |
| 12 | Layout's `<slot />` placement determines page region | The `<slot />` must be inside the `<main>` element. If you put `<slot />` outside the main column flexbox, the page content collapses to an unstyled block. |
| 13 | Pages with `definePageMeta({ layout: 'something' })` skip default.vue | None of the 5 Phase 8 pages should set `layout:` — they all use the default. If you accidentally set `layout: 'blank'` you bypass the shell. |
| 14 | v0.5.0 `src/views/*.vue` files still exist (deferred deletion) | They will not be auto-imported into routes because Nuxt only scans `app/pages/`. Safe to ignore; they're deleted by Phases 10-12 as those phases rewrite each view. |
| 15 | `app/components/` auto-import — Sidebar component could clash | If you split the sidebar into `app/components/SidebarNav.vue`, it becomes globally auto-imported as `<SidebarNav>`. For Phase 8 with only one sidebar instance, inline it in `default.vue` to avoid an unnecessary component file. Phase 10+ can refactor if components grow. |

**Confidence:** HIGH.

---

### 9. Anti-patterns to avoid

- **DON'T** create `app/router/index.ts`, `app/router.config.ts`, or anything that resembles a Vue Router config. Nuxt's `useRouter()` returns Nuxt's internal router; an explicit config file is redundant and confusing. (ROADMAP Success Criterion 3 explicitly forbids this.)
- **DON'T** import `createRouter` or `createWebHistory` anywhere. Nuxt handles router creation internally.
- **DON'T** hardcode a `NAV_ROUTES = [...]` const in the sidebar layout. While this would work, it duplicates the single source of truth (page filenames). The whole point of `definePageMeta` driving the nav is to make `pages/+definePageMeta` the only place a developer touches when adding/renaming a section. (ROADMAP Success Criterion 4: "without hardcoding route names".)
- **DON'T** use `<RouterLink>`. It's the Vue Router primitive; `<NuxtLink>` is the Nuxt-aware superset (adds prefetching, external-link detection, smarter active-class behaviour).
- **DON'T** put `<NuxtPage />` directly inside `<UApp>` without `<NuxtLayout>`. Layouts only mount when `<NuxtLayout>` is in the chain. Otherwise `default.vue` is orphaned.
- **DON'T** put the sidebar in `app/components/AppSidebar.vue` and import it into `default.vue` as a wrapper. Inline it in `default.vue` — fewer files, easier to mod for a demo.
- **DON'T** use Tailwind classes in page stubs that don't match the visual language of the final pages (e.g., bright `bg-red-500 text-white p-12`). Keep stubs minimal: `<h1>` + `<p>` + standard padding. They're throwaway content that should not influence the visual review.
- **DON'T** set `definePageMeta({ keepalive: true })` on any Phase 8 page. The Phase 8 pages are stubs; keepalive caches the page instance, which is meaningless for a stub. (Phase 10+ may revisit if discovery state should survive route changes — but that's a deliberate decision, not a default.)
- **DON'T** add page transitions (`pageTransition`) in Phase 8 — out of scope and adds visual complexity that's better added once content is real.

---

### 10. Build/dev/deploy compatibility check

**Phase 8 must NOT break:**

| Concern | Why it matters | How to verify |
|---------|----------------|---------------|
| `npm run typecheck` exit 0 | Type augmentation in page-meta.d.ts must not break Nuxt's own types | `npm run typecheck` after each task; expect green |
| `npm run build` exit 0 | Pages compile; no `definePageMeta` macro errors | `npm run build` at phase end |
| `npm run dev` server boots | Nuxt's file-based router builds the route table successfully | `npm run dev` and curl each of 5 paths |
| All 5 routes return 200 | No 404s, no SSR exceptions | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/discovery` per path |
| SSR HTML contains page marker | Pages SSR-render content, not just empty shell | `curl -s http://localhost:3000/discovery \| grep -q 'Discovery'` |

**Phase 8 must NOT introduce:**

- `app: { baseURL: '/district-demo/' }` — that's a Phase 13 concern. In dev, base path stays `/`.
- `nitro.preset` config — same, Phase 13.
- Any page-level data fetching — that's Phase 9.

**`postinstall` hook** (`nuxi prepare`) auto-runs on `npm install` — regenerates `.nuxt/tsconfig.json` to include the new page routes in type info. After adding the 5 pages, `nuxi prepare` (which dev/build run automatically) updates `.nuxt/types/router.d.ts` so `useRouter()` types include the new route names. **If editor shows red squigglies on route names after first add, run `npx nuxi prepare` manually.**

**Confidence:** HIGH.

---

## Standard Stack

### Core (used by Phase 8)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `nuxt` | ^4.4.6 (installed) | File-based routing + `<NuxtPage>`/`<NuxtLayout>`/`<NuxtLink>` built-ins | Required by NUXT-04 |
| `@nuxt/ui` | ^4.8.0 (installed) | `<UApp>` wrapper (from Phase 7), `<UIcon>` for sidebar icons | Required by NUXT-02 |
| `@nuxt/icon` | auto-installed by `@nuxt/ui` | Iconify integration for `i-lucide-*` icons | Companion module of `@nuxt/ui` v4 |
| `vue-router` | bundled by Nuxt | `RouteRecordRaw` type import for sidebar's `navRoutes` computed | Internal — do NOT add as explicit dep |

**Verified versions (via `npm view`, 2026-05-21):**
- `@nuxt/ui@4.8.0` — latest, already in package.json
- `nuxt@4.4.6` — latest, already in package.json

### Removed in Phase 7 (still relevant)

| Library | Reason | Phase 8 impact |
|---------|--------|----------------|
| `vue-router` (explicit dep) | Removed in Phase 7 — Nuxt bundles its own | Phase 8 imports `RouteRecordRaw` TYPE only, from `vue-router` — this resolves through Nuxt's transitive dep, no explicit dep needed |
| `primeicons` | Replaced by `@nuxt/icon` + Lucide | Phase 8 uses `i-lucide-*`, never `pi pi-*` |

### Supporting (unchanged)

| Library | Version | Purpose |
|---------|---------|---------|
| `tailwindcss` | ^4.3.0 (installed) | Utility classes for sidebar styling, dark theme |

### No new dependencies added in Phase 8

Phase 8 is a pure-code phase: layout + 5 pages + 1 type declaration. No `npm install` needed.

**Confidence:** HIGH.

---

## Architecture Patterns

### Recommended Project Structure (post-Phase-8)

```
app/
  app.vue                 # UApp > NuxtLayout > NuxtPage
  app.config.ts           # (unchanged from Phase 7)
  assets/css/main.css     # (unchanged from Phase 7)
  layouts/
    default.vue           # ★ NEW — shell: sidebar + header + <slot />
  pages/
    index.vue             # ★ NEW — Dashboard stub
    discovery.vue         # ★ NEW — Discovery stub
    dpa.vue               # ★ NEW — DPA stub
    risk.vue              # ★ NEW — Risk Position stub
    tags.vue              # ★ NEW — Tags Management stub
  stores/
    tags.ts               # (unchanged from Phase 7)
  types/
    page-meta.d.ts        # ★ NEW — PageMeta interface augmentation
public/
  favicon.svg
  icons.svg
nuxt.config.ts            # (unchanged from Phase 7)
tsconfig.json             # (unchanged)
package.json              # (unchanged)
```

**Total new files: 7** (1 layout + 5 pages + 1 type declaration). No deletions in Phase 8 (the deletion of `src/views/*.vue` files belongs to Phases 10-12 as those views are rewritten).

**Net diff vs Phase 7 ending state:** +7 files, ~150 lines of code added.

### Pattern 1: Persistent layout shell

**Source:** Nuxt 4 docs `directory-structure/app/layouts`.

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="...">[sidebar nav]</aside>
    <main class="flex-1 overflow-y-auto">
      <slot />  <!-- pages mount here, persisted layout above doesn't unmount -->
    </main>
  </div>
</template>
```

**Why this is the right pattern:** Vue Router preserves the layout DOM tree across route changes; only the page (inside `<slot />`) unmounts/remounts. Sidebar state (e.g., hover, focus, future collapsed-state) survives navigation for free.

### Pattern 2: Metadata-driven nav with type safety

```ts
// app/types/page-meta.d.ts
declare module '#app' {
  interface PageMeta {
    nav?: boolean
    navLabel?: string
    navIcon?: string
    navOrder?: number
  }
}
export {}
```

```vue
<!-- app/pages/discovery.vue -->
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})
</script>
```

```vue
<!-- app/layouts/default.vue -->
<script setup lang="ts">
const router = useRouter()
const navRoutes = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav === true)
    .sort((a, b) => (a.meta?.navOrder ?? 999) - (b.meta?.navOrder ?? 999))
)
</script>
```

**Why this is the right pattern:** Adding a 6th section in v1.1 is a single-file operation — create `app/pages/insights.vue` with `definePageMeta({ nav: true, navLabel: 'Insights', navIcon: 'i-lucide-line-chart', navOrder: 35 })` and the sidebar updates automatically. No sidebar edit, no router edit.

### Pattern 3: NuxtLink with explicit exact-match

```vue
<NuxtLink
  to="/"
  active-class="!bg-primary-600 !text-white"
  exact-active-class="!bg-primary-600 !text-white"
>
  Dashboard
</NuxtLink>
```

**Why both `active-class` and `exact-active-class`:** Identical values; the redundancy protects against future refactoring where someone changes one and forgets the other. Setting both ensures consistent active styling regardless of which mechanism fires.

### Anti-patterns to Avoid (summary, see Section 9 for full list)

- **DON'T** create a router config file.
- **DON'T** hardcode route names in the sidebar.
- **DON'T** use `RouterLink` (use `NuxtLink`).
- **DON'T** skip `<NuxtLayout>` in `app.vue`.
- **DON'T** use `bg-sidebar` utility — use `bg-[var(--color-sidebar)]`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File-based routing | `app/router/index.ts` with manual `createRouter` + route table | Nuxt's `app/pages/` convention | Nuxt does this for free; manual config violates NUXT-04 |
| Persistent shell wrapping | Components that re-mount on every route change | `app/layouts/default.vue` with `<slot />` | Layout DOM tree persists across route changes — built-in to NuxtLayout |
| Active-link styling | `useRoute()` + `:class="route.path === '/x' ? '...' : '...'"` per link | NuxtLink `active-class` / `exact-active-class` props | NuxtLink delegates to Vue Router's class logic, which is SSR-safe and handles edge cases |
| Nav metadata centralization | A `const NAV = [{ path: '/', label: 'Dashboard' ... }]` table | Per-page `definePageMeta({ nav, navLabel, navIcon, navOrder })` | One source of truth per page; trivially extensible; satisfies ROADMAP Criterion 4 |
| Icon delivery | `<svg>` inlined per route OR custom `<Icon>` wrapper component | `<UIcon name="i-lucide-..." />` (auto-imported via `@nuxt/ui` v4 + `@nuxt/icon`) | Module handles tree-shaking, server-bundle, SSR; one-line usage |
| Sidebar component primitive | Building a custom `<NavGroup>` / `<NavItem>` wrapper hierarchy | Inline `<ul>` + `<li>` + `<NuxtLink>` in the layout | 5 routes; the wrapper has no reuse to amortize; flatness aids same-day demo iteration |
| Custom CSS-in-JS for active state | Scoped styles or computed style objects | Tailwind utility classes (`!bg-primary-600`) via the `active-class` prop | Tailwind v4 is already the project's styling system; no new abstraction |
| Programmatic navigation in nav | `@click="$router.push('/x')"` handlers on `<li>` | `<NuxtLink :to="...">` (declarative, prefetches, accessible) | NuxtLink renders `<a>` with proper href — keyboard nav, right-click "open in new tab", screen reader nav all work for free |

**Key insight:** This phase is the canonical "Nuxt does this for free" phase. The wrong instinct is to ports v0.5.0's router-and-shell architecture mechanically; the right instinct is to lean into Nuxt's conventions and let `app/pages/` + `app/layouts/` + `<NuxtLink>` collapse what used to be 3 files into the framework itself.

---

## Common Pitfalls

### Pitfall 1: Forgetting `<NuxtLayout>` in `app.vue`

**What goes wrong:** Routes work, pages render, but the sidebar never appears. The default layout sits orphaned in `app/layouts/`.

**Why it happens:** Nuxt 4 (unlike Nuxt 2) does NOT auto-wrap pages in the default layout. The wrapping must be explicit.

**How to avoid:** `app.vue` MUST contain `<NuxtLayout>` (or `<NuxtLayout :name="...">` for dynamic layouts). For this project: `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>`.

**Warning signs:** Page content renders but no sidebar; `default.vue` exists but doesn't appear in DevTools component tree.

### Pitfall 2: `definePageMeta` macro using runtime values silently breaks

**What goes wrong:** The sidebar shows `undefined` or no entries; or only some pages appear in the sidebar.

**Why it happens:** `definePageMeta({...})` is a compile-time macro that gets extracted from the source AST at build time. The literal object's values are baked into the route record's `meta`. If you write `definePageMeta({ navLabel: PAGE_LABELS.discovery })` (referencing an imported const), the macro can't resolve `PAGE_LABELS.discovery` statically → it bakes in `undefined`.

**How to avoid:** Only pass literal primitives. No imports, no template strings with variables, no computed values, no composables.

**Warning signs:** Sidebar entry exists but label is blank; icon area is empty; sorting is wrong (because `navOrder` baked as `undefined`).

### Pitfall 3: Root path `/` always-active when using `active-class` only

**What goes wrong:** The Dashboard link in the sidebar is highlighted even when you're on `/discovery`, `/dpa`, etc.

**Why it happens:** Vue Router's `active-class` does prefix-match. The path `/` is a prefix of every URL, so the root link matches every route.

**How to avoid:** Use `exact-active-class` (which only fires on exact match) on the root link. Recommendation: use `exact-active-class` on ALL nav links uniformly.

**Warning signs:** Dashboard link is purple/highlighted on every page.

### Pitfall 4: Iconify icon name typo renders nothing

**What goes wrong:** The space where an icon should be is blank or shows a tiny dot. No console error.

**Why it happens:** `@nuxt/icon` doesn't throw for unknown icon names; it renders an empty placeholder. Lucide names use dashes (`file-text`), not underscores or camelCase.

**How to avoid:** Type the icon name exactly. Cross-check against `lucide.dev/icons`. For this project: `i-lucide-home`, `i-lucide-search`, `i-lucide-file-text`, `i-lucide-alert-triangle`, `i-lucide-tag`.

**Warning signs:** Visual gap in the sidebar list; one item is misaligned compared to neighbors.

### Pitfall 5: Page filename casing breaks Linux builds

**What goes wrong:** Dev server (on Mac/Windows) works fine. Production build on a Linux server (Vercel, Netlify, Amplify, GitHub Pages — but actually GitHub Pages uses Linux runners for the gh-pages action too) fails: page not found, 404 in router.

**Why it happens:** Mac/Windows file systems are case-insensitive — `pages/Discovery.vue` and `pages/discovery.vue` are the same file. Linux is case-sensitive — they're different files, but Nuxt's expected URL is generated from the canonical lowercase form.

**How to avoid:** All page filenames lowercase. All references to pages (e.g., `to="/discovery"`) lowercase.

**Warning signs:** Works locally, breaks in CI/CD pipeline or production deploy.

### Pitfall 6: Type augmentation file silently inert

**What goes wrong:** Editor doesn't autocomplete `navLabel` / `navIcon` in `definePageMeta`; typecheck doesn't catch typos.

**Why it happens:** A `.d.ts` file without any top-level `import` or `export` statement is parsed by TS as an ambient script file (not a module). `declare module` blocks inside script files are ignored.

**How to avoid:** Always include `export {}` (or some other export/import) at the bottom of `app/types/page-meta.d.ts`.

**Warning signs:** `definePageMeta` accepts any key without TS error; no autocomplete for the custom fields.

---

## Code Examples

Verified patterns drawn from Nuxt 4 docs and v0.5.0 source (recovered from git).

### `app/app.vue` — final shape

```vue
<!-- Source: nuxt.com/docs/4.x/directory-structure/app/layouts -->
<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
```

### `app/layouts/default.vue` — full shell

```vue
<!-- Source: composite from v0.5.0 SidebarNav + AppShell (git commit 15d021c~1), upgraded to NuxtLink + UIcon -->
<script setup lang="ts">
const router = useRouter()

const navRoutes = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav === true)
    .sort((a, b) => (a.meta?.navOrder ?? 999) - (b.meta?.navOrder ?? 999))
)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="flex flex-col w-64 h-screen bg-[var(--color-sidebar)] text-white shrink-0">
      <div class="px-6 py-6 border-b border-gray-700">
        <span class="text-lg font-semibold tracking-wide">Schoolday</span>
      </div>

      <ul class="flex-1 py-4 px-3 space-y-1">
        <li v-for="route in navRoutes" :key="String(route.path)">
          <NuxtLink
            :to="route.path"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            active-class="!bg-primary-600 !text-white"
            exact-active-class="!bg-primary-600 !text-white"
          >
            <UIcon
              :name="(route.meta?.navIcon as string) ?? 'i-lucide-circle'"
              class="text-base shrink-0"
            />
            <span>{{ route.meta?.navLabel ?? route.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </aside>

    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
        <span class="text-sm text-gray-700">Lakewood Unified School District</span>
      </header>
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>
```

### `app/types/page-meta.d.ts` — type augmentation

```ts
// Source: nuxt.com/docs/4.x/directory-structure/app/pages#typing-custom-metadata
declare module '#app' {
  interface PageMeta {
    nav?: boolean
    navLabel?: string
    navIcon?: string
    navOrder?: number
  }
}

// Required: must have at least one top-level import or export
// to be treated as a module (not a script file).
export {}
```

### `app/pages/index.vue` — Dashboard stub

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Dashboard',
  navIcon: 'i-lucide-home',
  navOrder: 10,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <p class="text-gray-600 mt-2">District overview. (Phase 11 wires the Top 8 card.)</p>
  </div>
</template>
```

### `app/pages/discovery.vue` — Discovery stub

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">App and domain usage across the district. (Phase 10 wires data.)</p>
  </div>
</template>
```

### `app/pages/dpa.vue` — DPA stub

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'DPA',
  navIcon: 'i-lucide-file-text',
  navOrder: 30,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">DPA</h1>
    <p class="text-gray-600 mt-2">Data Privacy Agreement status by vendor. (Phase 11 wires table + badges.)</p>
  </div>
</template>
```

### `app/pages/risk.vue` — Risk Position stub

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Risk Position',
  navIcon: 'i-lucide-alert-triangle',
  navOrder: 40,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Risk Position</h1>
    <p class="text-gray-600 mt-2">Vendor risk distribution and tier breakdown. (Phase 12 wires donut + table.)</p>
  </div>
</template>
```

### `app/pages/tags.vue` — Tags Management stub

```vue
<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Tags',
  navIcon: 'i-lucide-tag',
  navOrder: 50,
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Tags</h1>
    <p class="text-gray-600 mt-2">Tag groups, child tags, and vendor assignments. (Phase 12 wires CRUD.)</p>
  </div>
</template>
```

**Total Phase 8 code:** Roughly 150 lines across 7 files. Half of that is the layout shell; the other half is 5 nearly-identical page stubs.

---

## State of the Art

| Old Approach (v0.5.0) | Current Approach (v1.0.0) | When Changed | Impact |
|-----------------------|---------------------------|--------------|--------|
| `createRouter({ history: createWebHashHistory('/district-demo/'), routes })` | Nuxt file-based routing via `app/pages/` | Phase 8 | No router file; hash URLs gone; HTML5 history; base path moves to Phase 13 |
| `<RouterLink>` + `<RouterView>` | `<NuxtLink>` + `<NuxtPage>` + `<NuxtLayout>` | Phase 8 | Same active-class API; prefetching added; layout system added |
| `routes[i].meta = { nav: true, label, icon }` in router config | `definePageMeta({ nav, navLabel, navIcon, navOrder })` per page | Phase 8 | Distributed metadata; same data, no central router file |
| PrimeIcons `pi pi-home` class | Iconify Lucide `i-lucide-home` via `<UIcon>` | Phase 7 (packages); Phase 8 (usage) | More icons available (1700+); local server bundle for static deploys |
| `bg-primary` single-shade color | `bg-primary-600` graded color from brand palette | Phase 7 (palette); Phase 8 (usage) | Better contrast control; theme-token consistency |
| Sidebar uses `text-base text-gray-400 hover:bg-gray-800` Tailwind utilities | Same Tailwind utilities (carried forward verbatim) | — | No change; v0.5.0 design preserved |
| `<i class="pi pi-home text-base" />` in nav | `<UIcon name="i-lucide-home" class="text-base shrink-0" />` | Phase 8 | Component-based; `shrink-0` added to prevent icon shrinking when label is long |

**Deprecated/outdated:**

- `createWebHashHistory` — gone (no `vue-router` dep)
- PrimeIcons `pi` classes — gone (no `primeicons` dep)
- v0.5.0's `src/router/index.js` — deleted in Phase 7
- v0.5.0's `src/App.vue` — deleted in Phase 7
- v0.5.0's `src/components/layout/SidebarNav.vue` and `AppShell.vue` — NOT deleted by Phase 8 (they still exist in `src/`); they import PrimeIcons-free Tailwind only (good), but they import `vue-router` (broken since Phase 7 removed it). They are not in any Nuxt scan path, so they don't break the build. Phases 10-12 will delete them as those phases rewrite each view.

---

## Open Questions

None blocking. All ROADMAP success criteria are mappable to concrete verifiable artifacts, and all required APIs (`definePageMeta`, `<NuxtLayout>`, `<NuxtPage>`, `<NuxtLink>`, `useRouter().options.routes`) are documented and verified for Nuxt 4.

**Minor decisions left to plan/execute:**

1. **Active link shade — `primary-500` (exact v0.5.0 value) vs `primary-600` (one darker)** — Recommend `primary-600` for slightly better contrast on dark sidebar; either is defensible. Sales rep visual review would catch any problem in seconds.
2. **Icon size — `text-base` (16px) vs `text-lg` (18px)** — v0.5.0 used `text-base`; recommend matching verbatim.
3. **Inactive link text — `text-gray-400` vs `text-gray-300`** — v0.5.0 used `text-gray-400`; recommend matching verbatim.

None of these are research questions; they're aesthetic micro-tunings that belong in execution, not the plan.

---

## Environment Availability

Phase 8 has no external runtime dependencies beyond what Phase 7 already verified.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Nuxt 4 dev/build (Phase 7 verified) | ✓ | 24.14.0 | — |
| npm | (no new installs needed in Phase 8) | ✓ | 11.9.0 | — |
| `@nuxt/ui@^4.8.0` | `<UIcon>`, `<UApp>` | ✓ (installed Phase 7) | 4.8.0 | — |
| `@nuxt/icon` (auto-installed) | Iconify icons via `i-lucide-*` | ✓ (transitive via @nuxt/ui) | (latest) | — |
| Lucide icon set (`@iconify-json/lucide`) | Sidebar icons | ✓ (bundled by @nuxt/icon at build time, mode: "local") | (latest) | — |
| Git | Commit each phase 8 task | ✓ | (in PATH) | — |

**No blocking gaps. Phase 8 is a pure-code phase — no installs, no new external services.**

---

## Validation Architecture

> Phase 8 enables `workflow.nyquist_validation` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None yet — same as Phase 7 (no Vitest/Playwright installed; deferred to Phase 9 when API routes need integration tests). For Phase 8: `nuxi typecheck`, `nuxi build`, and `nuxi dev` + `curl` smoke probes ARE the test suite. |
| Config file | `tsconfig.json` (extends `.nuxt/tsconfig.json`); no test runner config |
| Quick run command | `npm run typecheck` |
| Full suite command | `npm install && npm run typecheck && npm run build && (npm run dev &); sleep 8; for path in / /discovery /dpa /risk /tags; do curl -s -o /dev/null -w "%{http_code} $path\n" http://localhost:3000$path; done; kill %1` |
| Phase gate | All grep probes pass; typecheck/build exit 0; all 5 routes return HTTP 200 on a clean dev-server boot |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NUXT-04 | No `router/index.ts`, `router.config.ts`, or `vue-router` import exists anywhere | Static (grep) | `! find app/ src/ -name 'router*.ts' -o -name 'router*.js' 2>/dev/null \| grep -qE 'router(/index)?\.(j\|t)s$'` AND `! grep -rE "createRouter\|createWebHistory\|createWebHashHistory" app/ nuxt.config.ts 2>/dev/null` | ✅ Verifiable post-Phase-7 baseline (no such files exist) |
| NUXT-04 | All 5 page files exist | File-exists | `test -f app/pages/index.vue && test -f app/pages/discovery.vue && test -f app/pages/dpa.vue && test -f app/pages/risk.vue && test -f app/pages/tags.vue` | ❌ Wave 0 |
| NUXT-04 | Each page has `definePageMeta` | Static (grep) | `for p in index discovery dpa risk tags; do grep -q "definePageMeta(" "app/pages/$p.vue" \|\| exit 1; done` | ❌ Wave 0 |
| NUXT-04 | Route `/` returns HTTP 200 | Runtime smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200` | ❌ Wave 0 (needs dev server) |
| NUXT-04 | Route `/discovery` returns HTTP 200 | Runtime smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/discovery` → `200` | ❌ Wave 0 |
| NUXT-04 | Route `/dpa` returns HTTP 200 | Runtime smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dpa` → `200` | ❌ Wave 0 |
| NUXT-04 | Route `/risk` returns HTTP 200 | Runtime smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/risk` → `200` | ❌ Wave 0 |
| NUXT-04 | Route `/tags` returns HTTP 200 | Runtime smoke | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/tags` → `200` | ❌ Wave 0 |
| NUXT-04 | Each page's SSR HTML contains page-specific h1 marker | Runtime smoke | `curl -s http://localhost:3000/discovery \| grep -q '<h1[^>]*>Discovery</h1>'` (and same for Dashboard, DPA, Risk Position, Tags) | ❌ Wave 0 |
| LAYOUT-01 | `app/layouts/default.vue` exists | File-exists | `test -f app/layouts/default.vue` | ❌ Wave 0 |
| LAYOUT-01 | `app/app.vue` includes `<NuxtLayout>` and `<NuxtPage />` | Static (grep) | `grep -q '<NuxtLayout>' app/app.vue && grep -q '<NuxtPage' app/app.vue` | ❌ Wave 0 (currently Phase 7 stub) |
| LAYOUT-01 | Sidebar uses `<NuxtLink>`, NOT `<RouterLink>` | Static (grep) | `grep -q '<NuxtLink' app/layouts/default.vue && ! grep -q '<RouterLink' app/layouts/default.vue` | ❌ Wave 0 |
| LAYOUT-01 | Sidebar background uses sidebar var | Static (grep) | `grep -q 'bg-\[var(--color-sidebar)\]' app/layouts/default.vue` | ❌ Wave 0 |
| LAYOUT-01 | All 5 page SSR HTML contains the sidebar marker (proves shell renders on every page) | Runtime smoke | `for p in / /discovery /dpa /risk /tags; do curl -s "http://localhost:3000$p" \| grep -q 'Schoolday' \|\| exit 1; done` (where 'Schoolday' is the sidebar header span text) | ❌ Wave 0 |
| LAYOUT-01 | All 5 page SSR HTML contains the district header marker | Runtime smoke | `for p in / /discovery /dpa /risk /tags; do curl -s "http://localhost:3000$p" \| grep -q 'Lakewood Unified School District' \|\| exit 1; done` | ❌ Wave 0 |
| LAYOUT-01 | All 5 nav items render in the sidebar SSR HTML on any page | Runtime smoke | `curl -s http://localhost:3000/ \| grep -oE '>(Dashboard\|Discovery\|DPA\|Risk Position\|Tags)<' \| sort -u \| wc -l` → `5` | ❌ Wave 0 |
| LAYOUT-01 | Active route highlighting visible on each route (manual visual) | Manual UAT | Open dev server in browser → visit `/discovery` → confirm Discovery nav item has brand-colored bg, others don't → repeat for `/dpa`, `/risk`, `/tags`, `/` | Manual |
| LAYOUT-01 | `app/types/page-meta.d.ts` exists and contains augmentation | File-exists + grep | `test -f app/types/page-meta.d.ts && grep -q "declare module '#app'" app/types/page-meta.d.ts` | ❌ Wave 0 |
| LAYOUT-01 | Type augmentation file has `export {}` to be a module | Static (grep) | `grep -q 'export {}' app/types/page-meta.d.ts` | ❌ Wave 0 |
| NUXT-04+LAYOUT-01 | `nuxi typecheck` clean | Build | `npm run typecheck` → exit 0 | ❌ Wave 0 |
| NUXT-04+LAYOUT-01 | `nuxi build` clean | Build | `npm run build` → exit 0 | ❌ Wave 0 |
| (impl) | No accidental `vue-router` package re-introduced | Static (grep) | `! grep -q '"vue-router"' package.json` | ✅ Phase 7 baseline holds |
| (impl) | No PrimeIcons regression | Static (grep) | `! grep -rE "pi pi-" app/ 2>/dev/null` | ✅ Phase 7 baseline holds (no `pi pi-*` in app/) |

### Sampling Rate

- **Per task commit:** Run grep probes that touch the file(s) the task modified (under 5 seconds total).
- **Per wave merge:** Full grep panel + `npm run typecheck && npm run build`; only spin up dev server + curl probes if both pass.
- **Phase gate:** All 22 grep/file probes pass; typecheck and build both exit 0; dev server boots and all 5 routes return HTTP 200 with the expected SSR markers; manual visual confirmation of active-link highlight on at least 3 routes.

**Sampling justification (Nyquist):** The phase produces 5 distinct routes — sampling all 5 (one curl per route) is the minimum to prove "no 404s" (ROADMAP Success Criterion 1). Sampling the sidebar render on all 5 routes proves persistence (Success Criterion 2). 22 probes total covers every literal claim in the 4 ROADMAP success criteria, with no claim left to "should work."

### Wave 0 Gaps

- [ ] `app/layouts/default.vue` — shell with sidebar nav + header + `<slot />` (LAYOUT-01)
- [ ] `app/pages/index.vue` — Dashboard stub + `definePageMeta` (NUXT-04, LAYOUT-01)
- [ ] `app/pages/discovery.vue` — Discovery stub + `definePageMeta` (NUXT-04, LAYOUT-01)
- [ ] `app/pages/dpa.vue` — DPA stub + `definePageMeta` (NUXT-04, LAYOUT-01)
- [ ] `app/pages/risk.vue` — Risk Position stub + `definePageMeta` (NUXT-04, LAYOUT-01)
- [ ] `app/pages/tags.vue` — Tags Management stub + `definePageMeta` (NUXT-04, LAYOUT-01)
- [ ] `app/types/page-meta.d.ts` — PageMeta interface augmentation + `export {}` (LAYOUT-01 type safety)
- [ ] Modify `app/app.vue` — replace Phase 7 placeholder with `<UApp><NuxtLayout><NuxtPage /></NuxtLayout></UApp>` (LAYOUT-01)
- [ ] Test runner: INTENTIONALLY NOT added in Phase 8; first added in Phase 9 when API routes need integration tests (same rationale as Phase 7).

### Runtime State Inventory

> Phase 8 is a pure-code phase that ADDS files. No renames, no string replacements affecting stored data, and no migration of existing state.

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| **Stored data** | None — no databases, no localStorage keys created or renamed. (Tags-store localStorage key `tags` was set in Phase 7 and is unaffected.) | None |
| **Live service config** | None — no external services connected (demo is fully client-side, mocked data). | None |
| **OS-registered state** | None — no scheduled tasks, no system services, no port registrations. | None |
| **Secrets/env vars** | None — no env vars introduced or referenced in Phase 8. | None |
| **Build artifacts** | `.nuxt/` and `.output/` from Phase 7 — Nuxt regenerates these automatically on `npm install` / `npm run build`. New `.nuxt/types/` entries will appear for the 5 page routes after first `nuxi prepare` post-edits. | None — auto-regenerated. If editor shows red squigglies on route names, run `npx nuxi prepare`. |

---

## Sources

### Primary (HIGH confidence)

- **Nuxt 4 docs:**
  - `https://nuxt.com/docs/4.x/getting-started/routing` — file-based routing fundamentals
  - `https://nuxt.com/docs/4.x/directory-structure/app/pages` — pages directory + typing custom metadata
  - `https://nuxt.com/docs/4.x/directory-structure/app/layouts` — layouts dir + `<NuxtLayout>` requirement
  - `https://nuxt.com/docs/4.x/api/utils/define-page-meta` — `definePageMeta` API
  - `https://nuxt.com/docs/4.x/api/composables/use-router` — `useRouter()` returns Vue Router instance
  - `https://nuxt.com/docs/4.x/api/components/nuxt-link` — `<NuxtLink>` active-class / exact-active-class
- **Nuxt UI v4 docs:**
  - `https://ui.nuxt.com/docs/components/navigation-menu` — UNavigationMenu, vertical orientation, manual active state
  - `https://ui.nuxt.com/docs/components/sidebar` — USidebar component (introduced v4.6.0)
- **Lucide icons:** `https://lucide.dev/icons/` — verified icon names exist
- **Project git history:** v0.5.0 SidebarNav.vue (commit `15d021c~1`) — exact sidebar HTML and colors
- **Phase 7 RESEARCH.md** — Nuxt UI v4 + `@nuxt/icon` + `@nuxt/ui` module integration verified
- **Phase 7-02 SUMMARY.md** — confirms current `app/app.vue` state, current `nuxt.config.ts`, current `main.css`

### Secondary (MEDIUM-HIGH confidence)

- **Nuxt skill `core-routing.md`** — confirms file-based routing patterns
- **Nuxt skill `features-components.md`** — confirms NuxtLink/NuxtPage/NuxtLayout API
- **Nuxt skill `core-directory-structure.md`** — confirms Nuxt 4 `app/` layout
- **`https://github.com/nuxt/ui/releases/tag/v4.6.0`** — USidebar component existence in v4
- **AnswerOverflow + community posts on UNavigationMenu active route** — confirm manual `active:` requirement for UNavigationMenu (multiple sources agree)

### Tertiary (LOW confidence — none)

No LOW-confidence claims in this research.

---

## Metadata

**Confidence breakdown:**
- File-based routing mechanics: **HIGH** — Nuxt docs primary source, skill reference confirms
- `definePageMeta` + type augmentation: **HIGH** — Nuxt docs primary source, two URLs cross-verified
- `<NuxtLayout>`/`<NuxtPage>` requirement: **HIGH** — Nuxt docs explicit; confirmed via WebFetch
- `<NuxtLink>` active-class behavior: **HIGH** — Nuxt docs + Vue Router defaults
- Handrolled list vs UNavigationMenu choice: **HIGH** — UNavigationMenu manual-active behavior confirmed via two sources
- v0.5.0 color migration: **HIGH** — exact source recovered from git
- Lucide icon names: **HIGH** — verified against lucide.dev
- Tailwind v4 utility behavior for non-graded vars: **MEDIUM-HIGH** — recommend the conservative arbitrary-value form; the utility-shortcut may also work
- Pitfalls: **HIGH** — all pitfalls cite primary sources

**Research date:** 2026-05-21
**Valid until:** 2026-06-21 (Nuxt 4 + @nuxt/ui v4 are stable releases; major behaviors unlikely to change within 30 days. Re-verify before any phase that depends on different routing semantics.)
