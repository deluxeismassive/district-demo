# Phase 4: 1EdTech View - Context

**Gathered:** 2026-05-13
**Status:** Ready for planning

<domain>
## Phase Boundary

Surface 1EdTech certification data at the vendor level — no standalone table page. Two changes:
1. **VendorDrawer 1EdTech section** — add a section to the existing vendor detail slide-over showing certification status, standard, and date
2. **edtech.js enrichment** — extend from single-field records to include `certificationStandard` and `certifiedDate`
3. **ReportsView cleanup** — remove the `1EdTech` tab from ReportsView's tab bar (DPA and Risk Position tabs remain as skeletons)

This phase deliberately narrows EDTECH-01 from "separate table view" to "drawer section." The district admin sees 1EdTech data in context when they click any vendor — no separate navigation needed.

</domain>

<decisions>
## Implementation Decisions

### Scope Clarification
- **D-01:** No standalone 1EdTech page or route. The VendorDrawer is the only 1EdTech data surface.
- **D-02:** No new sidebar nav entry for 1EdTech.
- **D-03:** Remove the `'1EdTech'` entry from `ReportsView.vue`'s `tabs` array. Remaining tabs: `['DPA', 'Risk Position']`. Both stay as skeleton stubs — no further work on ReportsView in this phase.

### edtech.js Data Enrichment
- **D-04:** Add two new fields to each of the 27 records in `src/data/edtech.js`:
  - `certificationStandard`: string | null — the 1EdTech standard name (e.g. "OneRoster 2.0", "CASE", "Caliper 1.2", "QTI 3.0")
  - `certifiedDate`: string | null — ISO date string (e.g. "2023-09-01")
- **D-05:** `certificationStandard` is null for `Not Certified` and `In Review` vendors. Only `Certified` and `Expired` vendors have a standard value.
- **D-06:** `certifiedDate` is null for `Not Certified` and `In Review` vendors. `Certified` vendors have a date. `Expired` vendors have the original certification date (the date they were certified before expiry).
- **D-07:** Claude assigns plausible standard names from the real 1EdTech portfolio: OneRoster, CASE, Caliper, QTI, LTI, TDT. Use at least 3 different standards across the Certified/Expired vendors.

### VendorDrawer 1EdTech Section
- **D-08:** Add a 1EdTech section to `src/components/VendorDrawer.vue`, placed **after the DPA section and before the Privacy Policy Score section**.
- **D-09:** Section order in drawer: Header → Usage → DPA → **1EdTech** → Privacy Policy Score → Tags.
- **D-10:** 1EdTech section fields shown:
  - Status badge (always shown — uses color-coded badge per D-12)
  - Standard (shown only when `certificationStandard` is non-null, renders as plain text)
  - Certified Date (shown only when `certifiedDate` is non-null, renders as plain text)
  - If no record found for vendor: show "No 1EdTech record on file." (same fallback pattern as DPA section)
- **D-11:** Join: `edtech.js` looked up by `props.vendor.vendorId` at the drawer level — same `Object.fromEntries` pattern established by DPA section.

### Badge Colors
- **D-12:** 1EdTech status badge colors reuse the DPA semantic palette. Add `EDTECH_STATUS_COLORS` to `src/data/riskLabels.js`:
  - `Certified` → green `#16a34a`
  - `Not Certified` → gray `#6b7280`
  - `In Review` → amber `#f59e0b`
  - `Expired` → red `#dc2626`
- **D-13:** Import `EDTECH_STATUS_COLORS` from `riskLabels.js` in VendorDrawer (alongside existing `DPA_STATUS_COLORS`).

### Claude's Discretion
- Exact standard assignments per vendor (must use real 1EdTech standard names; spread across OneRoster, CASE, Caliper, QTI, LTI)
- Exact certified dates (plausible — within the last 1–4 years for Certified; older dates for Expired)
- VendorDrawer section heading label ("1EdTech Certification" or "1EdTech" — match the style of the DPA heading)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints, out-of-scope items
- `.planning/REQUIREMENTS.md` — EDTECH-01 is the requirement for this phase

### Prior Phase Context
- `.planning/phases/02-data-layer-discovery/02-CONTEXT.md` — vendorId join pattern, VendorDrawer structure, data file conventions
- `.planning/phases/03-dpa-view/03-CONTEXT.md` — DPA section pattern in VendorDrawer; `riskLabels.js` constants pattern; badge styling with PrimeVue Tag

### Existing Code to Read Before Planning
- `src/components/VendorDrawer.vue` — File being extended; DPA section (lines ~105–160) is the template to replicate for 1EdTech
- `src/data/edtech.js` — File being enriched; 27 vendors currently with `certificationStatus` only
- `src/data/riskLabels.js` — File to extend with `EDTECH_STATUS_COLORS`
- `src/views/ReportsView.vue` — File to simplify: remove `'1EdTech'` from tabs array

No external specs — requirements fully captured in decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/VendorDrawer.vue` — DPA section block (Divider + section + Tag badge + v-if guards) is the direct template to copy for 1EdTech
- `src/data/riskLabels.js` — Already exports `DPA_STATUS_COLORS`; add `EDTECH_STATUS_COLORS` with same structure
- PrimeVue `Tag` component — already imported in VendorDrawer for DPA badges; reuse for 1EdTech badge

### Established Patterns
- Drawer section block: `<Divider /> <section> <h3 class="text-sm font-semibold text-gray-900 mb-4">...</h3> <div v-if="record"> ... </div> <div v-else class="text-sm text-gray-500">No record on file.</div> </section>`
- Join map: `const edtechMap = Object.fromEntries(edtechData.map((d) => [d.vendorId, d]))`
- Computed lookup: `const vendorEdtech = computed(() => props.vendor ? edtechMap[props.vendor.vendorId] ?? null : null)`
- Conditional field render: `v-if="vendorEdtech.certificationStandard"` before rendering standard row

### Integration Points
- `src/components/VendorDrawer.vue` — Insert 1EdTech section between DPA `</section>` closing and the Privacy Policy Score `<section>` opening
- `src/data/edtech.js` — Add `certificationStandard` and `certifiedDate` to all 27 records
- `src/data/riskLabels.js` — Add `EDTECH_STATUS_COLORS` export
- `src/views/ReportsView.vue` — Remove `'1EdTech'` from `tabs` array (one line change)

</code_context>

<specifics>
## Specific Ideas

- **Drawer-only rationale:** User confirmed the VendorDrawer is the correct and only home for 1EdTech data — no separate navigation needed. The rep clicks a vendor, sees everything: usage → DPA → 1EdTech → privacy score in a single slide-over.
- **ReportsView cleanup:** Removing the 1EdTech tab prevents dead tab content from appearing in demos. DPA and Risk Position tabs stay as skeletons since those phases have their own dedicated views.
- **Standard variety:** Use at least 3 different real 1EdTech standard names across the certified vendors to make the data feel authentic (e.g., some vendors on OneRoster, some on CASE, some on Caliper).

</specifics>

<deferred>
## Deferred Ideas

- **Standalone 1EdTech table view** — Discussed and explicitly removed from scope. If a dedicated page is needed in future, it would follow the DpaGrid pattern (new component + tab or route).
- **EDTECH-V2-01** — Certification level detail (which tiers/standards a vendor holds at a level). Not in v1 scope.
- **EDTECH-V2-02** — Filter by certification status. Not in v1 scope.
- **EDTECH-V2-03** — Cross-reference 1EdTech certified vendors with Discovery active usage. Not in v1 scope.
- **ReportsView DPA tab** — Still a skeleton. Will be addressed if/when the team wants a unified Reports view.

</deferred>

---

*Phase: 04-1edtech-view*
*Context gathered: 2026-05-13*
