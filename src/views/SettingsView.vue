<script setup>
import { shallowRef, nextTick } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useTagsStore, SEED_TAG_GROUPS } from '../stores/tags.js'

const PRESET_COLORS = [
  '#484CE6', // blue-violet (seed)
  '#DA8231', // orange (seed)
  '#16A34A', // green (seed)
  '#DC2626', // red (seed)
  '#0891B2', // cyan-600 (teal)
  '#7C3AED', // violet-600 (purple)
  '#E11D48', // rose-600 (rose/pink)
  '#475569'  // slate-600 (gray)
]

const tagsStore = useTagsStore()
const editingId = shallowRef(null)               // id of group OR tag currently being renamed (null = no edit)
const editingName = shallowRef('')               // draft name while editing
const swatchOpenForGroupId = shallowRef(null)    // which group has its swatch palette open (only one at a time)
const deleteDialogVisible = shallowRef(false)
const resetDialogVisible = shallowRef(false)
const pendingDelete = shallowRef(null)           // { type: 'tag' | 'group', group, tag? }
const pendingDeleteCount = shallowRef(0)

// --- Edit lifecycle (RESEARCH Pattern 1) ---

const editInputRefs = {}

function registerEditRef(id, el) {
  if (el) editInputRefs[id] = el
  else delete editInputRefs[id]
}

function startEditGroup(group) {
  editingId.value = group.id
  editingName.value = group.name
  swatchOpenForGroupId.value = group.id   // show swatch while renaming a group
  nextTick(() => editInputRefs[group.id]?.focus())
}

function startEditTag(tag) {
  editingId.value = tag.id
  editingName.value = tag.name
  nextTick(() => editInputRefs[tag.id]?.focus())
}

function confirmEdit(item, parentGroup = null) {
  const trimmed = editingName.value.trim()
  if (trimmed) {
    item.name = trimmed                   // mutates reactive Pinia ref — watch() persists
  } else if (parentGroup) {
    // Empty child — remove (RESEARCH Pitfall 5)
    parentGroup.children = parentGroup.children.filter(c => c.id !== item.id)
  } else {
    // Empty group — remove (RESEARCH Pitfall 5)
    tagsStore.tagGroups = tagsStore.tagGroups.filter(g => g.id !== item.id)
  }
  editingId.value = null
  swatchOpenForGroupId.value = null
}

// --- Color selection (RESEARCH Pattern 4) ---

function nextUnusedColor() {
  const used = new Set(tagsStore.tagGroups.map(g => g.color.toLowerCase()))
  return PRESET_COLORS.find(c => !used.has(c.toLowerCase())) ?? PRESET_COLORS[0]
}

function pickColor(group, color) {
  group.color = color
  // Do NOT close the swatch panel here; user may want to try multiple colors. It closes on confirmEdit.
}

function toggleSwatch(group) {
  swatchOpenForGroupId.value = swatchOpenForGroupId.value === group.id ? null : group.id
}

// --- Create ---

function addGroup() {
  const newGroup = {
    id: `group-${Date.now()}`,
    name: '',
    color: nextUnusedColor(),
    children: []
  }
  tagsStore.tagGroups.push(newGroup)
  nextTick(() => startEditGroup(newGroup))
}

function addTag(group) {
  const newTag = { id: `tag-${Date.now()}`, name: '' }
  group.children.push(newTag)
  nextTick(() => startEditTag(newTag))
}

// --- Delete (RESEARCH Pattern 2 + 3 — count, then cascade) ---

function vendorCountForTag(tagId) {
  return Object.values(tagsStore.assignments).filter(arr => arr.includes(tagId)).length
}

function vendorCountForGroup(group) {
  return group.children.reduce((sum, child) => sum + vendorCountForTag(child.id), 0)
}

function requestDeleteTag(group, tag) {
  pendingDelete.value = { type: 'tag', group, tag }
  pendingDeleteCount.value = vendorCountForTag(tag.id)
  deleteDialogVisible.value = true
}

function requestDeleteGroup(group) {
  pendingDelete.value = { type: 'group', group, tag: null }
  pendingDeleteCount.value = vendorCountForGroup(group)
  deleteDialogVisible.value = true
}

function confirmDelete() {
  editingId.value = null                  // RESEARCH Pitfall 1 — clear stale edit ref before mutating
  swatchOpenForGroupId.value = null
  const { type, group, tag } = pendingDelete.value
  if (type === 'tag') {
    // Cascade: filter tag id from every vendor's assignment array
    for (const vendorId in tagsStore.assignments) {
      tagsStore.assignments[vendorId] = tagsStore.assignments[vendorId].filter(id => id !== tag.id)
    }
    group.children = group.children.filter(c => c.id !== tag.id)
  } else {
    // Cascade: filter ALL children ids from every vendor's assignment array, then drop group
    const childIds = new Set(group.children.map(c => c.id))
    for (const vendorId in tagsStore.assignments) {
      tagsStore.assignments[vendorId] = tagsStore.assignments[vendorId].filter(id => !childIds.has(id))
    }
    tagsStore.tagGroups = tagsStore.tagGroups.filter(g => g.id !== group.id)
  }
  deleteDialogVisible.value = false
  pendingDelete.value = null
}

// --- Reset (RESEARCH Pattern 5) ---

function requestReset() {
  resetDialogVisible.value = true
}

function confirmReset() {
  editingId.value = null
  swatchOpenForGroupId.value = null
  // Deep clone SEED_TAG_GROUPS (JSON round-trip — sufficient for plain-object store data)
  tagsStore.tagGroups = JSON.parse(JSON.stringify(SEED_TAG_GROUPS))
  tagsStore.assignments = {}
  resetDialogVisible.value = false
}
</script>

<template>
  <div class="p-6">
    <!-- Page header (D-06) -->
    <div class="flex items-start justify-between mb-6">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">Tags</h1>
        <p class="text-sm text-gray-600 mt-1">
          Manage the tag library used across Discovery and vendor detail. Changes apply immediately and persist in your browser.
        </p>
      </div>
      <Button label="Reset to defaults" severity="secondary" outlined @click="requestReset" />
    </div>

    <!-- Add-group control (D-05) -->
    <div class="mb-4">
      <Button label="Add group" icon="pi pi-plus" severity="primary" @click="addGroup" />
    </div>

    <!-- Empty state (RESEARCH Open Question 1) -->
    <p v-if="tagsStore.tagGroups.length === 0" class="text-sm text-gray-500 italic">
      No tag groups yet. Add one to get started.
    </p>

    <!-- Group cards loop (D-03 always expanded, D-12 colored dot always visible) -->
    <div
      v-for="group in tagsStore.tagGroups"
      :key="group.id"
      class="bg-white rounded-lg border border-gray-200 p-6 mb-6"
    >
      <!-- Group header row -->
      <div class="flex items-center gap-2 mb-3">
        <!-- Colored dot (always visible, clickable to open swatch) -->
        <button
          type="button"
          class="w-4 h-4 rounded-full shrink-0 border border-gray-300"
          :style="{ backgroundColor: group.color }"
          aria-label="Change group color"
          @mousedown.prevent="toggleSwatch(group)"
        />
        <!-- Group name: display vs edit -->
        <template v-if="editingId !== group.id">
          <span
            class="text-base font-semibold text-gray-900 cursor-pointer hover:underline"
            @click="startEditGroup(group)"
          >{{ group.name || '(unnamed group)' }}</span>
          <button
            type="button"
            class="ml-1 text-gray-400 hover:text-gray-600"
            aria-label="Rename group"
            @click="startEditGroup(group)"
          ><i class="pi pi-pencil text-xs" /></button>
        </template>
        <template v-else>
          <input
            :ref="el => registerEditRef(group.id, el)"
            v-model="editingName"
            class="text-base font-semibold border-b border-primary outline-none bg-transparent px-1"
            placeholder="Group name..."
            @keydown.enter.prevent="confirmEdit(group)"
            @blur="confirmEdit(group)"
          />
        </template>
        <!-- Spacer + delete -->
        <button
          type="button"
          class="ml-auto text-gray-400 hover:text-red-600"
          aria-label="Delete group"
          @click="requestDeleteGroup(group)"
        ><i class="pi pi-trash text-sm" /></button>
      </div>

      <!-- Swatch palette (visible only when this group's swatch is open) -->
      <div v-if="swatchOpenForGroupId === group.id" class="flex gap-1.5 mb-3 ml-6">
        <button
          v-for="color in PRESET_COLORS"
          :key="color"
          type="button"
          class="w-6 h-6 rounded-full border-2 transition-transform"
          :class="group.color.toLowerCase() === color.toLowerCase() ? 'border-gray-700 scale-110' : 'border-transparent hover:scale-105'"
          :style="{ backgroundColor: color }"
          :aria-label="`Pick color ${color}`"
          @mousedown.prevent="pickColor(group, color)"
        />
      </div>

      <!-- Children list -->
      <ul class="ml-6 space-y-1">
        <li
          v-for="tag in group.children"
          :key="tag.id"
          class="flex items-center gap-2 group/row py-1"
        >
          <template v-if="editingId !== tag.id">
            <span
              class="text-sm text-gray-800 cursor-pointer hover:underline"
              @click="startEditTag(tag)"
            >{{ tag.name || '(unnamed tag)' }}</span>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 opacity-0 group-hover/row:opacity-100"
              aria-label="Rename tag"
              @click="startEditTag(tag)"
            ><i class="pi pi-pencil text-xs" /></button>
          </template>
          <template v-else>
            <input
              :ref="el => registerEditRef(tag.id, el)"
              v-model="editingName"
              class="text-sm border-b border-primary outline-none bg-transparent px-1"
              placeholder="Tag name..."
              @keydown.enter.prevent="confirmEdit(tag, group)"
              @blur="confirmEdit(tag, group)"
            />
          </template>
          <button
            type="button"
            class="ml-auto text-gray-400 hover:text-red-600 opacity-0 group-hover/row:opacity-100"
            aria-label="Delete tag"
            @click="requestDeleteTag(group, tag)"
          ><i class="pi pi-trash text-xs" /></button>
        </li>
      </ul>

      <!-- Add-tag affordance (D-05, D-08) -->
      <button
        type="button"
        class="ml-6 mt-2 text-sm text-primary hover:underline flex items-center gap-1"
        @click="addTag(group)"
      ><i class="pi pi-plus text-xs" /> Add tag</button>
    </div>

    <!-- Delete confirm dialog (D-13) -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      modal
      header="Confirm delete"
      :style="{ width: '24rem' }"
    >
      <p v-if="pendingDelete" class="text-sm text-gray-700">
        Delete
        <strong>{{ pendingDelete.type === 'tag' ? pendingDelete.tag.name : pendingDelete.group.name }}</strong>?
        It will be removed from {{ pendingDeleteCount }} vendor(s).
      </p>
      <template #footer>
        <Button label="Cancel" text @click="deleteDialogVisible = false" />
        <Button label="Delete" severity="danger" @click="confirmDelete" />
      </template>
    </Dialog>

    <!-- Reset confirm dialog (D-16) -->
    <Dialog
      v-model:visible="resetDialogVisible"
      modal
      header="Reset to defaults?"
      :style="{ width: '26rem' }"
    >
      <p class="text-sm text-gray-700">
        This will replace your current tag groups with the original seed set and clear every tag assignment on every vendor. This cannot be undone.
      </p>
      <template #footer>
        <Button label="Cancel" text @click="resetDialogVisible = false" />
        <Button label="Reset" severity="danger" @click="confirmReset" />
      </template>
    </Dialog>
  </div>
</template>
