<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useEventStore } from '@/stores/modules/events'
import { useUserStore } from '@/stores/modules/user'
import EventsList from '@/components/EventsList.vue'

const eventStore = useEventStore()
const userStore = useUserStore()
const eventCount = ref<number>(0)
const userCount = ref<number>(0)
onMounted(async () => {
  await eventStore.fetchEvents()
  eventCount.value = eventStore.events.length
  await userStore.getUsers()
  userCount.value = userStore.users.length
})
</script>

<template>
  <div>
    <div class="px-4 pt-6">
      <div class="grid w-full grid-cols-1 gap-4 mt-4 xl:grid-cols-2 2xl:grid-cols-3">
        <div
          class="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
          <div class="w-full">
            <h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Events</h3>
            <span
              class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white"
              >{{ eventCount }}</span
            >
          </div>
          <div class="w-full" id="new-products-chart"></div>
        </div>
        <div
          class="items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm sm:flex dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
          <div class="w-full">
            <h3 class="text-base font-normal text-gray-500 dark:text-gray-400">Users</h3>
            <span
              class="text-2xl font-bold leading-none text-gray-900 sm:text-3xl dark:text-white"
              >{{ userCount }}</span
            >
          </div>
          <div class="w-full" id="week-signups-chart"></div>
        </div>
      </div>

      <!-- Table -->
      <div
        class="p-4 my-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800"
      >
        <!-- Card header -->
        <div class="items-center justify-between lg:flex">
          <div class="mb-4 lg:mb-0">
            <h3 class="mb-2 text-xl font-bold text-gray-900 dark:text-white">Events</h3>
          </div>
        </div>
        <!-- Table -->
        <EventsList />
      </div>
    </div>
  </div>
</template>
