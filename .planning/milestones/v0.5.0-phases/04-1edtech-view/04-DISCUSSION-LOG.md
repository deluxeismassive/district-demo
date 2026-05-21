# Phase 4: 1EdTech View - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 04-1edtech-view
**Areas discussed:** Data richness, VendorDrawer 1EdTech section, Wire up DPA tab in Reports, Badge colors / status semantics

---

## Data Richness

| Option | Description | Selected |
|--------|-------------|----------|
| Standard + date | Add certificationStandard and certifiedDate | ✓ |
| Standard only | Add certificationStandard, no date | |
| Status only | Keep edtech.js minimal | |

**User's choice:** Standard + date — adds two sortable columns, makes certified vendors look more credible.

---

## Standard for Not Certified / In Review

| Option | Description | Selected |
|--------|-------------|----------|
| Null / dash | Not Certified and In Review show — in Standard column | ✓ |
| Standard shown for In Review | In Review vendors show the standard they're pursuing | |

**User's choice:** Null / dash — keeps focus on who IS certified.

---

## VendorDrawer 1EdTech Section Placement

| Option | Description | Selected |
|--------|-------------|----------|
| After DPA, before Privacy | Header → Usage → DPA → 1EdTech → Privacy → Tags | ✓ |
| After Privacy, before Tags | Puts 1EdTech near the bottom | |

**User's choice:** After DPA, before Privacy — keeps compliance data (DPA + 1EdTech) together narratively.

**Notes:** User confirmed via initial selection note: "the information will live in the discovery vendor details pop out. There is no other location for 1EdTech data." — this eliminated the need for a standalone 1EdTech table page entirely.

---

## Wire Up DPA Tab in Reports

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, wire it up | Import DpaGrid into ReportsView | |
| Leave as skeleton | Keep DPA tab as skeleton | |

**User's choice:** Neither — user clarified to remove the 1EdTech tab from ReportsView and not wire anything up in Reports. DPA and Risk Position tabs remain as skeleton stubs.

---

## 1EdTech Page Location

(Follow-up to Reports scope clarification)

| Option | Description | Selected |
|--------|-------------|----------|
| New sidebar page | Dedicated EdtechView.vue + route | |
| Tab in DiscoveryView | Third tab alongside Discovery and DPA | |
| Replace Reports entirely | Repurpose Reports route | |
| VendorDrawer only | No page — data only in drawer | ✓ |

**User's choice:** VendorDrawer only — "the information will live in the discovery vendor details pop out."

---

## Badge Colors / Status Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse DPA palette | Certified=green, Not Certified=gray, In Review=amber, Expired=red | ✓ |
| Different palette | Use distinct colors for 1EdTech | |

**User's choice:** Reuse DPA palette — consistent with DPA section directly above it.

---

## Claude's Discretion

- Exact standard name assignments per vendor
- Exact certified date values
- VendorDrawer section heading label

## Deferred Ideas

- Standalone 1EdTech table view (explicitly removed from scope)
- EDTECH-V2 enhancements (certification level detail, filter by status, cross-reference with usage)
- ReportsView DPA tab wiring
