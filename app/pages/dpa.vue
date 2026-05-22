<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { useDebounce } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
import type { Vendor, DpaRecord, DpaStatus, RiskLabel } from '#shared/types/data'
import { DPA_STATUS_COLORS, RISK_LABEL_COLORS } from '#shared/utils/riskLabels'

definePageMeta({
  nav: true,
  navLabel: 'DPA',
  navIcon: 'i-lucide-file-text',
  navOrder: 30,
})

// Phase 11 — vendor + DPA join shared across the page and the auto-imported
// VendorDrawer. NO `key` option: the implicit URL key dedups across this page,
// the drawer's own useFetch('/api/dpa'), and Plan 11-02 Dashboard (research §8).
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
const { data: dpaList } = await useFetch('/api/dpa', {
  default: () => [],
})

// Joined-row shape — Vendor name/category + DpaRecord status/dates/riskLabel.
type DpaRow = {
  vendorId: string
  name: string
  category: string
  status: DpaStatus
  signedDate: string | null
  expiryDate: string | null
  riskLabel: RiskLabel | null
}

// Carry-forward (10-01 lesson #3): explicit `(d: DpaRecord)` annotation —
// TS strict mode rejects implicit `any` on .map/.filter/.sort callbacks.
const dpaMap = computed<Record<string, DpaRecord>>(() =>
  Object.fromEntries(dpaList.value.map((d: DpaRecord) => [d.vendorId, d]))
)

const tableRows = computed<DpaRow[]>(() =>
  vendors.value.map((v: Vendor) => {
    const dpa = dpaMap.value[v.vendorId]
    return {
      vendorId: v.vendorId,
      name: v.name,
      category: v.category,
      status: dpa?.status ?? 'Unsigned',
      signedDate: dpa?.signedDate ?? null,
      expiryDate: dpa?.expiryDate ?? null,
      riskLabel: dpa?.riskLabel ?? null,
    }
  })
)

// Search filter — VueUse debounce (200ms) over a UInput v-model. Filters on
// name + category (lowercase-includes). Verbatim from discovery.vue Phase 10.
const search = ref('')
const debouncedSearch = useDebounce(search, 200)

const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((r: DpaRow) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})

// Header readout — counts only Unsigned + Expired rows in the visible
// (filtered) set, so typing into the filter updates the readout live.
const needsReviewCount = computed(() =>
  filteredRows.value.filter((r: DpaRow) => r.status === 'Unsigned' || r.status === 'Expired').length
)

// Sort state — default name-ascending. v-model:sorting binding on UTable.
const sorting = ref([{ id: 'name', desc: false }])

// Sortable column header helper — render fn calling column.toggleSorting().
// Verbatim from discovery.vue Phase 10.
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

// Carry-forward (10-01 lesson #2): TableColumn meta.class MUST be `{ th?, td? }`
// — NOT a plain string. Verified vs
// node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts lines 9-13.
const columns: TableColumn<DpaRow>[] = [
  { accessorKey: 'name',       header: sortHeader('Vendor Name'), meta: { class: { th: 'min-w-[12rem]', td: 'min-w-[12rem]' } } },
  { accessorKey: 'category',   header: sortHeader('Category'),    meta: { class: { th: 'w-[10rem]',     td: 'w-[10rem]' } } },
  { accessorKey: 'status',     header: sortHeader('Status'),      meta: { class: { th: 'w-[8rem]',      td: 'w-[8rem]' } } },
  { accessorKey: 'signedDate', header: sortHeader('Signed Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'expiryDate', header: sortHeader('Expiry Date'), meta: { class: { th: 'w-[9rem]',      td: 'w-[9rem]' } } },
  { accessorKey: 'riskLabel',  header: sortHeader('Risk Label'),  meta: { class: { th: 'w-[12rem]',     td: 'w-[12rem]' } } },
]

// Drawer state-lifting trio — verbatim from discovery.vue Phase 10-02.
// One drawer instance at page level (research §5); v-model:open via computed
// bridge clears selectedVendorId on close (X / Escape / backdrop).
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
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">DPA</h1>
    <p class="text-gray-600 mt-2">Data Privacy Agreement status by vendor. (Phase 11 wires table + badges.)</p>
  </div>
</template>
