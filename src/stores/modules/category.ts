import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { type Category, type CategoryDto } from '@/stores/interfaces/category.interface'
import { v4 as uuidv4 } from 'uuid'
import { generateSlug } from '@/stores/helpers/string-utils'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string
  success: string
}

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
    loading: false,
    error: '',
    success: '',
  }),

  getters: {
    // Get a category by ID
    getCategoryById: (state) => {
      return (id: number) => state.categories.find((cat) => cat.id === id)
    },
  },
  actions: {
    // Reset error state
    resetError() {
      this.error = ''
      this.success = ''
    },

    // Upload image to Supabase storage
    async uploadCategoryImage(file: File, path?: string): Promise<string | null> {
      if (!file) {
        this.error = 'No file provided'
        return null
      }

      this.loading = true
      this.error = ''

      try {
        // Generate a unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = path || fileName

        // Upload the file
        const { data, error: uploadError } = await supabase.storage
          .from('categories')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('categories').getPublicUrl(filePath)

        return publicUrl
      } catch (err: any) {
        this.error = err.message || 'Failed to upload image'
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete an existing category image
    async deleteCategoryImage(imageUrl: string) {
      if (!imageUrl) return

      this.loading = true
      this.error = null

      try {
        // Extract the file path from the public URL
        const urlParts = imageUrl.split('/')
        const filePath = urlParts.slice(urlParts.indexOf('category-images')).join('/')

        // Delete the image from storage
        const { error } = await supabase.storage.from('category-images').remove([filePath])

        if (error) throw error

        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete image'
        console.error('Image Delete Error:', err)
        return false
      } finally {
        this.loading = false
      }
    },

    // Add a new category with optional image upload
    async addCategory(categoryData: Omit<CategoryDto, 'id' | 'created_at'>, imageFile: File) {
      this.loading = true
      this.error = ''
      let imageUrl: string | undefined | null
      try {
        // Upload image if provided
        imageUrl = await this.uploadCategoryImage(imageFile)

        // Prepare category data with image URL if available
        const finalCategoryData = {
          ...categoryData,
          image_url: imageUrl,
          slug: generateSlug(categoryData.name),
        }

        // Insert category
        const { data, error } = await supabase.from('categories').insert(finalCategoryData).select()

        if (error) throw error

        if (data) {
          this.categories.push(data[0])
        }
        this.success = 'Category Added'
      } catch (err: any) {
        // If image was uploaded but category insert failed, delete the image
        if (imageUrl) {
          await this.deleteCategoryImage(imageUrl)
        }
        this.error = err.message || 'Failed to add category'
      } finally {
        this.loading = false
      }
    },

    // Fetch all categories
    async fetchCategories() {
      this.loading = true
      this.error = ''

      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.categories = data || []
        return this.categories
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch categories'
        console.error('Fetch Categories Error:', err)
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch a single category by ID
    async fetchCategory(id: number) {
      this.loading = true
      this.error = ''

      try {
        const { data, error } = await supabase.from('categories').select('*').eq('id', id).single()

        if (error) throw error

        // Update the specific category in the store or add if not exists
        const existingIndex = this.categories.findIndex((cat) => cat.id === id)
        if (existingIndex !== -1) {
          this.categories[existingIndex] = data
        } else {
          this.categories.push(data)
        }

        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch category'
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete a category
    async deleteCategory(id: number) {
      this.loading = true
      this.error = ''

      try {
        // First, find the category to get its image URL
        const category = this.categories.find((cat) => cat.id === id)

        // Delete the category
        const { error } = await supabase.from('categories').delete().eq('id', id)

        if (error) throw error

        // If the category had an image, delete it from storage
        if (category?.image_url) {
          await this.deleteCategoryImage(category.image_url)
        }

        // Remove the category from the local store
        this.categories = this.categories.filter((cat) => cat.id !== id)

        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete category'
        return false
      } finally {
        this.loading = false
      }
    },

    // Update an existing category
    async updateCategory(
      id: number,
      updateData: Partial<Omit<Category, 'id' | 'created_at'>>,
      newImageFile?: File | null,
    ) {
      this.loading = true
      this.error = ''

      try {
        // Find the existing category to handle image replacement
        const existingCategory = this.categories.find((cat) => cat.id === id)

        // Upload new image if provided
        let newImageUrl
        if (newImageFile) {
          // Delete existing image if it exists
          if (existingCategory?.image_url) {
            await this.deleteCategoryImage(existingCategory.image_url)
          }

          // Upload new image
          newImageUrl = await this.uploadCategoryImage(newImageFile)
        }

        // Prepare update data with new image URL if available
        const finalUpdateData = newImageUrl
          ? { ...updateData, image_url: newImageUrl, slug: generateSlug(updateData.name!) }
          : updateData
        // Update category
        const { data, error } = await supabase
          .from('categories')
          .update(finalUpdateData)
          .eq('id', id)
          .select()

        if (error) throw error
        if (data) {
          // Update the category in the local store
          const existingIndex = this.categories.findIndex((cat) => cat.id === id)
          if (existingIndex !== -1) {
            this.categories[existingIndex] = data[0]
          }
        }

        return data ? data[0] : null
      } catch (err: any) {
        this.error = err.message || 'Failed to update category'
        return null
      } finally {
        this.loading = false
      }
    },
  },
})
