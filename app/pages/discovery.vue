<script setup lang="ts">
definePageMeta({
  nav: true,
  navLabel: 'Discovery',
  navIcon: 'i-lucide-search',
  navOrder: 20,
})

// Phase 9: minimal useFetch demo. Phase 10 wires the full UTable + USlideover.
const { data: vendors } = await useFetch('/api/vendors', {
  default: () => [],
})
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-semibold text-gray-900">Discovery</h1>
    <p class="text-gray-600 mt-2">
      Loaded {{ vendors.length }} vendors from <code>/api/vendors</code>.
      (Phase 10 wires the UTable + USlideover.)
    </p>
  </div>
</template>
