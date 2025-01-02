import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRouteChecks() {
  const route = useRoute()
  const isHomePage = ref(true)
  const isLoginPage = ref(false)

  const checkIfHomePage = () => {
    isHomePage.value = route.path === '/'
  }

  const checkIfLoginPage = () => {
    isLoginPage.value = route.path === '/login'
  }

  watch(
    () => route.path,
    () => {
      checkIfHomePage()
      checkIfLoginPage()
    },
  )

  return {
    isHomePage,
    isLoginPage,
    checkIfHomePage,
    checkIfLoginPage,
  }
}
