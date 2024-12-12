<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import default_avatar from '@/assets/images/avatar.png'
import { useAuthStore } from '@/stores/modules/auth'
import type { User } from '@/stores/interfaces/users.interface'
import ColorModeSwitcher from '@/components/ColorModeSwitcher.vue'
import SearchInput from '@/components/SearchInput.vue'
import logo from '@/assets/images/logo-background.png'
import router from '@/router'

const authStore = useAuthStore()
const isDropdownOpen = ref(false)
const currentUser = ref<User | null>(null)
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}
const signOut = () => {
  authStore.logout()
  router.push('/login')
}
const menuItems = [
  {
    label: 'Dashboard',
    action: () => {
      // Navigate to dashboard
      // this.$router.push('/dashboard')
    },
  },
  {
    label: 'Profile',
    action: () => {
      // Navigate to profile page
      // this.$router.push('/profile')
    },
  },
  {
    label: 'Settings',
    action: () => {
      // Navigate to settings page
      // this.$router.push('/settings')
    },
  },
]

onMounted(() => {
  currentUser.value = authStore.user
  currentUser.value
  console.log('Current user', currentUser.value.email)
})
</script>
<template>
  <div>
    <nav
      class="fixed z-30 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="px-3 py-3 lg:px-5 lg:pl-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center justify-start">
            <button
              id="toggleSidebarMobile"
              aria-expanded="true"
              aria-controls="sidebar"
              class="p-2 text-gray-600 rounded cursor-pointer lg:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <svg
                id="toggleSidebarMobileHamburger"
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              <svg
                id="toggleSidebarMobileClose"
                class="hidden w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <a href="/" class="flex ml-2 md:mr-24">
              <img :src="logo" class="rounded-full w-8 mr-3" alt="Tempus Logo" />
              <span
                class="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white"
                >Tempus</span
              >
            </a>

            <SearchInput />
          </div>

          <div class="flex items-center">
            <!-- Search mobile -->
            <button
              id="toggleSidebarMobileSearch"
              type="button"
              class="p-2 text-gray-500 rounded-lg lg:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              <span class="sr-only">Search</span>
              <!-- Search icon -->
              <svg
                class="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>

            <!-- Dropdown menu -->
            <div
              id="dropdownNavbar"
              class="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
            >
              <ul
                class="py-2 text-sm text-gray-700 dark:text-gray-400"
                aria-labelledby="dropdownNavbarButton"
              >
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Dashboard</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Settings</a
                  >
                </li>
                <li>
                  <a
                    href="#"
                    class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    >Earnings</a
                  >
                </li>
              </ul>
              <div class="py-2">
                <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white"
                  >Sign out</a
                >
              </div>
            </div>

            <ColorModeSwitcher />

            <!-- Profile -->
            <div class="flex items-center ml-3">
              <div>
                <button
                  @click="toggleDropdown"
                  class="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  id="user-menu-button-2"
                  aria-expanded="false"
                >
                  <span class="sr-only">Open user menu</span>
                  <div>
                    <!-- <span v-if="currentUser.profile_picture_url">
                      <img
                        :src="currentUser.profile_picture_url"
                        :alt="currentUser.fullname"
                        class="h-10 w-10 rounded-full object-cover"
                      />
                    </span> -->
                    <span>
                      <img :src="default_avatar" class="h-10 w-10 rounded-full object-cover" />
                    </span>
                  </div>
                </button>
              </div>
              <!-- Dropdown Menu -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isDropdownOpen"
                  class="absolute top-12 right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div class="px-4 py-3" role="none">
                    <p class="text-sm text-gray-900 dark:text-white" role="none">User</p>
                    <p
                      class="text-sm font-medium text-gray-900 truncate dark:text-gray-300"
                      role="none"
                    >
                      {{ currentUser.email }}
                    </p>
                  </div>

                  <div class="py-1" role="none">
                    <a
                      href="javascript:void(0)"
                      @click.prevent="signOut"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                      role="menuitem"
                    >
                      Sign out
                    </a>
                  </div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>
