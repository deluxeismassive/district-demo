# Requirements: District Demo Portal

**Defined:** 2026-05-13
**Core Value:** Sales reps can walk a district admin prospect through a realistic, data-rich portal that makes the value of the product immediately tangible — and any section can be changed within hours for a specific demo.

## v1 Requirements

### Foundation

- [x] **FOUND-01**: App has multi-page SPA routing with a persistent sidebar nav linking all sections
- [ ] **FOUND-02**: Every page renders inside a consistent app shell (header, nav, content area)
- [ ] **FOUND-03**: All display data lives in `src/data/*.js` files, editable without touching components
- [x] **FOUND-04**: Pinia store manages shared tag state accessible across all pages

### Discovery

- [ ] **DISC-01**: User can view a sortable, filterable table of vendors with name, category, usage metrics, and user/student counts
- [ ] **DISC-02**: User can assign and remove tags on a vendor from the Discovery table
- [ ] **DISC-03**: User can expand or open a detail view for a vendor to see full usage data

### DPA

- [ ] **DPA-01**: User can view a sortable, filterable table of vendors with DPA status badge, signed date, and expiry date
- [ ] **DPA-02**: Page header shows a count of vendors that need DPA review

### Risk

- [ ] **RISK-01**: Each vendor has a calculated risk tier (High / Medium / Low) derived from DPA status and usage volume
- [ ] **RISK-02**: A donut chart displays the distribution of vendors by risk tier

### 1EdTech

- [ ] **EDTECH-01**: User can view a table of vendors with their 1EdTech certification status badge

### Tags

- [ ] **TAGS-01**: User can create, rename, and delete tags with color assignment on a Tags management page
- [ ] **TAGS-02**: User can assign and remove tags on vendor rows in the Discovery page

## v2 Requirements

Deferred to future iteration. Tracked but not in current roadmap.

### DPA Enhancements

- **DPA-V2-01**: Version currency indicator — show whether the on-file DPA matches the vendor's current version
- **DPA-V2-02**: Addendum presence indicator — flag whether a district-specific addendum exists
- **DPA-V2-03**: Expiry warning — amber highlight for DPAs expiring within 90 days

### Risk Enhancements

- **RISK-V2-01**: Risk table with contributing factors — vendor table showing tier badge and what drives the risk score
- **RISK-V2-02**: Click chart segment to filter the risk table below

### 1EdTech Enhancements

- **EDTECH-V2-01**: Certification level detail — which 1EdTech standards/tiers the vendor holds
- **EDTECH-V2-02**: Filter by certification status
- **EDTECH-V2-03**: Cross-reference 1EdTech certified vendors with Discovery active usage

### Tag Enhancements

- **TAGS-V2-01**: Filter Discovery table by one or more tags
- **TAGS-V2-02**: Tag persistence across page refresh (localStorage)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real backend / live data connections | Demo uses synthetic data only |
| Authentication / login screen | Portal opens directly; login adds friction with no demo benefit |
| Mobile optimization | Sales demos happen on desktop; responsive breakpoints waste build time |
| Multi-district support | Single fixture district is the right demo scope |
| Bulk import / export (CSV, PDF) | Pulls demo attention to operational workflows vs. insight story |
| Full CRUD on vendor records | Raises "is this real data?" questions; tag CRUD only |
| User account management / roles | Not relevant to demo audience |
| Audit log / change history | Adds complexity without demo value |
| Email notifications / alerts | Requires backend; demo stub looks broken |
| Paginated API calls / loading states | No backend; simulating latency looks broken |
| Compliance workflow / remediation tracking | Out of scope; describe verbally as "next step" |

## Traceability

Updated: 2026-05-13 after roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Complete |
| FOUND-02 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Complete |
| FOUND-03 | Phase 2 | Pending |
| DISC-01 | Phase 2 | Pending |
| DISC-02 | Phase 2 | Pending |
| DISC-03 | Phase 2 | Pending |
| TAGS-02 | Phase 2 | Pending |
| DPA-01 | Phase 3 | Pending |
| DPA-02 | Phase 3 | Pending |
| EDTECH-01 | Phase 4 | Pending |
| RISK-01 | Phase 5 | Pending |
| RISK-02 | Phase 5 | Pending |
| TAGS-01 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0

---
*Requirements defined: 2026-05-13*
*Last updated: 2026-05-13 after roadmap creation*
