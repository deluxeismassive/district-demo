<script setup>
import SidebarNav from './SidebarNav.vue'
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <SidebarNav />
    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
        <span class="text-sm text-gray-700">Lakewood Unified School District</span>
      </header>
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <RouterView />
      </main>
    </div>
  </div>
</template>
