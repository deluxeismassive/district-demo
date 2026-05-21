---
phase: 10
slug: discovery-page
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-21
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth for probes: `10-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (no Vitest yet — verification is build + grep + curl + typecheck + manual visual UAT) |
| **Config file** | none |
| **Quick run command** | `npm run typecheck` (~5s) |
| **Full suite command** | `npm run build` (~30s) |
| **Estimated runtime** | typecheck ~5s; build ~30s; curl + grep panel ~10s; manual UAT ~5 min |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck` (5s).
- **After each plan completes:** Run `npm run build` plus the plan's grep panel.
- **After Plan 10-01:** curl `GET /discovery` → SSR HTML contains 27 vendor names in table rows.
- **After Plan 10-02:** grep for `<USlideover`, `<VChart`, `<ClientOnly` in `app/components/VendorDrawer.vue`; manual UAT: click row → drawer opens with radar.
- **After Plan 10-03:** grep for `setVendorTags` action in `app/stores/tags.ts` + `<USelectMenu` usage in discovery.vue / VendorDrawer.vue; manual UAT: assign tags, navigate away, return, confirm persistence.
- **Before `/gsd:verify-work`:** `npm run build` + dev-server visual walkthrough.
- **Max feedback latency:** typecheck ~5s; build ~30s.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-* | 01 | 1 | PAGE-01 | grep + typecheck + curl | per task `<verify>` blocks | ✅ | ⬜ pending |
| 10-02-* | 02 | 2 | PAGE-01 | grep + typecheck + build | per task `<verify>` blocks | ✅ | ⬜ pending |
| 10-03-* | 03 | 3 | PAGE-01 | grep + typecheck + build | per task `<verify>` blocks | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Possible*: `@vueuse/core` may need installation if not already a transitive peer of `@nuxt/ui` v4. Plan 10-01 Task 1 must `npm ls @vueuse/core` and install if missing. No other Wave 0 dependencies — all other deliverables build on what Phases 7-9 provide.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sort by clicking column header reorders rows correctly | PAGE-01 SC#1 | Visual / interaction | 1. `npm run dev`. 2. Open `/discovery`. 3. Click "Vendor Name" column → rows reorder ascending. 4. Click again → descending. 5. Repeat for one usage-metric column. |
| Text filter narrows visible rows in real time | PAGE-01 SC#1 | Visual / interaction | 1. Type "google" in the search input. 2. Confirm only matching vendors remain. 3. Clear input → all 27 rows return. |
| Row click opens VendorDrawer with radar chart | PAGE-01 SC#2 | Visual | 1. Click any vendor row. 2. Drawer slides in from right with vendor name in header. 3. Radar chart renders with 10 axes (no console errors, no FOUC after ~200ms client mount). 4. Close drawer → returns to table. |
| Drawer DPA + 1EdTech sections render with real data | PAGE-01 (implicit) | Visual | Inside the drawer: confirm DPA status badge appears and 1EdTech section shows correct content. |
| Tag assignment via USelectMenu writes back to Pinia | PAGE-01 SC#3 | Visual + persistence | 1. Open drawer (or use per-row select). 2. Select 2 tags from different groups. 3. Confirm chips appear immediately in the table row. 4. Navigate to another page (`/dpa`), return to `/discovery`. 5. Tag chips still present (persisted via persistedstate plugin). |
| Tag chips in row reflect assignments | PAGE-01 SC#4 | Visual | Confirm chip colors match tag group hex (`#484ce6` curriculum, `#da8231` assessment, `#16a34a` communication, `#dc2626` administration). |
| Hydration mismatch flash on Pinia-driven tag chips | informational | Visual | Initial server render has empty assignments (persist plugin hydrates client-side only). Brief chip-pop after hydration is expected; flag if it becomes jarring. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (@vueuse/core if not present)
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s (typecheck) / 60s (build)
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — planner fills `<verify>` blocks; checker confirms coverage; executor flips `nyquist_compliant: true` after green run.
