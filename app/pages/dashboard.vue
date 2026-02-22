<script setup lang="ts">
const { user, logout } = useAuth()

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Dashboard - OpenShift Partner Labs'
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-primary-500 mb-4">
      Dashboard
    </h1>
    <p class="text-muted-500 dark:text-muted-400">
      Welcome to your protected dashboard!
    </p>

    <ClientOnly>
      <div v-if="user" class="bg-muted-100 dark:bg-muted-800 p-6 rounded-lg mt-6">
        <h2 class="text-xl font-semibold text-muted-800 dark:text-white mb-4">
          User Information
        </h2>
        <div class="flex items-center gap-6 my-6">
          <img
            v-if="user.picture"
            :src="user.picture"
            alt="Profile picture"
            class="size-20 rounded-full object-cover"
          >
          <div class="space-y-2">
            <p class="text-muted-700 dark:text-muted-300">
              <span class="font-semibold">Name:</span> {{ user.name }}
            </p>
            <p class="text-muted-700 dark:text-muted-300">
              <span class="font-semibold">Email:</span> {{ user.email }}
            </p>
          </div>
        </div>
        <button
          class="bg-danger-500 hover:bg-danger-600 text-white px-6 py-3 rounded cursor-pointer transition-colors"
          @click="logout"
        >
          Logout
        </button>
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 p-6 rounded-lg mt-6">
          <p class="text-muted-500 dark:text-muted-400">Loading user information...</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
