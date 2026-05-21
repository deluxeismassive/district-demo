# Phase 3: DPA View - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 03-dpa-view
**Areas discussed:** Header callout design, Table columns, Status filtering, Row interaction

---

## Header Callout Design

| Option | Description | Selected |
|--------|-------------|----------|
| Stat card (per-page) | Prominent metric box above the DPA table | |
| Page header badge | Count pill next to the heading | |
| Inline alert bar | Descriptive banner above the table | |
| **Dashboard card** | Top 8 at-risk vendors card on the Dashboard page | ✓ |

**User's choice:** The "needs attention" metric belongs on the Dashboard, not the DPA tab. It should be a card listing the top 8 highest-risk vendors — those with high usage + no DPA, no DPA, or a high risk score. Risk labels are hardcoded in mock data (not computed).

**Notes:** User explicitly redirected the callout from the DPA tab to the Dashboard. This replaces the original DPA-02 requirement for a per-tab count header with a more prominent cross-cutting Dashboard card.

---

## Table Columns / Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| DPA tab in ReportsView | DPA grid lives under Reports → DPA tab | |
| **DPA tab in DiscoveryView** | Tab bar on Discovery page: Discovery / DPA | ✓ |

**User's choice:** DPA grid moves to DiscoveryView as a sibling tab — not in ReportsView. Discovery and DPA grids toggle on the same page. VendorDrawer also gains a DPA section.

**Columns decided:** Vendor Name, Category, Status badge, Signed Date, Expiry Date, Risk Label.

**Notes:** User wants the DPA data in two places: (1) the DPA grid tab in DiscoveryView, and (2) the existing VendorDrawer slide-over. This unifies the vendor browsing experience.

---

## Status Filtering

Not explicitly discussed — deferred to Claude's discretion. Will use global text filter consistent with the Discovery table pattern.

---

## Row Interaction

Not explicitly discussed — deferred to Claude's discretion. Recommended: clicking a DPA grid row opens the same VendorDrawer (now extended with DPA section), consistent with Discovery tab behavior.

---

## Claude's Discretion

- Status filter UX (global search recommended for consistency)
- Row click behavior in DPA grid (open VendorDrawer recommended)
- Risk label badge colors
- VendorDrawer section ordering
- Dashboard card layout
- Whether ReportsView DPA tab reuses the new component or stays skeletal

## Deferred Ideas

- DPA-V2-03: Expiry warning row highlighting (90-day amber highlight)
- DPA-V2-01: Version currency indicator
- DPA-V2-02: Addendum presence indicator
- Computed risk scores connected to actual privacy policy dimensions (Phase 5)
- Click-to-filter from Dashboard card to pre-filtered DPA grid
