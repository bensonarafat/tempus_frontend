<script lang="ts" setup>
import { ref } from 'vue'
defineProps<{
  label: string | null
}>()

// Define the emits
const emit = defineEmits<{
  // Define the custom event with its payload type
  (e: 'image-picked', value: File): void
}>()

const error = ref<null | string>('')
const imagePreview = ref('')
const imageFile = ref(null as File | null)
const imageUrl = ref('')

const loading = ref(false)

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  imageUrl.value = ''
}

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    const file = files[0]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'Please upload an image file'
      return false
    }

    // Validate file size (e.g. 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image must be less than 5MB'
      return
    }

    imageFile.value = file

    // Create preview URL
    imagePreview.value = URL.createObjectURL(file)

    emit('image-picked', imageFile.value)
  }
}

const setImagePreview = (url: string) => {
  imagePreview.value = url
}
defineExpose({
  removeImage,
  setImagePreview,
})
</script>
<template>
  <div class="mb-5">
    <label v-if="label" class="block mb-2 text-sm font-medium dark:text-white text-gray-900">{{
      label
    }}</label>

    <div class="flex items-center justify-center w-full">
      <label
        for="image-upload"
        class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
      >
        <div v-if="!imagePreview" class="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            class="w-8 h-8 mb-4 text-gray-500"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p class="mb-2 text-sm text-gray-500">
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
        </div>
        <div v-else class="relative w-full h-full">
          <img :src="imagePreview" class="object-cover w-full h-full rounded-lg" />
          <button
            @click.prevent="removeImage"
            class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <input
          id="image-upload"
          type="file"
          class="hidden"
          accept="image/*"
          @change="handleImageChange"
          :disabled="loading"
        />
      </label>
    </div>
  </div>
</template>
