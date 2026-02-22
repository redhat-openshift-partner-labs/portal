<script setup lang="ts">

definePageMeta({
  layout: 'empty'
})

useHead({
  title: 'Home - OpenShift Partner Labs'
})
</script>

<template>
  <div class="container">
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
}

.counter {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

button {
  background: #00DC82;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #00b86d;
}

.info {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 2rem;
}

ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

li {
  margin: 0.5rem 0;
}

code {
  background: #e9ecef;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
}
</style>