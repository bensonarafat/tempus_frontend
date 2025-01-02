import { supabase } from '@/services/supabase'
import type { Provider, Session, User } from '@supabase/supabase-js'
import { defineStore } from 'pinia'
const base_url = import.meta.env.VITE_BASE_URL

interface LoginResult {
  success: boolean
  message?: string
  session?: Session | null
}

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    // Authentication status checks
    isLoggedIn(): boolean {
      return this.isAuthenticated
    },
  },

  actions: {
    // Authentication-specific actions
    async login(
      email: string,
      password: string,
      rememberMe: boolean = false,
    ): Promise<LoginResult> {
      this.loading = true
      this.error = null

      try {
        // Set persistent session based on remember me
        const { persistSession } = rememberMe ? { persistSession: true } : { persistSession: false }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          throw error
        }
        // Update store state
        this.session = data.session
        this.user = data.user
        this.isAuthenticated = true
        return {
          success: true,
          session: data.session,
          message: 'Login successful',
        }
      } catch (error: any) {
        // Handle different error scenarios
        let errorMessage = 'Login failed'
        if (error.message) {
          switch (error.message) {
            case 'Invalid login credentials':
              errorMessage = 'Incorrect email or password'
              break
            case 'Email is confirmed':
              errorMessage = 'Please confirm your email before logging in'
              break
            default:
              errorMessage = error.message
          }
        }
        this.error = errorMessage
        this.isAuthenticated = false
        return {
          success: false,
          message: errorMessage,
        }
      } finally {
        this.loading = false
      }
    },

    async logout() {
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
        if (error) throw error
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Password reset failed'
        throw error
      }
    },

    async oauthLogin(provider: Provider): Promise<LoginResult> {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider,
          options: {
            redirectTo: base_url + 'oauth-callback',
          },
        })

        if (error) {
          throw error
        }

        return {
          success: true,
          session: null,
          message: `${provider} login successful`,
        }
      } catch (error: any) {
        this.error = error.message || `${provider} login failed`
        return {
          success: false,
          message: 'error',
        }
      } finally {
        this.loading = false
      }
    },

    async checkCurrentAuthStatus() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          return false
        }
        if (session) {
          const check = await this.checkIfUserAlreadySignUp(session.user.id)
          if (!check) {
            this.session = null
            this.user = null
            this.error = 'Email adress not found, try using another or contact support'
            return false
          }
        }
        this.session = session
        this.user = session?.user ?? null
        this.isAuthenticated = !!session
        return this.isAuthenticated
      } catch (error) {
        return false
      }
    },
    async checkIfUserAlreadySignUp(id?: string | null) {
      if (!id) {
        await this.logout()
        return false
      }
      const { error } = await supabase.from('users').select('*').eq('uuid', id).single()
      if (error) {
        await this.logout()
        await this.deleteAuth(id)
        return false
      }
      return true
    },

    async deleteAuth(id?: string | null) {
      await supabase.auth.admin.deleteUser(id!)
    },
    // async initAuthListener() {
    //   supabase.auth.onAuthStateChange(async (event, currentSession) => {
    //     // Update local state
    //     this.session = currentSession
    //     this.user = currentSession?.user || null
    //     this.isAuthenticated = !!currentSession

    //     if (event == 'INITIAL_SESSION') {
    //     } else if (event === 'SIGNED_IN') {
    //       // handle sign in event
    //       this.isAuthenticated = true
    //     } else if (event === 'SIGNED_OUT') {
    //       window.localStorage.removeItem('oauth_provider_token')
    //       window.localStorage.removeItem('oauth_provider_refresh_token')
    //       // Reset local state
    //       this.user = null
    //       this.session = null
    //       this.isAuthenticated = false
    //     } else if (event === 'PASSWORD_RECOVERY') {
    //       // handle password recovery event
    //       console.log('Event Passsword')
    //     } else if (event === 'TOKEN_REFRESHED') {
    //       // handle token refreshed event
    //       console.log('Event Token referesh')
    //     } else if (event === 'USER_UPDATED') {
    //       // handle user updated event
    //       console.log('Event User updated')
    //     }

    //     // Handle OAuth tokens
    //     if (currentSession && currentSession.provider_token) {
    //       await this.checkIfUserAlreadySignUp(currentSession.user.id)
    //       window.localStorage.setItem('oauth_provider_token', currentSession.provider_token)
    //       console.log('OAuth Provider token', currentSession.provider_token)
    //     }

    //     if (currentSession && currentSession.provider_refresh_token) {
    //       window.localStorage.setItem(
    //         'oauth_provider_refresh_token',
    //         currentSession.provider_refresh_token,
    //       )
    //       console.log('OAuth Provider refresh token', currentSession.provider_refresh_token)
    //     }
    //   })
    // },
  },
})

//Plugin to initialize auth listener
export function setupAuthPlugin(app: any) {
  const authStore = useAuthStore()
  // authStore.initAuthListener()
}
