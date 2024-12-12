import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { type Category, type CategoryDto } from '@/stores/interfaces/category.interface'
import { v4 as uuidv4 } from 'uuid'
import { generateSlug } from '@/stores/helpers/string-utils'
import { useImageUpload } from '../helpers/image-upload-utils'
const { uploadImage, uploadError, deleteImage } = useImageUpload()

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
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

    // Add a new category with image upload
    async addCategory(categoryData: Omit<CategoryDto, 'id' | 'created_at'>, imageFile: File) {
      this.loading = true
      this.error = ''
      let imageUrl: string | undefined | null
      try {
        // Upload image
        imageUrl = await uploadImage(imageFile, 'categories')
        if (!imageUrl) {
          this.error = uploadError.value
          return
        }

        // Prepare category data with image URL
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
          await deleteImage(imageUrl, 'categories')
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
          await deleteImage(category.image_url, 'categories')
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
            await deleteImage(existingCategory.image_url, 'categories')
          }

          // Upload image
          newImageUrl = await uploadImage(newImageFile, 'categories')
          if (!newImageUrl) {
            this.error = uploadError.value
            return
          }
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
        this.success = 'Category Updated'
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
