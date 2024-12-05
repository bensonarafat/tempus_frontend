import { useAuthStore } from "@/stores/modules/auth"
import { useUserStore } from "@/stores/modules/user"
import {supabase} from '@/services/supabase'

// Check if user is authenticated
export const authGuard = async (to : any, from : any, next :any) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  try {
    // Get current user from supabase
    const {data: {user}} = await supabase.auth.getUser()
    if(user) {
      // User is authenticated
      // fetch user profile if not already loaded


      if(!authStore.isAuthenticated) {
        authStore.session = await supabase.auth.getSession()
        authStore.isAuthenticated = true
        await userStore.fetchCurrentUser()
      }
      next() // Allow navigation
    }else{
      next('/login')
    }
  } catch (error) {
    next('/login')
  }
}


// Admin only route guard
export const adminGuard = async (to : any, from : any, next: any) => {
  const userStore = useUserStore();

  try {
    const {data: {user}} = await supabase.auth.getUser()

    if(user) {
      await userStore.fetchCurrentUser()

      // Check if user is an admin
      if(userStore.isAdmin) {
        next(); // Allow navigation
      }else{
        next('/unauthorized')
      }
    }else{
      next('/login')
    }
  } catch (error) {
    next('/login')
  }
}


// Guest-only routes (for login/signup)
export const guestGuard = async (to : any, from : any , next : any) => {
  const authStore = useAuthStore();

  try {
    if(await authStore.checkCurrentAuthStatus()) {
      next("/dashboard")
    }else{
      next()
    }
  } catch (error) {
    next()
  }
}
