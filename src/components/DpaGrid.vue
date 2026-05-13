<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import { FilterMatchMode } from '@primevue/core/api'
import vendorsData from '../data/vendors.js'
import dpaData from '../data/dpa.js'
import { RISK_LABEL_COLORS, DPA_STATUS_COLORS } from '../data/riskLabels.js'

const emit = defineEmits(['row-click'])

// View-level join — same pattern as DiscoveryView (Phase 2 established)
const dpaMap = Object.fromEntries(
  dpaData.map((d) => [d.vendorId, d])
)

const tableRows = computed(() =>
  vendorsData.map((v) => ({
    ...v,
    ...dpaMap[v.vendorId]
  }))
)

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

function onRowClick(event) {
  emit('row-click', event)
}

// Count of vendors needing DPA review = Unsigned + Expired (per DPA-02 / D-20)
const needsAttentionCount = computed(() =>
  tableRows.value.filter((r) => r.status === 'Unsigned' || r.status === 'Expired').length
)
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div class="max-w-sm flex-1">
        <IconField>
          <InputIcon><i class="pi pi-search" /></InputIcon>
          <InputText
            v-model="filters['global'].value"
            placeholder="Search vendors..."
            class="w-full"
          />
        </IconField>
      </div>
      <span class="text-sm text-gray-500 ml-4">
        {{ needsAttentionCount }} vendors need DPA review
      </span>
    </div>

    <DataTable
      :value="tableRows"
      v-model:filters="filters"
      :globalFilterFields="['name', 'category']"
      @row-click="onRowClick"
      sortField="name"
      :sortOrder="1"
      removableSort
      dataKey="vendorId"
      rowHover
      class="bg-white"
    >
      <template #empty>
        <div class="py-8 text-center">
          <div class="text-sm font-semibold text-gray-900">No vendors match your search</div>
          <div class="text-sm text-gray-500 mt-1">Try a different search term or clear the filter to see all vendors.</div>
        </div>
      </template>

      <Column field="name" header="Vendor Name" sortable :style="{ minWidth: '12rem' }" />
      <Column field="category" header="Category" sortable :style="{ width: '10rem' }" />
      <Column field="status" header="Status" sortable :style="{ width: '8rem' }">
        <template #body="{ data }">
          <Tag
            :value="data.status"
            :style="{ backgroundColor: DPA_STATUS_COLORS[data.status], color: '#ffffff' }"
          />
        </template>
      </Column>
      <Column field="signedDate" header="Signed Date" sortable :style="{ width: '9rem' }">
        <template #body="{ data }">{{ data.signedDate ?? '—' }}</template>
      </Column>
      <Column field="expiryDate" header="Expiry Date" sortable :style="{ width: '9rem' }">
        <template #body="{ data }">{{ data.expiryDate ?? '—' }}</template>
      </Column>
      <Column field="riskLabel" header="Risk Label" sortable :style="{ width: '12rem' }">
        <template #body="{ data }">
          <Tag
            v-if="data.riskLabel"
            :value="data.riskLabel"
            :style="{ backgroundColor: RISK_LABEL_COLORS[data.riskLabel], color: '#ffffff' }"
          />
          <span v-else class="text-gray-400">—</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
