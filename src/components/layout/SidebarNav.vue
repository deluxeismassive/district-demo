<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const navRoutes = router.getRoutes().filter(r => r.meta?.nav)
</script>

<template>
  <nav class="flex flex-col w-64 h-screen bg-sidebar text-white shrink-0">
    <div class="px-6 py-6 border-b border-gray-700">
      <span class="text-lg font-semibold tracking-wide">Schoolday</span>
    </div>

    <ul class="flex-1 py-4 px-3 space-y-1">
      <li v-for="route in navRoutes" :key="route.name">
        <RouterLink
          :to="route.path"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
          active-class="bg-primary text-white"
          exact-active-class="bg-primary text-white"
        >
          <i :class="route.meta.icon" class="text-base" />
          <span>{{ route.meta.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
