<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useTagsStore, type TagGroup, type TagItem } from '~/stores/tags'

// EXPLICIT store import — @pinia/nuxt v0.11.3 does NOT auto-import store factories (Phase 10 lesson #1).

definePageMeta({
  nav: true,
  navLabel: 'Tags',
  navIcon: 'i-lucide-tag',
  navOrder: 50,
})

const tagsStore = useTagsStore()

// 8-swatch palette — verbatim from v0.5.0 SettingsView.vue:7-16.
// First 4 match SEED_TAG_GROUPS hex; last 4 are alternatives.
const PALETTE_COLORS = [
  '#484CE6', // blue-violet (matches SEED Curriculum)
  '#DA8231', // orange       (matches SEED Assessment)
  '#16A34A', // green        (matches SEED Communication)
  '#DC2626', // red          (matches SEED Administration)
  '#0891B2', // cyan-600 (teal)
  '#7C3AED', // violet-600 (purple)
  '#E11D48', // rose-600 (rose/pink)
  '#475569', // slate-600 (gray)
] as const

// ---- Inline rename state ----

const editingId = ref<string | null>(null)
const editingName = ref<string>('')

function startEditGroup(group: TagGroup) {
  editingId.value = group.id
  editingName.value = group.name
  swatchOpenForGroupId.value = group.id // show swatch while renaming the group
}

function startEditTag(tag: TagItem) {
  editingId.value = tag.id
  editingName.value = tag.name
}

function commitEditGroup(group: TagGroup) {
  if (editingId.value !== group.id) return
  tagsStore.renameTagGroup(group.id, editingName.value)
  editingId.value = null
  swatchOpenForGroupId.value = null
}

function commitEditTag(group: TagGroup, tag: TagItem) {
  if (editingId.value !== tag.id) return
  tagsStore.renameTag(group.id, tag.id, editingName.value)
  editingId.value = null
}

// ---- Swatch popover state ----

const swatchOpenForGroupId = ref<string | null>(null)
function toggleSwatch(groupId: string) {
  swatchOpenForGroupId.value = swatchOpenForGroupId.value === groupId ? null : groupId
}

// ---- Cascade-count helpers (UI-local — not store actions) ----

function vendorCountForTag(tagId: string): number {
  return Object.values(tagsStore.assignments).filter((arr: string[]) => arr.includes(tagId)).length
}

function vendorCountForGroup(group: TagGroup): number {
  return group.children.reduce((sum: number, child: TagItem) => sum + vendorCountForTag(child.id), 0)
}

// ---- Delete flow ----

type PendingDelete =
  | { type: 'tag'; group: TagGroup; tag: TagItem }
  | { type: 'group'; group: TagGroup }

const pendingDelete = ref<PendingDelete | null>(null)
const pendingDeleteCount = ref(0)
const deleteDialogOpen = ref(false)

function requestDeleteTag(group: TagGroup, tag: TagItem) {
  pendingDelete.value = { type: 'tag', group, tag }
  pendingDeleteCount.value = vendorCountForTag(tag.id)
  deleteDialogOpen.value = true
}

function requestDeleteGroup(group: TagGroup) {
  pendingDelete.value = { type: 'group', group }
  pendingDeleteCount.value = vendorCountForGroup(group)
  deleteDialogOpen.value = true
}

function confirmDelete() {
  if (!pendingDelete.value) return
  editingId.value = null // clear stale edit state before mutating
  swatchOpenForGroupId.value = null
  if (pendingDelete.value.type === 'tag') {
    tagsStore.deleteTag(pendingDelete.value.group.id, pendingDelete.value.tag.id)
  } else {
    tagsStore.deleteTagGroup(pendingDelete.value.group.id)
  }
  deleteDialogOpen.value = false
  pendingDelete.value = null
}

// ---- Reset flow ----

const resetDialogOpen = ref(false)
function requestReset() {
  resetDialogOpen.value = true
}
function confirmReset() {
  editingId.value = null
  swatchOpenForGroupId.value = null
  tagsStore.resetToDefaults()
  resetDialogOpen.value = false
}

// ---- Add affordances (discretion — v0.5.0 demo parity) ----

function onAddGroup() {
  const newId = tagsStore.addTagGroup('#475569')
  // After Pinia mutation, transition immediately into edit mode for the new group.
  nextTick(() => {
    editingId.value = newId
    editingName.value = ''
    swatchOpenForGroupId.value = newId
  })
}

function onAddTag(group: TagGroup) {
  const newId = tagsStore.addTag(group.id)
  if (!newId) return
  nextTick(() => {
    editingId.value = newId
    editingName.value = ''
  })
}
</script>

<template>
  <div class="p-6">
    <!-- Page header: title + description + Reset-to-defaults (top-right) -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Tags</h1>
        <p class="text-sm text-gray-600 mt-1">
          Manage tag groups and child tags. Changes persist across page refresh.
        </p>
      </div>
      <UButton
        color="neutral"
        variant="outline"
        label="Reset to defaults"
        icon="i-lucide-rotate-ccw"
        @click="requestReset"
      />
    </div>

    <!-- Add group affordance -->
    <div class="mb-6">
      <UButton
        color="neutral"
        variant="outline"
        label="Add group"
        icon="i-lucide-plus"
        @click="onAddGroup"
      />
    </div>

    <!-- Empty state -->
    <div
      v-if="tagsStore.tagGroups.length === 0"
      class="bg-white rounded-lg border border-gray-200 p-8 text-center"
    >
      <div class="text-sm font-semibold text-gray-900">No tag groups</div>
      <div class="text-sm text-gray-500 mt-1">
        Click "Add group" to create one, or "Reset to defaults" to restore the seed set.
      </div>
    </div>

    <!-- Group cards -->
    <div
      v-for="group in tagsStore.tagGroups"
      :key="group.id"
      class="bg-white rounded-lg border border-gray-200 p-6 mb-6"
    >
      <!-- Group header row: color dot + name (display OR edit) + delete -->
      <div class="flex items-center gap-3 mb-2">
        <button
          type="button"
          class="w-4 h-4 rounded-full shrink-0 border border-gray-300"
          :style="{ backgroundColor: group.color }"
          aria-label="Change group color"
          @mousedown.prevent="toggleSwatch(group.id)"
        />

        <template v-if="editingId !== group.id">
          <span
            class="text-base font-semibold text-gray-900 cursor-pointer hover:underline"
            @click="startEditGroup(group)"
          >{{ group.name || '(unnamed group)' }}</span>
        </template>
        <template v-else>
          <UInput
            v-model="editingName"
            placeholder="Group name..."
            size="sm"
            autofocus
            class="flex-1 max-w-xs"
            @keydown.enter.prevent="commitEditGroup(group)"
            @blur="commitEditGroup(group)"
          />
        </template>

        <div class="flex-1" />

        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-trash-2"
          size="sm"
          aria-label="Delete group"
          @click="requestDeleteGroup(group)"
        />
      </div>

      <!-- Swatch popover (v-if open for this group) -->
      <div
        v-if="swatchOpenForGroupId === group.id"
        class="flex gap-1.5 mb-3 ml-6"
      >
        <button
          v-for="color in PALETTE_COLORS"
          :key="color"
          type="button"
          class="w-6 h-6 rounded-full border-2 transition-transform"
          :class="group.color.toLowerCase() === color.toLowerCase()
            ? 'border-gray-700 scale-110'
            : 'border-transparent hover:scale-105'"
          :style="{ backgroundColor: color }"
          :aria-label="`Pick color ${color}`"
          @mousedown.prevent="tagsStore.setTagGroupColor(group.id, color)"
        />
      </div>

      <!-- Child tags list -->
      <ul class="ml-6 space-y-1 mt-3">
        <li
          v-for="tag in group.children"
          :key="tag.id"
          class="flex items-center gap-2 py-1 group/tag"
        >
          <template v-if="editingId !== tag.id">
            <span
              class="text-sm text-gray-800 cursor-pointer hover:underline"
              @click="startEditTag(tag)"
            >{{ tag.name || '(unnamed tag)' }}</span>
          </template>
          <template v-else>
            <UInput
              v-model="editingName"
              placeholder="Tag name..."
              size="sm"
              autofocus
              class="max-w-xs"
              @keydown.enter.prevent="commitEditTag(group, tag)"
              @blur="commitEditTag(group, tag)"
            />
          </template>

          <div class="flex-1" />

          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-trash-2"
            size="xs"
            class="opacity-0 group-hover/tag:opacity-100 transition-opacity"
            aria-label="Delete tag"
            @click="requestDeleteTag(group, tag)"
          />
        </li>
      </ul>

      <!-- Add tag affordance -->
      <button
        type="button"
        class="ml-6 mt-2 text-sm text-primary-600 hover:underline flex items-center gap-1"
        @click="onAddTag(group)"
      >
        <UIcon name="i-lucide-plus" class="w-3.5 h-3.5" />
        Add tag
      </button>
    </div>

    <!-- Delete confirmation modal -->
    <UModal
      v-model:open="deleteDialogOpen"
      title="Confirm delete"
      :description="pendingDelete && pendingDelete.type === 'tag'
        ? `Delete tag '${pendingDelete.tag.name}'?`
        : pendingDelete && pendingDelete.type === 'group'
          ? `Delete group '${pendingDelete.group.name}' and all its tags?`
          : undefined"
    >
      <template #body>
        <p class="text-sm text-gray-700">
          This will remove it from {{ pendingDeleteCount }} vendor(s). This action cannot be undone.
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
          <UButton color="error" variant="solid" label="Delete" @click="confirmDelete" />
        </div>
      </template>
    </UModal>

    <!-- Reset confirmation modal -->
    <UModal v-model:open="resetDialogOpen" title="Reset to defaults?">
      <template #body>
        <p class="text-sm text-gray-700">
          This will replace your current tag groups with the original seed set and
          clear every tag assignment on every vendor. This cannot be undone.
        </p>
      </template>
      <template #footer="{ close }">
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="Cancel" @click="close" />
          <UButton color="error" variant="solid" label="Reset" @click="confirmReset" />
        </div>
      </template>
    </UModal>
  </div>
</template>
