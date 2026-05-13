import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const TAG_GROUPS_KEY = 'schoolday-tag-groups'
const ASSIGNMENTS_KEY = 'schoolday-tag-assignments'

const SEED_TAG_GROUPS = [
  {
    id: 'group-curriculum',
    name: 'Curriculum',
    color: '#484ce6',
    children: [
      { id: 'tag-math', name: 'Math' },
      { id: 'tag-science', name: 'Science' },
      { id: 'tag-ela', name: 'ELA' },
      { id: 'tag-social-studies', name: 'Social Studies' }
    ]
  },
  {
    id: 'group-assessment',
    name: 'Assessment',
    color: '#da8231',
    children: [
      { id: 'tag-formative', name: 'Formative' },
      { id: 'tag-summative', name: 'Summative' }
    ]
  },
  {
    id: 'group-communication',
    name: 'Communication',
    color: '#16a34a',
    children: [
      { id: 'tag-parent-engagement', name: 'Parent Engagement' },
      { id: 'tag-staff-messaging', name: 'Staff Messaging' }
    ]
  },
  {
    id: 'group-admin',
    name: 'Administration',
    color: '#dc2626',
    children: [
      { id: 'tag-hr', name: 'HR' },
      { id: 'tag-finance', name: 'Finance' },
      { id: 'tag-scheduling', name: 'Scheduling' }
    ]
  }
]

function loadOrDefault(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : defaultVal
  } catch {
    return defaultVal
  }
}

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref(loadOrDefault(TAG_GROUPS_KEY, SEED_TAG_GROUPS))
  const assignments = ref(loadOrDefault(ASSIGNMENTS_KEY, {}))

  watch(
    tagGroups,
    (val) => localStorage.setItem(TAG_GROUPS_KEY, JSON.stringify(val)),
    { deep: true }
  )
  watch(
    assignments,
    (val) => localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(val)),
    { deep: true }
  )

  return { tagGroups, assignments }
})
