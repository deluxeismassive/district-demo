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

  function setVendorTags(vendorId: string, tagIds: string[]) {
    if (tagIds.length === 0) {
      delete assignments.value[vendorId]
    } else {
      assignments.value[vendorId] = tagIds
    }
  }

  function clearVendorTags(vendorId: string) {
    delete assignments.value[vendorId]
  }

  // ---- Plan 12-02 (new) ----

  /** Rename a tag inside a group. Trims; no-op if empty after trim. */
  function renameTag(groupId: string, tagId: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    const tag = group.children.find((t: TagItem) => t.id === tagId)
    if (!tag) return
    tag.name = trimmed
  }

  /** Rename a tag group itself. Trims; no-op if empty after trim. */
  function renameTagGroup(groupId: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed) return
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.name = trimmed
  }

  /** Set the color for a tag group (palette pick). */
  function setTagGroupColor(groupId: string, newColor: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.color = newColor
  }

  /** Delete a single tag inside a group + cascade-scrub from all vendor assignments. */
  function deleteTag(groupId: string, tagId: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    group.children = group.children.filter((t: TagItem) => t.id !== tagId)
    // Cascade — scrub from every vendor's assignment array; reuse setVendorTags
    // so the empty-array cleanup branch fires automatically.
    for (const vendorId of Object.keys(assignments.value)) {
      const remaining = assignments.value[vendorId]!.filter((id: string) => id !== tagId)
      setVendorTags(vendorId, remaining)
    }
  }

  /** Delete an entire tag group + cascade-scrub every child tag from every vendor assignment. */
  function deleteTagGroup(groupId: string) {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return
    const childIds = new Set(group.children.map((t: TagItem) => t.id))
    tagGroups.value = tagGroups.value.filter((g: TagGroup) => g.id !== groupId)
    for (const vendorId of Object.keys(assignments.value)) {
      const remaining = assignments.value[vendorId]!.filter((id: string) => !childIds.has(id))
      setVendorTags(vendorId, remaining)
    }
  }

  /** Reset to seed groups + clear all assignments. Deep-clone via JSON to avoid sharing the seed reference. */
  function resetToDefaults() {
    tagGroups.value = JSON.parse(JSON.stringify(SEED_TAG_GROUPS))
    assignments.value = {}
  }

  // ---- Discretion (v0.5.0 demo parity) ----

  /** Add an empty tag group with a unique-ish id; returns the new id for the UI to auto-focus rename. */
  function addTagGroup(initialColor: string): string {
    const id = `group-${Date.now()}`
    tagGroups.value.push({ id, name: '', color: initialColor, children: [] })
    return id
  }

  /** Add an empty tag to an existing group; returns the new tag id for the UI to auto-focus rename. */
  function addTag(groupId: string): string | null {
    const group = tagGroups.value.find((g: TagGroup) => g.id === groupId)
    if (!group) return null
    const id = `tag-${Date.now()}`
    group.children.push({ id, name: '' })
    return id
  }

  return {
    tagGroups,
    assignments,
    setVendorTags,
    clearVendorTags,
    // Plan 12-02 new:
    renameTag,
    renameTagGroup,
    setTagGroupColor,
    deleteTag,
    deleteTagGroup,
    resetToDefaults,
    addTagGroup,
    addTag,
  }
}, {
  persist: true,
})
