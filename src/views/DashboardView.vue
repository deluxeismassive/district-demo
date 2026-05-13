<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import vendorsData from '../data/vendors.js'
import dpaData from '../data/dpa.js'
import { RISK_LABEL_COLORS } from '../data/riskLabels.js'

// Join vendors with dpa records by vendorId
const vendorMap = Object.fromEntries(vendorsData.map((v) => [v.vendorId, v]))

// Top 8 = first 8 dpa records with a non-null riskLabel.
// Plan 01 guaranteed at least 8 such records, including 8 specific "demo storyline" vendors.
const topAtRisk = computed(() =>
  dpaData
    .filter((d) => d.riskLabel != null)
    .slice(0, 8)
    .map((d) => {
      const v = vendorMap[d.vendorId]
      return {
        vendorId: d.vendorId,
        name: v?.name ?? d.vendorId,
        category: v?.category ?? '—',
        riskLabel: d.riskLabel
      }
    })
)

// Summary KPIs (lightweight, per D-19)
const totalVendors = computed(() => vendorsData.length)
const signedCount = computed(() => dpaData.filter((d) => d.status === 'Signed').length)
const needsReviewCount = computed(
  () => dpaData.filter((d) => d.status === 'Unsigned' || d.status === 'Expired').length
)
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>

    <!-- Summary KPI tiles -->
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
        <div class="text-2xl font-semibold mt-1" style="color: #dc2626;">{{ needsReviewCount }}</div>
      </div>
    </div>

    <!-- Top 8 At-Risk Vendors card -->
    <div class="bg-white border border-gray-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-semibold text-gray-900">Top 8 Vendors Needing Attention</h2>
        <span class="text-sm text-gray-500">{{ topAtRisk.length }} flagged</span>
      </div>
      <div class="divide-y divide-gray-100">
        <div
          v-for="row in topAtRisk"
          :key="row.vendorId"
          class="flex items-center justify-between py-3"
        >
          <div class="flex flex-col">
            <span class="text-sm font-semibold text-gray-900">{{ row.name }}</span>
            <span class="text-xs text-gray-500">{{ row.category }}</span>
          </div>
          <Tag
            :value="row.riskLabel"
            :style="{ backgroundColor: RISK_LABEL_COLORS[row.riskLabel], color: '#ffffff' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
