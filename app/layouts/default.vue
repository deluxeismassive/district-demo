<!-- Source: composite from v0.5.0 SidebarNav + AppShell (git commit 15d021c~1), upgraded to NuxtLink + UIcon -->
<script setup lang="ts">
const router = useRouter()

const navRoutes = computed(() =>
  router.options.routes
    .filter((r) => r.meta?.nav === true)
    .sort((a, b) => (a.meta?.navOrder ?? 999) - (b.meta?.navOrder ?? 999))
)
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <aside class="flex flex-col w-64 h-screen bg-[var(--color-sidebar)] text-white shrink-0">
      <div class="px-6 py-6 border-b border-gray-700">
        <span class="text-lg font-semibold tracking-wide">Schoolday</span>
      </div>

      <ul class="flex-1 py-4 px-3 space-y-1">
        <li v-for="route in navRoutes" :key="String(route.path)">
          <NuxtLink
            :to="route.path"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-sm font-medium"
            active-class="!bg-primary-600 !text-white"
            exact-active-class="!bg-primary-600 !text-white"
          >
            <UIcon
              :name="(route.meta?.navIcon as string) ?? 'i-lucide-circle'"
              class="text-base shrink-0"
            />
            <span>{{ route.meta?.navLabel ?? route.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </aside>

    <div class="flex flex-col flex-1 overflow-hidden">
      <header class="flex items-center h-14 bg-white border-b border-gray-200 pl-6 shrink-0">
        <span class="text-sm text-gray-700">Lakewood Unified School District</span>
      </header>
      <main class="flex-1 overflow-y-auto bg-gray-50">
        <slot />
      </main>
    </div>
  </div>
</template>
