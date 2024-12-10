import { supabase } from '@/services/supabase'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import { decode } from 'base64-arraybuffer'

export function useImageUpload() {
  const uploadError = ref<string | null>(null)

  async function uploadImage(file: File, bucket: string, path?: string): Promise<string | null> {
    if (!file) {
      uploadError.value = 'No file provided'
      return null
    }

    try {
      uploadError.value = null

      // Genrate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = path || fileName

      // upload the file
      const { data, error: err } = await supabase.storage.from(bucket).upload(filePath, file)

      if (err) throw err

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath)
      return publicUrl
    } catch (error: any) {
      uploadError.value = error.message || 'Failed to upload image'
      return null
    }
  }

  async function deleteImage(imageUrl: string, bucket: string): Promise<boolean> {
    if (!imageUrl) return false
    uploadError.value = null
    try {
      // Extract the file path from the public URL
      const fileName = imageUrl.split('/').pop()
      if (!fileName) return false
      // Delete the image from storage
      const { error } = await supabase.storage.from(bucket).remove([fileName])

      if (error) throw error

      return true
    } catch (error: any) {
      uploadError.value = error.message || 'Failed to delete image'
      return false
    }
  }

  async function uploadBase64Image(base64Data: any, fileExtension: string, bucket: string) {
    try {
      // Genrate a unique filename
      const filename = `${Date.now()}.${fileExtension}`

      // Upload to supaba storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filename, decode(base64Data), {
          contentType: `image/${fileExtension}`,
        })

      if (error) throw error

      //Get public url
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename)
      return publicUrlData.publicUrl
    } catch (error) {
      return null
    }
  }
  return {
    uploadBase64Image,
    deleteImage,
    uploadError,
    uploadImage,
  }
}
