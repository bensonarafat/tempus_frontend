
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import type { User } from '@/stores/interfaces/user.interface'
import SuccessAlert from '@/components/SuccessAlert.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'
import ImageUploader from '@/components/ImageUploader.vue'

const userStore = useUserStore()

const route = useRoute()
const router = useRouter()

const imageUploaderRef = ref<InstanceType<typeof ImageUploader> | null>(null)

const loading = ref(false)
const imageFile = ref(null as File | null)
const error = ref<null | string>('')
const success = ref('')
const fullname = ref<string | null>(null)
const phone_number = ref<string | null>(null)

const handleImagePicker = (data: File) => {
  imageFile.value = data
}

const handleSubmit = async () => {
  loading.value = true
  error.value = userStore.error
  success.value = userStore.success
  if (!fullname.value) {
    error.value = 'Full name field is required'
    return
  }

  // Prepare the user data object
  const userDto = {
    fullname: fullname.value,
    phone_number: phone_number.value,
  }
  const id = route.params.id as any
  await userStore.updateUser(id, userDto, imageFile.value)

  loading.value = false
  error.value = userStore.error
  success.value = userStore.success
}
const fetchUser = async (id: number) => {
  loading.value = true
  try {
    await userStore.getUser(id)
    const fetchedUser = userStore.users.find((e) => e.id == id)

    if (fetchedUser) {
      fullname.value = fetchedUser.fullname
      phone_number.value = fetchedUser.phone_number ?? ''
      if (fetchedUser.profile_picture_url != '' || fetchedUser.profile_picture_url != null) {
        imageUploaderRef.value?.setImagePreview(fetchedUser.profile_picture_url!)
      }
    } else {
      error.value = 'User not found'
      router.push('/users/manage')
    }
  } catch (err) {
    error.value = 'Failed to fetch user'
  } finally {
    loading.value = false
  }
}
onMounted(() => {
  const id = route.params.id as any
  fetchUser(id)
})
</script>
<template>
  <div>
    <div class="grid grid-cols-1 px-4 pt-6 dark:bg-gray-900">
      <div class="mb-4 col-span-full xl:mb-2">
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
                  >User</a
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
                  >Add</span
                >
              </div>
            </li>
          </ol>
        </nav>
        <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Add User</h1>
      </div>

      <div class="">
        <div
          class="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800"
        >
          <form @submit.prevent="handleSubmit">
            <!-- Error Alert -->
            <ErrorAlert :error="error" />
            <!-- Success Alert -->
            <SuccessAlert :success="success" />

            <div class="flex flex-col">
              <div class="mb-3">
                <label
                  for="name"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >Full name</label
                >
                <input
                  v-model="fullname"
                  type="text"
                  name="fullname"
                  id="fullname"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div class="mb-3">
                <label
                  for="phone_number"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >Phone number</label
                >
                <input
                  type="text"
                  name="phone_number"
                  id="phone_number"
                  v-model="phone_number"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Phone Number"
                />
              </div>
              <!-- Image Upload Section -->
              <ImageUploader
                ref="imageUploaderRef"
                label="Avatar"
                @image-picked="handleImagePicker"
              />

              <div class="col-span-6 sm:col-full">
                <button
                  class="text-white bg-teal-600 focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-teal-600 dark:hover:bg-teal-600 dark:focus:ring-teal-600"
                  type="submit"
                >
                  <span v-if="loading">
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
                  </span>
                  <span v-if="!loading"> Submit </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
