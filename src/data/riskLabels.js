// Allowed riskLabel values for DPA records (per D-10).
// Vendors with no risk concern use null, not a string from this list.
export const RISK_LABELS = {
  HIGH_USAGE_NO_DPA: 'High Usage / No DPA',
  NO_DPA: 'No DPA',
  HIGH_RISK_SCORE: 'High Risk Score'
}

// Badge background colors for risk labels (per D-08 — severity semantics, reds for highest risk).
// Keys are the exact label strings; values are hex colors used by PrimeVue Tag :style.
// - "High Usage / No DPA" → red-700 (#b91c1c)  — most severe: vendor in active use without DPA
// - "No DPA"              → red-500 (#ef4444)  — severe but lower usage
// - "High Risk Score"     → amber-600 (#d97706) — moderate: signed DPA but poor privacy posture
export const RISK_LABEL_COLORS = {
  'High Usage / No DPA': '#b91c1c',
  'No DPA': '#ef4444',
  'High Risk Score': '#d97706'
}

// Status badge colors for DPA status column (per D-07).
// - Signed   → green-600 (#16a34a)
// - Expired  → red-600   (#dc2626)
// - Pending  → amber-500 (#f59e0b)
// - Unsigned → gray-500  (#6b7280)
export const DPA_STATUS_COLORS = {
  Signed: '#16a34a',
  Expired: '#dc2626',
  Pending: '#f59e0b',
  Unsigned: '#6b7280'
}

// Status badge colors for 1EdTech certification status column (per D-12).
// Reuses the DPA semantic palette for visual consistency across the portal.
// - Certified     → green-600 (#16a34a)  — certified and current
// - Not Certified → gray-500  (#6b7280)  — vendor has no certification
// - In Review     → amber-500 (#f59e0b)  — application in progress
// - Expired       → red-600   (#dc2626)  — previously certified, now lapsed
export const EDTECH_STATUS_COLORS = {
  Certified: '#16a34a',
  'Not Certified': '#6b7280',
  'In Review': '#f59e0b',
  Expired: '#dc2626'
}
