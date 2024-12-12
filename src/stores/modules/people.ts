import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import type { People, PeopleCreateDto, PeopleUpdateDto } from '@/stores/interfaces/people.interface'
import { useImageUpload } from '../helpers/image-upload-utils'
import { generateSlug } from '@/stores/helpers/string-utils'

const { uploadImage, uploadError, deleteImage } = useImageUpload()

interface PeopleState {
  people: People[]
  loading: boolean
  error: string | null
  success: string
}

export const usePeopleStore = defineStore('people', {
  state: (): PeopleState => ({
    people: [],
    loading: false,
    error: '',
    success: '',
  }),

  getters: {
    // Get people by id
    getPeopleById: (state) => {
      return (id: number) => state.people.find((e) => e.id === id)
    },
  },

  actions: {
    // Reset error state
    resetError() {
      this.error = ''
      this.success = ''
    },

    // Add people with image upload
    async addPeople(peopleData: Omit<PeopleCreateDto, 'id' | 'created_at'>, imageFile: File) {
      this.loading = true
      this.error = null
      let imageUrl: string | undefined | null

      try {
        // Upload Image
        imageUrl = await uploadImage(imageFile, 'people')
        if (!imageUrl) {
          this.error = uploadError.value
          return
        }

        // Prepare data with image URL
        const finalData = {
          ...peopleData,
          image_url: imageUrl,
          slug: generateSlug(peopleData.name),
        }

        // insert
        const { data, error } = await supabase.from('people').insert(finalData).select()

        if (error) throw error

        if (data) {
          this.people.push(data[0])
        }

        this.success = 'People Added'
      } catch (err: any) {
        // if image was uploaded but data insert failed, delete the image
        if (imageUrl) {
          await deleteImage(imageUrl, 'people')
        }
        this.error = err.message || 'Failed to add people'
      } finally {
        this.loading = false
      }
    },

    async fetchAllPeople() {
      this.loading = true
      this.error = ''

      try {
        const { data: people, error } = await supabase
          .from('people')
          .select(
            `*,  users (
            id,
            fullname,
            username,
            email
          )`,
          )
          .order('created_at', { ascending: false })
        if (error) throw error

        this.people = people || []
        return this.people
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch people'
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch a single people by Id
    async fetchPeople(id: number) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.from('people').select('*').eq('id', id).single()

        if (error) throw error

        // Update the specific people in the store or add if not exists
        const existingIndex = this.people.findIndex((e) => e.id === id)
        if (existingIndex !== -1) {
          this.people[existingIndex] = data
        } else {
          this.people.push(data)
        }

        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch people'
        return null
      } finally {
        this.loading = false
      }
    },

    // delete
    async deletePeople(id: number) {
      this.loading = true
      this.error = ''

      try {
        // First, find the vent to get it's image url
        const people = this.people.find((e) => e.id === id)

        // Delete
        const { error } = await supabase.from('people').delete().eq('id', id)

        if (error) throw error

        // if the had an image, delete it from storage
        if (people?.image_url) {
          await deleteImage(people.image_url, 'people')
        }

        // Remove the even from the local store
        this.people = this.people.filter((e) => e.id !== id)
        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete people'
        return false
      } finally {
        this.loading = false
      }
    },

    // Update
    async updatePeople(
      id: number,
      updateData: Partial<Omit<PeopleUpdateDto, 'id' | 'created_at'>>,
      newImageFile?: File | null,
    ) {
      this.loading = true
      this.error = ''
      try {
        // final the exisitng people to handle image replacement
        const existingPeople = this.people.find((e) => e.id === id)

        // Upload new image if provided
        let newImageUrl
        if (newImageFile) {
          // Delete exisiting image if it exists
          if (existingPeople?.image_url) {
            await deleteImage(existingPeople.image_url, 'people')
          }

          // Upload image
          newImageUrl = await uploadImage(newImageFile, 'people')
          if (!newImageUrl) {
            this.error = uploadError.value
            return
          }
        }

        // Prepare update data with new image URL if available
        const finalUpdateData = newImageUrl
          ? { ...updateData, image_url: newImageUrl, slug: generateSlug(updateData.name!) }
          : updateData
        // Update people
        const { data, error } = await supabase
          .from('people')
          .update(finalUpdateData)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data) {
          // Update the people in the local store
          const existingIndex = this.people.findIndex((e) => e.id === id)
          if (existingIndex !== -1) {
            this.people[existingIndex] = data[0]
          }
        }
        this.success = 'People Updated'
        return data ? data[0] : null
      } catch (err: any) {
        this.error = err.message || 'Failed to update people'
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
