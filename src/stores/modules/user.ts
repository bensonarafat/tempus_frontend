import { defineStore } from 'pinia'
import {
  type User,
  type CreateUserDto,
  type UpdateUserDto,
} from '@/stores/interfaces/user.interface'
import { supabase } from '@/services/supabase'

interface UserState {
  currentUser: User | null
  loading: boolean
  error: string | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    loading: false,
    error: null,
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
