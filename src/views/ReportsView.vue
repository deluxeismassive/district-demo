<script setup>
import { ref } from 'vue'
import Skeleton from 'primevue/skeleton'

const tabs = ['DPA', 'Risk Position', '1EdTech']
const activeTab = ref('DPA')
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-4 text-gray-900">Reports</h1>

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

    <div v-for="i in 6" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
    </div>
  </div>
</template>
