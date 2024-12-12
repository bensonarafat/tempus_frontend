import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import type {
  Resource,
  ResourceCreateDto,
  ResourceUpdateDto,
} from '@/stores/interfaces/resource.interface'
import { useImageUpload } from '../helpers/image-upload-utils'

const { uploadImage, uploadError, deleteImage } = useImageUpload()

interface ResourceState {
  resources: Resource[]
  loading: boolean
  error: string | null
  success: string
}

export const useResourceStore = defineStore('resource', {
  state: (): ResourceState => ({
    resources: [],
    loading: false,
    error: '',
    success: '',
  }),

  getters: {
    // get Resource by id
    getResourceById: (state) => {
      return (id: number) => state.resources.find((e) => e.id === id)
    },
  },

  actions: {
    // reset erro state
    resetError() {
      this.error = ''
      this.success = ''
    },

    // Add resource with image upload if it is provided
    async addResouce(
      resourcedata: Omit<ResourceCreateDto, 'id' | 'created_at'>,
      imageFile?: File | null,
      url?: string | null,
    ) {
      this.loading = true
      this.error = null
      let imageUrl: string | undefined | null

      try {
        // Upload Image if provided
        if (imageFile) {
          imageUrl = await uploadImage(imageFile, 'events')
          if (!imageUrl) {
            this.error = uploadError.value
            return
          }
        }

        // Prepare data with image
        const finalData = imageUrl
          ? { ...resourcedata, url: imageUrl }
          : {
              ...resourcedata,
              url: url,
            }

        // insert
        const { data, error } = await supabase.from('resources').insert(finalData).select()

        if (error) throw error

        if (data) {
          this.resources.push(data[0])
        }

        this.success = 'Resource Added'
      } catch (err: any) {
        // if image was uploaded but data insert failed, delete the image
        if (imageUrl) {
          await deleteImage(imageUrl, 'events')
        }
        this.error = err.message || 'Failed to add resource'
      } finally {
        this.loading = false
      }
    },

    // fetch all resources
    async fetchResouces() {
      this.loading = true
      this.error = ''
      try {
        const { data: resources, error } = await supabase
          .from('resources')
          .select(
            `*,   users (
            id,
            fullname,
            username,
            email
          ), events (
          title)`,
          )
          .order('created_at', { ascending: false })
        if (error) throw error

        this.resources = resources || []
        return this.resources
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch resources'
        return []
      } finally {
        this.loading = false
      }
    },

    // fetch resources by media _type
    async fetchResouresByMediaType(media_type: string) {
      this.loading = true
      this.error = ''
      try {
        const { data: resources, error } = await supabase
          .from('resources')
          .select(
            `*,   users (
            id,
            fullname,
            username,
            email
          ), events (
          title)`,
          )
          .eq('media_type', media_type)
          .order('created_at', { ascending: false })
        if (error) throw error

        this.resources = resources || []
        return this.resources
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch resources'
        return null
      } finally {
        this.loading = false
      }
    },

    // fetch a single resource by id
    async fetchResource(id: number) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase
          .from('resources')
          .select(
            `*,   users (
            id,
            fullname,
            username,
            email
          ), events (
          title)`,
          )
          .eq('id', id)
          .single()

        if (error) throw error

        // Update the specific resources in the store or add if not exists
        const existingIndex = this.resources.findIndex((e) => e.id === id)
        if (existingIndex !== -1) {
          this.resources[existingIndex] = data
        } else {
          this.resources.push(data)
        }

        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch resources'
        return null
      } finally {
        this.loading = false
      }
    },

    // delete
    async deleteResource(id: number) {
      this.loading = true
      this.error = ''
      try {
        // First, find the vent to get it's image url
        const resources = this.resources.find((e) => e.id === id)

        // Delete
        const { error } = await supabase.from('resources').delete().eq('id', id)

        if (error) throw error

        // if the had an image, delete it from storage
        if (resources?.url && resources.media_type == 'image') {
          await deleteImage(resources.url, 'events')
        }

        // Remove the even from the local store
        this.resources = this.resources.filter((e) => e.id !== id)
        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete resource'
        return false
      } finally {
        this.loading = false
      }
    },

    // Update
    async updateResource(
      id: number,
      updateData: Partial<Omit<ResourceUpdateDto, 'id' | 'created_at'>>,
      newImageFile?: File | null,
      url?: string | null,
    ) {
      this.loading = true
      this.error = ''

      try {
        // final the exisitng resource to handle image replacement
        const existingResource = this.resources.find((e) => e.id === id)

        // Upload new image if provided
        let newImageUrl
        if (newImageFile) {
          // Delete exisiting image if it exists
          if (existingResource?.url) {
            await deleteImage(existingResource.url, 'events')
          }

          // Upload image
          newImageUrl = await uploadImage(newImageFile, 'events')
          if (!newImageUrl) {
            this.error = uploadError.value
            return
          }
        }

        // Prepare update data with new image URL  if available
        const finalUpdateData = newImageUrl
          ? { ...updateData, url: newImageUrl }
          : { ...updateData, url: url }

        // Update resources
        const { data, error } = await supabase
          .from('resources')
          .update(finalUpdateData)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data) {
          // Update the resource in the local stroe
          const existingIndex = this.resources.findIndex((e) => e.id === id)
          if (existingIndex !== -1) {
            this.resources[existingIndex] = data[0]
          }
        }
        this.success = 'Resource Updated'
        return data ? data[0] : null
      } catch (err: any) {
        this.error = err.message || 'Failed to update resources'
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
