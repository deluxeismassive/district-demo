<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Discovery</h1>

    <div class="flex gap-4 mb-3">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="120px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
    </div>

    <div v-for="i in 8" :key="i" class="flex gap-4 py-3 border-b border-gray-100">
      <Skeleton width="200px" height="1rem" />
      <Skeleton width="120px" height="1rem" />
      <Skeleton width="100px" height="1rem" />
      <Skeleton width="80px" height="1.5rem" border-radius="9999px" />
    </div>
  </div>
</template>
