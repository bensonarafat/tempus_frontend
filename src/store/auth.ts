import { defineStore } from "pinia";
import { supabase } from '@/lib/superbase_service'
import type { User } from "@supabase/supabase-js";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user:null as null | User,
    token: null as null | string,
    isAuthenticated: false,

  }),

  actions: {
    async login(email: string, password: string) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })
        if (!error) {
          this.token = data.session.access_token
          this.user = data.user
          this.isAuthenticated = true
          localStorage.setItem('token', data.session.access_token)
          return { success: true }
        }
        return { success: false, error: error.message }
      } catch (error) {
        return { success: false, error: 'Login failed' }
      }
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('token');
    }
  }
})
