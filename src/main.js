import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { RadarChart, PieChart } from 'echarts/charts'
import { RadarComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import router from './router/index.js'
import './style.css'
import App from './App.vue'

const SchoolDayPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#eeeeff',
      100: '#d4d4fc',
      200: '#ababf8',
      300: '#8284f4',
      400: '#6466ef',
      500: '#484ce6',
      600: '#3c40cc',
      700: '#3034b3',
      800: '#252899',
      900: '#1a1d80',
      950: '#0f1166'
    }
  }
})

use([CanvasRenderer, RadarChart, PieChart, RadarComponent, TooltipComponent, LegendComponent])

const app = createApp(App)

app.use(createPinia())
app.use(PrimeVue, {
  theme: {
    preset: SchoolDayPreset,
    options: {
      darkModeSelector: false
    }
  }
})
app.use(router)
app.component('VChart', VChart)

app.mount('#app')
