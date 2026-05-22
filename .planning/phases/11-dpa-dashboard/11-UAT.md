---
status: complete
phase: 11-dpa-dashboard
source: [11-01-SUMMARY.md, 11-02-SUMMARY.md]
started: 2026-05-21T00:00:00Z
updated: 2026-05-21T00:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. DPA Table Loads + 6 Sortable Columns
expected: Navigate to `/dpa`. UTable shows 27 rows with 6 column headers. Click each header — order cycles asc → desc → unsorted, arrow icon flips.
result: pass

### 2. DPA Filter Narrows + Clears
expected: Type "google" in the `/dpa` filter input. Visible rows narrow to only Google-related vendors (~1 row). Clear the input — all 27 rows return. "X vendors need DPA review" readout updates live.
result: pass

### 3. DPA Status Badge Hex Colors
expected: On `/dpa`, the Status column badges show: Signed = green (#16a34a), Expired = red (#dc2626), Pending = amber (#f59e0b), Unsigned = gray (#6b7280). Risk Label column shows red/amber tier hex colors per `shared/utils/riskLabels.ts`. No plain-text status anywhere.
result: pass

### 4. Dashboard KPI Tiles + Top-8 UCard
expected: Visit `/`. Three KPI tiles read "27" (Total Vendors), "16" (DPAs Signed), "9" (Needs Review). Below them, a single UCard titled "Top 8 Vendors Needing Attention" lists 8 vendors: Zoom, Kahoot, Quizlet, Flip, Prodigy, Renaissance, Naviance, Infinite Campus. Each row shows a color-coded risk-label badge (3× dark red, 3× lighter red, 2× amber).
result: pass

### 5. VendorDrawer Mount from Both Surfaces
expected: Click any row in the `/dpa` table → VendorDrawer slides in from the right with that vendor's name, category, and DPA section. Close the drawer, navigate to `/`, click any Top-8 row → same drawer mounts with that vendor. DPA status-badge color inside the drawer matches the row's badge color.
result: pass

### 6. URL-Key Dedup Across Routes
expected: Open DevTools Network tab. Navigate from `/` to `/dpa` (or reverse) — `/api/dpa` and `/api/vendors` are each fetched ONCE total across both routes, not re-fetched on the second page. (Nuxt's URL-key dedup confirms the same useFetch cache entry is shared.)
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
