import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagsStore = defineStore('tags', () => {
  const tags = ref([])
  const assignments = ref({})

  return { tags, assignments }
})
