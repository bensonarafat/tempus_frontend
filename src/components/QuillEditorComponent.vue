
<script lang="ts" setup>
import { ref } from 'vue'
import { useImageUpload } from '@/stores/helpers/image-upload-utils'
import { Quill } from '@vueup/vue-quill'
const { uploadBase64Image } = useImageUpload()
const base64ImageRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/gi

// Define the emits
const emit = defineEmits<{
  (e: 'data-change', value: string | null): void
}>()

const editor = ref<null | Quill>(null)
const content = ref<string | null>('')
const handleTextChange = async () => {
  content.value = editor.value.getHTML()
  let processedHTML = content.value
  const imageMatches = content.value!.matchAll(base64ImageRegex)

  for (const match of imageMatches) {
    const [fullMatch, fileExtension, base64Data] = match
    const uploadedUrl = await uploadBase64Image(base64Data, fileExtension, 'events')
    if (uploadedUrl) {
      if (processedHTML != null) {
        processedHTML = processedHTML.replace(
          fullMatch,
          fullMatch.replace(
            `src="data:image/${fileExtension};base64,${base64Data}"`,
            `src="${uploadedUrl}"`
          )
        )
      }
    }
  }
  emit('data-change', processedHTML)
}

const clearOrSetEditor = (text: string) => {
  editor.value.setHTML(text)
}

// Expose the method to the parent
defineExpose({
  clearOrSetEditor,
})
</script>
<template>
  <QuillEditor
    ref="editor"
    theme="snow"
    toolbar="full"
    contentType="html"
    style="min-height: 500px"
    @text-change="handleTextChange"
  />
</template>
