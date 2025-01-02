// composables/useAuthentication.ts
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/modules/auth'

export function useAuthentication() {
  const authStore = useAuthStore()
  const isAuthenticated = ref(false)
  const loading = ref(false)

  const checkAuthStatus = async () => {
    loading.value = true
    isAuthenticated.value = await authStore.checkCurrentAuthStatus()
    loading.value = false
  }

  watch(
    () => authStore.isAuthenticated,
    (value) => {
      isAuthenticated.value = value
    },
  )

  return {
    isAuthenticated,
    loading,
    checkAuthStatus,
  }
}
