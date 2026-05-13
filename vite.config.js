import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/district-demo/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
})
