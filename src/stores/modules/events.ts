import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import type { Event, EventDto, EventUpdateDto } from '@/stores/interfaces/event.interface'
import { useImageUpload } from '../helpers/image-upload-utils'
import { generateSlug } from '@/stores/helpers/string-utils'

const { uploadImage, uploadError, deleteImage } = useImageUpload()

interface EventState {
  events: Event[]
  loading: boolean
  error: string | null
  success: string
}

export const useEventStore = defineStore('event', {
  state: (): EventState => ({
    events: [],
    loading: false,
    error: '',
    success: '',
  }),

  getters: {
    // Get a event by id
    getEventById: (state) => {
      return (id: number) => state.events.find((event) => event.id === id)
    },
  },

  actions: {
    // Reset error state
    resetError() {
      this.error = ''
      this.success = ''
    },

    // Add a new event with image upload
    async addEvent(eventData: Omit<EventDto, 'id' | 'created_at'>, imageFile: File) {
      this.loading = true
      this.error = null
      let imageUrl: string | undefined | null

      try {
        // Upload Image
        imageUrl = await uploadImage(imageFile, 'events')
        if (!imageUrl) {
          this.error = uploadError.value
          return
        }
        // Prepare event data with image URL
        const finalData = {
          ...eventData,
          image_url: imageUrl,
          slug: generateSlug(eventData.title),
        }

        // insert event
        const { data, error } = await supabase.from('events').insert(finalData).select()

        if (error) throw error

        if (data) {
          this.events.push(data[0])
        }

        this.success = 'Event Added'
      } catch (err: any) {
        // if image was uploaded but data insert failed, delete the image
        if (imageUrl) {
          await deleteImage(imageUrl, 'events')
        }
        this.error = err.message || 'Failed to add event'
      } finally {
        this.loading = false
      }
    },

    // Fetch all events
    async fetchEvents() {
      this.loading = true
      this.error = ''

      try {
        const { data: events, error } = await supabase
          .from('events')
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

        this.events = events || []
        return this.events
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch events'
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch a single event by ID
    async fetchEvent(id: number) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.from('events').select('*').eq('id', id).single()

        if (error) throw error

        // Update the specific event in the store or add if not exists
        const existingIndex = this.events.findIndex((e) => e.id === id)
        if (existingIndex !== -1) {
          this.events[existingIndex] = data
        } else {
          this.events.push(data)
        }

        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch event'
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete
    async deleteEvent(id: number) {
      this.loading = true
      this.error = ''

      try {
        // First, find the vent to get it's image url
        const event = this.events.find((e) => e.id === id)

        // Delete the event
        const { error } = await supabase.from('events').delete().eq('id', id)

        if (error) throw error

        // if the event had an image, delete it from storage
        if (event?.image_url) {
          await deleteImage(event.image_url, 'events')
        }

        // Remove the even from the local store
        this.events = this.events.filter((e) => e.id !== id)
        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete event'
        return false
      } finally {
        this.loading = false
      }
    },

    // Update
    async updateEvent(
      id: number,
      updateData: Partial<Omit<EventUpdateDto, 'id' | 'created_at'>>,
      newImageFile?: File | null,
    ) {
      this.loading = true
      this.error = ''
      try {
        // final the exisitng event to handle image replacement
        const existingEvent = this.events.find((e) => e.id === id)

        // Upload new image if provided
        let newImageUrl
        if (newImageFile) {
          // Delete exisiting image if it exists
          if (existingEvent?.image_url) {
            await deleteImage(existingEvent.image_url, 'events')
          }

          // Upload image
          newImageUrl = await uploadImage(newImageFile, 'events')
          if (!newImageUrl) {
            this.error = uploadError.value
            return
          }
        }

        // Prepare update data with new image URL if available
        const finalUpdateData = newImageUrl
          ? { ...updateData, image_url: newImageUrl, slug: generateSlug(updateData.title!) }
          : updateData
        // Update event
        const { data, error } = await supabase
          .from('events')
          .update(finalUpdateData)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data) {
          // Update the event in the local store
          const existingIndex = this.events.findIndex((e) => e.id === id)
          if (existingIndex !== -1) {
            this.events[existingIndex] = data[0]
          }
        }
        this.success = 'Event Updated'
        return data ? data[0] : null
      } catch (err: any) {
        this.error = err.message || 'Failed to update event'
        return null
      } finally {
        this.loading = false
      }
    },

    // Search for events
    async search(query: string) {
      this.loading = true
      this.error = ''
      try {
        const { data: events, error } = await supabase
          .from('events')
          .select('*')
          .ilike('title', `%${query}%`)
          .limit(10)
        if (error) throw error
        this.events = events || []
        return this.events
      } catch (err: any) {
        this.error = err.message || 'Failed to search for event'
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
