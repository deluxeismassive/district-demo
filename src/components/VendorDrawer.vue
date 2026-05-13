<script setup>
import { computed } from 'vue'
import Drawer from 'primevue/drawer'
import Divider from 'primevue/divider'
import MultiSelect from 'primevue/multiselect'
import { useTagsStore } from '../stores/tags.js'

const props = defineProps({
  vendor: { type: Object, default: null },
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['update:visible'])

const tagsStore = useTagsStore()

const visibleProxy = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const totalPrivacyScore = computed(() =>
  props.vendor
    ? Object.values(props.vendor.privacyScore).reduce((sum, v) => sum + v, 0)
    : 0
)

const selectedTagIds = computed({
  get: () => (props.vendor ? tagsStore.assignments[props.vendor.vendorId] ?? [] : []),
  set: (val) => {
    if (props.vendor) tagsStore.assignments[props.vendor.vendorId] = val
  }
})

const radarOption = computed(() => {
  if (!props.vendor) return {}
  const s = props.vendor.privacyScore
  return {
    radar: {
      indicator: [
        { name: 'Information Collected', max: 10 },
        { name: 'Use of Information', max: 10 },
        { name: 'Data Sharing', max: 10 },
        { name: 'Security Measures', max: 10 },
        { name: 'User Rights', max: 10 },
        { name: 'Retention Period', max: 10 },
        { name: 'Compliance with Laws', max: 10 },
        { name: 'Updates to Privacy Policy', max: 10 },
        { name: 'Overall Clarity and Transparency', max: 10 },
        { name: 'Contact Information', max: 10 }
      ]
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [
              s.informationCollected,
              s.useOfInformation,
              s.dataSharing,
              s.securityMeasures,
              s.userRights,
              s.retentionPeriod,
              s.complianceWithLaws,
              s.updatesToPolicy,
              s.clarityAndTransparency,
              s.contactInformation
            ],
            areaStyle: { color: 'rgba(72, 76, 230, 0.15)' },
            lineStyle: { color: '#484ce6', width: 2 }
          }
        ]
      }
    ],
    tooltip: { trigger: 'item' }
  }
})
</script>

<template>
  <Drawer
    v-model:visible="visibleProxy"
    position="right"
    :style="{ width: '480px' }"
  >
    <template v-if="vendor">
      <div class="flex flex-col gap-1">
        <h2 class="text-2xl font-semibold text-gray-900">{{ vendor.name }}</h2>
        <span class="text-sm text-gray-500">{{ vendor.category }}</span>
      </div>

      <Divider />

      <section>
        <h3 class="text-sm font-semibold text-gray-900 mb-4">Usage</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-sm text-gray-500">Frequency</div>
            <div class="text-sm font-semibold text-gray-900">{{ vendor.frequency }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Last Seen</div>
            <div class="text-sm font-semibold text-gray-900">{{ vendor.lastSeen }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Users</div>
            <div class="text-sm font-semibold text-gray-900">{{ vendor.userCount.toLocaleString() }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-500">Students</div>
            <div class="text-sm font-semibold text-gray-900">{{ vendor.studentCount.toLocaleString() }}</div>
          </div>
        </div>
      </section>

      <Divider />

      <section>
        <h3 class="text-sm font-semibold text-gray-900 mb-2">Privacy Policy Score</h3>
        <div class="flex items-baseline gap-2 mb-4">
          <span class="text-2xl font-semibold text-primary">{{ totalPrivacyScore }}</span>
          <span class="text-sm text-gray-500">Total Score / 100</span>
        </div>
        <VChart
          :option="radarOption"
          autoresize
          style="height: 320px; width: 100%"
        />
      </section>

      <Divider />

      <section>
        <h3 class="text-sm font-semibold text-gray-900 mb-2">Tags</h3>
        <MultiSelect
          v-model="selectedTagIds"
          :options="tagsStore.tagGroups"
          optionLabel="name"
          optionValue="id"
          optionGroupLabel="name"
          optionGroupChildren="children"
          placeholder="Assign tags..."
          display="chip"
          class="w-full"
        >
          <template #emptyfilter>No tags available. Create tags in Settings.</template>
        </MultiSelect>
      </section>
    </template>
  </Drawer>
</template>
