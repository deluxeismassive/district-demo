export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  future: { compatibilityVersion: 4 },
  ssr: true,
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    'nuxt-echarts',
  ],

  css: ['~/assets/css/main.css'],

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  piniaPluginPersistedstate: {
    storage: 'localStorage',
  },

  echarts: {
    renderer: 'canvas',
    charts: ['RadarChart', 'PieChart'],
    components: ['TooltipComponent', 'LegendComponent', 'RadarComponent'],
  },

  // === Phase 13 deployment switches (do not enable in Phase 7) ===
  //
  // GitHub Pages (next target):
  //   app: { baseURL: '/district-demo/' },
  //   nitro: { preset: 'github_pages' },
  //   build via `npm run generate && npm run deploy`
  //
  // AWS Amplify SSR (future):
  //   nitro: { preset: 'aws-amplify' },
  //   keep ssr: true; remove baseURL/static
  //
  // Switching between deployment targets should require only edits in this block.
})
