<script setup lang="ts">
import type { Vendor, DpaRecord, RiskLabel } from '#shared/types/data'
import { RISK_LABEL_COLORS } from '#shared/utils/riskLabels'

definePageMeta({
  nav: true,
  navLabel: 'Dashboard',
  navIcon: 'i-lucide-home',
  navOrder: 10,
})

// Phase 11 — Dashboard shares /api/dpa + /api/vendors with the DPA page and the
// VendorDrawer's internal fetches. NO `key` option: the implicit URL key dedups
// across all three call sites (Plan 11-01 carry-forward, research §8).
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
const { data: dpaList } = await useFetch('/api/dpa', {
  default: () => [],
})

// Carry-forward (10-01 lesson #3): explicit `(v: Vendor)` annotation — TS strict
// mode rejects implicit `any` on .map/.filter callbacks.
const vendorMap = computed<Record<string, Vendor>>(() =>
  Object.fromEntries(vendors.value.map((v: Vendor) => [v.vendorId, v]))
)

// Top-8 derivation — verbatim from v0.5.0 DashboardView.vue lines 13-26.
// `filter(d => d.riskLabel !== null).slice(0, 8)` surfaces the 8 demo-critical
// vendors (Zoom, Kahoot, Quizlet, Flipgrid, Prodigy, Renaissance, Naviance,
// Infinite Campus) — research §2 enumerates the candidate set.
const topAtRisk = computed(() =>
  dpaList.value
    .filter((d: DpaRecord) => d.riskLabel !== null)
    .slice(0, 8)
    .map((d: DpaRecord) => {
      const v = vendorMap.value[d.vendorId]
      return {
        vendorId: d.vendorId,
        name: v?.name ?? d.vendorId,
        category: v?.category ?? '—',
        // filter above narrows out null; cast safe.
        riskLabel: d.riskLabel as RiskLabel,
      }
    })
)

// KPI computeds — verbatim from v0.5.0 DashboardView.vue lines 28-34.
// Expected counts against current data: 27 / 16 / 9.
const totalVendors = computed(() => vendors.value.length)

const signedCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Signed').length
)

const needsReviewCount = computed(() =>
  dpaList.value.filter((d: DpaRecord) => d.status === 'Unsigned' || d.status === 'Expired').length
)

// Drawer state-lifting trio — same shape as Plan 11-01 dpa.vue, with
// `selectVendor(vendorId)` instead of `onRowSelect(_event, row)` because Top-8
// rows are plain divs (not UTable rows). One VendorDrawer instance at page
// level (research §5, §10).
const selectedVendorId = ref<string | null>(null)

function selectVendor(vendorId: string) {
  selectedVendorId.value = vendorId
}

const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v: Vendor) => v.vendorId === selectedVendorId.value) ?? null
    : null
)

const drawerOpen = computed({
  get: () => selectedVendorId.value !== null,
  set: (v) => { if (!v) selectedVendorId.value = null },
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <p class="text-gray-600 mt-2">District overview. (Phase 11 wires the Top 8 card.)</p>
  </div>
</template>
