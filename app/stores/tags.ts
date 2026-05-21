import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagItem {
  id: string
  name: string
}

export interface TagGroup {
  id: string
  name: string
  color: string
  children: TagItem[]
}

export type TagAssignments = Record<string, string[]>

export const SEED_TAG_GROUPS: TagGroup[] = [
  {
    id: 'group-curriculum',
    name: 'Curriculum',
    color: '#484ce6',
    children: [
      { id: 'tag-math', name: 'Math' },
      { id: 'tag-science', name: 'Science' },
      { id: 'tag-ela', name: 'ELA' },
      { id: 'tag-social-studies', name: 'Social Studies' },
    ],
  },
  {
    id: 'group-assessment',
    name: 'Assessment',
    color: '#da8231',
    children: [
      { id: 'tag-formative', name: 'Formative' },
      { id: 'tag-summative', name: 'Summative' },
    ],
  },
  {
    id: 'group-communication',
    name: 'Communication',
    color: '#16a34a',
    children: [
      { id: 'tag-parent-engagement', name: 'Parent Engagement' },
      { id: 'tag-staff-messaging', name: 'Staff Messaging' },
    ],
  },
  {
    id: 'group-admin',
    name: 'Administration',
    color: '#dc2626',
    children: [
      { id: 'tag-hr', name: 'HR' },
      { id: 'tag-finance', name: 'Finance' },
      { id: 'tag-scheduling', name: 'Scheduling' },
    ],
  },
]

export const useTagsStore = defineStore('tags', () => {
  const tagGroups = ref<TagGroup[]>(SEED_TAG_GROUPS)
  const assignments = ref<TagAssignments>({})

  return { tagGroups, assignments }
}, {
  persist: true,
})
