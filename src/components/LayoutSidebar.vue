<script lang="ts" setup>
import SideBar from './SideBar.vue'
import NavBarSidebar from './NavBarSidebar.vue'
</script>
<template>
  <div>
    <NavBarSidebar />

    <SideBar />

    <div class="flex pt-16 overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div
        id="main-content"
        class="relative w-full h-full overflow-y-auto bg-gray-50 lg:ml-64 dark:bg-gray-900 min-h-screen"
      >
        <slot />

        <FooterSidebar />
      </div>
    </div>
  </div>
</template>
