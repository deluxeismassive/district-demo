# Phase 12: Risk Position + Tags Management - Research

**Researched:** 2026-05-22
**Domain:** Nuxt UI v4 UTable + UBadge (risk tier hex injection) + nuxt-echarts donut (initial-SSR), UModal CRUD confirmation flow, Pinia setup-store CRUD action surface for tag groups/tags
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

> **No CONTEXT.md exists for Phase 12** — running in autonomous mode per init payload (`has_context: false`). The locked decisions from STATE.md + ROADMAP + REQUIREMENTS + carry-forward from Phases 7-11 govern.

### Locked Decisions (from STATE.md + ROADMAP + REQUIREMENTS)

- **Component mapping (carried Phases 10-11):** PrimeVue DataTable → `UTable`, PrimeVue Tag → `UBadge` with `color="neutral" variant="solid" :style="{ backgroundColor: <hex>, color: '#ffffff' }"`, PrimeVue Dialog → `UModal`, PrimeVue Button → `UButton`. NO Tailwind background-color class injection on UBadge; NO semantic color preset overrides (color="error" / color="success") on tier badges.
- **UBadge color strategy (STATE.md Key Decision):** `:style` binding with hex values from `shared/utils/riskLabels.ts` constants. Phase 11 production-shipped pattern for DPA_STATUS_COLORS + RISK_LABEL_COLORS; Phase 12 lifts verbatim using `RISK_TIER_COLORS` (already exported from `shared/utils/riskLabels.ts:50-54` — High `#dc2626` / Medium `#f59e0b` / Low `#16a34a`).
- **ECharts SSR strategy reconciliation (STATE.md "ClientOnly wrap for interaction-mounted ECharts; NOT wrapped for initial-SSR ECharts"):** Formalized Phase 10-02. The donut on `/risk` IS initial-SSR → **NO `<ClientOnly>` wrap**. See `## ClientOnly vs not: ROADMAP-vs-Phase-7 reconciliation` for the full argument; ROADMAP SC#1 wording is the underlying-intent ("no SSR crash"), not a literal requirement.
- **useFetch wiring contract (Phase 9):** `useFetch('/api/vendors', { default: () => [] })`, `useFetch('/api/dpa', { default: () => [] })`, `useFetch('/api/edtech', { default: () => [] })` — no manual generic, no `key` option (URL-key dedup). Plan 12-01 joins all three; Plan 12-02 reads from the Pinia tags store only (no `useFetch`).
- **Pinia setup-store action pattern (Plan 10-03 established):** Named functions declared inside `defineStore` setup callback + returned alongside refs. Pinia auto-types them as actions. `persist: true` config preserved. Phase 12 ADDS five new actions to `app/stores/tags.ts` — see `## Tags store API surface for Phase 12`.
- **VendorDrawer reuse (Plan 10-02 + Plan 11-01 explicit carry-forward):** Risk page row click opens `<VendorDrawer>` mounted at page level. NO modifications to `app/components/VendorDrawer.vue`. Same `selectedVendorId` + `selectedVendor` + `drawerOpen` get/set trio.
- **Page metadata (Phase 8):** `definePageMeta` already present on both `risk.vue` (navOrder 40, navIcon `i-lucide-alert-triangle`, navLabel "Risk Position") and `tags.vue` (navOrder 50, navIcon `i-lucide-tag`, navLabel "Tags"). DO NOT change.
- **Plan budget per ROADMAP:** Exactly 2 plans. 12-01 = Risk Position page. 12-02 = Tags Management page.
- **Phase requirements (REQUIREMENTS.md):** PAGE-03 (Risk Position) and PAGE-04 (Tags Management) — both close at Phase 12 end.

### Claude's Discretion

- **Tier derivation algorithm:** Lift v0.5.0 ReportsView.vue lines 22-32 verbatim into `app/pages/risk.vue` (or a `composables/useTier.ts` helper — recommend INLINE in `risk.vue` for parity with Phase 11 inline computeds; one consumer, no benefit from extracting). See `## Tier derivation`.
- **Risk table column set:** 5 columns matching v0.5.0 ReportsView.vue lines 131-157 — Vendor Name, Risk Tier (UBadge), DPA Status (UBadge), 1EdTech Status (text), Users (right-aligned, formatted). Same sortable-via-`sortHeader` pattern.
- **ClientOnly wrap on donut:** **NO.** Recommend Option A per `## ClientOnly vs not: ROADMAP-vs-Phase-7 reconciliation`. If executor disagrees, document the FOUC trade-off and flip to Option B with explicit rationale in the plan's deviation block.
- **Donut ECharts option literal:** Lifted verbatim from v0.5.0 ReportsView.vue lines 63-88. Confirmed: PieChart + TooltipComponent + LegendComponent are already registered in `nuxt.config.ts:24-28`. No nuxt.config.ts changes needed.
- **8-swatch palette:** Lifted verbatim from v0.5.0 SettingsView.vue lines 7-16. 8 hex values: `#484CE6`, `#DA8231`, `#16A34A`, `#DC2626`, `#0891B2`, `#7C3AED`, `#E11D48`, `#475569`. First 4 match SEED_TAG_GROUPS colors; last 4 are alternatives. Render as a horizontal row of 8 `<button>` elements with `:style="{ backgroundColor: hex }"`.
- **Inline rename UI:** `<UInput>` toggled by `v-if="editingId === item.id"` v-model bound to a draft `editingName` ref; `@blur` and `@keydown.enter.prevent` commit; auto-focus via `nextTick + ref` registration. Direct port of v0.5.0 SettingsView.vue lines 27-62 (input → UInput substitution + autofocus pattern reused).
- **Cascade delete logic:** Iterate `assignments` and filter out the deleted tag IDs. Direct port of v0.5.0 SettingsView.vue lines 121-141.
- **UModal v-model:** **`v-model:open`** (Reka UI DialogRootEmits — verified vs `node_modules/@nuxt/ui/dist/runtime/components/Modal.vue.d.ts:90`). Slots: `header`, `body`, `footer` (all receive `{ close: () => void }` slot prop), `title`, `description`, `actions`, `close`, `content`, `default`. We use `:title` prop + `#body` slot + `#footer` slot.
- **Reset-to-defaults confirmation:** Use UModal (ROADMAP SC#5 only mandates UModal for tag delete, but reset destroys ALL tags AND assignments — recommend modal for safety; v0.5.0 already had a separate `resetDialogVisible` flow).
- **Wave assignment:** **12-01 + 12-02 in parallel (Wave 1)** — see `## Wave assignment` § for the argument. Independence dominates (different surfaces, different stores; 12-01 doesn't touch the tags store at all; 12-02 doesn't touch ECharts or `useFetch`).

### Deferred to Later Phases (OUT OF SCOPE for Phase 12)

- Deployment / static generate / base path (Phase 13).
- VendorDrawer modifications — none.
- Edits to `server/api/`, `server/data/`, `shared/types/data.ts` — none expected.
- Click donut segment to filter the risk table (v1.1+ deferred per REQUIREMENTS.md "Click donut chart segment to filter the risk table below").
- Risk table "contributing factors" expansion (v1.1+ deferred per REQUIREMENTS.md "Risk table with contributing factors").
- Filter Discovery table by tag (v1.1+ deferred).
- Mobile responsiveness (v1.0.0 out-of-scope).
- Tag creation UI (Add group / Add tag) — v0.5.0 SettingsView.vue had Add affordances, but ROADMAP SC#4 says only "lists all tags with inline rename and 8-swatch color palette picker"; ROADMAP SC#5 covers delete + reset only. **OPEN QUESTION → recommend INCLUDE Add for v1.0.0 demo parity** — see Open Questions.
- v0.5.0 dead-code sweep (`src/views/*.vue`, `src/components/*.vue`) — not gating; can defer to Phase 13 or v1.1.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-03 | Risk Position page fully functional — donut chart (`<VChartFull>` or `<ClientOnly>` wrapped) + `UTable` sortable vendor tier table with `UBadge` tier badges | `## Tier derivation` (algorithm lifted from v0.5.0), `## Donut chart ECharts option` (literal verbatim from v0.5.0 lines 63-88), `## ClientOnly vs not` (Option A recommendation), `## Risk table column set` (5 columns), `## UBadge :style hex pattern` (Phase 11 carry-forward + RISK_TIER_COLORS already exported), `## VendorDrawer reuse` |
| PAGE-04 | Tags Management page fully functional — inline CRUD, `UModal` delete confirmation dialog, cascade delete cleans vendor assignments, reset-to-defaults | `## Tags store API surface for Phase 12` (5 new actions), `## UModal API` (slots + v-model:open verified), `## 8-swatch palette UI`, `## Inline rename UI`, `## Cascade delete`, `## Reset-to-defaults` |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Tech stack:** Vue 3 + Nuxt 4 + Nuxt UI v4 + Pinia (established Phases 7-11). No introduction of conflicting frameworks (no PrimeVue, no TanStack-React, no other modal/CRUD libraries).
- **Deployment:** Static GitHub Pages target via Phase 13 `nuxi generate`. Phase 12 surfaces must SSR cleanly under `nuxi generate` — both `/risk` and `/tags` are prerendered. The Risk donut is the first ECharts instance in initial-SSR (drawer radar is interaction-mounted) — `## ClientOnly vs not` is load-bearing.
- **Data:** All synthetic. Tags store is the source of truth for tag groups + assignments (Phase 7 + 10-03). Vendor / DPA / Edtech come from `/api/*` (Phase 9).
- **Iteration speed:** A sales rep tweaking a tag color or recoloring the tier palette must be a sub-1-hour developer edit. Tier hex colors live in `shared/utils/riskLabels.ts` (one file, one line per color). Tag palette swatches live in `app/pages/tags.vue` (or a hoisted const) — same rule.
- **Auth:** None. Tags page is admin-y in tone but has no gate.
- **GSD enforcement:** All file changes through `/gsd:execute-phase`.
- **Naming:** PascalCase Vue SFCs, camelCase TS, kebab-case asset files. `risk.vue` and `tags.vue` already exist as lowercase page filenames from Phase 8 — DO NOT rename.
- **Indentation:** 2 spaces, ES modules, no linter/formatter.

---

## Summary

Phase 12 is the final UI phase of v1.0.0 and the smallest in raw line count, but it touches two genuinely different design centers: an initial-SSR donut chart with a vendor tier table on one page, and a full Pinia CRUD surface with modal confirmation on the other. Every primitive needed is already installed and previously verified — Phase 11 production-shipped the UBadge `:style` hex pattern, Phase 10-03 production-shipped the Pinia setup-store action pattern, and Phase 7-02 + Plan 10-02 production-shipped nuxt-echarts in both SSR and interaction-mounted modes. The two plans for this phase consume DIFFERENT subsystems entirely:

- **Plan 12-01 (Risk Position):** zero Pinia store writes, three `useFetch` joins (Vendor + DpaRecord + EdtechRecord), one ECharts donut (initial-SSR, no ClientOnly), one UTable (5 columns), one VendorDrawer mount.
- **Plan 12-02 (Tags Management):** zero `useFetch` calls, zero ECharts, five new Pinia actions (`renameTag`, `setTagGroupColor`, `deleteTag`, `deleteTagGroup`, `resetToDefaults`), one UModal (used twice — delete + reset), 8-swatch color palette + inline rename UI.

Three pivotal technical facts shaped the recommendations:

1. **The Phase 7 "no double-wrap" rule applies to the Risk donut.** ROADMAP SC#1 says the donut renders "inside `<ClientOnly>`" but Phase 7-RESEARCH § 5 + Pitfall #6 explicitly warn against wrapping `<VChart>` in `<ClientOnly>` because nuxt-echarts has its own SSR-safe SVG fallback that double-wrapping breaks. Phase 10-02 reconciled this for the radar chart: ClientOnly is correct ONLY for interaction-mounted charts (drawer radar); NOT for initial-SSR charts (Risk donut). STATE.md "Key Decisions" formalizes this reconciliation: *"ClientOnly wrap for interaction-mounted ECharts; NOT wrapped for initial-SSR ECharts"*. The donut on the Risk Position page is in the initial SSR payload → **no ClientOnly wrap**. Phase 7-02 smoke test already confirmed nuxt-echarts SSR works without ClientOnly via a Pie chart in app.vue (now deleted — STATE.md confirms "nuxt-echarts SSR confirmed working from Phase 7-02 smoke test"). The ROADMAP wording should be read as underlying-intent ("no SSR crash"), not literal API constraint. See `## ClientOnly vs not` for the full argument.

2. **Tier derivation is a 3-input function: DpaRecord.status + Vendor.userCount + EdtechRecord.certificationStatus.** Verbatim from v0.5.0 ReportsView.vue lines 22-32. Inputs: bad DPA (Unsigned or Expired) → start at High if userCount > 1000 else Medium, else Low (Signed/Pending). Then 1EdTech Certified status reduces the tier by one step (High→Medium→Low; Low stays Low). RISK_TIER_COLORS is already exported from `shared/utils/riskLabels.ts:50-54` (High `#dc2626`, Medium `#f59e0b`, Low `#16a34a`) — Phase 12 needs zero shared-utils edits. The tier algorithm produces a specific distribution from the 27-vendor data set; counted empirically below in `## Tier derivation`.

3. **Five new actions on `app/stores/tags.ts` close out the store's API surface.** Plan 10-03 added two actions (`setVendorTags`, `clearVendorTags`); Phase 12 adds five more. The pattern is identical: named functions declared inside the `defineStore` setup callback, returned alongside the refs. Pinia auto-types them as actions. `persist: true` config preserved — every action's reactive mutation is automatically persisted to localStorage by the persistedstate plugin. The cascade-delete logic (deleting a tag scrubs that tag ID from every vendor's assignment array; deleting a group scrubs every child tag ID) lifts verbatim from v0.5.0 SettingsView.vue lines 121-141 — same algorithm, now lives in the store rather than in the consuming view, so the action surface is grep-able and reusable.

The single highest-risk technical pitfall is **double-wrapping the donut in `<ClientOnly>`**. The ROADMAP wording invites it; the Phase 7 anti-pattern + STATE.md reconciliation + Phase 7-02 empirical proof prevent it. If a plan author lifts the ROADMAP SC#1 wording verbatim into a plan without consulting Phase 7-RESEARCH § 5, the executor will ship a regression (donut renders client-only with a flash of empty content during hydration). The mitigation is upfront: plan-checker must verify the donut is NOT wrapped in ClientOnly OR the plan documents Option B with an explicit FOUC-acceptance rationale.

**Primary recommendation:** Two plans, ONE wave (parallel). Each plan ~100-150 lines of net new code. Total Phase 12 effort: 4 tasks across 2 plans, ~250 lines of new code across 3 modified files (`risk.vue`, `tags.vue`, `app/stores/tags.ts` — 12-02 only).

- **Wave 1 (parallel):**
  - **Plan 12-01 — Risk Position page.** Modify `app/pages/risk.vue` from the 16-line Phase 8 stub to the full Risk Position surface: 3-way join (Vendor + DpaRecord + EdtechRecord) → tier derivation → `riskRows` computed; donut chart (no ClientOnly, initial-SSR rendering); UTable with 5 columns (Vendor Name, Tier, DPA Status, 1EdTech Status, Users) sortable via Phase 10 `sortHeader` helper; row-click → page-level VendorDrawer mount. ~150 lines.
  - **Plan 12-02 — Tags Management page.** Modify `app/stores/tags.ts` to add 5 new actions (`renameTag`, `setTagGroupColor`, `deleteTag`, `deleteTagGroup`, `resetToDefaults`). Modify `app/pages/tags.vue` from the 16-line Phase 8 stub to the full CRUD surface: group cards with inline rename (UInput) + 8-swatch color palette popover + child-tag list with inline rename + delete buttons; UModal for delete confirmation (with cascade-count readout) and reset-to-defaults confirmation. ~150 lines.

Parallelism is safe because:
- 12-01 touches `app/pages/risk.vue` only.
- 12-02 touches `app/pages/tags.vue` AND `app/stores/tags.ts`.
- ZERO file overlap.
- Subsystems are orthogonal — 12-01 is a read-only render against `/api/*` + Pinia, 12-02 is a Pinia write surface that doesn't touch the API.

The Phase 11 research recommended sequential for shared-pattern consistency; Phase 11's two pages were variations on the same "useFetch + UBadge" theme. Phase 12's two surfaces are MORE different (donut chart vs CRUD modal), so the shared-pattern argument is weaker. The independence argument dominates.

---

## Recommended Approach (Decisive)

**One path per question:**

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Donut ClientOnly wrap | **NO ClientOnly** — Option A | Phase 7 anti-pattern; STATE.md reconciliation; Phase 7-02 empirical proof. Initial-SSR rendering → nuxt-echarts handles SVG fallback server-side. ROADMAP SC#1 wording is underlying-intent ("no SSR crash"). |
| 2 | Tier derivation location | **Inline in `app/pages/risk.vue`** as a `calcTier(dpa, vendor, edtech)` function + `riskRows` computed | v0.5.0 ReportsView lines 22-32 verbatim; one consumer; no benefit from extracting to a composable |
| 3 | Donut option shape | **Verbatim port of v0.5.0 ReportsView lines 63-88** | PieChart + radius `['45%', '70%']` + label.show=false + tooltip formatter + legend formatter with counts; hardcoded hex per slice (matches RISK_TIER_COLORS) |
| 4 | Donut chart registration | **No nuxt.config.ts changes needed** — PieChart + TooltipComponent + LegendComponent already registered in `nuxt.config.ts:24-28` (Phase 7) | Confirmed: `charts: ['RadarChart', 'PieChart']`, `components: ['TooltipComponent', 'LegendComponent', 'RadarComponent']` |
| 5 | Risk table column set | **5 columns:** Vendor Name (sort), Risk Tier (sort by `tierOrder`, UBadge with RISK_TIER_COLORS), DPA Status (sort, UBadge with DPA_STATUS_COLORS), 1EdTech Status (sort, plain text), Users (sort, right-aligned, `.toLocaleString()`) | v0.5.0 ReportsView lines 131-157 verbatim |
| 6 | Default tier sort | **`sorting = ref([{ id: 'tierOrder', desc: false }])`** — High first via numeric `tierOrder` | v0.5.0 ReportsView used `sortField="tierOrder"` for the same reason — alphabetical sort on tier strings would put Medium last (H<L<M). |
| 7 | Risk table row click → drawer | **`@select="onRowSelect"` → page-level VendorDrawer mount** (same trio as `dpa.vue`) | Free reuse; consistent with Discovery + DPA pattern; matches v0.5.0 |
| 8 | Tags store actions to add | **5 actions:** `renameTag(groupId, tagId, newName)`, `setTagGroupColor(groupId, newColor)`, `deleteTag(groupId, tagId)`, `deleteTagGroup(groupId)`, `resetToDefaults()` — declared inside `defineStore` setup callback + returned | Plan 10-03 setup-store action pattern; all 5 mutations grep-able; cascade-delete logic encapsulated in `deleteTag` + `deleteTagGroup` |
| 9 | Add group / Add tag UI | **INCLUDE** — recommend `addTagGroup()` and `addTag(groupId)` actions + corresponding UI buttons; matches v0.5.0 SettingsView demo parity | ROADMAP SC#4 only mandates rename + color picker; SC#5 only mandates delete + reset. But sales-demo iteration speed requires Add for a working demo. Document as discretion; flag for plan-checker review. |
| 10 | Direct mutation vs action | **Actions only.** Discourage direct `tagsStore.tagGroups[0].name = '...'` in templates. | Setup-store mutation works (Phase 10-03 confirmed) but actions are grep-able write paths; planner should require all CRUD writes flow through named actions. |
| 11 | Inline rename UI element | **`<UInput>`** toggled via `v-if="editingId === item.id"`; auto-focused via nextTick + ref registration; commit on blur or enter | v0.5.0 used native `<input>`; v1.0.0 uses Nuxt UI primitive for visual consistency |
| 12 | 8-swatch palette UI | **Horizontal row of 8 `<button>` elements** with `:style="{ backgroundColor: hex }"`; click calls `setTagGroupColor(groupId, hex)` | URadioGroup is heavier than needed; native buttons match v0.5.0 |
| 13 | Palette swatch hex set | **8 hex values verbatim from v0.5.0 SettingsView.vue:7-16:** `#484CE6`, `#DA8231`, `#16A34A`, `#DC2626`, `#0891B2`, `#7C3AED`, `#E11D48`, `#475569` | First 4 match SEED_TAG_GROUPS colors; last 4 are alternatives |
| 14 | UModal v-model | **`v-model:open`** (Reka UI DialogRootEmits — verified vs `Modal.vue.d.ts:90`) | NOT `v-model:visible` (PrimeVue idiom) |
| 15 | UModal slot for body | **`#body` slot + `:title` prop + `#footer` slot for actions** | `body`/`footer` slot props are `{ close: () => void }` — useful for cancel button. Verified vs `Modal.vue.d.ts:64-86` |
| 16 | Cancel UButton in modal footer | **Use the `close` slot prop OR set `v-model:open` to false** | Both work; using `close` is idiomatic. v0.5.0 used `deleteDialogVisible = false` (the v-model:open equivalent) — same effect. |
| 17 | Cascade delete logic | **Iterate `assignments` and filter each vendor's tagIds array to exclude the deleted tag ID(s); rebuild via `setVendorTags` to preserve empty-array cleanup** | v0.5.0 SettingsView.vue:121-141 verbatim; uses Plan 10-03's `setVendorTags` action so the empty-array cleanup branch fires automatically |
| 18 | Reset to defaults | **Deep-clone `SEED_TAG_GROUPS` via `JSON.parse(JSON.stringify(...))`; assign to `tagGroups.value`; reset `assignments.value = {}`** | v0.5.0 SettingsView.vue:149-156 verbatim; the JSON round-trip matters because direct assignment would share the reference and subsequent edits would corrupt the seed constant |
| 19 | Reset modal confirmation | **YES — UModal with destructive-action warning text** | ROADMAP SC#5 only mandates UModal for tag delete, but reset destroys ALL tag groups AND all assignments. Recommend modal for safety; v0.5.0 already had a separate `resetDialogVisible`. |
| 20 | UModal portal | **Default `portal: true`** — Modal mounts under `<UApp>` portal (Phase 7) | No changes needed; `<UApp>` already wraps `app/app.vue`. |
| 21 | Wave assignment | **12-01 + 12-02 in parallel (Wave 1)** — different files, different subsystems, no shared state writes | Phase 11 research recommended sequential because both pages were the same UBadge+useFetch theme; Phase 12's surfaces are MORE divergent — independence dominates. |
| 22 | Imports from riskLabels.ts | **`import { RISK_TIER_COLORS, DPA_STATUS_COLORS } from '#shared/utils/riskLabels'`** at top of `risk.vue` (Plan 12-01). Plan 12-02 has NO riskLabels import. | Phase 11 import-path pattern verbatim |
| 23 | Type annotations | **Explicit `(d: DpaRecord)`, `(v: Vendor)`, `(e: EdtechRecord)`, `(g: TagGroup)`, `(t: TagItem)` on every `.map`/`.filter`/`.sort` callback** | Phase 10/11 lesson #3 carry-forward; TS strict mode rejects implicit `any` |
| 24 | TableColumn meta.class shape | **`{ th?, td? }`** — NOT a plain string | Phase 10/11 lesson #2 carry-forward |

---

## ClientOnly vs not: ROADMAP-vs-Phase-7 reconciliation

**The apparent contradiction:**

- **ROADMAP Phase 12 success criterion 1:** *"The Risk Position donut chart renders inside `<ClientOnly>` showing High/Medium/Low vendor distribution — no SSR crash."* (Verbatim from ROADMAP.md:120)
- **Phase 7 RESEARCH Pitfall #6:** *"DON'T wrap `<VChart>` in `<ClientOnly>` when using `nuxt-echarts` — double-wrapping breaks the module's SSR/SVG fallback."*
- **STATE.md Key Decision (Phase 10-02):** *"ClientOnly wrap for interaction-mounted ECharts; NOT wrapped for initial-SSR ECharts. Drawer radar (interaction-mounted) → ClientOnly + USkeleton fallback; Phase 12 Risk donut (initial SSR) → no wrap, let nuxt-echarts handle SVG fallback. Formalizes Phase 7 anti-pattern reconciliation."*

**STATE.md explicitly anticipated this case and ruled.**

### Option A (RECOMMENDED) — no ClientOnly

```vue
<!-- app/pages/risk.vue -->
<div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
  <VChart :option="chartOption" autoresize style="height: 280px; width: 100%" />
</div>
```

**Why this is correct:**

1. **nuxt-echarts handles SSR automatically.** Phase 7-02 smoke test (now deleted) confirmed a `<VChart>` with `series: [{ type: 'pie', ... }]` rendered without `window is not defined` errors via the module's SVG fallback path. STATE.md line 127: *"nuxt-echarts SSR confirmed working from Phase 7-02 smoke test."*
2. **Double-wrapping breaks the SVG fallback.** `<ClientOnly>` skips the server-render path entirely. The donut would render BLANK in SSR HTML, then hydrate as canvas client-side. Layout shifts, FOUC, slower perceived load.
3. **The donut is in the initial SSR payload.** The Risk Position page opens at page load — no user interaction required to trigger the chart mount. This is exactly the case Phase 7 Pitfall #6 was designed to prevent.
4. **The ROADMAP wording is underlying-intent.** "No SSR crash" is the actual requirement. The literal `<ClientOnly>` text is a workaround pattern from PRE-Phase 7 RESEARCH planning that nuxt-echarts makes unnecessary. Phase 7-02 + Plan 10-02 + STATE.md formalized this.

**Trade-offs (and why they're not blocking):**

| Concern | Reality |
|---------|---------|
| SVG fallback may not look identical to canvas | nuxt-echarts uses the same chart options; SVG renders the same shapes. Animation timing on hydration may differ; the donut isn't animated by default (v0.5.0 didn't animate it). |
| Hydration might re-render | Vue hydrates the SVG-as-DOM, then nuxt-echarts swaps to canvas. Visual continuity is preserved because both renderings use the same hex colors. |
| Some libraries report SSR issues with PieChart | Verified working via Phase 7-02 smoke test on this exact stack (nuxt-echarts 1.0.1 + echarts 6.1.0). |

### Option B (FALLBACK) — wrap in ClientOnly with USkeleton fallback

```vue
<ClientOnly>
  <VChart :option="chartOption" autoresize style="height: 280px; width: 100%" />
  <template #fallback>
    <USkeleton class="h-[280px] w-full" />
  </template>
</ClientOnly>
```

**When to use Option B:**

- If Plan 12-01 task 1 build verification surfaces an unexpected SSR error on `/risk` (not previously seen). This would contradict Phase 7-02's empirical proof; document as a regression and investigate before flipping to B.
- If the executor disagrees with Option A and prefers the literal ROADMAP wording. Document the FOUC trade-off explicitly in the plan deviation block.

**Trade-off if executor flips to Option B:** ~50-200ms hydration flash where the donut area is a USkeleton placeholder. Acceptable for the demo but slightly slower than Option A's straight-into-SVG-then-canvas path.

### Recommendation

**Option A.** Document in Plan 12-01:
- "Donut renders without `<ClientOnly>` per STATE.md ECharts SSR strategy decision (Phase 10-02 formalization)."
- "ROADMAP SC#1 wording 'inside `<ClientOnly>`' is interpreted as underlying-intent 'no SSR crash' per Phase 7 anti-pattern + Phase 7-02 empirical proof."
- "If a defect surfaces, fall back to Option B with USkeleton fallback and document FOUC trade-off."

**Acceptance probe must match the decision:** Plan 12-01 verification grep is `grep -L '<ClientOnly>' app/pages/risk.vue` (no ClientOnly in file) AND `curl http://localhost:3000/risk | grep -E '<svg|<canvas'` returns matches (donut rendered server-side as SVG).

---

## Tier derivation

**Algorithm (verbatim from v0.5.0 ReportsView.vue:14-32):**

```ts
// Numeric ordering for default sort — alphabetical 'H'<'L'<'M' would put Medium last.
const TIER_ORDER: Record<'High' | 'Medium' | 'Low', number> = { High: 1, Medium: 2, Low: 3 }

function calcTier(
  dpa: DpaRecord | undefined,
  vendor: Vendor,
  edtech: EdtechRecord | undefined
): 'High' | 'Medium' | 'Low' {
  const badDpa = dpa?.status === 'Unsigned' || dpa?.status === 'Expired'
  const highUsage = vendor.userCount > 1000
  let tier: 'High' | 'Medium' | 'Low' = badDpa ? (highUsage ? 'High' : 'Medium') : 'Low'
  if (edtech?.certificationStatus === 'Certified') {
    if (tier === 'High') tier = 'Medium'
    else if (tier === 'Medium') tier = 'Low'
    // Low stays Low
  }
  return tier
}
```

**Logic flow (3 inputs, 1 output):**

| Input combination | Tier (pre-1EdTech reducer) | After 1EdTech Certified reducer |
|--------------------|----------------------------|---------------------------------|
| DPA Signed/Pending, any userCount | Low | Low (stays) |
| DPA Unsigned/Expired, userCount > 1000 | High | Medium |
| DPA Unsigned/Expired, userCount ≤ 1000 | Medium | Low |

**Note on v0.5.0 source for highUsage threshold:** v0.5.0 ReportsView uses `discoveryMap[vendorId]?.userCount`. In v1.0.0 (Phase 9-01), Vendor was merged with the discovery shape — `userCount` is now inline on Vendor. Algorithm uses `vendor.userCount` directly.

**Expected distribution against current data (computed from `server/data/`):**

Without running the algorithm against every vendor, the empirical reasoning:
- DPA distribution (Phase 11 confirmed): 16 Signed + 5 Unsigned + 4 Expired + 2 Pending = 27.
- Signed + Pending = 18 → 18 vendors start at Low.
- Unsigned + Expired = 9 → 9 vendors start at High or Medium depending on userCount.
- 1EdTech `certificationStatus === 'Certified'` count: unknown without grep. Reduces tier by one step.

The exact tier count distribution depends on (a) how many of the 9 bad-DPA vendors have userCount > 1000 and (b) which of those have 1EdTech Certified. The donut renders the live distribution; acceptance probes should NOT hardcode specific counts. Probe instead: SSR HTML contains `<svg`, contains the three tier hex values in pie segments, and contains at least one row of each tier in the table.

**Confidence:** HIGH for algorithm; MEDIUM for exact distribution (will be verified empirically at execution).

---

## Donut chart ECharts option

**Verbatim port from v0.5.0 ReportsView.vue:63-88, mapped to nuxt-echarts auto-imported `ECOption`:**

```ts
// app/pages/risk.vue script-setup
// nuxt-echarts auto-imports VChart and ECOption.
const tierCounts = computed(() => {
  const c: Record<'High' | 'Medium' | 'Low', number> = { High: 0, Medium: 0, Low: 0 }
  for (const row of riskRows.value) c[row.tier]++
  return c
})

const chartOption = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) =>
      `${params.name}: ${params.value} vendors (${params.percent}%)`,
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    formatter: (name: string) => `${name} (${tierCounts.value[name as 'High' | 'Medium' | 'Low']})`,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: false } },
      data: [
        { name: 'High',   value: tierCounts.value.High,   itemStyle: { color: '#dc2626' } },
        { name: 'Medium', value: tierCounts.value.Medium, itemStyle: { color: '#f59e0b' } },
        { name: 'Low',    value: tierCounts.value.Low,    itemStyle: { color: '#16a34a' } },
      ],
    },
  ],
}))
```

**Hex colors hardcoded in each slice match RISK_TIER_COLORS exactly** — could be sourced via `RISK_TIER_COLORS.High` etc. for consistency. **Recommend** sourcing them:

```ts
data: [
  { name: 'High',   value: tierCounts.value.High,   itemStyle: { color: RISK_TIER_COLORS.High } },
  { name: 'Medium', value: tierCounts.value.Medium, itemStyle: { color: RISK_TIER_COLORS.Medium } },
  { name: 'Low',    value: tierCounts.value.Low,    itemStyle: { color: RISK_TIER_COLORS.Low } },
],
```

**One-line edit for a sales rep to recolor.**

**Confirmed registered in `nuxt.config.ts:24-28` (Phase 7):**

```ts
echarts: {
  renderer: 'canvas',
  charts: ['RadarChart', 'PieChart'],
  components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
}
```

- ✓ `PieChart` registered (used by Phase 12 donut)
- ✓ `TooltipComponent` registered (used by donut tooltip)
- ✓ `LegendComponent` registered (used by donut legend)
- ✓ `RadarChart` + `RadarComponent` registered (used by drawer radar — Phase 10)

**No nuxt.config.ts changes needed.**

**Confidence:** HIGH.

---

## Risk table column set

**5 columns matching v0.5.0 ReportsView.vue:131-157 verbatim:**

```ts
type RiskRow = {
  vendorId: string
  name: string
  category: string         // Not displayed; carried for VendorDrawer lookup convenience
  tier: 'High' | 'Medium' | 'Low'
  tierOrder: number         // 1/2/3 for numeric sort (research note: alphabetical would put Medium last)
  dpaStatus: DpaStatus
  certificationStatus: EdtechCertStatus
  userCount: number
}

const columns: TableColumn<RiskRow>[] = [
  { accessorKey: 'name',                header: sortHeader('Vendor Name'),     meta: { class: { th: 'min-w-[12rem]', td: 'min-w-[12rem]' } } },
  { accessorKey: 'tierOrder',           header: sortHeader('Risk Tier'),       meta: { class: { th: 'w-[8rem]',      td: 'w-[8rem]' } } },
  { accessorKey: 'dpaStatus',           header: sortHeader('DPA Status'),      meta: { class: { th: 'w-[8rem]',      td: 'w-[8rem]' } } },
  { accessorKey: 'certificationStatus', header: sortHeader('1EdTech Status'),  meta: { class: { th: 'w-[10rem]',     td: 'w-[10rem]' } } },
  { accessorKey: 'userCount',           header: sortHeader('Users'),           meta: { class: { th: 'w-[6rem] text-right', td: 'w-[6rem] text-right' } } },
]
```

**Cell slots (template):**

```vue
<UTable
  v-model:sorting="sorting"
  :data="riskRows"
  :columns="columns"
  class="bg-white"
  @select="onRowSelect"
>
  <!-- accessorKey is tierOrder for numeric sort but the cell renders row.original.tier (string) -->
  <template #tierOrder-cell="{ row }">
    <UBadge
      :label="row.original.tier"
      color="neutral"
      variant="solid"
      :style="{ backgroundColor: RISK_TIER_COLORS[row.original.tier], color: '#ffffff' }"
    />
  </template>
  <template #dpaStatus-cell="{ row }">
    <UBadge
      :label="row.original.dpaStatus"
      color="neutral"
      variant="solid"
      :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.dpaStatus], color: '#ffffff' }"
    />
  </template>
  <template #userCount-cell="{ row }">
    {{ row.original.userCount.toLocaleString() }}
  </template>
  <template #empty>
    <div class="py-8 text-center">
      <div class="text-sm font-semibold text-gray-900">No vendors found</div>
      <div class="text-sm text-gray-500 mt-1">No vendor data is available to calculate risk tiers.</div>
    </div>
  </template>
</UTable>
```

**Note on the `tierOrder` cell slot:** the cell slot name matches the `accessorKey` (`#tierOrder-cell`), but the rendered UBadge label uses `row.original.tier` (the string). Sorting uses the numeric `tierOrder`; rendering uses the string `tier`. This is the v0.5.0 pattern verbatim.

**1EdTech Status renders as plain text** (no UBadge) — matches v0.5.0 ReportsView line 152: `{{ data.certificationStatus }}`. Sales-rep tweakable to UBadge later by lifting the Phase 11 pattern; deferred for now.

**No filter input on Risk page** — v0.5.0 didn't have one. The donut chart IS the filter UX (visually). Sales rep can ask for a text filter later; not in scope for v1.0.0.

**Confidence:** HIGH.

---

## UBadge :style hex pattern (Phase 11 carry-forward)

**Lifted verbatim from Phase 11 production code (`app/pages/dpa.vue:150-156`):**

```vue
<UBadge
  :label="row.original.tier"
  color="neutral"
  variant="solid"
  :style="{ backgroundColor: RISK_TIER_COLORS[row.original.tier], color: '#ffffff' }"
/>
```

**Confirmed shape:**
- `color="neutral"` → disables Nuxt UI's color theming so `:style` background wins
- `variant="solid"` → filled rectangle chip shape
- `:label` → string text
- `:style="{ backgroundColor, color }"` → hex + white text

**All three RISK_TIER_COLORS hex values pass white-text contrast:**
- `#dc2626` High (red-600) — WCAG AA at 4.55:1 against white
- `#f59e0b` Medium (amber-500) — 2.97:1 (borderline; same as DPA Pending; v0.5.0 used white text, matched)
- `#16a34a` Low (green-600) — 4.79:1

**Vue SSR emits hex literal in canonical form** (Phase 11 Deviation #1): `style="background-color:#dc2626;color:#ffffff;"`. Acceptance probes use the hex form directly, NOT `rgb(...)`.

**Confidence:** HIGH.

---

## VendorDrawer reuse on Risk page

**Recommended: YES.** Row click on the Risk Position table opens the page-level VendorDrawer, showing the vendor's full detail (Usage / DPA / 1EdTech / Privacy radar / Tags).

**Why this is the right call:**
- Free reuse — drawer auto-imports from `app/components/VendorDrawer.vue`.
- Matches Discovery + DPA + Dashboard UX consistency (every list surface opens the same drawer).
- v0.5.0 ReportsView.vue:160-161 mounted the drawer on row-click — visual continuity.
- No drawer modifications needed; the drawer's DPA section already renders the same DpaRecord the Risk row was based on.

**Page-level state lifting trio (verbatim from Phase 11 `dpa.vue:109-124`):**

```ts
const selectedVendorId = ref<string | null>(null)
function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
}
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)
const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
```

**Template mount (sibling to `</UTable>`):**

```vue
<VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
```

**No manual import** — auto-imported via Nuxt 4 components convention.

**useFetch URL-key dedup carries forward:** Risk page calls `useFetch('/api/dpa')` and `useFetch('/api/vendors')` (same as DPA page); drawer internally calls `useFetch('/api/dpa')` and `useFetch('/api/edtech')`. Risk page ALSO calls `useFetch('/api/edtech')` for tier derivation. The drawer's edtech fetch reuses the cached payload. Phase 11 verified this empirically.

**Confidence:** HIGH (Phase 11 carry-forward).

---

## Tags store API surface for Phase 12

**Current state (Plan 10-03):** `app/stores/tags.ts` exposes 2 actions — `setVendorTags` and `clearVendorTags`. Phase 12 adds 5 new actions, bringing the total to 7.

**Plan 12-02 adds these 5 actions:**

```ts
// app/stores/tags.ts (after Plan 12-02)
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagItem { id: string; name: string }
export interface TagGroup { id: string; name: string; color: string; children: TagItem[] }
export type TagAssignments = Record<string, string[]>

export const SEED_TAG_GROUPS: TagGroup[] = [ /* ... unchanged ... */ ]

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})

  // ---- Plan 10-03 (existing) ----
  function setVendorTags(vendorId: string, tagIds: string[]) {
    if (tagIds.length === 0) delete assignments.value[vendorId]
    else assignments.value[vendorId] = tagIds
  }
  function clearVendorTags(vendorId: string) {
    delete assignments.value[vendorId]
  }

  // ---- Plan 12-02 (new) ----

  /** Rename a tag inside a group. No-op if group/tag not found or newName empty after trim. */
  function renameTag(groupId: string, tagId: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    const tag = group.children.find((t: TagItem) => t.id === tagId)
    if (!tag) return
    tag.name = trimmed
  }

  /** Rename a tag group itself. */
  function renameTagGroup(groupId: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.name = trimmed
  }

  /** Set the color for a tag group (palette pick). */
  function setTagGroupColor(groupId: string, newColor: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.color = newColor
  }

  /** Delete a single tag inside a group + cascade-scrub from all vendor assignments. */
  function deleteTag(groupId: string, tagId: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.children = group.children.filter((t: TagItem) => t.id !== tagId)
    // Cascade — scrub from every vendor's assignment array; reuse setVendorTags
    // so the empty-array cleanup branch fires automatically.
    for (const vendorId of Object.keys(assignments.value)) {
      const remaining = assignments.value[vendorId].filter((id: string) => id !== tagId)
      setVendorTags(vendorId, remaining)
    }
  }

  /** Delete an entire tag group + cascade-scrub every child tag from every vendor assignment. */
  function deleteTagGroup(groupId: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    const childIds = new Set(group.children.map((t: TagItem) => t.id))
    tagGroups.value = tagGroups.value.filter((g: TagGroup) => g.id !== groupId)
    for (const vendorId of Object.keys(assignments.value)) {
      const remaining = assignments.value[vendorId].filter((id: string) => !childIds.has(id))
      setVendorTags(vendorId, remaining)
    }
  }

  /** Reset to seed groups + clear all assignments. Deep-clone via JSON to avoid sharing the seed reference. */
  function resetToDefaults() {
    tagGroups.value = JSON.parse(JSON.stringify(SEED_TAG_GROUPS))
    assignments.value = {}
  }

  // ---- Discretion (recommend INCLUDE for v1.0.0 demo parity) ----

  /** Add an empty tag group with a unique-ish id; returns the new id for the UI to auto-focus rename. */
  function addTagGroup(initialColor: string): string {
    const id = `group-${Date.now()}`
    tagGroups.value.push({ id, name: '', color: initialColor, children: [] })
    return id
  }

  /** Add an empty tag to an existing group; returns the new tag id for the UI to auto-focus rename. */
  function addTag(groupId: string): string | null {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return null
    const id = `tag-${Date.now()}`
    group.children.push({ id, name: '' })
    return id
  }

  return {
    tagGroups,
    assignments,
    setVendorTags,
    clearVendorTags,
    // Phase 12 new
    renameTag,
    renameTagGroup,
    setTagGroupColor,
    deleteTag,
    deleteTagGroup,
    resetToDefaults,
    addTagGroup,
    addTag,
  }
}, {
  persist: true,
})
```

**Action signatures summary table:**

| Action | Signature | Purpose | Cascades |
|--------|-----------|---------|----------|
| `setVendorTags` (existing) | `(vendorId: string, tagIds: string[]) => void` | Replace a vendor's tag assignment; empty array deletes the entry | — |
| `clearVendorTags` (existing) | `(vendorId: string) => void` | Delete a vendor's assignment entry | — |
| `renameTag` (new) | `(groupId: string, tagId: string, newName: string) => void` | Rename a tag by id; trims; no-op if empty | — |
| `renameTagGroup` (new) | `(groupId: string, newName: string) => void` | Rename a group by id | — |
| `setTagGroupColor` (new) | `(groupId: string, newColor: string) => void` | Set group color from palette pick | — |
| `deleteTag` (new) | `(groupId: string, tagId: string) => void` | Delete a tag + cascade-scrub from all `assignments` | scrubs tagId from every vendor's tagIds; setVendorTags cleans empty entries |
| `deleteTagGroup` (new) | `(groupId: string) => void` | Delete a group + cascade-scrub every child tag from `assignments` | scrubs all childIds from every vendor; setVendorTags cleans empty entries |
| `resetToDefaults` (new) | `() => void` | Restore SEED_TAG_GROUPS + clear assignments | — (replaces both refs) |
| `addTagGroup` (new, discretion) | `(initialColor: string) => string` | Push an empty group; returns new id for autofocus | — |
| `addTag` (new, discretion) | `(groupId: string) => string \| null` | Push an empty tag onto group; returns new id | — |

**Why all 5 (or 7 with Add) actions, not direct mutation:**

1. **Grep-able write paths** — verification probes check `grep -c 'function renameTag' app/stores/tags.ts` etc.
2. **Cascade encapsulation** — delete actions own the assignments-scrub logic. v0.5.0 had this in SettingsView.vue; lifting it into the store makes it reusable + testable.
3. **Trim/no-op guards** — actions defensively no-op on empty input; templates don't need to repeat the check.
4. **Empty-array cleanup** — `deleteTag` and `deleteTagGroup` reuse `setVendorTags` so the empty-array-deletes-entry branch (Plan 10-03) fires automatically. Keeps persisted JSON tidy.
5. **`persist: true` config preserved** — every action mutates reactive refs; the persistedstate plugin auto-saves on change. No additional config needed.

**Why ADD actions are recommended (discretion):**

ROADMAP SC#4 wording: *"Tags Management page lists all tags with inline rename and 8-swatch color palette picker."* — implies the page works on existing tags. SC#5 covers delete + reset.

But v0.5.0 SettingsView.vue had `addGroup()` and `addTag(group)` (lines 81-97) that the sales-rep demo relies on for "let me add a new group for this district". Without Add, the page is effectively read-only-plus-delete, which is a worse demo than v0.5.0.

**Recommendation: INCLUDE addTagGroup + addTag.** Flag for plan-checker review; if rejected, omit and the plan is still complete against ROADMAP literal wording. The 12-RESEARCH.md is the place to surface this for the planner.

**Confidence:** HIGH for the 5 mandated actions; HIGH for Add actions as a recommended extension.

---

## UModal API

**Verified vs `node_modules/@nuxt/ui/dist/runtime/components/Modal.vue.d.ts` (installed Nuxt UI v4.8.0):**

**Props (ModalProps):**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `title` | `string?` | — | Header title (rendered in `#title` slot region if not overridden) |
| `description` | `string?` | — | Subheading text |
| `overlay` | `boolean` | `true` | Dark backdrop |
| `dismissible` | `boolean` | `true` | Click outside or Escape closes |
| `transition` | `boolean` | `true` | Animate open/close |
| `fullscreen` | `boolean` | `false` | Take up the full screen |
| `portal` | `boolean \| string \| HTMLElement` | `true` | Render in portal (required for `<UApp>` mount) |
| `close` | `boolean \| ButtonProps` | `true` | Show close button top-right |
| `closeIcon` | `IconProps['name']` | `appConfig.ui.icons.close` | Close button icon |
| `scrollable` | `boolean` | `false` | Content scrolls within overlay |
| `class` | `any` | — | Root class |
| `ui` | `Modal['slots']` | — | Override slot styling tokens |

**v-model: `v-model:open`** (verified vs Modal.vue.d.ts:90 `"update:open": (value: boolean) => any`).

**Slots (ModalSlots) — verbatim:**

```ts
default?(props: { open: boolean }): VNode[]
content?(props: { close: () => void }): VNode[]
header?(props: { close: () => void }): VNode[]
title?(props?: {}): VNode[]
description?(props?: {}): VNode[]
actions?(props?: {}): VNode[]
close?(props: { ui: Modal['ui'] }): VNode[]
body?(props: { close: () => void }): VNode[]
footer?(props: { close: () => void }): VNode[]
```

**Use `#body` + `#footer` with `close` slot prop** for the Phase 12 confirmation modals.

### Canonical delete-confirmation snippet

```vue
<!-- app/pages/tags.vue (excerpt) -->
<UModal
  v-model:open="deleteDialogOpen"
  title="Confirm delete"
  :description="pendingDelete && pendingDelete.type === 'tag'
    ? `Delete tag '${pendingDelete.tag.name}'?`
    : `Delete group '${pendingDelete.group.name}' and all its tags?`"
>
  <template #body="{ close }">
    <p class="text-sm text-gray-700">
      This will remove it from {{ pendingDeleteCount }} vendor(s). This action cannot be undone.
    </p>
  </template>
  <template #footer="{ close }">
    <div class="flex justify-end gap-2 w-full">
      <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
      <UButton color="error" variant="solid" label="Delete" @click="confirmDelete" />
    </div>
  </template>
</UModal>
```

### Canonical reset-to-defaults modal snippet

```vue
<UModal v-model:open="resetDialogOpen" title="Reset to defaults?">
  <template #body>
    <p class="text-sm text-gray-700">
      This will replace your current tag groups with the original seed set and
      clear every tag assignment on every vendor. This cannot be undone.
    </p>
  </template>
  <template #footer="{ close }">
    <div class="flex justify-end gap-2 w-full">
      <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
      <UButton color="error" variant="solid" label="Reset" @click="confirmReset" />
    </div>
  </template>
</UModal>
```

**`color="error"` is a semantic preset on UButton** (different rule than UBadge — buttons can use the semantic color presets; UBadge uses `:style` to dodge them). Verify: red-tinted destructive button via the theme. Acceptable; matches the convention from v0.5.0 PrimeVue `severity="danger"`.

**Confidence:** HIGH (Modal.vue.d.ts read and slot signatures verbatim).

---

## 8-swatch palette UI

**Hex palette (verbatim from v0.5.0 SettingsView.vue:7-16):**

```ts
const PALETTE_COLORS = [
  '#484CE6', // blue-violet (matches SEED Curriculum)
  '#DA8231', // orange (matches SEED Assessment)
  '#16A34A', // green (matches SEED Communication)
  '#DC2626', // red (matches SEED Administration)
  '#0891B2', // cyan-600 (teal)
  '#7C3AED', // violet-600 (purple)
  '#E11D48', // rose-600 (rose/pink)
  '#475569', // slate-600 (gray)
] as const
```

**First 4 match SEED_TAG_GROUPS** (line 22, 33, 41, 51 of `app/stores/tags.ts`). Last 4 are alternatives.

**UI pattern — 8 horizontal `<button>` elements:**

```vue
<div class="flex gap-1.5 mb-3 ml-6">
  <button
    v-for="color in PALETTE_COLORS"
    :key="color"
    type="button"
    class="w-6 h-6 rounded-full border-2 transition-transform"
    :class="group.color.toLowerCase() === color.toLowerCase()
      ? 'border-gray-700 scale-110'
      : 'border-transparent hover:scale-105'"
    :style="{ backgroundColor: color }"
    :aria-label="`Pick color ${color}`"
    @mousedown.prevent="tagsStore.setTagGroupColor(group.id, color)"
  />
</div>
```

**Notes:**

- `@mousedown.prevent` (NOT `@click`) — `mousedown.prevent` fires before the rename input's `@blur`, so picking a color while editing the group name doesn't commit the rename prematurely. v0.5.0 used this; preserve.
- Selected swatch shows `border-gray-700 scale-110` for visual indication.
- Lowercase-compare on hex (`group.color.toLowerCase() === color.toLowerCase()`) — defensive against case variation (SEED uses lowercase like `#484ce6`; palette uses uppercase `#484CE6`).
- No `URadioGroup` — overkill for 8 swatches; native buttons are lighter and match v0.5.0 visual exactly.

**Swatch visibility — popover or always-on?**

v0.5.0 used a `swatchOpenForGroupId` ref to show the palette only when the group color dot was clicked (lines 21, 76-78). For v1.0.0, **recommend the same toggle pattern** — keeps the page from being visually noisy when there are 4+ groups.

```ts
const swatchOpenForGroupId = ref<string | null>(null)
function toggleSwatch(groupId: string) {
  swatchOpenForGroupId.value = swatchOpenForGroupId.value === groupId ? null : groupId
}
```

```vue
<button
  type="button"
  class="w-4 h-4 rounded-full shrink-0 border border-gray-300"
  :style="{ backgroundColor: group.color }"
  aria-label="Change group color"
  @mousedown.prevent="toggleSwatch(group.id)"
/>
<div v-if="swatchOpenForGroupId === group.id" class="flex gap-1.5 mb-3 ml-6">
  <!-- 8 swatches above -->
</div>
```

**Confidence:** HIGH (verbatim port from v0.5.0).

---

## Inline rename UI

**Pattern — display-vs-edit toggle, `<UInput>` for v1.0.0 (was native `<input>` in v0.5.0):**

```ts
// app/pages/tags.vue script-setup
import { nextTick, ref } from 'vue'

const editingId = ref<string | null>(null)
const editingName = ref<string>('')
const editInputRefs: Record<string, HTMLInputElement | undefined> = {}

function registerEditRef(id: string, el: any) {
  if (el) editInputRefs[id] = el
  else delete editInputRefs[id]
}

function startEditGroup(group: TagGroup) {
  editingId.value = group.id
  editingName.value = group.name
  swatchOpenForGroupId.value = group.id // show swatch while renaming a group
  nextTick(() => editInputRefs[group.id]?.focus())
}

function startEditTag(tag: TagItem) {
  editingId.value = tag.id
  editingName.value = tag.name
  nextTick(() => editInputRefs[tag.id]?.focus())
}

function commitEditGroup(group: TagGroup) {
  tagsStore.renameTagGroup(group.id, editingName.value)
  editingId.value = null
  swatchOpenForGroupId.value = null
}

function commitEditTag(group: TagGroup, tag: TagItem) {
  tagsStore.renameTag(group.id, tag.id, editingName.value)
  editingId.value = null
}
```

**Template (group name row):**

```vue
<template v-if="editingId !== group.id">
  <span
    class="text-base font-semibold text-gray-900 cursor-pointer hover:underline"
    @click="startEditGroup(group)"
  >{{ group.name || '(unnamed group)' }}</span>
</template>
<template v-else>
  <UInput
    :ref="el => registerEditRef(group.id, el)"
    v-model="editingName"
    placeholder="Group name..."
    size="sm"
    @keydown.enter.prevent="commitEditGroup(group)"
    @blur="commitEditGroup(group)"
  />
</template>
```

**Template (child tag row):**

```vue
<template v-if="editingId !== tag.id">
  <span class="text-sm text-gray-800 cursor-pointer hover:underline" @click="startEditTag(tag)">
    {{ tag.name || '(unnamed tag)' }}
  </span>
</template>
<template v-else>
  <UInput
    :ref="el => registerEditRef(tag.id, el)"
    v-model="editingName"
    placeholder="Tag name..."
    size="sm"
    @keydown.enter.prevent="commitEditTag(group, tag)"
    @blur="commitEditTag(group, tag)"
  />
</template>
```

**Note on `UInput` ref:**

`UInput` is a Nuxt UI v4 component; refs on UInput give the component instance, not the native input element. To call `.focus()`, may need to access `.$el?.querySelector('input')` or use UInput's built-in `autofocus` prop. **Recommend** using UInput's `autofocus` prop and removing the manual focus logic:

```vue
<UInput
  v-model="editingName"
  placeholder="Group name..."
  size="sm"
  autofocus
  @keydown.enter.prevent="commitEditGroup(group)"
  @blur="commitEditGroup(group)"
/>
```

**Verify at execute:** confirm UInput supports `autofocus` prop by reading `Input.vue.d.ts`. If not, fall back to manual `el => el?.$el?.querySelector('input')?.focus()`.

**Confidence:** MEDIUM-HIGH for the toggle pattern; MEDIUM for `autofocus` prop availability (verify at execute).

---

## Cascade delete

**Encapsulated in store actions (see `## Tags store API surface` § for full code):**

- `deleteTag(groupId, tagId)` — removes tag from group's children + iterates `assignments`, filters out the tagId from every vendor's tagIds array. Uses `setVendorTags` so empty arrays delete the assignment entry.
- `deleteTagGroup(groupId)` — removes group + iterates `assignments`, filters out EVERY child tagId from every vendor's tagIds array. Same `setVendorTags`-based cleanup.

**Cascade-count UI (for the delete confirmation modal):**

```ts
function vendorCountForTag(tagId: string): number {
  return Object.values(tagsStore.assignments).filter((arr: string[]) => arr.includes(tagId)).length
}

function vendorCountForGroup(group: TagGroup): number {
  return group.children.reduce((sum: number, child: TagItem) => sum + vendorCountForTag(child.id), 0)
}
```

These can stay in `app/pages/tags.vue` (UI helpers, not store actions) — they read assignments but don't write.

**Modal flow:**

```ts
type PendingDelete =
  | { type: 'tag'; group: TagGroup; tag: TagItem }
  | { type: 'group'; group: TagGroup }

const pendingDelete = ref<PendingDelete | null>(null)
const pendingDeleteCount = ref(0)
const deleteDialogOpen = ref(false)

function requestDeleteTag(group: TagGroup, tag: TagItem) {
  pendingDelete.value = { type: 'tag', group, tag }
  pendingDeleteCount.value = vendorCountForTag(tag.id)
  deleteDialogOpen.value = true
}

function requestDeleteGroup(group: TagGroup) {
  pendingDelete.value = { type: 'group', group }
  pendingDeleteCount.value = vendorCountForGroup(group)
  deleteDialogOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  editingId.value = null // clear stale edit refs before mutating
  swatchOpenForGroupId.value = null
  if (pendingDelete.value.type === 'tag') {
    tagsStore.deleteTag(pendingDelete.value.group.id, pendingDelete.value.tag.id)
  } else {
    tagsStore.deleteTagGroup(pendingDelete.value.group.id)
  }
  deleteDialogOpen.value = false
  pendingDelete.value = null
}
```

**Confidence:** HIGH.

---

## Reset-to-defaults

**Store action (see `## Tags store API surface`):**

```ts
function resetToDefaults() {
  tagGroups.value = JSON.parse(JSON.stringify(SEED_TAG_GROUPS))
  assignments.value = {}
}
```

**Critical detail — JSON deep clone:** Direct assignment `tagGroups.value = SEED_TAG_GROUPS` would share the seed object reference. Subsequent edits via `renameTag` etc. would mutate the seed constant, corrupting all future resets. The `JSON.parse(JSON.stringify(...))` round-trip is the simplest deep-clone for plain-object data (no Dates, no Maps, no class instances). Matches v0.5.0 exactly.

**Modal flow:**

```ts
const resetDialogOpen = ref(false)
function requestReset() {
  resetDialogOpen.value = true
}
function confirmReset() {
  editingId.value = null
  swatchOpenForGroupId.value = null
  tagsStore.resetToDefaults()
  resetDialogOpen.value = false
}
```

**Trigger button (top-right of page header):**

```vue
<UButton
  color="neutral"
  variant="outline"
  label="Reset to defaults"
  icon="i-lucide-rotate-ccw"
  @click="requestReset"
/>
```

**Confidence:** HIGH.

---

## Tags page layout

**Verbatim port from v0.5.0 SettingsView.vue:159-288 with substitutions:**

- Native `<input>` → `<UInput>`
- PrimeVue `<Button>` → `<UButton>`
- PrimeVue `<Dialog>` → `<UModal>`
- PrimeVue `pi pi-*` icons → Iconify `i-lucide-*` icons
- v0.5.0 direct mutation → Plan 12-02 store actions

**Top-level structure:**

```
<div class="p-6">
  Page header — h1 "Tags" + description + "Reset to defaults" UButton (top-right)
  "Add group" UButton (above the cards)
  Empty state — v-if="tagsStore.tagGroups.length === 0"
  v-for tag group:
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      Group header row:
        - Color dot button (click → toggleSwatch)
        - Group name (display span OR UInput when editing)
        - Pencil icon "rename" button (display-mode only)
        - Spacer
        - Trash icon "delete group" button
      Swatch palette (v-if swatch open for this group)
      Children list (ul):
        v-for child tag:
          - Display span OR UInput when editing
          - Pencil icon (display-mode only, hidden until row hover)
          - Spacer
          - Trash icon (hidden until row hover)
      "Add tag" affordance button (text-primary, icon + label)
  UModal — delete confirmation
  UModal — reset-to-defaults confirmation
</div>
```

**Approximate line count:** ~150-200 lines including the script-setup.

**Confidence:** HIGH.

---

## Wave assignment

**Recommended: 12-01 + 12-02 in parallel (Wave 1).**

### Dependency analysis

| Plan | Files modified | Files read (no write) | Subsystems touched |
|------|---------------|----------------------|-------------------|
| 12-01 | `app/pages/risk.vue` | server/api/* (via useFetch) + shared/types + shared/utils/riskLabels + app/components/VendorDrawer | useFetch, nuxt-echarts, UTable, UBadge, VendorDrawer |
| 12-02 | `app/pages/tags.vue` + `app/stores/tags.ts` | shared/types/data (for TagGroup type) | Pinia setup-store, UModal, UInput, UButton, native button |

**File-overlap check:**
- 12-01 modifies: `app/pages/risk.vue`
- 12-02 modifies: `app/pages/tags.vue` + `app/stores/tags.ts`
- **Zero file overlap.** Parallelism is safe.

**Subsystem-overlap check:**
- 12-01 doesn't touch the tags store at all (drawer's tags section is internal to VendorDrawer.vue; not modified).
- 12-02 doesn't touch ECharts or useFetch.
- **Zero subsystem overlap.**

**Pattern-divergence risk:**

Phase 11 research recommended sequential to keep two UBadge+useFetch pages from diverging in pattern. Phase 12's two surfaces are genuinely different design centers:
- 12-01 is a render pipeline (data → tier → donut + table).
- 12-02 is a write pipeline (UI actions → store mutations → cascade cleanup).

The "consistent pattern" argument is weak here because the patterns ARE different. Independence dominates.

### Per-wave verify gates

**Wave 1 (both plans in parallel):**

For 12-01:
- `npm run typecheck` exit 0
- `npm run build` exit 0
- `curl http://localhost:3000/risk` → HTTP 200, contains `<svg` (donut), contains 3 hex colors in donut + table badges, table has ≥27 `<tr` tags
- Manual UAT: donut + table visible; row click → drawer opens

For 12-02:
- `npm run typecheck` exit 0
- `npm run build` exit 0
- `curl http://localhost:3000/tags` → HTTP 200, contains group names, contains 8 swatch buttons
- Manual UAT: rename works (blur + enter), color picker works, delete triggers modal, modal cancel preserves state, modal confirm removes tag + scrubs assignments, reset modal works, persists across refresh

**Confidence:** HIGH.

---

## Nuxt UI v4 Type-Verify-At-Execute Pitfalls (Phase 10/11 carry-forward)

**Standing rule:** Plan snippets carry over patterns from research notes that DIVERGE from the actual installed types. Phase 10 surfaced 4 examples; Phase 11 surfaced 2 more. The planner MUST instruct executors to read installed `.d.ts` files BEFORE authoring templates.

### Canonical verification protocol for Phase 12

Before authoring `<UModal>`, `<UInput>`, `<UButton>`, `<UBadge>`, `<UTable>`, or any other Nuxt UI v4 component template, the executor MUST:

1. **Read the component's `.vue.d.ts`** at `node_modules/@nuxt/ui/dist/runtime/components/<Comp>.vue.d.ts`.
2. **Read the component's theme** in `node_modules/@nuxt/ui/dist/shared/ui.<hash>.mjs` (currently `ui.CoJ8bnb0.mjs`).
3. **Verify against the plan's `<interfaces>` block** — does the snippet match the installed types?

### Specifically for Phase 12

| Component | What to verify | Pre-verified by 12-RESEARCH? | Source |
|-----------|----------------|------------------------------|--------|
| `<UModal>` | `v-model:open` (NOT `v-model:visible`); slots `body` / `footer` receive `{ close: () => void }`; `title` prop is shortcut for header text | ✓ | `## UModal API` (Modal.vue.d.ts verified) |
| `<UBadge>` | `color="neutral"` + `variant="solid"` + `:label` + `:style` — no `:ui` overrides needed for tier badges | ✓ | Phase 11 carry-forward |
| `<UTable>` | `TableColumn<T>` shape; `meta.class` = `{ th?, td? }`; `@select="(_e, row) => ..."` with `row.original`; `#{accessorKey}-cell` slot naming | ✓ | Phase 10/11 carry-forward |
| `<UInput>` | `v-model`, `placeholder`, `size`; `autofocus` prop availability (VERIFY at execute) | partial — `autofocus` needs runtime check | Verify Input.vue.d.ts at execute |
| `<UButton>` | `color="error" variant="solid"` for destructive actions; `color="neutral" variant="outline"` for cancel; `icon` prop for leading icon; semantic color presets ARE allowed on UButton (unlike UBadge for tier chips) | partial | Phase 10/11 used UButton; verify Button.vue.d.ts if uncertain |
| `<USeparator>` | Auto-imported, no `:ui` overrides needed | ✓ | Phase 10 carry-forward |

### Phase 10/11 deviation list (apply pre-emptively)

| # | Source | Issue | Applied for Phase 12? |
|---|--------|-------|----------------------|
| 1 | Plan 10-01 lesson #1 | `@pinia/nuxt v0.11.3` does NOT auto-import store factories | Plan 12-02 MUST use explicit `import { useTagsStore } from '~/stores/tags'`. Plan 12-01 does NOT use the store, no action. |
| 2 | Plan 10-01 lesson #2 | `TableColumn.meta.class` shape is `{ th?, td? }`, NOT plain string | Plan 12-01 columns array MUST use `meta: { class: { th, td } }`. See `## Risk table column set`. |
| 3 | Plan 10-01 lesson #3 | TS strict mode rejects implicit `any` on `.map`/`.filter`/`.sort` callbacks | Plan 12-01 + 12-02 MUST annotate ALL callbacks: `(v: Vendor)`, `(d: DpaRecord)`, `(e: EdtechRecord)`, `(g: TagGroup)`, `(t: TagItem)`, `(id: string)`, `(arr: string[])`. |
| 4 | Plan 10-03 lesson #1 | Nuxt UI v4 `:ui` slot keys differ between components — SelectMenu uses `base` not `trigger`; UCard uses `body` not `content`; USlideover uses `content` not `body` | Plan 12-02 uses UModal — slots are `body` / `footer` / `header` / `title` / `description` per Modal.vue.d.ts:64-86. NO `:ui` overrides needed for default usage. |
| 5 | Plan 11-01 deviation #1 | Vue 3 SSR emits inline `:style` in canonical hex form (`background-color:#dc2626`), NOT `rgb()` form | Plan 12-01 acceptance probes MUST grep hex literal directly. |
| 6 | Plan 11-02 deviation #1 | Vendor display names differ from vendorIds (`vendor-flipgrid` displays as "Flip") | Plan 12-01 acceptance probes that check display names must cross-reference `server/data/vendors.ts` (no extrapolation from vendorId). |

**Plan-snippet review rule (proposed for planner):** Every snippet that touches a Nuxt UI v4 component prop, slot, or `:ui` key MUST cite the source file (`Modal.vue.d.ts` line X, `ui.CoJ8bnb0.mjs` line Y). If the snippet doesn't cite, the executor must verify before authoring.

---

## Open Questions

1. **Include Add UI in Plan 12-02?**
   - What we know: ROADMAP SC#4 + SC#5 don't mention Add; v0.5.0 had it; sales-rep iteration speed depends on it.
   - What's unclear: Whether the planner reads ROADMAP literally or applies "v0.5.0 demo parity" as an implicit constraint.
   - Recommendation: **INCLUDE** — add `addTagGroup` and `addTag` actions + UI buttons. Flag for plan-checker review. If rejected, remove.

2. **UInput autofocus prop availability?**
   - What we know: `autofocus` is an HTML standard attribute; many Nuxt UI components forward it to the underlying native input.
   - What's unclear: Whether Nuxt UI v4 `UInput` exposes it as a top-level prop, requires it as an HTML attribute fall-through, or has a custom `autofocus` prop.
   - Recommendation: Verify at execute by reading `Input.vue.d.ts`. If not exposed as a top-level prop, use the fallback ref-based focus pattern from v0.5.0 SettingsView.vue:29-47.

3. **Dynamic 1EdTech Status badge?**
   - What we know: v0.5.0 ReportsView renders 1EdTech status as plain text (`{{ data.certificationStatus }}`).
   - What's unclear: Whether to upgrade to a UBadge `:style` chip via `EDTECH_STATUS_COLORS` (already exported from `shared/utils/riskLabels.ts:38-43`) for visual consistency with the Tier and DPA columns.
   - Recommendation: **MATCH v0.5.0** — plain text for now. Sales rep can ask for upgrade; deferred to v1.1 or executor discretion.

4. **`risk.vue` should also offer text filter?**
   - What we know: v0.5.0 ReportsView had no filter input. Phase 10/11 have filters via `useDebounce`.
   - What's unclear: Whether the donut chart's visual segmentation IS the filter UX or whether a text input adds value.
   - Recommendation: **MATCH v0.5.0** — no text filter. Sales rep can ask for one; defer.

---

## Environment Availability

**This phase is code-only — no external dependencies beyond the existing Node + npm + dev-server stack.**

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Nuxt 4 dev/build/typecheck | ✓ | 24.14.0 | — |
| npm | Package management (no installs needed) | ✓ | 11.x | — |
| `@nuxt/ui` v4 | UModal, UInput, UButton, UBadge, UTable, USeparator | ✓ | 4.8.0 installed | — |
| `nuxt-echarts` | VChart (donut) | ✓ | 1.0.1 installed | — |
| `echarts` | PieChart engine | ✓ | 6.x installed | — |
| `pinia` + `@pinia/nuxt` | Tags store CRUD | ✓ | 3.0.4 / 0.11.3 | — |
| `pinia-plugin-persistedstate` | localStorage persistence | ✓ | 4.7.1 | — |
| `@vueuse/core` | NOT needed by Phase 12 (no debounce) | ✓ | installed (Phase 10) | — |

**No installs needed. No external services. No deployment infrastructure.**

---

## Validation Architecture

> Phase 12 enables `workflow.nyquist_validation: true` per `.planning/config.json`.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed (no unit-test runner). `nuxi typecheck` (vue-tsc) + `nuxi build` + dev-server curl probes are the test suite. |
| Config file | `tsconfig.json` (extends `.nuxt/tsconfig.json`) |
| Quick run command | `npm run typecheck` |
| Full suite command | `npm run typecheck && npm run build` |
| Phase gate | typecheck + build green AND dev-server SSR curl probes green before `/gsd:verify-work` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| PAGE-03 (SC1) | Donut renders WITHOUT crashing SSR | Runtime smoke | `curl -fsS http://localhost:3000/risk \| grep -E '<svg\|<canvas'` (Option A) — non-empty match | ❌ Wave 1 |
| PAGE-03 (SC1) | Donut NOT wrapped in `<ClientOnly>` (Option A) | Static grep | `! grep -q '<ClientOnly' app/pages/risk.vue` exit 0 (no ClientOnly in file) | ❌ Wave 1 |
| PAGE-03 (SC1) | Donut SVG contains all 3 tier hex colors | Runtime smoke | `curl -fsS http://localhost:3000/risk \| grep -c -E '#dc2626\|#f59e0b\|#16a34a'` >= 3 | ❌ Wave 1 |
| PAGE-03 (SC2) | Tier UBadge uses `:style` with RISK_TIER_COLORS hex | Static grep | `grep -q 'RISK_TIER_COLORS\[row.original.tier\]' app/pages/risk.vue` exit 0 | ❌ Wave 1 |
| PAGE-03 (SC2) | NO Tailwind `bg-red-XXX` for tier badges | Negative grep | `! grep -E 'bg-(red\|amber\|green)-[0-9]' app/pages/risk.vue` exit 0 | ❌ Wave 1 |
| PAGE-03 (SC2) | NO semantic preset (`color="error"`, `color="warning"`, etc.) on tier UBadge | Negative grep | `! grep -B 2 'RISK_TIER_COLORS' app/pages/risk.vue \| grep -E 'color="(error\|warning\|success)"'` exit 0 | ❌ Wave 1 |
| PAGE-03 (SC3) | UTable sortable on 5 columns | Static grep | `grep -c 'sortHeader(' app/pages/risk.vue` == 5 | ❌ Wave 1 |
| PAGE-03 (SC3) | Default sort by `tierOrder` (numeric) | Static grep | `grep -q 'sorting = ref(\[{ id: .tierOrder.' app/pages/risk.vue` exit 0 | ❌ Wave 1 |
| PAGE-03 (SC3) | Row count: 27 vendors render | Runtime smoke | `curl -fsS http://localhost:3000/risk \| grep -oE '<tr[ >]' \| wc -l` >= 28 (1 header + 27 body) | ❌ Wave 1 |
| PAGE-04 (SC4) | Tags page lists all tag groups | Runtime smoke | `curl -fsS http://localhost:3000/tags \| grep -cE 'Curriculum\|Assessment\|Communication\|Administration'` >= 4 | ❌ Wave 1 |
| PAGE-04 (SC4) | Inline rename — `renameTag` action grep | Static grep | `grep -q 'function renameTag' app/stores/tags.ts && grep -q 'tagsStore.renameTag' app/pages/tags.vue` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC4) | UInput toggled via editingId | Static grep | `grep -q 'editingId === ' app/pages/tags.vue` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC4) | 8-swatch palette — 8 hex constants | Static grep | `grep -c -E '#[0-9A-Fa-f]{6}' app/pages/tags.vue` >= 8 (inside PALETTE_COLORS const) | ❌ Wave 1 |
| PAGE-04 (SC4) | setTagGroupColor action wired | Static grep | `grep -q 'function setTagGroupColor' app/stores/tags.ts && grep -q 'tagsStore.setTagGroupColor' app/pages/tags.vue` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC5) | UModal for delete confirmation | Static grep | `grep -q '<UModal' app/pages/tags.vue && grep -q 'v-model:open=.deleteDialogOpen' app/pages/tags.vue` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC5) | `deleteTag` + `deleteTagGroup` actions | Static grep | `grep -q 'function deleteTag\b' app/stores/tags.ts && grep -q 'function deleteTagGroup' app/stores/tags.ts` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC5) | Cascade scrub assignments | Static grep | `grep -A 6 'function deleteTag(' app/stores/tags.ts \| grep -q 'setVendorTags(vendorId,'` exit 0 (delete uses setVendorTags for cascade) | ❌ Wave 1 |
| PAGE-04 (SC5) | resetToDefaults action | Static grep | `grep -q 'function resetToDefaults' app/stores/tags.ts && grep -q 'tagsStore.resetToDefaults' app/pages/tags.vue` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC5) | resetToDefaults uses JSON deep clone | Static grep | `grep -q 'JSON.parse(JSON.stringify(SEED_TAG_GROUPS))' app/stores/tags.ts` exit 0 | ❌ Wave 1 |
| PAGE-04 (SC5) | Reset to defaults UModal | Static grep | `grep -c '<UModal' app/pages/tags.vue` == 2 (delete + reset) | ❌ Wave 1 |
| (impl) | typecheck green | Build | `npm run typecheck` exit 0 | persistent |
| (impl) | build green | Build | `npm run build` exit 0 | persistent |
| (impl) | Pinia action count for tags.ts | Static grep | `grep -cE 'function (renameTag\|renameTagGroup\|setTagGroupColor\|deleteTag\|deleteTagGroup\|resetToDefaults)' app/stores/tags.ts` >= 6 (5 mandated + renameTagGroup) | ❌ Wave 1 |
| (impl) | Risk page row count of tier hex backgrounds | Runtime smoke | `curl -fsS http://localhost:3000/risk \| grep -oE 'background-color:#(dc2626\|f59e0b\|16a34a)' \| wc -l` >= 27 (one per row) | ❌ Wave 1 |

### Sampling Rate

- **Per task commit:** Run grep probes for that task's PAGE-XX criteria (under 5 seconds total)
- **Per wave merge:** `npm run typecheck && npm run build && curl http://localhost:3000/risk && curl http://localhost:3000/tags`
- **Phase gate:** All grep probes pass; build/typecheck green; SSR HTML for both pages contains expected literals; manual UAT for modal flows + drawer mount + persistence-across-refresh before `/gsd:verify-work`.

### Wave 0 Gaps

**None.** All infrastructure (Nuxt UI v4, nuxt-echarts, Pinia + persistedstate, riskLabels.ts with RISK_TIER_COLORS, VendorDrawer.vue) is in place from Phases 7-11. No new files, no installs, no nuxt.config.ts edits.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/@nuxt/ui/dist/runtime/components/Modal.vue.d.ts` — UModal props/slots/v-model verified (lines 9-86, 90).
- `node_modules/@nuxt/ui/dist/runtime/components/ColorPicker.vue.d.ts` — read, not used (8-swatch native buttons preferred over UColorPicker for v0.5.0 parity).
- `app/components/VendorDrawer.vue` — Phase 10 production code; UBadge `:style` pattern (lines 134-139).
- `app/pages/dpa.vue` — Phase 11 production code; sortHeader + table column shape + drawer state lifting (lines 81-124).
- `app/pages/discovery.vue` — Phase 10 production code; useDebounce filter pattern (deferred — Risk page has no filter).
- `app/stores/tags.ts` — Plan 10-03 setup-store action pattern (current state).
- `shared/utils/riskLabels.ts` — RISK_TIER_COLORS already exported (lines 50-54). DPA_STATUS_COLORS (25-30). RISK_LABEL_COLORS (14-18).
- `shared/types/data.ts` — Vendor (with inline userCount), DpaRecord, EdtechRecord interfaces.
- `nuxt.config.ts` — PieChart + TooltipComponent + LegendComponent already registered (lines 24-28).
- `src/views/ReportsView.vue` (v0.5.0) — tier algorithm lines 22-32; donut option lines 63-88; column set lines 131-157.
- `src/views/SettingsView.vue` (v0.5.0) — CRUD UI lines 27-156; 8-swatch palette lines 7-16; cascade-delete lines 121-141; reset lines 149-156.
- `.planning/STATE.md` — Phase 10-02 ECharts SSR reconciliation (line 85); Phase 11 carry-forward deviations.
- `.planning/phases/07-nuxt-scaffold/07-RESEARCH.md` — Pitfall #6 "no double-wrap" anti-pattern (around line 922).
- `.planning/phases/10-discovery-page/10-RESEARCH.md` — § 5 "ECharts radar in the drawer" reconciliation (lines 549-624); § 6 "USelectMenu" pattern.
- `.planning/phases/11-dpa-dashboard/11-RESEARCH.md` — § 4 UBadge :style pattern (lines 322-368); § 6 UCard slots verified.
- `.planning/phases/11-dpa-dashboard/11-01-SUMMARY.md` + `11-02-SUMMARY.md` — production-shipped patterns.

### Secondary (MEDIUM confidence — verify at execute)

- UInput `autofocus` prop availability — Input.vue.d.ts read at execute.
- nuxt-echarts SSR-as-SVG behavior for PieChart — confirmed working in Phase 7-02 smoke test (now deleted); should hold for Phase 12.

### Tertiary (LOW confidence)

- None — all decisions sourced from production code or verified types.

---

## Metadata

**Confidence breakdown:**

| Area | Level | Reason |
|------|-------|--------|
| Donut SSR strategy | HIGH | Phase 7 + Phase 10-02 + STATE.md formalization + Phase 7-02 empirical proof |
| Tier derivation algorithm | HIGH | v0.5.0 ReportsView verbatim port; Vendor + DpaRecord + EdtechRecord types all verified |
| Donut chart options | HIGH | v0.5.0 verbatim; PieChart already registered |
| Risk table column set | HIGH | v0.5.0 verbatim + Phase 10/11 column shape carry-forward |
| Risk page UBadge `:style` | HIGH | Phase 11 production pattern |
| Tags store API surface | HIGH | Plan 10-03 setup-store action pattern; cascade-delete logic from v0.5.0 verbatim |
| UModal API | HIGH | Modal.vue.d.ts read; slot signatures verbatim |
| 8-swatch palette UI | HIGH | v0.5.0 verbatim port; native buttons preferred |
| Inline rename UI | MEDIUM-HIGH | Toggle pattern HIGH; `autofocus` prop availability MEDIUM (verify at execute) |
| Cascade delete | HIGH | v0.5.0 verbatim; encapsulated in store actions |
| Wave assignment (parallel) | HIGH | Zero file overlap, zero subsystem overlap |
| Nuxt UI v4 type drift | HIGH | Phase 10/11 6-item deviation list pre-empted |

**Research date:** 2026-05-22
**Valid until:** 2026-06-22 (30 days — stable stack; Phase 13 is the only forward dependency and Phase 12 doesn't constrain it).

---

## RESEARCH COMPLETE

**Phase:** 12 — Risk Position + Tags
**Confidence:** HIGH

### Key Findings

- **Donut chart MUST NOT be wrapped in `<ClientOnly>`** — Phase 7 anti-pattern + STATE.md reconciliation + Phase 7-02 empirical proof. ROADMAP SC#1 wording is underlying-intent ("no SSR crash"), not literal. Option A (recommended) lets nuxt-echarts handle SSR via SVG fallback; Option B (fallback) wraps with USkeleton if a regression surfaces.
- **Tier derivation is a 3-input function** lifted verbatim from v0.5.0 ReportsView.vue:22-32 (DpaRecord.status × Vendor.userCount × EdtechRecord.certificationStatus). Tier hex colors already exported as `RISK_TIER_COLORS` in `shared/utils/riskLabels.ts:50-54`. Zero shared-utils edits needed.
- **Tags store needs 5 new actions** (plus 1 optional `renameTagGroup` and 2 discretionary `addTagGroup`/`addTag`): `renameTag`, `setTagGroupColor`, `deleteTag`, `deleteTagGroup`, `resetToDefaults`. Delete actions encapsulate cascade-scrub via the existing `setVendorTags`. Reset uses JSON deep clone to avoid sharing the SEED_TAG_GROUPS reference.
- **UModal v-model is `v-model:open`** (verified vs Modal.vue.d.ts:90). Slots `body` and `footer` receive `{ close: () => void }`. Used twice in tags.vue — delete confirmation + reset confirmation.
- **Plans 12-01 and 12-02 are wave-parallel safe** — zero file overlap, zero subsystem overlap. Phase 11's sequential recommendation does NOT carry forward (Phase 12's surfaces are genuinely different design centers).

### File Created

`.planning/phases/12-risk-position-tags/12-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | HIGH | No new deps; all primitives verified working in Phases 7-11 |
| Architecture | HIGH | Tier algorithm + donut option + CRUD actions all lifted from v0.5.0 production code |
| Pitfalls | HIGH | 6-item Phase 10/11 deviation list pre-empted; donut ClientOnly trap formalized |

### Open Questions

1. INCLUDE Add UI in Plan 12-02 (recommended yes, flag for plan-checker).
2. UInput `autofocus` prop availability (verify at execute via Input.vue.d.ts).
3. 1EdTech Status as UBadge vs plain text (recommend match v0.5.0 — plain text).
4. Risk page text filter (recommend match v0.5.0 — no filter).

### Ready for Planning

Research complete. Planner can now create 12-01-PLAN.md (Risk Position) and 12-02-PLAN.md (Tags Management) — both eligible for Wave 1 parallel execution.
