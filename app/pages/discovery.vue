<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import { useDebounce } from '@vueuse/core'
import type { TableColumn } from '@nuxt/ui'
// Deviation (Rule 3 - Blocking): @pinia/nuxt v0.11.3 does NOT auto-import
// store factories from app/stores. Plan §1 interface block said
// "auto-imported via @pinia/nuxt — DO NOT redeclare", but the typecheck
// surfaces "Cannot find name 'useTagsStore'". Adding an explicit relative
// import; this is the canonical pattern from @pinia/nuxt v0.11 docs.
import { useTagsStore } from '~/stores/tags'

definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

// Phase 9 wiring — preserved verbatim. No manual generic; Nitro flow-types Vendor[].
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})

const tagsStore = useTagsStore()

// Tag chip shape — used by both childTagIndex lookup and the row.tags array.
type TagChip = { id: string; name: string; parentColor: string; parentId: string }

// Build childId -> { name, parentColor, parentId } once, reactive on tagGroups.
const childTagIndex = computed(() => {
  const idx: Record<string, { name: string; parentColor: string; parentId: string }> = {}
  for (const group of tagsStore.tagGroups) {
    for (const child of group.children) {
      idx[child.id] = { name: child.name, parentColor: group.color, parentId: group.id }
    }
  }
  return idx
})

// Vendor rows extended with denormalized tag chips (resolved from assignments).
// Deviation (Rule 3 - Blocking): explicit `(id: string)` etc. annotations — TS strict
// mode rejects the implicit `any` on map/sort callbacks from the plan interface snippet.
const tableRows = computed(() =>
  vendors.value.map((v) => {
    const ids = tagsStore.assignments[v.vendorId] ?? []
    const tags: TagChip[] = ids
      .map((id: string) => ({ id, ...childTagIndex.value[id] }))
      .filter((t): t is TagChip => Boolean(t.name))
      .sort((a: TagChip, b: TagChip) => a.parentId.localeCompare(b.parentId))
    return { ...v, tags }
  })
)

// Plan 10-03 — Grouped items shape for the per-row USelectMenu. Array-of-arrays
// is the Nuxt UI v4 grouped-items API (verified against
// node_modules/@nuxt/ui/dist/runtime/components/SelectMenu.vue.d.ts —
// `items?: T` where T extends ArrayOrNested<SelectMenuItem>; the runtime
// uses `isArrayOfArray()` to switch to the grouped rendering path).
// Shared between this per-row select and the drawer's full-width select via
// the same `tagsStore.setVendorTags` action.
const groupedTagItems = computed(() =>
  tagsStore.tagGroups.map((g) =>
    g.children.map((c) => ({ id: c.id, name: c.name, groupColor: g.color }))
  )
)

// Search filter — VueUse debounce (200ms) over a UInput v-model, filters on name + category.
const search = ref('')
const debouncedSearch = useDebounce(search, 200)

const filteredRows = computed(() => {
  const q = debouncedSearch.value.trim().toLowerCase()
  if (!q) return tableRows.value
  return tableRows.value.filter((r) =>
    r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
  )
})

// Sort state — default name-ascending. v-model:sorting binding on UTable.
const sorting = ref([{ id: 'name', desc: false }])

// Sortable column header helper — render fn calling column.toggleSorting().
// NB: TableColumn<any> over TableColumn<VendorRow> is deliberate — row shape
// extends Vendor with a `tags` array; keeping `any` avoids a separate row type
// (research Open Question #4).
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

// Deviation (Rule 3 - Blocking): plan interface snippet had `meta: { class: '<str>' }`
// but Nuxt UI v4 ColumnMeta requires `class: { th?, td? }` per
// node_modules/@nuxt/ui/dist/runtime/components/Table.vue.d.ts lines 10-13.
// Widths apply to both th and td so each column applies the same class to both.
const columns: TableColumn<any>[] = [
  { accessorKey: 'name',         header: sortHeader('Vendor Name'),  meta: { class: { th: 'min-w-[12rem]', td: 'min-w-[12rem]' } } },
  { accessorKey: 'category',     header: sortHeader('Category'),     meta: { class: { th: 'w-[9rem]', td: 'w-[9rem]' } } },
  { accessorKey: 'frequency',    header: sortHeader('Frequency'),    meta: { class: { th: 'w-[7rem]', td: 'w-[7rem]' } } },
  { accessorKey: 'lastSeen',     header: sortHeader('Last Seen'),    meta: { class: { th: 'w-[8rem]', td: 'w-[8rem]' } } },
  { accessorKey: 'userCount',    header: sortHeader('Users'),        meta: { class: { th: 'w-[6rem] text-right', td: 'w-[6rem] text-right' } } },
  { accessorKey: 'studentCount', header: sortHeader('Students'),     meta: { class: { th: 'w-[6rem] text-right', td: 'w-[6rem] text-right' } } },
  { accessorKey: 'tags',         header: 'Tags',                     enableSorting: false, meta: { class: { th: 'w-[14rem]', td: 'w-[14rem]' } } },
  // Plan 10-03 — narrow 3rem column hosting the compact per-row USelectMenu `+` trigger.
  // accessorKey 'tagsAssign' has no matching Vendor field; the cell is overridden via the
  // #tagsAssign-cell slot which reads row.original.vendorId directly. Carries Plan 10-01's
  // ColumnMeta {th, td} shape deviation (plan §interfaces snippet had a plain string).
  { accessorKey: 'tagsAssign',   header: '',                         enableSorting: false, meta: { class: { th: 'w-[3rem]', td: 'w-[3rem]' } } },
]

// Row-select stub — Plan 10-01 captures the vendor ID only.
// Plan 10-02 wires this ref into the VendorDrawer mount below.
const selectedVendorId = ref<string | null>(null)
function onRowSelect(_event: Event, row: any) {
  selectedVendorId.value = row.original.vendorId
}

// Plan 10-02 — drawer state lifting (research §8).
// `selectedVendor` looks up the full vendor object reactively from `vendors.value`.
// `drawerOpen` is a computed get/set so `v-model:open` on the drawer derives from
// `selectedVendorId` and clears it when the drawer closes (X / Escape / backdrop).
const selectedVendor = computed(() =>
  selectedVendorId.value
    ? vendors.value.find((v) => v.vendorId === selectedVendorId.value) ?? null
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
      <h1 class="text-xl font-semibold text-gray-900">Discovery</h1>
      <span class="text-sm text-gray-500">{{ filteredRows.length }} vendors</span>
    </div>

    <div class="mb-4 max-w-sm">
      <UInput
        v-model="search"
        placeholder="Search vendors..."
        icon="i-lucide-search"
        class="w-full"
      />
    </div>

    <UTable
      v-model:sorting="sorting"
      :data="filteredRows"
      :columns="columns"
      class="bg-white"
      @select="onRowSelect"
    >
      <template #tags-cell="{ row }">
        <div class="flex flex-wrap gap-1">
          <UBadge
            v-for="tag in row.original.tags"
            :key="tag.id"
            :label="tag.name"
            color="neutral"
            variant="solid"
            size="sm"
            :style="{ backgroundColor: tag.parentColor, color: '#ffffff' }"
          />
        </div>
      </template>
      <!--
        Plan 10-03 — compact per-row USelectMenu in the narrow `tagsAssign` column.
        Writes through the same `setVendorTags` Pinia action used by the drawer,
        so both surfaces stay in sync via Pinia reactivity (research §6/§7).

        Deviation (Rule 3 - Blocking): plan §interfaces specified
        `:ui="{ trigger: 'w-auto' }"` but the installed Nuxt UI v4 SelectMenu theme
        (node_modules/@nuxt/ui/dist/shared/ui.CoJ8bnb0.mjs lines ~5520-5544) defines
        the trigger slot as `base`, NOT `trigger`. Using `:ui="{ base: 'w-auto' }"`
        for the same intent (icon-only trigger shrinks inside the 3rem column).
      -->
      <template #tagsAssign-cell="{ row }">
        <USelectMenu
          :model-value="tagsStore.assignments[row.original.vendorId] ?? []"
          :items="groupedTagItems"
          value-key="id"
          label-key="name"
          multiple
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-plus"
          :ui="{ base: 'w-auto' }"
          @update:model-value="(ids) => tagsStore.setVendorTags(row.original.vendorId, ids)"
        />
      </template>
      <template #empty>
        <div class="py-8 text-center">
          <div class="text-sm font-semibold text-gray-900">No vendors match your search</div>
          <div class="text-sm text-gray-500 mt-1">Try a different search term or clear the filter.</div>
        </div>
      </template>
    </UTable>

    <!--
      Plan 10-02 — drawer mounted ONCE at the page level (not inside a row cell).
      Auto-imported from app/components/VendorDrawer.vue — no manual import needed.
    -->
    <VendorDrawer v-model:open="drawerOpen" :vendor="selectedVendor" />
  </div>
</template>
