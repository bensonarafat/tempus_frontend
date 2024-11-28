<script setup lang="ts">
import { useAuthStore } from '@/stores/modules/auth'
const store = useAuthStore()

store.resetPassword('')
</script>

<template>
  <main>Forgot password</main>
</template>
