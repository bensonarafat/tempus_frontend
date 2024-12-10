<!-- YoutubeLinksInput.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'

// Utility function to validate YouTube URL
const isValidYouTubeURL = (url: string): boolean => {
  // Regular expression to match YouTube URLs
  const youtubeRegex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([^&\s]+)/
  return youtubeRegex.test(url)
}

// Define props and emits
interface Props {
  maxLinks?: number
}

const props = withDefaults(defineProps<Props>(), {
  maxLinks: 5,
})

// Define emits
const emit = defineEmits<{
  (e: 'update:links', links: string[]): void
}>()

// State for YouTube links
const youtubeLinks = ref<string[]>([])
const newLink = ref<string>('')
const linkError = ref<string>('')

// Add a new YouTube link
const addLink = () => {
  // Reset previous error
  linkError.value = ''

  // Trim the link and validate
  const trimmedLink = newLink.value.trim()

  // Check if link is empty
  if (!trimmedLink) {
    linkError.value = 'Please enter a YouTube link'
    return
  }

  // Check if link is valid
  if (!isValidYouTubeURL(trimmedLink)) {
    linkError.value = 'Please enter a valid YouTube URL'
    return
  }

  // Check if link is already added
  if (youtubeLinks.value.includes(trimmedLink)) {
    linkError.value = 'This link has already been added'
    return
  }

  // Check maximum links limit
  if (youtubeLinks.value.length >= props.maxLinks) {
    linkError.value = `Maximum ${props.maxLinks} links allowed`
    return
  }

  // Add the link
  youtubeLinks.value.push(trimmedLink)

  // Emit updated links
  emit('update:links', youtubeLinks.value)

  // Clear the input
  newLink.value = ''
}

// Remove a YouTube link
const removeLink = (linkToRemove: string) => {
  youtubeLinks.value = youtubeLinks.value.filter((link) => link !== linkToRemove)

  // Emit updated links
  emit('update:links', youtubeLinks.value)
}

// Computed property to check if more links can be added
const canAddMoreLinks = computed(() => {
  return youtubeLinks.value.length < props.maxLinks
})
</script>

<template>
  <div class="max-w-2xl mx-auto p-4">
    <div class="space-y-4">
      <div class="flex space-x-2">
        <input
          v-model="newLink"
          type="text"
          placeholder="Enter YouTube video URL"
          @keyup.enter="addLink"
          class="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          @click="addLink"
          :disabled="!canAddMoreLinks"
          class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Add Link
        </button>
      </div>

      <!-- Error Message -->
      <p v-if="linkError" class="text-red-500 text-sm">
        {{ linkError }}
      </p>

      <!-- List of Added Links -->
      <div v-if="youtubeLinks.length > 0" class="space-y-2">
        <div
          v-for="link in youtubeLinks"
          :key="link"
          class="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
        >
          <span class="truncate flex-grow mr-4">{{ link }}</span>
          <button
            @click="removeLink(link)"
            class="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
