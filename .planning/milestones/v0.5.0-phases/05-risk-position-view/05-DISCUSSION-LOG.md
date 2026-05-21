# Phase 5: Risk Position View - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 05-risk-position-view
**Areas discussed:** Risk tier formula, Page layout, ReportsView DPA tab, Risk data source, Table columns

---

## Risk Tier Formula

| Option | Description | Selected |
|--------|-------------|----------|
| DPA status + usage (base) | Unsigned/Expired + high usage = High; low usage = Medium; Signed/Pending = Low | ✓ |
| DPA status only | Unsigned/Expired = High, Pending = Medium, Signed = Low | |
| riskLabel field (existing) | Use existing riskLabel values from dpa.js | |

**User's choice:** DPA status + usage, with 1EdTech certification added as a modifier that reduces the tier by one level.
**Notes:** "It should mostly be 1, but I think we can fold in 1EdTech certification in there. Certifications made by 1EdTech should be available for us to use and add to the calculation."

---

## 1EdTech Factor

| Option | Description | Selected |
|--------|-------------|----------|
| Reduce tier by one level | Certified vendors drop one tier (High→Med, Med→Low). High can't be fully offset by certification. | ✓ |
| Bonus that prevents High | Certified vendors can't be High risk regardless of DPA/usage | |
| Separate column/indicator | Don't fold into tier — show as independent badge | |

**User's choice:** Reduce tier by one level.
**Notes:** Active 1EdTech certification (certificationStatus === 'Certified') drops tier by one level. Expired certifications do not reduce risk.

---

## Page Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Chart + full vendor table | Donut chart at top, sortable vendor table below | ✓ |
| Chart only | Donut summary only, no vendor drill-down | |

**User's choice:** Chart + full vendor table.

---

## ReportsView DPA Tab

| Option | Description | Selected |
|--------|-------------|----------|
| Remove it | Delete DPA tab — admins access DPA via DiscoveryView | ✓ |
| Wire it to DpaGrid | Show DpaGrid in the tab too | |
| Leave as skeleton | Keep stub for future work | |

**User's choice:** Remove it.

---

## Risk Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Computed in component | Join dpa.js + discovery.js + edtech.js live in component | ✓ |
| New src/data/risk.js file | Pre-compute in dedicated file | |
| Add riskTier to vendors.js | Static field on each vendor record | |

**User's choice:** Computed in component.

---

## Table Columns

| Option | Description | Selected |
|--------|-------------|----------|
| Vendor, Risk tier, DPA status, Usage | 4 columns showing calculation inputs | |
| Vendor + Risk tier only | Minimal 2-column view | |
| Vendor, Risk tier, DPA, 1EdTech, Usage | All contributing factors visible | ✓ |

**User's choice:** All contributing factors — Vendor Name, Risk Tier, DPA Status, 1EdTech Status, User Count.

---

## Claude's Discretion

- Exact ECharts donut option structure (legend position, tooltip formatter, label visibility)
- Whether vendor name links to VendorDrawer
- Card/container styling for chart section
- "Users" column header label

## Deferred Ideas

- RISK-V2-01: Risk table with per-factor drill-down detail
- RISK-V2-02: Click donut segment to filter the vendor table
- Privacy score as a risk input (privacyScore fields exist in vendors.js but not used in v1)
