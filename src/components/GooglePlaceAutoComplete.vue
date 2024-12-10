<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { type AddressSelectedPayload, type Address } from '@/stores/interfaces/address.interface'

// Declare global Google Maps types to avoid TS errors
declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete
        }
      }
    }
  }
}

interface AddressComponent {
  long_name: string
  short_name: string
  types: string[]
}

// Define emits
const emit = defineEmits<{ (e: 'address-selected', payload: AddressSelectedPayload): void }>()

// Refs
const addressField = ref<string | null>(null)
const addressInput = ref<HTMLInputElement | null>(null)
const parsedAddress = ref<Address | null>(null)
const autocomplete = ref<google.maps.places.Autocomplete | null>(null)

// Method to parse address components
const parsedAddressComponents = (addressComponents?: AddressComponent[]): Address | null => {
  if (!addressComponents) return null

  const parsedAddress: Address = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  }

  addressComponents.forEach((component) => {
    const type = component.types[0]

    switch (type) {
      case 'street_number':
        parsedAddress.street += component.long_name
        break
      case 'route':
        parsedAddress.street += ' ' + component.long_name
        break
      case 'locality':
        parsedAddress.city += component.long_name
        break
      case 'administrative_area_level_1':
        parsedAddress.state += component.short_name
        break
      case 'postal_code':
        parsedAddress.postalCode += component.long_name
        break
      case 'country':
        parsedAddress.country += component.long_name
        break
    }
  })

  return parsedAddress
}

// Method to handle place change event
function onPlaceChanged() {
  // Ensure autocomplete is not null
  if (!autocomplete.value) return

  // Retrive the select place
  const place = autocomplete.value.getPlace()

  if (!place.geometry) {
    // User enter the name of a Place that was not suggested
    console.error('No details available for input: ' + place.name)
    return
  }

  // Parse address components
  const parsedAddressValue = parsedAddressComponents(place.address_components)
  if (parsedAddressValue) {
    parsedAddress.value = parsedAddressValue
  }

  // Ensure place.geometry.location is not null
  if (!place.geometry.location) return

  // Emit the selected place details to parent component
  emit('address-selected', {
    formattedAddress: place.formatted_address || '',
    coordinates: {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    },
    parsedAddress: parsedAddressValue || ({} as Address),
  })
}

// Method to initialize autocomplete
const initAutocomplete = () => {
  // Ensure Google Maps Places API is available
  if (window.google?.maps?.places && addressInput.value) {
    // Initialize autocomplete on the input field
    autocomplete.value = new window.google.maps.places.Autocomplete(addressInput.value, {
      types: ['address'],
    })

    // Add Listener for place changed event
    autocomplete.value.addListener('place_changed', onPlaceChanged)
  } else {
    console.error(
      'Google Maps Places API not loaded or input ref is null. Make sure to include the script.'
    )
  }
}

// Method to handle input changes
const onInputChange = () => {
  // Optional: Additional input handling if needed
  parsedAddress.value = null
}

const clearInput = () => {
  addressInput.value = null
  parsedAddress.value = null
  addressField.value = null
}

const setAddress = (data: AddressSelectedPayload) => {
  addressField.value = data.formattedAddress
  parsedAddress.value = data.parsedAddress
}

defineExpose({
  clearInput,
  setAddress,
})
// Initialize autocomplete when component is mounted
onMounted(() => {
  initAutocomplete()
})
</script>
<template>
  <div>
    <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >Address</label
    >
    <input
      v-model="addressField"
      ref="addressInput"
      @input="onInputChange"
      type="text"
      name="addressInput"
      id="addressInput"
      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
      placeholder="Search Event Address (Optional)"
    />
  </div>
</template>
