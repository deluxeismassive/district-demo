# Phase 2: Data Layer + Discovery - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 02-data-layer-discovery
**Areas discussed:** Data file structure, Vendor detail view, Tag assignment UX, Tag persistence

---

## Data File Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Separate files per source | vendors.js + discovery.js + dpa.js + edtech.js, each phase adds its own file | ✓ |
| One merged vendors.js | All fields in one object per vendor | |
| Separate + computed join | Separate files plus a composable that merges them | |

**User's choice:** Separate files per source

**Follow-up: Scope of Phase 2 data seeding**

| Option | Description | Selected |
|--------|-------------|----------|
| All 3 source files now | vendors.js + discovery.js + dpa.js + edtech.js all seeded in Phase 2 | ✓ |
| Discovery only now | Only vendors.js + discovery.js; DPA and 1EdTech files added later | |

**User's choice:** All 3 files now — ensures vendorId consistency from the start

**Notes:** User explicitly flagged that Discovery, DPA, and 1EdTech are 3 distinct data sources with different structures that cross-reference to produce reports. File structure mirrors real-world source separation intentionally.

---

## Vendor Detail View

| Option | Description | Selected |
|--------|-------------|----------|
| Slide-over panel | PrimeVue Drawer slides from right, table stays visible | ✓ |
| Row expansion | Inline accordion-style expansion within DataTable | |
| Modal dialog | Centered modal over the table | |

**User's choice:** Slide-over panel (PrimeVue Drawer)

**Follow-up: What does the slide-over show?**

| Option | Description | Selected |
|--------|-------------|----------|
| Usage deep-dive | Discovery metrics only (usage, counts, frequency) | ✓ |
| Full cross-section view | Discovery + DPA + 1EdTech summary in one panel | |
| Claude's discretion | Claude decides what's useful for demo context | |

**User's choice:** Usage deep-dive — plus privacy policy radar chart (added later in discussion)

**Notes:** User added that the slide-over also needs a privacy policy radar chart with 10 scored dimensions and a total score. This was added as a follow-up requirement during the "Done" prompt.

---

## Tag Assignment UX

| Option | Description | Selected |
|--------|-------------|----------|
| Tags column with MultiSelect | Dedicated column, click opens dropdown | |
| Tag pills + inline add button | Pills in row + '+' to open popover | |
| Tags only in detail panel | Read-only in table, assignment via slide-over | ✓ |

**User's choice:** Table shows pills (read-only); assignment is via the slide-over panel only

**Notes:** User clarified that tags are hierarchical — parent groups contain child tags. Only child tags are assigned to vendors. Tag pills in the table show child tags grouped under their parent. No inline '+' or creation in the table; all tag management is in the Settings/Tags page (Phase 6).

**Follow-up: Assignment granularity**

| Option | Description | Selected |
|--------|-------------|----------|
| Assign the parent tag | Implies all children | |
| Assign individual child tags | User picks specific children; parent shown as group header | ✓ |
| Either level is assignable | Both parent and child can be assigned | |

**User's choice:** Assign individual child tags

---

## Tag Persistence

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage persistence | Survives refresh and browser close | ✓ |
| In-memory only | Resets on page refresh | |

**User's choice:** localStorage persistence

**Follow-up: Seed tags**

| Option | Description | Selected |
|--------|-------------|----------|
| Claude decides | Realistic edtech-context parent groups and child tags | ✓ |
| I'll specify them | User defines tag names | |
| No seed tags | Start empty | |

**User's choice:** Claude decides — match edtech demo context

---

## Privacy Policy Radar Chart (added during wrap-up)

**User's addition:** Each vendor needs 10 privacy policy dimension scores (1–10 each, total out of 100), rendered as a radar/spider chart in the vendor detail slide-over.

**Dimensions:**
1. Information Collected
2. Use of Information
3. Data Sharing
4. Security Measures
5. User Rights
6. Retention Period
7. Compliance with Laws
8. Updates to Privacy Policy
9. Overall Clarity and Transparency
10. Contact Information

**Data location:**

| Option | Description | Selected |
|--------|-------------|----------|
| vendors.js — vendor metadata | Scores describe the vendor, available to all sections | ✓ |
| discovery.js — Discovery-specific | Only used in Discovery detail right now | |

**User's choice:** vendors.js — it's shared vendor metadata

---

## Claude's Discretion

- Exact vendor fixture count (target 25–30)
- Specific edtech brand names to include
- Specific parent group and child tag names for seed data
- Filter UX in the Discovery table
- Radar chart visual styling
- Layout and proportions of the vendor detail slide-over

## Deferred Ideas

None — discussion stayed within Phase 2 scope.
