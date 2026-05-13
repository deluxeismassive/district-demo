# Features Research

**Domain:** Edtech school district data privacy / compliance portal
**Audience:** District IT administrators (shown by sales rep during demo)
**Researched:** 2026-05-13
**Confidence:** MEDIUM — based on training knowledge of edtech compliance platforms (Lightspeed Systems, GoGuardian, Privacy Vaults Online, Student DPA consortium, CoSN, ClassLink, Clever) through Aug 2025. No live verification available this session.

---

## Table Stakes

Features district IT admins expect to see. Their absence makes the portal feel like a toy or an unfinished alpha. These features establish credibility with the audience.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Vendor list with searchable/filterable table | Every compliance tool leads with this. Without it, admins can't orient themselves. | Low | Name, category, status columns at minimum |
| Per-vendor detail view or expandable row | Admins drill into a vendor to see the full picture. Flat lists feel insufficient. | Low-Med | Modal, drawer, or expand-in-row all work |
| DPA status badge/indicator | Pass/Fail/Pending visual is the first thing IT admins look for. Text-only status feels antiquated. | Low | Color-coded pill or icon; not just a text column |
| Signed date + expiry date columns | DPA contract currency is a compliance liability. Missing dates signals incomplete data. | Low | ISO date format preferred; flag overdue visually |
| Vendor count / coverage summary | "X of Y vendors covered" is the KPI every district tracks. Show it prominently. | Low | Headline stat, not buried in a table |
| Column sorting on data tables | Admins sort by risk, by date, by vendor name. Static tables feel broken without it. | Low | Client-side sort is fine for a demo |
| Basic filtering (status, category) | Filtering to "unsigned DPAs" or "high-risk" is a core workflow. | Low | Dropdown or button-group filter |
| Usage metrics per vendor | Frequency, last-seen date, and user/student count — standard in network monitoring tools | Low | Raw numbers are fine; sparklines are a bonus |
| Clear section navigation | Admins expect distinct views for Discovery, DPA, Risk, Certification — mixing them is confusing | Low | Sidebar or top nav with active state |
| Empty state handling | Tables that load with nothing shown look broken during a live demo | Low | Show placeholder copy or synthetic "no results" state when filters reduce to zero |

---

## Differentiators

Features that are not universally present in competitive tools but would visibly impress a district IT admin in a demo setting.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Risk Position page (converged view) | Competing tools show discovery and DPA in silos. A single converged risk view is rare and highly valued. | Med | This is the demo's centerpiece — invest here |
| Risk score or risk tier per vendor | Moving beyond status flags to a synthesized score (e.g. "High / Medium / Low") demonstrates analytical depth | Low-Med | Calculated from discovery volume + DPA gaps + addendum absence |
| Visual risk distribution (chart) | A donut/bar chart of vendors by risk tier communicates the district's posture at a glance — executives love it | Med | One chart is sufficient; avoid dashboard clutter |
| Addendum presence indicator | "DPA signed but addendum missing" is a known compliance gap. Calling it out explicitly shows domain expertise | Low | Boolean flag surfaced visually, not hidden in details |
| Version currency indicator | "DPA is for v1.2 but vendor is on v2.0" is a subtle but real risk. Few tools surface this clearly. | Low | "Current" / "Outdated" label next to DPA version |
| 1EdTech certification status | This is an emerging compliance layer most tools don't yet show. Its presence signals forward-looking coverage. | Low | Simple certification badge / status column |
| Tagging / classification by admin | Letting admins label vendors (e.g. "Curriculum", "Assessment", "IT Infrastructure") mirrors real workflows in mature districts | Low-Med | Tag creation + assignment is in scope; tag-based filtering is a bonus |
| Highlight bar / annotation on risk page | A text callout that explains why a specific vendor is risky reinforces the sales narrative ("here's what your data is telling you") | Low | Static per-vendor annotation in mock data |
| Consistent vendor cross-referencing | The same vendor appearing in Discovery, DPA, and 1EdTech pages with consistent naming shows data coherence | Low | Mock data discipline, not a new feature |

---

## Anti-Features

Things to deliberately not build in a demo context. Building these wastes time, adds demo-breaking complexity, or confuses the audience.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time data refresh / live sync | No backend exists; simulating it with timers is fragile and distracts from the compliance story | Static mock data that looks current (recent dates in fixtures) |
| User account management / roles | Admins seeing login screens or permission dialogs in a demo lose focus on the product value | No auth; portal opens directly |
| Bulk import / export (CSV, PDF) | Useful in production; in a demo it pulls attention to operational workflows vs. the insight story | Don't show; mention verbally if asked |
| Audit log / change history | Legitimate compliance feature, but adds UI complexity that dilutes the demo's focus | Out of scope for this iteration |
| Email notifications / alerts | Backend dependency; a demo stub that doesn't send email is worse than not showing the feature at all | Don't show |
| Multi-district switcher | One fixture district is the right demo scope; a switcher implies unfinished data for each district | Single district, show district name in header |
| Full CRUD on vendor records | Demo admins don't need to create vendors; it raises "is this real data?" questions | Read-only vendor data; tag CRUD only |
| Paginated API calls with loading states | No backend means simulating network latency; it looks broken not realistic | All data loads instantly from local fixtures |
| Compliance workflow / remediation tracking | Valuable in production (ticket creation, DPA request workflows), but adds scope that obscures the portal's observability value | Out of scope; describe verbally as "next step after seeing the data" |
| Mobile layout | Sales demos are conducted on desktop; responsive breakpoints add build time with no demo payoff | Desktop-only layouts acceptable |

---

## Risk Position Visualization Options

The Risk Position page is deliberately undefined — it needs a design decision. These are the viable options for displaying the converged discovery + DPA risk view, ordered by demo impact.

### Option A: Risk Tier Table with Score Column (Recommended baseline)
Each vendor gets a calculated risk tier (High / Medium / Low / Unknown) shown as a colored badge. A score or contributing factors column (e.g. "Unsigned DPA + High Usage") explains the rating inline. This is the safest option — familiar table UI, easy to scan, works even when an admin wants to dig in.

**Pros:** Familiar pattern, easy to explain during demo, filterable
**Cons:** Less visually striking than a chart; doesn't communicate overall posture at a glance
**Implementation:** Risk tier badge column + filter by tier + sortable score column

### Option B: Summary Chart + Risk Table (Recommended)
A donut or stacked bar chart showing vendor distribution by risk tier sits above the vendor table. Provides an executive-level "posture view" before the admin drills down. This is the closest analog to what security posture dashboards (Tenable, Qualys) use — an audience that district IT admins often have prior exposure to.

**Pros:** Visually impactful for a demo; immediately communicates scope of problem; shows both overview and detail
**Cons:** Chart requires a charting library (lightweight — Chart.js or Vue-chartjs); slight added build time
**Implementation:** Donut chart (vendor count by tier) + risk table below. Chart segments are clickable to filter the table.

### Option C: Risk Matrix / Heat Map
A 2x2 or 3x3 grid plotting vendors by (Usage Volume) x (DPA Coverage gap). High-usage / low-coverage vendors appear in the "red zone." Common in enterprise security GRC tools.

**Pros:** Sophisticated appearance; communicates two dimensions simultaneously
**Cons:** Harder to build correctly; hard to read with many vendors; unfamiliar to some IT admins who expect tables
**Implementation:** SVG or CSS grid with vendor dots positioned by computed coordinates

### Option D: Vendor Cards with Risk Color Coding
Grid of cards, each representing a vendor, color-coded by risk tier. Good for visual demos, poor for data density.

**Pros:** Visually engaging; easy to point at during a demo
**Cons:** Poor scalability (20+ vendors becomes unnavigable); hard to sort/filter mentally
**Recommendation:** Do not use as primary view; could work as a secondary "visual" toggle

### Design Decision Recommendation
**Use Option B (Summary Chart + Risk Table).** It gives sales reps a compelling visual to open with ("here's your district's risk at a glance") and then a detailed table to drill into. The chart investment is minimal with Vue-chartjs. The donut chart segmented by High / Medium / Low / No DPA tier is immediately legible and matches the mental model district admins already have from security dashboards.

### Risk Score Calculation (suggested logic for mock data)
A vendor's risk tier can be derived from:
- **High**: Active usage (high frequency or high user count) AND no signed DPA, OR signed DPA is expired
- **Medium**: Active usage AND DPA signed but outdated version, OR DPA signed but no addendum where required
- **Low**: Active usage AND current DPA AND addendum present
- **Unknown/Unreviewed**: No DPA data exists for vendor; usage detected but not yet evaluated

This logic can live in a computed property or a utility function, applied to mock data at render time — no backend required.

---

## DPA-Specific Patterns

How edtech DPA data is conventionally displayed in tools like Student DPA consortium portal, Lightspeed Filter, and Privacy Vaults Online.

### Standard Column Set
District admins expect to see, at minimum:
- **Vendor Name** — normalized, not raw domain
- **DPA Status** — Signed / Unsigned / Expired / Pending (color-coded)
- **Signed Date** — when the DPA was executed
- **Expiry Date** — when it lapses; expired dates should be flagged visually (red or warning icon)
- **DPA Version** — version of the agreement on file
- **Version Currency** — whether the on-file version matches the vendor's current version ("Current" / "Outdated")
- **Addendum Present** — yes/no flag; addendums are district-specific supplements common in K-12 compliance
- **DPA Type** — some tools distinguish "custom DPA" vs "standard template" vs "Student DPA consortium agreement"

### Visual Conventions in the Industry
- Status badges use a 3-color system: green (signed/current), yellow/amber (expiring soon or version outdated), red (expired, unsigned, or high-risk gap)
- Expiry dates within 90 days are commonly flagged with an amber indicator even if not yet expired
- A "needs attention" count in the page header ("4 vendors need DPA review") is standard in mature tools and drives admin action
- Sorting by "most urgent" (expired first, then expiring soon, then outdated version) is the most-used sort in real workflows
- Addendum presence is often shown as a simple checkmark / dash rather than a full boolean column — it's a visual scan item, not a sortable field

### What the Student DPA Consortium Model Looks Like
The Student Data Privacy Consortium (SDPC) and similar orgs maintain a registry where districts can see if a vendor has a pre-negotiated template DPA. The UI pattern is: vendor search → status summary → agreement document link → district customization notes. This is the mental model many IT admins carry into product demos.

---

## Tag/Classification Patterns

How data categorization UX works in compliance and IT governance tools, applied to the edtech vendor tagging use case.

### Standard Tag UX Conventions
- Tags are displayed as small colored pills on the vendor row or detail view
- Tag creation happens inline (type-to-create in a combobox input, "Create 'Curriculum'" affordance)
- Tags are not exclusive — a vendor can have multiple tags
- Tag color is either user-assigned or auto-assigned from a predefined palette
- Tag management (rename, delete, merge) lives in a dedicated settings/admin page, not inline
- Deleting a tag prompts: "This will remove the tag from X vendors. Continue?"

### Filtering by Tag
- Tag-based filtering uses a multi-select pattern (show vendors with ANY of the selected tags, or ALL — "any" is more common)
- Selected filter tags appear as dismissible chips above the table
- "Clear all filters" is always present when filters are active

### What to Show in the Demo (Minimal Viable Tag UX)
Given the scope (tag creation + editing, not full taxonomy management), the right UX pattern is:
1. Tags column in the vendor table showing existing tag pills
2. Click a vendor row → tag assignment interface (multi-select combobox with "create new" affordance)
3. Tags page (or settings section) with a list of all tags, editable name/color, and delete
4. Filter-by-tag affordance on the Discovery page (at minimum)

Do not build a full taxonomy hierarchy (parent/child tags). Flat tags are the industry norm for this audience and scope.

### Tag Color Assignment
Pre-define 8-10 distinct colors in mock data. When a user creates a new tag, auto-assign the next available color from the palette. This keeps the UI visually coherent without requiring a color picker in the demo.

---

## Sources

**Confidence note:** All findings based on training knowledge of the following platforms and resources (no live verification this session):
- Student Data Privacy Consortium (SDPC) portal patterns
- Privacy Vaults Online feature set
- Lightspeed Systems Filter/Analytics UI conventions
- GoGuardian Admin console patterns
- CoSN (Consortium for School Networking) privacy toolkit documentation
- 1EdTech (formerly IMS Global) certification registry patterns
- General enterprise GRC/compliance dashboard UI conventions (Tenable, Qualys posture views)

**Confidence level: MEDIUM** — These patterns are stable and well-established in the edtech compliance space as of the knowledge cutoff. The 1EdTech section reflects conventions as of mid-2024; the certification registry format may have evolved.
