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

  // === Deployment: GitHub Pages (v1.0.0) ===
  // To switch to AWS Amplify SSR: see .planning/adr/AMPLIFY-GLIDEPATH.md
  // 3-line switch: (1) remove app.baseURL, (2) set nitro.preset='aws-amplify', (3) add amplify.yml
  app: {
    baseURL: '/district-demo/',
  },
  nitro: {
    preset: 'github_pages',
  },
})
