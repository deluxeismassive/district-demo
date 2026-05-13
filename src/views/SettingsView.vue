<script setup>
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-6 text-gray-900">Settings</h1>

    <div>
      <div v-for="i in 6" :key="i" class="flex justify-between py-3 border-b border-gray-100">
        <Skeleton width="140px" height="1rem" />
        <Skeleton width="200px" height="1rem" />
      </div>
    </div>
  </div>
</template>
