import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { nav: true, label: 'Dashboard', icon: 'pi pi-home' }
  },
  {
    path: '/discovery',
    name: 'discovery',
    component: () => import('../views/DiscoveryView.vue'),
    meta: { nav: true, label: 'Discovery', icon: 'pi pi-search' }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/ReportsView.vue'),
    meta: { nav: true, label: 'Reports', icon: 'pi pi-chart-bar' }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../views/SettingsView.vue'),
    meta: { nav: true, label: 'Settings', icon: 'pi pi-cog' }
  }
]

export default createRouter({
  history: createWebHashHistory('/district-demo/'),
  routes
})
