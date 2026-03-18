<script setup lang="ts">
const { data, pending } = useDashboard()

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Docs - OpenShift Partner Labs',
})

// Companies with fallback icons for those without logo URLs
const companiesWithIcons = computed(() => {
  const defaultIcons = [
    'ph:building-duotone',
    'ph:cpu-duotone',
    'ph:cloud-duotone',
    'ph:chart-line-duotone',
    'ph:shield-check-duotone',
    'ph:lightbulb-duotone',
    'ph:rocket-duotone',
    'ph:gear-duotone',
    'ph:stack-duotone',
    'ph:network-duotone',
    'ph:code-duotone',
    'ph:desktop-tower-duotone',
  ]

  return (data.value?.companies ?? []).map((company, index) => ({
    name: company.name,
    logo: company.logoUrl,
    icon: defaultIcons[index % defaultIcons.length] ?? 'ph:building-duotone',
  }))
})
</script>

<template>
  <div class="space-y-6 p-6">
    <h1 class="text-2xl font-bold text-muted-800 dark:text-white mb-4">
      Docs
    </h1>
    <p class="text-muted-500 dark:text-muted-400">
      Documentation coming soon.
    </p>

    <!-- Partners Served Ticker -->
    <BaseCard
      rounded="lg"
      class="overflow-hidden p-4"
    >
      <p class="text-muted-500 dark:text-muted-400 mb-3 text-center text-sm font-medium">
        Partners Served
      </p>
      <template v-if="pending && !data">
        <div class="flex justify-center gap-12 overflow-hidden">
          <div
            v-for="i in 6"
            :key="i"
            class="flex shrink-0 items-center gap-3"
          >
            <div class="bg-muted-200 dark:bg-muted-700 size-10 animate-pulse rounded-lg" />
            <div class="bg-muted-200 dark:bg-muted-700 h-4 w-24 animate-pulse rounded" />
          </div>
        </div>
      </template>
      <template v-else-if="companiesWithIcons.length === 0">
        <p class="text-muted-400 text-center text-sm">
          No companies to display
        </p>
      </template>
      <div
        v-else
        class="ticker-container relative"
      >
        <div class="ticker-track flex gap-12">
          <!-- First set of companies -->
          <div
            v-for="company in companiesWithIcons"
            :key="company.name"
            class="ticker-item flex shrink-0 items-center gap-3"
          >
            <div class="bg-primary-500/10 flex size-10 items-center justify-center rounded-lg">
              <img
                v-if="company.logo"
                :src="company.logo"
                :alt="company.name"
                class="size-6 object-contain"
              >
              <Icon
                v-else
                :name="company.icon"
                class="text-primary-500 size-5"
              />
            </div>
            <span class="text-muted-700 dark:text-muted-300 whitespace-nowrap font-medium">
              {{ company.name }}
            </span>
          </div>
          <!-- Duplicate set for seamless loop -->
          <div
            v-for="company in companiesWithIcons"
            :key="`${company.name}-dup`"
            class="ticker-item flex shrink-0 items-center gap-3"
          >
            <div class="bg-primary-500/10 flex size-10 items-center justify-center rounded-lg">
              <img
                v-if="company.logo"
                :src="company.logo"
                :alt="company.name"
                class="size-6 object-contain"
              >
              <Icon
                v-else
                :name="company.icon"
                class="text-primary-500 size-5"
              />
            </div>
            <span class="text-muted-700 dark:text-muted-300 whitespace-nowrap font-medium">
              {{ company.name }}
            </span>
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.ticker-container {
  mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
}

.ticker-track {
  animation: ticker 30s linear infinite;
}

@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.ticker-container:hover .ticker-track {
  animation-play-state: paused;
}
</style>
