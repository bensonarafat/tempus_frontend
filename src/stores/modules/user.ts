import { defineStore } from 'pinia'
import {
  type User,
  type CreateUserDto,
  type UpdateUserDto,
} from '@/stores/interfaces/user.interface'
import { supabase } from '@/services/supabase'

import { useImageUpload } from '../helpers/image-upload-utils'

const { uploadImage, uploadError, deleteImage } = useImageUpload()

interface UserState {
  currentUser: User | null
  users: User[]
  loading: boolean
  error: string | null
  success: string
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    users: [],
    loading: false,
    error: null,
    success: '',
  }),

  getters: {
    // User-specific getters
    getUserProfile(): User | null {
      return this.currentUser
    },

    isAdmin(): boolean {
      return this.currentUser?.role === 'admin'
    },
  },

  actions: {
    // reset erro state
    resetError() {
      this.error = ''
      this.success = ''
    },

    async getUsers() {
      this.loading = true
      this.error = ''
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select(`*`)
          .order('created_at', { ascending: false })
        if (error) throw error

        this.users = users || []
        return this.users
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch users'
        return []
      } finally {
        this.loading = false
      }
    },
    async getUser(id: number) {
      this.loading = true
      this.error = ''
      try {
        const { data, error } = await supabase.from('users').select(`*`).eq('id', id).single()

        if (error) throw error

        // Update the specific user in the store or add if not exists
        const existingIndex = this.users.findIndex((e) => e.id === id)
        if (existingIndex !== -1) {
          this.users[existingIndex] = data
        } else {
          this.users.push(data)
        }

        return data
      } catch (err: any) {
        this.error = err.message || 'Failed to fetch user'
        return null
      } finally {
        this.loading = false
      }
    },
    async addUser(userData: Omit<CreateUserDto, 'id' | 'created_at'>, imageFile?: File | null) {
      this.loading = true
      this.error = null
      let imageUrl: string | undefined | null

      try {
        // make sure username or email do not exists
        const { data: emailExists, error: emailError } = await supabase
          .from('users')
          .select('*')
          .eq('email', userData.email)
          .single()
        const { data: usernameExists, error: usernameError } = await supabase
          .from('users')
          .select('*')
          .eq('username', userData.username)
          .single()

        // Validate existence and throw errors if needed
        if (emailExists) {
          throw new Error('Email already in use')
        }

        if (usernameExists) {
          throw new Error('Username already taken')
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true,
        })
        if (authError) throw Error(authError.message)

        if (imageFile) {
          // Upload Image
          imageUrl = await uploadImage(imageFile, 'users')
          if (!imageUrl) {
            this.error = uploadError.value
          }
        }
        const { password, ...userDataWithoutPassword } = userData

        // Prepare data with image URL
        const finalData = {
          ...userDataWithoutPassword,
          profile_picture_url: imageUrl,
          uuid: authData.user.id,
        }
        // insert
        const { data, error } = await supabase.from('users').insert(finalData).select()

        if (error) throw error

        if (data) {
          this.users.push(data[0])
        }

        this.success = 'User Created'
      } catch (err: any) {
        // if image was uploaded but data insert failed, delete the image
        if (imageUrl) {
          await deleteImage(imageUrl, 'users')
        }
        this.error = err.message || 'Failed to add user'
      } finally {
        this.loading = false
      }
    },
    async updateUser(
      id: number,
      updateData: Partial<Omit<UpdateUserDto, 'id' | 'created_at'>>,
      newImageFile?: File | null,
    ) {
      this.loading = true
      this.error = ''

      try {
        // final the exisitng user to handle image replacement
        const existingUser = this.users.find((e) => e.id === id)

        // Upload new image if provided
        let newImageUrl
        if (newImageFile) {
          // Delete exisiting image if it exists
          if (existingUser?.profile_picture_url) {
            await deleteImage(existingUser.profile_picture_url, 'users')
          }

          // Upload image
          newImageUrl = await uploadImage(newImageFile, 'users')
          if (!newImageUrl) {
            this.error = uploadError.value
            return
          }
        }

        // Prepare update data with new image URL  if available
        const finalUpdateData = newImageUrl
          ? { ...updateData, profile_picture_url: newImageUrl }
          : { ...updateData }

        // Update resources
        const { data, error } = await supabase
          .from('users')
          .update(finalUpdateData)
          .eq('id', id)
          .select()

        if (error) throw error

        if (data) {
          // Update the resource in the local stroe
          const existingIndex = this.users.findIndex((e) => e.id === id)
          if (existingIndex !== -1) {
            this.users[existingIndex] = data[0]
          }
        }
        this.success = 'Users Updated'
        return data ? data[0] : null
      } catch (err: any) {
        this.error = err.message || 'Failed to update users'
        return null
      } finally {
        this.loading = false
      }
    },
    async deleteUser(id: number) {
      this.loading = true
      this.error = ''
      try {
        // First, find the vent to get it's image url
        const users = this.users.find((e) => e.id === id)

        console.log('Users', users)

        // Delete
        const { error } = await supabase.from('users').delete().eq('id', id)
        const { error: authError } = await supabase.auth.admin.deleteUser(users?.uuid!)
        if (error) throw error

        // if the had an image, delete it from storage
        if (users?.profile_picture_url) {
          await deleteImage(users.profile_picture_url, 'users')
        }

        // Remove the even from the local store
        this.users = this.users.filter((e) => e.id !== id)
        return true
      } catch (err: any) {
        this.error = err.message || 'Failed to delete user'
        return false
      } finally {
        this.loading = false
      }
    },
    // User profile-related actions
    async fetchCurrentUser() {
      this.loading = true
      this.error = null

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          // Fetch additional user details from custom users table
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('uuid', user.id)
            .single()
          if (error) throw error
          this.currentUser = {
            uuid: user.id,
            email: user.email || '',
            ...userProfile,
          }
        }
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch user profile'
        this.currentUser = null
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(updateData: UpdateUserDto) {
      if (!this.currentUser) {
        throw new Error('No user is currently logged in')
      }

      this.loading = true
      this.error = null

      try {
        const { error } = await supabase.from('users').update({}).eq('id', this.currentUser.id)

        if (error) throw error

        // Referesh current user data
        await this.fetchCurrentUser()

        return this.currentUser
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to update user profile'
        throw error
      } finally {
        this.loading = false
      }
    },

    // clear user data
    clearUserProfile() {
      this.currentUser = null
    },
  },
})
