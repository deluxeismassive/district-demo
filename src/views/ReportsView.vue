<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import vendorsData from '../data/vendors.js'
import dpaData from '../data/dpa.js'
import discoveryData from '../data/discovery.js'
import edtechData from '../data/edtech.js'
import { RISK_TIER_COLORS, DPA_STATUS_COLORS } from '../data/riskLabels.js'
import VendorDrawer from '../components/VendorDrawer.vue'

// Numeric ordering for default sort — alphabetical 'H'<'L'<'M' would put Medium last (RESEARCH Pitfall 3).
const TIER_ORDER = { High: 1, Medium: 2, Low: 3 }

// View-level joins by vendorId (established pattern from VendorDrawer + DpaGrid).
const dpaMap       = Object.fromEntries(dpaData.map((d) => [d.vendorId, d]))
const discoveryMap = Object.fromEntries(discoveryData.map((d) => [d.vendorId, d]))
const edtechMap    = Object.fromEntries(edtechData.map((d) => [d.vendorId, d]))

// Risk tier formula — D-01 (base) + D-02 (1EdTech reducer) + D-03 (threshold).
function calcTier(dpa, discovery, edtech) {
  const badDpa = dpa?.status === 'Unsigned' || dpa?.status === 'Expired'
  const highUsage = (discovery?.userCount ?? 0) > 1000
  let tier = badDpa ? (highUsage ? 'High' : 'Medium') : 'Low'
  if (edtech?.certificationStatus === 'Certified') {
    if (tier === 'High') tier = 'Medium'
    else if (tier === 'Medium') tier = 'Low'
    // Low stays Low
  }
  return tier
}

// Computed flat rows for the table. Pick fields explicitly to avoid spread collisions (RESEARCH Pitfall 4).
const riskRows = computed(() =>
  vendorsData.map((v) => {
    const dpa = dpaMap[v.vendorId]
    const disc = discoveryMap[v.vendorId]
    const et = edtechMap[v.vendorId]
    const tier = calcTier(dpa, disc, et)
    return {
      vendorId: v.vendorId,
      name: v.name,
      category: v.category,
      privacyScore: v.privacyScore,
      tier,
      tierOrder: TIER_ORDER[tier],
      dpaStatus: dpa?.status ?? 'Unsigned',
      certificationStatus: et?.certificationStatus ?? 'Not Certified',
      userCount: disc?.userCount ?? 0
    }
  })
)

// Per-tier counts for chart + legend labels.
const tierCounts = computed(() => {
  const c = { High: 0, Medium: 0, Low: 0 }
  for (const row of riskRows.value) c[row.tier]++
  return c
})

// ECharts donut option — pie with inner radius, semantic colors, legend with counts, percent tooltip.
const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    formatter: (params) =>
      `${params.name}: ${params.value} vendors (${params.percent}%)`
  },
  legend: {
    orient: 'horizontal',
    bottom: 0,
    formatter: (name) => `${name} (${tierCounts.value[name]})`
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '70%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: { label: { show: false } },
      data: [
        { name: 'High',   value: tierCounts.value.High,   itemStyle: { color: '#dc2626' } },
        { name: 'Medium', value: tierCounts.value.Medium, itemStyle: { color: '#f59e0b' } },
        { name: 'Low',    value: tierCounts.value.Low,    itemStyle: { color: '#16a34a' } }
      ]
    }
  ]
}))

// Drawer state — pattern lifted from DiscoveryView.
const drawerVisible = ref(false)
const selectedVendor = ref(null)

function onRowClick(event) {
  selectedVendor.value = event.data
  drawerVisible.value = true
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold text-gray-900 mb-6">Risk Position</h1>

    <!-- Donut chart card -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <VChart
        :option="chartOption"
        autoresize
        style="height: 280px; width: 100%"
      />
    </div>

    <!-- Vendor risk table -->
    <DataTable
      :value="riskRows"
      sortField="tierOrder"
      :sortOrder="1"
      removableSort
      dataKey="vendorId"
      rowHover
      class="bg-white"
      @row-click="onRowClick"
    >
      <template #empty>
        <div class="py-8 text-center">
          <div class="text-sm font-semibold text-gray-900">No vendors found</div>
          <div class="text-sm text-gray-500 mt-1">No vendor data is available to calculate risk tiers.</div>
        </div>
      </template>

      <Column field="name" header="Vendor Name" sortable :style="{ minWidth: '12rem' }" />

      <Column field="tierOrder" header="Risk Tier" sortable :style="{ width: '8rem' }">
        <template #body="{ data }">
          <Tag
            :value="data.tier"
            :style="{ backgroundColor: RISK_TIER_COLORS[data.tier], color: '#ffffff' }"
          />
        </template>
      </Column>

      <Column field="dpaStatus" header="DPA Status" sortable :style="{ width: '8rem' }">
        <template #body="{ data }">
          <Tag
            :value="data.dpaStatus"
            :style="{ backgroundColor: DPA_STATUS_COLORS[data.dpaStatus], color: '#ffffff' }"
          />
        </template>
      </Column>

      <Column field="certificationStatus" header="1EdTech Status" sortable :style="{ width: '10rem' }">
        <template #body="{ data }">{{ data.certificationStatus }}</template>
      </Column>

      <Column field="userCount" header="Users" sortable :style="{ width: '6rem' }">
        <template #body="{ data }">{{ data.userCount.toLocaleString() }}</template>
      </Column>
    </DataTable>

    <!-- Drawer for vendor drill-down — reuses existing component, no modifications -->
    <VendorDrawer v-model:visible="drawerVisible" :vendor="selectedVendor" />
  </div>
</template>
