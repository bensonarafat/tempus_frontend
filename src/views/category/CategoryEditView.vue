<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/modules/category'
import { type CategoryDto } from '@/stores/interfaces/category.interface'
import SuccessAlert from '@/components/SuccessAlert.vue'
import ErrorAlert from '@/components/ErrorAlert.vue'

const categoryStore = useCategoryStore()
const route = useRoute()
const router = useRouter()

const loading = ref(false)
const imagePreview = ref<string | undefined>('')
const error = ref('')
const success = ref('')
const imageFile = ref<File | null>(null)
const imageUrl = ref<string | undefined>('')
const name = ref('')
const description = ref<string | undefined>('')

const removeImage = () => {
  imageFile.value = null
  imagePreview.value = ''
  imageUrl.value = ''
}

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files

  if (files && files.length > 0) {
    const file = files[0]

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'Please upload an image file'
      return false
    }

    // Validate file size (e.g. 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'Image must be less than 5MB'
      return
    }

    imageFile.value = file

    // Create preview URL
    imagePreview.value = URL.createObjectURL(file)
  }
}

const fetchCategory = async (id: number) => {
  loading.value = true
  try {
    await categoryStore.fetchCategory(id)
    const fetchedCategory = categoryStore.categories.find((e) => e.id == id)

    if (fetchedCategory) {
      name.value = fetchedCategory.name
      description.value = fetchedCategory.description
      imageUrl.value = fetchedCategory.image_url
      imagePreview.value = fetchedCategory.image_url
    } else {
      error.value = 'Category not found'
      router.push('/categories')
    }
  } catch (err) {
    error.value = 'Failed to fetch category'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  success.value = ''

  if (!name.value) {
    error.value = 'Name is required'
    loading.value = false
    return
  }

  // Prepare the category data object
  const categoryDto: CategoryDto = {
    name: name.value,
    description: description.value,
    // updated_at: Date.toString(),
  }

  try {
    const id = route.params.id as any
    await categoryStore.updateCategory(id, categoryDto, imageFile.value)

    error.value = categoryStore.error
    success.value = categoryStore.success

    if (!error.value) {
      // Redirect to category list or details page
      router.push('/category/manage')
    }
  } catch (err) {
    error.value = 'Failed to update category'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const id = route.params.id as any
  fetchCategory(id)
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
                  >Category</a
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
                  >Edit</span
                >
              </div>
            </li>
          </ol>
        </nav>
        <h1 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
          Edit Category
        </h1>
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
                  >Name</label
                >
                <input
                  v-model="name"
                  type="text"
                  name="first-name"
                  id="first-name"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Category Name"
                  required
                />
              </div>
              <div class="mb-3">
                <label
                  for="description"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >Description</label
                >
                <input
                  v-model="description"
                  type="text"
                  name="description"
                  id="description"
                  class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Description"
                />
              </div>

              <!-- Image Upload Section -->
              <div class="mb-5">
                <label class="block mb-2 text-sm font-medium dark:text-white text-gray-900"
                  >Image</label
                >
                <div class="flex items-center justify-center w-full">
                  <label
                    for="image-upload"
                    class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div
                      v-if="!imagePreview"
                      class="flex flex-col items-center justify-center pt-5 pb-6"
                    >
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p class="mb-2 text-sm text-gray-500">
                        <span class="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p class="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <div v-else class="relative w-full h-full">
                      <img :src="imagePreview" class="object-cover w-full h-full rounded-lg" />
                      <button
                        @click.prevent="removeImage"
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handleImageChange"
                      :disabled="loading"
                    />
                  </label>
                </div>
              </div>

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
                  <span v-if="!loading"> Update </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
