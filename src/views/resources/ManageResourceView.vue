<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import NavPagination from '@/components/NavPagination.vue'
import { useRouter } from 'vue-router'
import { useResourceStore } from '@/stores/modules/resource'
import type { Resource } from '@/stores/interfaces/resource.interface'
import { getFormatedDate } from '@/stores/helpers/date-utils'
const router = useRouter()
const resourceStore = useResourceStore()

const resources = ref<Resource[]>([])
const loading = ref(false)
const isDeleteModalOpen = ref(false)
const resourceToDelete = ref<number | null>(null)

const openDeleteModal = (eventId: number) => {
  resourceToDelete.value = eventId
  isDeleteModalOpen.value = true
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false
  resourceToDelete.value = null
}

const fetchResources = async () => {
  await resourceStore.fetchResouces()
  loading.value = resourceStore.loading
  resources.value = resourceStore.resources
}

const confirmDeleteEvent = async () => {
  loading.value = true
  if (resourceToDelete.value) {
    isDeleteModalOpen.value = false

    try {
      await resourceStore.deleteResource(resourceToDelete.value)
      resources.value = resourceStore.resources
      resourceToDelete.value = null
      loading.value = false
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }
}
onMounted(() => {
  fetchResources()
})
</script>

<template>
  <div>
    <div
      class="p-4 bg-white block sm:flex items-center justify-between border-b border-gray-200 lg:mt-1.5 dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="w-full mb-1">
        <div class="mb-4">
          <nav class="flex mb-5" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 text-sm font-medium md:space-x-2">
              <li class="inline-flex items-center">
                <a
                  href="#"
                  class="inline-flex items-center text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-white"
                >
                  <svg
                    class="w-5 h-5 mr-2.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
                    ></path>
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div class="flex items-center">
                  <svg
                    class="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <a
                    href="#"
                    class="ml-1 text-gray-700 hover:text-primary-600 md:ml-2 dark:text-gray-300 dark:hover:text-white"
                    >Resources</a
                  >
                </div>
              </li>
              <li>
                <div class="flex items-center">
                  <svg
                    class="w-6 h-6 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <span class="ml-1 text-gray-400 md:ml-2 dark:text-gray-500" aria-current="page"
                    >Manage</span
                  >
                </div>
              </li>
            </ol>
          </nav>
          <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
            All Resources
          </h1>
        </div>
        <div class="items-center justify-between block sm:flex">
          <div class="flex items-center mb-4 sm:mb-0">
            <form class="sm:pr-3" action="#" method="GET">
              <label for="products-search" class="sr-only">Search</label>
              <div class="relative w-48 mt-1 sm:w-64 xl:w-96">
                <input
                  type="text"
                  name="email"
                  id="products-search"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Search for resource"
                />
              </div>
            </form>
          </div>

          <div class="flex items-center ml-auto space-x-2 sm:space-x-3">
            <button
              v-on:click="router.push('/resources/add')"
              id="createProductButton"
              class="inline-flex items-center justify-center w-1/2 px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-teal-600 focus:ring-4 focus:ring-teal-6000 sm:w-auto dark:bg-teal-600 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
              type="button"
              data-drawer-target="drawer-create-product-default"
              data-drawer-show="drawer-create-product-default"
              aria-controls="drawer-create-product-default"
              data-drawer-placement="right"
            >
              <svg
                class="w-5 h-5 mr-2 -ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clip-rule="evenodd"
                ></path>
              </svg>
              Add Resource
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="overflow-x-auto">
        <div class="inline-block min-w-full align-middle">
          <div class="overflow-hidden shadow">
            <table
              v-if="!loading"
              class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600"
            >
              <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" class="p-4">
                    <div class="flex items-center">
                      <input
                        id="checkbox-all"
                        aria-describedby="checkbox-1"
                        type="checkbox"
                        class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label for="checkbox-all" class="sr-only">checkbox</label>
                    </div>
                  </th>

                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Event
                  </th>
                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Media Type
                  </th>
                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    class="p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400"
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody
                class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700"
              >
                <tr
                  v-for="(resource, index) in resources"
                  :key="resource.id"
                  class="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td class="w-4 p-4">
                    <div class="flex items-center">
                      <input
                        :id="'index-' + resource.id"
                        aria-describedby="checkbox-1"
                        type="checkbox"
                        class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label :for="'index-' + resource.id" class="sr-only"> checkbox </label>
                    </div>
                  </td>
                  <td
                    class="p-4 text-sm font-normal text-gray-500 whitespace-nowrap dark:text-gray-400"
                  >
                    <div class="text-base font-semibold text-gray-900 dark:text-white">
                      <data value="name">{{ index + 1 }}</data>
                    </div>
                  </td>
                  <td
                    class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <data value="technology">
                      <span v-if="resource.users">
                        {{ resource.users.fullname }}
                      </span>
                      <span v-else> None </span>
                    </data>
                  </td>
                  <td
                    class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <data value="technology">
                      <span v-if="resource.events">
                        {{ resource.events.title }}
                      </span>
                      <span v-else> None </span>
                    </data>
                  </td>
                  <td
                    class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <data value="technology">{{ resource.media_type }} </data>
                  </td>
                  <td
                    class="p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <data value="technology">{{ getFormatedDate(resource.created_at) }}</data>
                  </td>
                  <td class="p-4 space-x-2 whitespace-nowrap">
                    <button
                      v-on:click="router.push(`/resources/edit/${resource.id}`)"
                      type="button"
                      id="updateProductButton"
                      data-drawer-target="drawer-update-product-default"
                      data-drawer-show="drawer-update-product-default"
                      aria-controls="drawer-update-product-default"
                      data-drawer-placement="right"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-red-700 dark:text-white rounded-lg focus:ring-4"
                    >
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <svg>
                          <path
                            d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"
                          />
                          <path
                            fill-rule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </svg>
                      Update
                    </button>
                    <button
                      type="button"
                      id="deleteProductButton"
                      @click="openDeleteModal(resource.id)"
                      data-drawer-target="drawer-delete-product-default"
                      data-drawer-show="drawer-delete-product-default"
                      aria-controls="drawer-delete-product-default"
                      data-drawer-placement="right"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
                    >
                      <svg
                        class="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                      Delete item
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>

            <div v-else class="justify-items-center">
              <svg
                aria-hidden="true"
                class="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none"
    >
      <div class="relative w-auto max-w-sm mx-auto my-6">
        <div
          class="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none dark:bg-gray-800"
        >
          <div
            class="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200 dark:border-gray-700"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
            <button
              @click="cancelDelete"
              class="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
            >
              <span
                class="block w-6 h-6 text-2xl text-black bg-transparent opacity-5 focus:outline-none"
              >
                ×
              </span>
            </button>
          </div>
          <div class="relative flex-auto p-6">
            <p class="my-4 text-blueGray-500 dark:text-gray-400">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
          </div>
          <div
            class="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200 dark:border-gray-700"
          >
            <button
              @click="cancelDelete"
              class="px-6 py-2 mb-1 mr-1 text-sm font-bold text-gray-600 uppercase transition-all duration-150 ease-linear outline-none background-transparent focus:outline-none dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              @click="confirmDeleteEvent"
              class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300 dark:focus:ring-red-900"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <NavPagination />
  </div>
</template>
