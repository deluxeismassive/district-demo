<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Dashboard</h1>

    <div class="grid grid-cols-4 gap-4 mb-8">
      <Skeleton v-for="i in 4" :key="i" width="100%" height="96px" border-radius="8px" />
    </div>

    <div class="space-y-3">
      <Skeleton width="60%" height="1rem" />
      <Skeleton width="60%" height="1rem" />
    </div>
  </div>
</template>
