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
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>

    <!--
      KPI tiles — plain divs (NOT UCards) for v0.5.0 visual parity and to avoid
      a size-disparity jar against the wider Top-8 UCard below (research §6,
      Open Question #2).
    -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">Total Vendors</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">{{ totalVendors }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">DPAs Signed</div>
        <div class="text-2xl font-semibold text-gray-900 mt-1">{{ signedCount }}</div>
      </div>
      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <div class="text-sm text-gray-500">Needs Review</div>
        <div class="text-2xl font-semibold mt-1 text-red-600">{{ needsReviewCount }}</div>
      </div>
    </div>

    <!--
      Top-8 UCard — single UCard on the page; default variant="outline".
      Slot keys: #header for the title row, default slot for the list body
      (UCard's body region — NOT named "content", which is USlideover's key).
    -->
    <UCard variant="outline" class="bg-white">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-900">Top 8 Vendors Needing Attention</h2>
          <span class="text-sm text-gray-500">{{ topAtRisk.length }} flagged</span>
        </div>
      </template>
      <div class="divide-y divide-gray-100">
        <div
          v-for="row in topAtRisk"
          :key="row.vendorId"
          class="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-4 sm:-mx-6 px-4 sm:px-6"
          @click="selectVendor(row.vendorId)"
        >
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">{{ row.name }}</span>
            <span class="text-xs text-gray-500">{{ row.category }}</span>
          </div>
          <UBadge
            :label="row.riskLabel"
            color="neutral"
            variant="solid"
            :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }"
          />
        </div>
      </div>
    </UCard>

    <!--
      Plan 11-02 — drawer mounted ONCE at the page level (Plan 11-01 carry-forward).
      Auto-imported from app/components/VendorDrawer.vue — no manual import.
    -->
    <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
  </div>
</template>
