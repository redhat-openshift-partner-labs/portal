<script setup lang="ts">
const { user } = useAuth()

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Dashboard - OpenShift Partner Labs'
})

// Stat cards data
const stats = ref([
  { label: 'Total Labs', value: 142, icon: 'ph:flask-duotone' },
  { label: 'Active Labs', value: 23, icon: 'ph:play-circle-duotone' },
  { label: 'Total Users', value: 1847, icon: 'ph:users-duotone' },
  { label: 'Completed Sessions', value: 3291, icon: 'ph:check-circle-duotone' }
])

// Cost Overview Chart Options
const costChartOptions = computed(() => ({
  chart: {
    id: 'cost-overview',
    type: 'area' as const,
    height: 280,
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#0ea5e9', '#a855f7', '#22c55e'],
  stroke: {
    width: 2,
    curve: 'smooth' as const
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' }
    }
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `$${val}k`,
      style: { cssClass: 'text-muted-500 dark:text-muted-400' }
    }
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { useSeriesColors: true }
  },
  tooltip: { theme: 'dark' },
  grid: {
    borderColor: 'rgba(0,0,0,0.05)'
  }
}))

const costChartSeries = ref([
  { name: 'This Year', data: [28, 42, 35, 48, 38, 52] },
  { name: 'Last Year', data: [22, 35, 30, 40, 32, 45] }
])

// Cost Summary Stats
const costSummary = ref([
  { label: 'This Year', value: '$243.8k', color: 'text-sky-500' },
  { label: 'Last Year', value: '$204.5k', color: 'text-purple-500' },
  { label: 'Growth', value: '+19.2%', color: 'text-green-500' }
])

// Labs Summary Chart Options
const labsChartOptions = computed(() => ({
  chart: {
    id: 'labs-summary',
    type: 'bar' as const,
    height: 280,
    toolbar: { show: false }
  },
  colors: ['#0ea5e9', '#22c55e'],
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '55%',
      dataLabels: { position: 'top' }
    }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' }
    }
  },
  yaxis: {
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' }
    }
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { useSeriesColors: true }
  },
  tooltip: { theme: 'dark' },
  grid: {
    borderColor: 'rgba(0,0,0,0.05)'
  }
}))

const labsChartSeries = ref([
  { name: 'Created', data: [28, 35, 42, 38, 45, 52] },
  { name: 'Completed', data: [22, 30, 38, 35, 40, 48] }
])
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Welcome Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <ClientOnly>
          <img
            v-if="user?.picture"
            :src="user.picture"
            :alt="user.name || 'User'"
            class="size-16 rounded-full object-cover ring-2 ring-primary-500/20"
          >
          <div
            v-else
            class="bg-primary-500/10 text-primary-500 flex size-16 items-center justify-center rounded-full text-2xl font-semibold"
          >
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <template #fallback>
            <div class="bg-muted-200 dark:bg-muted-700 size-16 animate-pulse rounded-full" />
          </template>
        </ClientOnly>
        <div>
          <ClientOnly>
            <h1 class="text-muted-800 dark:text-white text-2xl font-semibold">
              Welcome back, {{ user?.name?.split(' ')[0] || 'User' }}
            </h1>
            <template #fallback>
              <div class="bg-muted-200 dark:bg-muted-700 h-8 w-48 animate-pulse rounded" />
            </template>
          </ClientOnly>
          <p class="text-muted-500 dark:text-muted-400 mt-1">
            Happy to see you again on your dashboard.
          </p>
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <BaseCard
        v-for="stat in stats"
        :key="stat.label"
        rounded="lg"
        class="p-5"
      >
        <div class="flex items-center gap-4">
          <div class="bg-primary-500/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
            <Icon :name="stat.icon" class="text-primary-500 size-6" />
          </div>
          <div>
            <p class="text-muted-500 dark:text-muted-400 text-sm">
              {{ stat.label }}
            </p>
            <p class="text-muted-800 dark:text-white text-2xl font-semibold">
              {{ stat.value.toLocaleString() }}
            </p>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Cost Overview Chart -->
      <BaseCard rounded="lg" class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-muted-800 dark:text-white text-lg font-semibold">
            Cost Overview
          </h3>
          <div class="flex gap-4">
            <div v-for="item in costSummary" :key="item.label" class="text-end">
              <p class="text-muted-400 text-xs">{{ item.label }}</p>
              <p :class="[item.color, 'font-semibold']">{{ item.value }}</p>
            </div>
          </div>
        </div>
        <ClientOnly>
          <apexchart
            type="area"
            height="280"
            :options="costChartOptions"
            :series="costChartSeries"
          />
          <template #fallback>
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <p class="text-muted-400">Loading chart...</p>
            </div>
          </template>
        </ClientOnly>
      </BaseCard>

      <!-- Labs Summary Chart -->
      <BaseCard rounded="lg" class="p-5">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-muted-800 dark:text-white text-lg font-semibold">
            Labs Summary
          </h3>
          <div class="flex gap-4">
            <div class="text-end">
              <p class="text-muted-400 text-xs">Total Created</p>
              <p class="font-semibold text-sky-500">240</p>
            </div>
            <div class="text-end">
              <p class="text-muted-400 text-xs">Total Completed</p>
              <p class="font-semibold text-green-500">213</p>
            </div>
          </div>
        </div>
        <ClientOnly>
          <apexchart
            type="bar"
            height="280"
            :options="labsChartOptions"
            :series="labsChartSeries"
          />
          <template #fallback>
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <p class="text-muted-400">Loading chart...</p>
            </div>
          </template>
        </ClientOnly>
      </BaseCard>
    </div>
  </div>
</template>
