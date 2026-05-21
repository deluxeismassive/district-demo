---
phase: 09-server-data-layer
plan: 01
subsystem: server-data-layer
tags: [nuxt-server, shared-types, server-data, typescript-migration, discovery-merge, type-safety, vendor-data]

# Dependency graph
requires:
  - phase: 08-01
    provides: "5 page stubs at app/pages/{index,discovery,dpa,risk,tags}.vue (Phase 9 does NOT modify); app/types/page-meta.d.ts PageMeta augmentation (Phase 9 does NOT redeclare); app/stores/tags.ts Pinia store (Phase 9 does NOT modify)"
  - phase: 07-02
    provides: "Nuxt 4 SSR scaffold with @nuxt/ui v4, @pinia/nuxt, nuxt-echarts; tsconfig.json extending .nuxt/tsconfig.json"
provides:
  - "shared/types/data.ts exporting Vendor, DpaRecord, EdtechRecord interfaces (auto-imported on both server and client via Nuxt v3.14+ shared/ convention) — single source of truth for data shape"
  - "shared/types/data.ts exporting Frequency, DpaStatus, RiskLabel, EdtechCertStatus type aliases (string-literal unions) and PrivacyScore interface"
  - "shared/utils/riskLabels.ts exporting RISK_LABELS, RISK_LABEL_COLORS, DPA_STATUS_COLORS, EDTECH_STATUS_COLORS, RISK_TIER_COLORS color maps for Phase 11-12 UBadge styling"
  - "server/data/vendors.ts — 27 typed Vendor[] records with src/data/discovery.js metrics (frequency, lastSeen, userCount, studentCount) merged inline by vendorId"
  - "server/data/dpa.ts — 27 typed DpaRecord[] records (verbatim migration)"
  - "server/data/edtech.ts — 27 typed EdtechRecord[] records (verbatim migration)"
  - "v0.5.0 src/data/{vendors,discovery,dpa,edtech,riskLabels}.js graveyard cleared from disk"
affects: [09-02, 10-discovery, 11-dpa-dashboard, 12-risk-tags]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "shared/types/*.ts — Nuxt v3.14+ convention: pure type declarations auto-imported on both server and client; no Vue/h3/Nitro imports allowed (framework-enforced boundary)"
    - "shared/utils/*.ts — pure constants/utilities auto-imported on both server and client"
    - "server/data/*.ts — server-only typed mock data; Nitro excludes from client bundle by virtue of server/ scan; imports shared types via #shared/types/data alias"
    - "Discovery-into-Vendor denormalization at-rest — eliminates client-side join overhead in Phase 10; matches the data the Discovery page actually needs"
    - "Explicit Vendor[] / DpaRecord[] / EdtechRecord[] type annotation on each data array — forces compile-time validation against the interface, catches typos and missing fields"

key-files:
  created:
    - "shared/types/data.ts (PrivacyScore, Vendor, DpaRecord, EdtechRecord interfaces + Frequency, DpaStatus, RiskLabel, EdtechCertStatus type aliases)"
    - "shared/utils/riskLabels.ts (RISK_LABELS const + 4 color-map records: RISK_LABEL_COLORS, DPA_STATUS_COLORS, EDTECH_STATUS_COLORS, RISK_TIER_COLORS)"
    - "server/data/vendors.ts (27 Vendor[] records with merged discovery metrics)"
    - "server/data/dpa.ts (27 DpaRecord[] records)"
    - "server/data/edtech.ts (27 EdtechRecord[] records)"
  modified: []
  deleted:
    - "src/data/vendors.js (v0.5.0 — superseded by server/data/vendors.ts with merged discovery)"
    - "src/data/discovery.js (v0.5.0 — metrics merged into server/data/vendors.ts; no separate route/file)"
    - "src/data/dpa.js (v0.5.0 — superseded by server/data/dpa.ts)"
    - "src/data/edtech.js (v0.5.0 — superseded by server/data/edtech.ts)"
    - "src/data/riskLabels.js (v0.5.0 — superseded by shared/utils/riskLabels.ts)"

key-decisions:
  - "Discovery metrics merged into the Vendor interface rather than served via a separate /api/discovery route — eliminates the v0.5.0 client-side Object.fromEntries join in Phase 10 (research §4 rationale), reduces Discovery page fetches from 2 to 1, and matches the join shape the page actually consumes"
  - "shared/types/data.ts chosen over server/utils/types.ts as the home for Vendor/DpaRecord/EdtechRecord interfaces — auto-imported on both server and client (Nuxt v3.14+); server-only would force client pages to do explicit cross-boundary imports for any future explicit annotation (research §6)"
  - "shared/utils/riskLabels.ts (not server/data/riskLabels.ts) — these are UI styling constants for UBadge, not server-side mock data; pure-data with no Vue/h3 imports satisfies the shared/ boundary restriction"
  - "Explicit Vendor[] / DpaRecord[] / EdtechRecord[] type annotation on each array literal — research Pitfall §7 noted that TypeScript only catches missing fields, not extra ones; annotating the array forces strict-shape conformance and catches typos at compile time"
  - "Edtech orphan reconciliation was a no-op — research §4 anticipated 28 source edtech records with one orphan; the v0.5.0 src/data/edtech.js shipped with exactly 27 records, every vendorId resolves to a vendor in src/data/vendors.js. Migration is verbatim. Documented in server/data/edtech.ts header comment so future maintainers understand the research-vs-reality drift."
  - "Deleted v0.5.0 src/data/*.js files at the end of Plan 09-01 (not deferred to a later cleanup phase) — the new server/data/*.ts files compile, typecheck, and build succeed without them; deferring would leave a dead-code graveyard"

patterns-established:
  - "Pattern A: server/data/X.ts holds a typed array literal with explicit type annotation; the .ts file is a pure data module with one default export"
  - "Pattern B: shared/types/data.ts is the canonical home for interfaces consumed by both server and client; future phases consuming via #shared/types/data alias on the server, via auto-import on the client"
  - "Pattern C: at-rest denormalization (discovery → Vendor) — when source data is 1:1 with the primary entity and there is no use case for fetching the secondary data independently, merge at migration time rather than joining at view time"
  - "Pattern D: nuxi prepare + npm run typecheck as the rapid feedback loop after adding files under shared/ or server/ (typecheck ~5s, prepare ~3s)"

requirements-completed: [DATA-01]

# Metrics
duration: ~12min
completed: 2026-05-21
---

# Phase 9 Plan 01: Server Data Layer Migration Summary

**v0.5.0 JS mock data migrated to typed TypeScript modules under server/data/ + shared/types/; discovery.js metrics merged into Vendor by vendorId; v0.5.0 graveyard files deleted; typecheck + build green**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-05-21
- **Completed:** 2026-05-21
- **Tasks:** 4
- **Files created:** 5
- **Files modified:** 0
- **Files deleted:** 5

## Accomplishments

- Created `shared/types/data.ts` exporting the canonical data shape for the entire codebase: 4 interfaces (`PrivacyScore`, `Vendor`, `DpaRecord`, `EdtechRecord`) and 4 type aliases (`Frequency`, `DpaStatus`, `RiskLabel`, `EdtechCertStatus`). Auto-imported on both server and client thanks to Nuxt 4's `shared/` directory convention. No Vue/h3/Nitro imports — pure type declarations.
- Created `shared/utils/riskLabels.ts` migrating the 4 color maps (`RISK_LABEL_COLORS`, `DPA_STATUS_COLORS`, `EDTECH_STATUS_COLORS`, `RISK_TIER_COLORS`) and the `RISK_LABELS` const from v0.5.0. Hex values preserved verbatim from `src/data/riskLabels.js`. These are needed by Phases 11-12 UBadge `:style` bindings.
- Migrated 27 vendor records into `server/data/vendors.ts` as typed `Vendor[]`, **merging the discovery metrics inline** (frequency, lastSeen, userCount, studentCount). 1:1 vendorId match between `src/data/vendors.js` and `src/data/discovery.js` confirmed before merge; every record carries both privacy and usage data. Phase 10 will read this via `useFetch('/api/vendors')` without doing a client-side join.
- Migrated 27 DPA records into `server/data/dpa.ts` as typed `DpaRecord[]` — verbatim migration of the v0.5.0 source; explicit type annotation forces every `status` value to match the `'Signed' | 'Unsigned' | 'Expired' | 'Pending'` union.
- Migrated 27 1EdTech records into `server/data/edtech.ts` as typed `EdtechRecord[]`. Research had anticipated 28 source records and an orphan — the actual `src/data/edtech.js` shipped with exactly 27, every `vendorId` resolves to a vendor in `vendors.ts`. No reconciliation needed; migration is verbatim. Documented inline in the file header.
- Deleted all 5 v0.5.0 `src/data/*.js` files (`vendors.js`, `discovery.js`, `dpa.js`, `edtech.js`, `riskLabels.js`). Pre-deletion probe confirmed no file under `app/`, `server/`, `shared/`, or `nuxt.config.ts` imports from `src/data/`. `src/views/*.vue` and `src/components/*.vue` still reference these on disk but live outside Nuxt's scan path — they remain dead code until Phases 10-12 delete them as each view is rewritten.

## Files Created/Modified

| File | Action | Detail |
|------|--------|--------|
| `shared/types/data.ts` | created | 4 interfaces + 4 type aliases; no framework imports |
| `shared/utils/riskLabels.ts` | created | 1 const + 4 color-map records (Record<string, string>) |
| `server/data/vendors.ts` | created | 27 Vendor[] records, explicit type annotation, discovery merged inline |
| `server/data/dpa.ts` | created | 27 DpaRecord[] records, explicit type annotation |
| `server/data/edtech.ts` | created | 27 EdtechRecord[] records, explicit type annotation |
| `src/data/vendors.js` | deleted | v0.5.0 — superseded |
| `src/data/discovery.js` | deleted | v0.5.0 — metrics merged into server/data/vendors.ts |
| `src/data/dpa.js` | deleted | v0.5.0 — superseded |
| `src/data/edtech.js` | deleted | v0.5.0 — superseded |
| `src/data/riskLabels.js` | deleted | v0.5.0 — superseded |

## Commits

| Hash | Task | Message |
|------|------|---------|
| `8d881c1` | 1 | feat(09-01): add shared/types/data.ts + shared/utils/riskLabels.ts |
| `ebf31ea` | 2 | feat(09-01): migrate vendors with merged discovery metrics to server/data/vendors.ts |
| `430b4ff` | 3 | feat(09-01): migrate dpa + edtech to server/data/ (no orphan — source had 27 records, not 28) |
| `4fb0e52` | 4 | chore(09-01): delete v0.5.0 src/data/*.js files now that server/data/*.ts migration is complete |

## Phase Requirement Status

| Requirement | Status | Note |
|-------------|--------|------|
| DATA-01 | partial | Typed source data exists in `server/data/*.ts`; HTTP routes (`server/api/*.get.ts`) are Plan 09-02's responsibility |
| DATA-02 | open | Pages still don't fetch from `/api/...` — Plan 09-02 wires `app/pages/discovery.vue` to `useFetch('/api/vendors')` as proof-of-typing |

Plan 09-02 will close DATA-01 fully (by creating the three event handlers that expose the typed data over HTTP) and close DATA-02 (by wiring the demo page).

## Key Decisions

1. **Discovery merged into Vendor (not a separate route).** Discovery metrics are 1:1 with vendors; there's no scenario where the Discovery page needs them without the vendor identity. Merging at-rest eliminates the v0.5.0 `Object.fromEntries(...).map(...)` join that Phase 10 would otherwise have to recreate against `useFetch('/api/discovery')`. Trade-off accepted: the `Vendor` interface now carries usage fields that aren't strictly "vendor identity," but the alternative is doubling the API surface for a join that's never logically separable.
2. **Edtech orphan reconciliation: no-op.** Research §4 expected 28 source records and one orphan to drop. The actual `src/data/edtech.js` ships with exactly 27 records and every `vendorId` exists in `vendors.js`. Documented in `server/data/edtech.ts` header so future maintainers don't trip over the research-vs-reality drift. No data was dropped or renamed.
3. **shared/types/data.ts over server/utils/types.ts.** Per research §6 — `shared/` auto-imports on both server and client (Nuxt v3.14+), making future explicit annotations of `useFetch` responses ergonomic without forcing a soft client→server dependency.
4. **Explicit type annotations everywhere.** Each of the three data arrays is declared `const X: Y[] = [...]` rather than relying on inference. Per research Pitfall §7, TypeScript only catches missing fields without an explicit annotation; we want compile-time validation of every record's shape against the interface.
5. **v0.5.0 files deleted in this plan, not deferred.** Carrying dead-code v0.5.0 data files alongside the new server/data layer would create grep noise and ambiguity for future maintainers. Deletion verified by running `npm run build` after `git rm` — the build is the strict test that no live code path imports the deleted files.

## Handoff to Plan 09-02

Plan 09-02 picks up an established typed data layer. The handoff:

- **Import path on the server:** `import vendors from '~~/server/data/vendors'` (or relative `../data/vendors`). The handler signature in Plan 09-02 is one line: `export default defineEventHandler(() => vendors)`.
- **Type inference flows automatically.** Nuxt 4 / Nitro infers the handler's return type from the imported array (`Vendor[]`), then propagates it to `useFetch('/api/vendors')` calls on the client. No manual `<Vendor[]>` generic needed.
- **The discovery merge means Plan 09-02 only ships 3 routes (vendors, dpa, edtech).** No `/api/discovery` — that data lives on every Vendor record.
- **The Vendor interface in `shared/types/data.ts` is the single source of truth.** If Plan 09-02 needs to annotate anything explicitly, it imports from `#shared/types/data` on the server and relies on auto-import on the client.
- **Plan 09-02 demo wiring target:** `app/pages/discovery.vue` (research §9 recommendation). One `useFetch('/api/vendors', { default: () => [] })` call + a count render. Other 4 page stubs stay untouched; Phases 10-12 own them.

## Known Orphans (deferred)

- `src/views/*.vue` and `src/components/*.vue` still reference v0.5.0 paths that no longer exist (the deleted `src/data/*.js` and `src/router/index.js`). These files live outside Nuxt's scan path (`app/` only) and are not built. They will be deleted incrementally by Phases 10-12 as each view is rewritten into `app/pages/`.
- `src/stores/` directory is empty (cleared in Phase 7-02). Kept on disk for historical clarity; no cleanup needed.
- Pre-existing Rollup/iconify deprecation warnings during `npm run build` (`@iconify/utils`, `@vueuse/core`, `@vue/shared`) — upstream library noise, not introduced by Plan 09-01. Logged in deferred-items if a phase wants to chase them; for now they are accepted as build noise.

## Self-Check

- [x] `shared/types/data.ts` exists and exports 4 interfaces + 4 type aliases — verified
- [x] `shared/utils/riskLabels.ts` exists and exports 5 consts — verified
- [x] `server/data/vendors.ts` exists with 27 Vendor[] records, explicit type annotation, discovery merged — verified (vendorId count 27, all 5 discovery fields count 27, privacyScore count 27)
- [x] `server/data/dpa.ts` exists with 27 DpaRecord[] records, explicit type annotation — verified
- [x] `server/data/edtech.ts` exists with 27 EdtechRecord[] records, explicit type annotation — verified (no orphans, source-data drift from research documented)
- [x] No file under `app/`, `server/`, `shared/`, or `nuxt.config.ts` imports from `src/data/` — verified via grep
- [x] All 5 v0.5.0 `src/data/*.js` files deleted from disk — verified via test -f
- [x] `shared/` files import no Vue/h3/Nitro code — verified via grep
- [x] `npm run typecheck` exits 0 — verified after each task
- [x] `npm run build` exits 0 — verified after Task 4 deletion
- [x] Cross-file consistency: every edtech.vendorId in vendors.ts, every dpa.vendorId in vendors.ts — verified via comm -23 returns 0 orphans
- [x] 4 atomic commits with feat/chore prefixes — `8d881c1`, `ebf31ea`, `430b4ff`, `4fb0e52`

## Self-Check: PASSED

All 5 created files verified on disk; all 5 deletions verified; all 4 commit hashes exist in `git log --oneline --all`; SUMMARY.md exists at the path the plan specified.
