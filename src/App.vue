<!-- layouts/DefaultLayout.vue -->
<script lang="ts" setup>
import { onMounted } from 'vue'
import SideBar from '@/components/SideBar.vue'
import NavBarSidebar from './components/NavBarSidebar.vue'
import Footer from './components/Footer.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { useRouteChecks } from '@/composables/useRouteChecks'
import { useAuthentication } from '@/composables/useAuthentication'

const { isHomePage, isLoginPage, checkIfHomePage, checkIfLoginPage } = useRouteChecks()
const { isAuthenticated, loading, checkAuthStatus } = useAuthentication()

onMounted(async () => {
  await checkAuthStatus()
  checkIfHomePage()
  checkIfLoginPage()
})
</script>

<template>
  <main>
    <template v-if="!loading">
      <template v-if="isAuthenticated && !isHomePage">
        <div>
          <NavBarSidebar />
          <SideBar />
        </div>

        <div class="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <div
            id="main-content"
            class="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900 min-h-screen"
          >
            <LoadingSpinner v-if="isLoginPage" />
            <div>
              <router-view></router-view>
              <Footer />
            </div>
          </div>
        </div>
      </template>

      <router-view v-else></router-view>
    </template>

    <LoadingSpinner v-else />
  </main>
</template>
