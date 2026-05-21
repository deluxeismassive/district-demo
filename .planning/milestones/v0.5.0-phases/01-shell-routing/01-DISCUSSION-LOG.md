# Phase 1: Shell & Routing - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-13
**Phase:** 01-shell-routing
**Areas discussed:** Visual style, App identity, Sidebar design, Stub page content

---

## Visual Style

| Option | Description | Selected |
|--------|-------------|----------|
| Clean enterprise | Dark sidebar, white content area, muted blues/grays | ✓ |
| Light minimal | All-white, subtle borders, minimal color | |
| Dark mode | Dark background throughout | |

**User's choice:** Clean enterprise
**Notes:** Feels like a real compliance tool; right for the district admin audience.

---

## Component Library

| Option | Description | Selected |
|--------|-------------|----------|
| PrimeVue + Tailwind | PrimeVue for tables/dropdowns/badges, Tailwind for layout | ✓ |
| Tailwind only | Build everything from scratch | |
| Minimal CSS | Just style.css | |

**User's choice:** PrimeVue + Tailwind

---

## Brand Colors

| Option | Description | Selected |
|--------|-------------|----------|
| PGC brand colors | User-provided hex values | ✓ |
| Professional defaults | Standard enterprise blue/navy | |
| You decide | Claude picks | |

**User's choice:** PGC brand colors
**Notes:** `#DA8231` (orange/accent), `#484CE6` (blue-violet/primary)

---

## App Identity

| Option | Description | Selected |
|--------|-------------|----------|
| PGC product name | Show actual product name | ✓ |
| District-branded | Show demo district name in header | |
| Generic placeholder | "District Portal" | |

**User's choice:** Product name "Schoolday"

---

## District Name

| Option | Description | Selected |
|--------|-------------|----------|
| Real-sounding district | e.g. "Lakewood Unified School District" | ✓ |
| Generic placeholder | "Demo District USD" | |
| I'll provide the name | Specific name | |

**User's choice:** Real-sounding district name (specific name deferred to Phase 2 data creation)

---

## Sidebar Design

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed, always visible | Always open, no collapse | ✓ |
| Collapsible | Can collapse to icons | |

**User's choice:** Fixed, always visible

---

## Nav Section Labels

**User's choice:** Named explicitly — **Dashboard, Discovery, Reports, Settings** (in that order)

---

## Reports Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Sub-navigation / tabs within Reports | Single /reports route, tabs for DPA/Risk/1EdTech | ✓ |
| Separate routes under /reports/ | DPA, Risk, 1EdTech as separate pages | |
| Single combined page | All three datasets on one scrollable page | |

**User's choice:** Tabs within Reports page
**Notes:** Significant structural decision — collapses 3 roadmap phases into sub-tabs of one route.

---

## Dashboard Content

| Option | Description | Selected |
|--------|-------------|----------|
| Overview / summary stats | Key numbers at a glance | ✓ |
| Just a landing page stub | Placeholder for now | |
| You decide | Make it look like a real homepage | |

**User's choice:** Overview/summary stats (vendor count, DPA coverage, risk summary)

---

## Settings Content

| Option | Description | Selected |
|--------|-------------|----------|
| Tags management only | Tags CRUD only | ✓ |
| Tags + district info | Tags + district config placeholder | |
| You decide | Whatever makes sense | |

**User's choice:** Tags management only

---

## Stub Page Content

| Option | Description | Selected |
|--------|-------------|----------|
| Loading skeleton | Gray placeholder rows — realistic | ✓ |
| Empty state with icon | "No data yet" | |
| Minimal placeholder text | Just the page title | |

**User's choice:** Loading skeleton

---

## Claude's Discretion

- PrimeVue theme preset selection (Lara / Aura / Nora)
- Icon set for sidebar nav items
- Sidebar width and padding specifics
- Skeleton row count and shape per page type

## Deferred Ideas

None surfaced during discussion.
