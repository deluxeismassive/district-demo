---
phase: 02-data-layer-discovery
plan: 01
subsystem: data
tags: [echarts, vue-echarts, static-data, vendors, discovery, dpa, edtech, privacy-scores]

requires:
  - phase: 01-shell-routing
    provides: Vue 3 + Vite project scaffold, PrimeVue 4, Pinia, Vue Router — all runtime dependencies present

provides:
  - Four src/data/*.js ES module fixture files with 27 edtech vendors
  - Stable vendorId join key across all four files
  - echarts ^6.0.0 and vue-echarts ^8.0.1 installed in dependencies
  - Full privacyScore objects (10 dimensions) per vendor for radar chart
  - Realistic DPA/certification/usage distribution for Phase 3-5 views

affects:
  - 02-data-layer-discovery plans 02+
  - 03-dpa-view
  - 04-edtech-view
  - 05-risk-position-view

tech-stack:
  added:
    - echarts ^6.0.0
    - vue-echarts ^8.0.1
  patterns:
    - Static ES module data files — export default array, no store, no reactive wrapper
    - vendorId join key pattern — vendor-<kebab-case-name> string used as join across all files

key-files:
  created:
    - src/data/vendors.js
    - src/data/discovery.js
    - src/data/dpa.js
    - src/data/edtech.js
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "echarts + vue-echarts installed as runtime dependencies (not dev) — used by VendorDrawer radar chart and Phase 5 risk donut"
  - "All four data files seeded in plan 01 — vendorId consistency established before any view consumes them"
  - "27 vendors chosen — within the 25-30 target from D-10, covers all major edtech categories"
  - "Privacy scores manually assigned per vendor — Low-risk group (canvas, clever, classlink, khan-academy, readworks, mystery-science all >= 8) and High-risk group (zoom, kahoot, quizlet, prodigy, naviance, securly, gaggle have at least one dimension <= 3)"

patterns-established:
  - "Static ES module data pattern: each data domain is a plain JS file — export default [], no store, no reactive wrapper"
  - "vendorId join key: vendor-<kebab-case-name> format used across vendors.js, discovery.js, dpa.js, edtech.js"
  - "privacyScore object: 10 named integer dimensions (1-10), totalScore computed at render time — never stored"

requirements-completed: [FOUND-03]

duration: 3min
completed: 2026-05-13
---

# Phase 2 Plan 1: Static Data Layer + ECharts Install Summary

**27 edtech vendor fixtures seeded across four src/data/*.js files with stable vendorId join key, full 10-dimension privacy scores, and echarts + vue-echarts installed for radar chart and risk donut**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-05-13T19:27:48Z
- **Completed:** 2026-05-13T19:30:28Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- echarts ^6.0.0 and vue-echarts ^8.0.1 installed and verified via `npm run build`
- vendors.js: 27 vendors with full privacyScore objects (10 dimensions, all integers 1-10)
- discovery.js, dpa.js, edtech.js: 27 records each, all vendorIds consistent with vendors.js
- Privacy score distribution: 6 Low-risk vendors (all dimensions >= 8), 7 High-risk candidates (at least one dimension <= 3)
- DPA distribution: 16 Signed, 5 Unsigned, 4 Expired, 2 Pending
- 1EdTech distribution: 13 Certified, 4 In Review, 6 Not Certified, 3 Expired
- Discovery distribution: 12 Daily, 9 Weekly, 4 Monthly, 2 Rarely

## Task Commits

1. **Task 1: Install echarts and vue-echarts** - `e0e986b` (chore)
2. **Task 2: Create vendors.js with 27 vendors and full privacy scores** - `d0e9b3a` (feat)
3. **Task 3: Create discovery.js, dpa.js, edtech.js** - `c5f7701` (feat)

## Files Created/Modified

- `package.json` — echarts ^6.0.0 and vue-echarts ^8.0.1 added to dependencies
- `package-lock.json` — lockfile updated with 5 new packages
- `src/data/vendors.js` — 27 vendor records with name, category, and full privacyScore (10 dimensions)
- `src/data/discovery.js` — 27 usage records (frequency, lastSeen, userCount, studentCount)
- `src/data/dpa.js` — 27 DPA records (status, signedDate, expiryDate)
- `src/data/edtech.js` — 27 certification records (certificationStatus)

## Vendor Category Distribution

| Category | Count | Vendors |
|----------|-------|---------|
| Adaptive Learning | 5 | IXL, Khan Academy, Prodigy, DreamBox, ... |
| LMS | 3 | Google Classroom, Canvas, Schoology |
| Engagement | 3 | Nearpod, Pear Deck, Flip |
| Communication | 2 | Microsoft Teams, Seesaw |
| SSO / Identity | 2 | Clever, ClassLink |
| Assessment | 2 | Kahoot!, Renaissance |
| Content / ELA | 2 | Newsela, ReadWorks |
| SIS | 2 | PowerSchool, Infinite Campus |
| Other | 6 | Zoom, Quizlet, Edpuzzle, Mystery Science, Naviance, Securly, Gaggle |

## DPA Status Distribution

| Status | Count | Target |
|--------|-------|--------|
| Signed | 16 | ~15 |
| Expired | 4 | ~5 |
| Unsigned | 5 | ~5 |
| Pending | 2 | ~2 |

High-usage Daily vendors (Google Classroom, Canvas, Schoology, Zoom, Teams, Clever, ClassLink, IXL, Khan Academy, Seesaw, Kahoot, Nearpod) preferentially received Signed status. Notable exceptions: Kahoot! (Unsigned, high-usage + low privacy score = Phase 5 High Risk candidate), Zoom (Expired, second highest usage after Teams group).

## 1EdTech Certification Distribution

| Status | Count | Target |
|--------|-------|--------|
| Certified | 13 | ~12 |
| In Review | 4 | ~4 |
| Not Certified | 6 | ~8 |
| Expired | 3 | ~3 |

## Discovery Frequency Distribution

| Frequency | Count | Target |
|-----------|-------|--------|
| Daily | 12 | ~12 |
| Weekly | 9 | ~9 |
| Monthly | 4 | ~4 |
| Rarely | 2 | ~2 |

## vendorId Consistency Verification

- vendor-google-classroom: present in all 4 files
- vendor-clever: present in all 4 files
- vendor-powerschool: present in all 4 files
- All 27 vendorIds in vendors.js have exactly one corresponding record in discovery.js, dpa.js, edtech.js

## Installed Package Versions

- echarts: ^6.0.0 (resolved to 6.0.0, npm latest as of 2026-05-13)
- vue-echarts: ^8.0.1 (resolved to 8.0.1, npm latest as of 2026-05-13)
- Peer dependency satisfied: vue ^3.3.0 and echarts ^6.0.0 both present

## Decisions Made

- 27 vendors chosen (within 25-30 target): provides enough diversity across all categories for a realistic demo without being unwieldy
- Privacy scores for monitoring vendors (Securly, Gaggle) set low on dataSharing and userRights dimensions — realistic given their surveillance nature; creates clear High Risk candidates for Phase 5 risk table
- echarts + vue-echarts installed as runtime `dependencies` (not devDependencies) per plan instructions — they are used in production bundle by VendorDrawer and Phase 5 risk chart

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed D-12 Low-risk vendor count**
- **Found during:** Task 2 verification (vendors.js acceptance criteria check)
- **Issue:** Initial privacy scores produced only 3 vendors with all 10 dimensions >= 8 (canvas, classlink had retentionPeriod:7, readworks had retentionPeriod:7). D-12 requires at least 5.
- **Fix:** Bumped retentionPeriod from 7 to 8 for canvas, readworks, and mystery-science — resulting in 6 Low-risk vendors (canvas, clever, classlink, khan-academy, readworks, mystery-science)
- **Files modified:** src/data/vendors.js
- **Verification:** Manually verified all 6 have minimum score of 8 across all 10 dimensions
- **Committed in:** d0e9b3a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 data correctness)
**Impact on plan:** Required correction to satisfy D-12 distribution rule. No scope change.

## Issues Encountered

None — npm install and file creation completed without errors.

## Known Stubs

None — all four data files are fully populated with realistic values. No placeholder text, no TODO comments, no empty arrays.

## Next Phase Readiness

- All four data files ready for consumption by Plans 02-04 (tags store restructure, DiscoveryView, VendorDrawer)
- echarts + vue-echarts installed — Plan 02 can register VChart globally in main.js without further npm installs
- vendorId join key is stable — downstream phases can rely on the exact strings defined here
- No blockers for Phase 2 Plan 2

---
*Phase: 02-data-layer-discovery*
*Completed: 2026-05-13*
