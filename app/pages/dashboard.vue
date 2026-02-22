<script setup lang="ts">
const { user, logout } = useAuth()

definePageMeta({
  layout: 'empty'
})

useHead({
  title: 'Dashboard - OpenShift Partner Labs'
})
</script>

<template>
  <div class="container">
    <h1>Dashboard</h1>
    <p>Welcome to your protected dashboard!</p>

    <ClientOnly>
      <div v-if="user" class="user-info">
        <h2>User Information</h2>
        <div class="user-card">
          <img v-if="user.picture" :src="user.picture" alt="Profile picture" class="avatar">
          <div class="user-details">
            <p><strong>Name:</strong> {{ user.name }}</p>
            <p><strong>Email:</strong> {{ user.email }}</p>
          </div>
        </div>
        <button @click="logout" class="logout-btn">Logout</button>
      </div>
      <template #fallback>
        <div class="user-info">
          <p>Loading user information...</p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #00DC82;
  margin-bottom: 1rem;
}

h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.user-info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.logout-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 1rem;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
