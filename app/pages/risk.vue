<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Vendor, DpaRecord, DpaStatus, EdtechRecord, EdtechCertStatus } from '#shared/types/data'
import { RISK_TIER_COLORS, DPA_STATUS_COLORS } from '#shared/utils/riskLabels'
// VChart + ECOption are auto-imported by nuxt-echarts (Phase 7 nuxt.config.ts).
// VendorDrawer is auto-imported from app/components/ (Nuxt 4 convention).
// useFetch / computed / ref are auto-imported by Nuxt 4.

definePageMeta({
  nav: true,
  navLabel: 'Risk Position',
  navIcon: 'i-lucide-alert-triangle',
  navOrder: 40,
})

// Phase 12 — three-way join: Vendor + DpaRecord + EdtechRecord.
// NO `key` option on any useFetch — URL-key dedup is the contract; the
// drawer's internal `/api/dpa` + `/api/edtech` fetches re-use this page's
// cached payloads (Phase 11 carry-forward).
const { data: vendors } = await useFetch('/api/vendors', { default: () => [] })
const { data: dpaList } = await useFetch('/api/dpa', { default: () => [] })
const { data: edtechList } = await useFetch('/api/edtech', { default: () => [] })

// Numeric tier ordering — alphabetical 'H' < 'L' < 'M' would put Medium last;
// `tierOrder` is the sort accessor; the UBadge label renders `row.original.tier`.
const TIER_ORDER: Record<'High' | 'Medium' | 'Low', number> = { High: 1, Medium: 2, Low: 3 }

// Tier derivation — verbatim from v0.5.0 ReportsView.vue lines 22-32 (3-input).
// badDpa (Unsigned/Expired) → start High if userCount > 1000 else Medium; else Low.
// 1EdTech Certified reduces tier by one step (Low stays Low).
function calcTier(
  dpa: DpaRecord | undefined,
  vendor: Vendor,
  edtech: EdtechRecord | undefined
): 'High' | 'Medium' | 'Low' {
  const badDpa = dpa?.status === 'Unsigned' || dpa?.status === 'Expired'
  const highUsage = vendor.userCount > 1000
  let tier: 'High' | 'Medium' | 'Low' = badDpa ? (highUsage ? 'High' : 'Medium') : 'Low'
  if (edtech?.certificationStatus === 'Certified') {
    if (tier === 'High') tier = 'Medium'
    else if (tier === 'Medium') tier = 'Low'
    // Low stays Low
  }
  return tier
}

type RiskRow = {
  vendorId: string
  name: string
  category: string
  tier: 'High' | 'Medium' | 'Low'
  tierOrder: number
  dpaStatus: DpaStatus
  certificationStatus: EdtechCertStatus
  userCount: number
}

// Carry-forward (10-01 / 11-01 lesson #3): explicit `(d: DpaRecord)` /
// `(e: EdtechRecord)` annotations — TS strict mode rejects implicit `any`
// on .map/.filter/.sort callbacks.
const dpaMap = computed<Record<string, DpaRecord>>(() =>
  Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))
)
const edtechMap = computed<Record<string, EdtechRecord>>(() =>
  Object.fromEntries(edtechList.value.map((e: EdtechRecord) => [e.vendorId, e]))
)

const riskRows = computed<RiskRow[]>(() =>
  vendors.value.map((v: Vendor) => {
    const dpa = dpaMap.value[v.vendorId]
    const edtech = edtechMap.value[v.vendorId]
    const tier = calcTier(dpa, v, edtech)
    return {
      vendorId: v.vendorId,
      name: v.name,
      category: v.category,
      tier,
      tierOrder: TIER_ORDER[tier],
      dpaStatus: dpa?.status ?? 'Unsigned',
      certificationStatus: edtech?.certificationStatus ?? 'Not Certified',
      userCount: v.userCount,
    }
  })
)

// Per-tier counts for chart slice values + legend formatter.
const tierCounts = computed(() => {
  const c: Record<'High' | 'Medium' | 'Low', number> = { High: 0, Medium: 0, Low: 0 }
  for (const row of riskRows.value) c[row.tier]++
  return c
})

// ECharts donut option — verbatim port of v0.5.0 ReportsView.vue lines 63-88,
// sourcing slice colors from RISK_TIER_COLORS (one-line edit to recolor).
const chartOption = computed<ECOption>(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params: any) =>
      `${params.name}: ${params.value} vendors (${params.percent}%)`,
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    formatter: (name: string) =>
      `${name} (${tierCounts.value[name as 'High' | 'Medium' | 'Low']})`,
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: false } },
      data: [
        { name: 'High',   value: tierCounts.value.High,   itemStyle: { color: RISK_TIER_COLORS.High } },
        { name: 'Medium', value: tierCounts.value.Medium, itemStyle: { color: RISK_TIER_COLORS.Medium } },
        { name: 'Low',    value: tierCounts.value.Low,    itemStyle: { color: RISK_TIER_COLORS.Low } },
      ],
    },
  ],
}))

// Sortable column header helper — verbatim from dpa.vue (Phase 11 production pattern).
const UButton = resolveComponent('UButton')

function sortHeader(label: string) {
  return ({ column }: { column: any }) =>
    h(UButton, {
      label,
      color: 'neutral',
      variant: 'ghost',
      class: '-mx-2.5',
      icon: column.getIsSorted()
        ? (column.getIsSorted() === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-narrow-wide')
        : 'i-lucide-arrow-up-down',
      onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
    })
}

// Default sort: tierOrder ascending — High (1) first. Alphabetical on tier
// strings would put Medium last (H < L < M).
const sorting = ref([{ id: 'tierOrder', desc: false }])

// Carry-forward (10-01 lesson #2): TableColumn.meta.class MUST be `{ th?, td? }`
// — NOT a plain string. Verified vs
// node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts.
const columns: TableColumn<RiskRow>[] = [
  { accessorKey: 'name',                header: sortHeader('Vendor Name'),    meta: { class: { th: 'min-w-[12rem]',      td: 'min-w-[12rem]' } } },
  { accessorKey: 'tierOrder',           header: sortHeader('Risk Tier'),      meta: { class: { th: 'w-[8rem]',           td: 'w-[8rem]' } } },
  { accessorKey: 'dpaStatus',           header: sortHeader('DPA Status'),     meta: { class: { th: 'w-[8rem]',           td: 'w-[8rem]' } } },
  { accessorKey: 'certificationStatus', header: sortHeader('1EdTech Status'), meta: { class: { th: 'w-[10rem]',          td: 'w-[10rem]' } } },
  { accessorKey: 'userCount',           header: sortHeader('Users'),          meta: { class: { th: 'w-[6rem] text-right', td: 'w-[6rem] text-right' } } },
]

// Drawer state-lifting trio — verbatim from dpa.vue (Plan 10-02 / 11-01 carry-forward).
// One drawer instance at page level; `v-model:open` via computed bridge clears
// `selectedVendorId` on close (X / Escape / backdrop).
const selectedVendorId = ref<string | null>(null)
function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
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
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">Risk Position</h1>
      <span class="text-sm text-gray-500">{{ riskRows.length }} vendors assessed</span>
    </div>

    <!-- Donut card -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <!--
        Plan 12-01 — Donut renders WITHOUT ClientOnly per STATE.md ECharts SSR strategy
        ("ClientOnly wrap for interaction-mounted ECharts; NOT wrapped for initial-SSR ECharts").
        nuxt-echarts handles initial-SSR via SVG fallback (Phase 7-02 smoke test confirmed).
        Wrapping in <ClientOnly> would break the SVG fallback (Phase 7-RESEARCH § 5 Pitfall #6).
      -->
      <VChart :option="chartOption" autoresize style="height: 280px; width: 100%" />
    </div>

    <UTable
      v-model:sorting="sorting"
      :data="riskRows"
      :columns="columns"
      class="bg-white"
      @select="onRowSelect"
    >
      <!-- accessorKey is tierOrder (numeric) for sort; the cell renders row.original.tier (string). -->
      <template #tierOrder-cell="{ row }">
        <UBadge
          :label="row.original.tier"
          color="neutral"
          variant="solid"
          :style="{ backgroundColor: RISK_TIER_COLORS[row.original.tier], color: '#ffffff' }"
        />
      </template>
      <template #dpaStatus-cell="{ row }">
        <UBadge
          :label="row.original.dpaStatus"
          color="neutral"
          variant="solid"
          :style="{ backgroundColor: DPA_STATUS_COLORS[row.original.dpaStatus], color: '#ffffff' }"
        />
      </template>
      <template #userCount-cell="{ row }">
        {{ row.original.userCount.toLocaleString() }}
      </template>
      <template #empty>
        <div class="py-8 text-center">
          <div class="text-sm font-semibold text-gray-900">No vendors found</div>
          <div class="text-sm text-gray-500 mt-1">No vendor data is available to calculate risk tiers.</div>
        </div>
      </template>
    </UTable>

    <!--
      Plan 12-01 — drawer mounted ONCE at the page level (Plan 10-02 / 11-01 carry-forward).
      Auto-imported from app/components/VendorDrawer.vue — no manual import needed.
    -->
    <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
  </div>
</template>
