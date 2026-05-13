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
import discoveryData from '../data/discovery.js'
import { useTagsStore } from '../stores/tags.js'
import VendorDrawer from '../components/VendorDrawer.vue'
import DpaGrid from '../components/DpaGrid.vue'

const tagsStore = useTagsStore()

// Tab state — Discovery tab is the default
const tabs = ['Discovery', 'DPA']
const activeTab = ref('Discovery')

// Join vendors with discovery by vendorId (Pattern 2 — view-level join)
const discoveryMap = Object.fromEntries(
  discoveryData.map((d) => [d.vendorId, d])
)

const tableRows = computed(() =>
  vendorsData.map((v) => ({
    ...v,
    ...discoveryMap[v.vendorId]
  }))
)

// Global filter — Name + Category only (per RESEARCH.md anti-pattern note)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Drawer state
const drawerVisible = ref(false)
const selectedVendor = ref(null)

function onRowClick(event) {
  selectedVendor.value = event.data
  drawerVisible.value = true
}

// Tag pill helpers
// Build a flat childId -> { name, parentColor, parentName } map for O(1) lookup
const childTagIndex = computed(() => {
  const idx = {}
  for (const group of tagsStore.tagGroups) {
    for (const child of group.children) {
      idx[child.id] = {
        name: child.name,
        parentColor: group.color,
        parentId: group.id
      }
    }
  }
  return idx
})

function tagsForVendor(vendorId) {
  const ids = tagsStore.assignments[vendorId] ?? []
  // Resolve to { name, parentColor, parentId }, then group/sort by parentId for visual clustering (D-18)
  return ids
    .map((id) => ({ id, ...childTagIndex.value[id] }))
    .filter((t) => t.name)
    .sort((a, b) => a.parentId.localeCompare(b.parentId))
}

// Vendor count reflects filtered view — DataTable exposes filtered length via @value-change but
// for a simple read-out we compute against tableRows and the global filter value directly.
const filteredCount = computed(() => {
  const q = (filters.value.global.value ?? '').trim().toLowerCase()
  if (!q) return tableRows.value.length
  return tableRows.value.filter((row) =>
    row.name.toLowerCase().includes(q) ||
    row.category.toLowerCase().includes(q)
  ).length
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-xl font-semibold text-gray-900">Discovery</h1>
      <span v-if="activeTab === 'Discovery'" class="text-sm text-gray-500">{{ filteredCount }} vendors</span>
    </div>

    <!-- Tab bar (pattern copied from ReportsView.vue) -->
    <div class="flex gap-1 border-b border-gray-200 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab"
        @click="activeTab = tab"
        class="px-4 py-2 text-sm font-medium border-b-2 transition-colors"
        :class="activeTab === tab
          ? 'border-primary text-primary'
          : 'border-transparent text-gray-500 hover:text-gray-700'"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Discovery tab — existing filter + DataTable, unchanged -->
    <template v-if="activeTab === 'Discovery'">
      <div class="mb-4 max-w-sm">
        <IconField>
          <InputIcon><i class="pi pi-search" /></InputIcon>
          <InputText
            v-model="filters['global'].value"
            placeholder="Search vendors..."
            class="w-full"
          />
        </IconField>
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
        <Column field="category" header="Category" sortable :style="{ width: '9rem' }" />
        <Column field="frequency" header="Frequency" sortable :style="{ width: '7rem' }" />
        <Column field="lastSeen" header="Last Seen" sortable :style="{ width: '8rem' }" />
        <Column field="userCount" header="Users" sortable :style="{ width: '6rem' }">
          <template #body="{ data }">{{ data.userCount.toLocaleString() }}</template>
        </Column>
        <Column field="studentCount" header="Students" sortable :style="{ width: '6rem' }">
          <template #body="{ data }">{{ data.studentCount.toLocaleString() }}</template>
        </Column>
        <Column header="Tags" :style="{ width: '12rem' }">
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="t in tagsForVendor(data.vendorId)"
                :key="t.id"
                :value="t.name"
                :style="{ backgroundColor: t.parentColor, color: '#ffffff' }"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </template>

    <!-- DPA tab — new component, owns its own filter + grid + emits row-click -->
    <template v-else-if="activeTab === 'DPA'">
      <DpaGrid @row-click="onRowClick" />
    </template>

    <!-- Shared drawer — opened by row-click on either tab -->
    <VendorDrawer v-model:visible="drawerVisible" :vendor="selectedVendor" />
  </div>
</template>
