import {supabase} from '@/services/supabase'
import type { Provider } from '@supabase/supabase-js'
import { defineStore } from 'pinia'


interface LoginResult {
  success: boolean
  message?: string,
  session?: any
}


interface AuthState {
  user: any | null
  session: any | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () : AuthState => ({
    user: null,
    session: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    // Authentication status checks
    isLoggedIn(): boolean{
      return this.isAuthenticated
    }
  },

  actions: {
    // Authentication-specific actions
    async login(email: string, password: string, rememberMe: boolean = false) : Promise<LoginResult> {
      this.loading = true
      this.error = null

      try {

         // Set persistent session based on remember me
         const { persistSession } = rememberMe
         ? { persistSession: true }
         : { persistSession: false }

        const {data, error} = await supabase.auth.signInWithPassword({
          email, password,
        });
        if(error) {
          throw error
        }
        // Update store state
        this.session = data.session
        this.user = data.user
        this.isAuthenticated = true
        return {
          success: true,
          session: data.session,
          message: 'Login successful'
        }
      } catch (error: any ) {
        // Handle different error scenarios
        let errorMessage = 'Login failed'
        if(error.message) {
          switch (error.message) {
            case 'Invalid login credentials':
              errorMessage = "Incorrect email or password"
              break;
            case 'Email is confirmed':
              errorMessage = "Please confirm your email before logging in"
              break;
            default:
              errorMessage = error.message
          }
        }
        this.error = errorMessage
        this.isAuthenticated = false
        return {
          success: false,
          message: errorMessage
        }
      }finally {
        this.loading = false
      }
    },

    async logout () {
      try {
        await supabase.auth.signOut()
        this.session = null
        this.isAuthenticated = false
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Logout failed'
        throw error
      }
    },

    async resetPassword(email: string) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if(error) throw error
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Password reset failed'
        throw error
      }
    },

    async oauthLogin(provider: Provider) : Promise<LoginResult>  {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: import.meta.env.VITE_BASE_URL
          }
        })

        if (error) {
          throw error
        }

        return {
          success: true,
          session: null,
          message: `${provider} login successful`
        }
      } catch (error: any) {
        this.error = error.message || `${provider} login failed`
        return {
          success: false,
          message: "error"
        }
      } finally {
        this.loading = false
      }
    },

    async checkCurrentAuthStatus() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user ?? null
      this.isAuthenticated = !!session
      return this.isAuthenticated
    },
  }
})
