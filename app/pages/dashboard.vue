<script setup lang="ts">
const { user } = useAuth()
const { data, pending, error, refresh } = useDashboard()

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Dashboard - OpenShift Partner Labs',
})

// Refresh dashboard data on mount
onMounted(() => {
  refresh()
})

// Stat cards configuration with icons and links
const statCards = computed(() => {
  const stats = data.value?.stats
  return [
    { label: 'Total Labs', value: stats?.totalLabs ?? 0, icon: 'ph:flask-duotone', link: '/requests' },
    { label: 'Active Labs', value: stats?.activeLabs ?? 0, icon: 'ph:play-circle-duotone', link: '/requests?status=active' },
    { label: 'Denied Labs', value: stats?.deniedLabs ?? 0, icon: 'ph:prohibit-duotone', link: '/archive?status=Denied' },
    { label: 'Completed Labs', value: stats?.completedLabs ?? 0, icon: 'ph:check-circle-duotone', link: '/archive?status=Completed' },
  ]
})

// Cost Overview Chart Options
const costChartOptions = computed(() => ({
  chart: {
    id: 'cost-overview',
    type: 'area' as const,
    height: 280,
    width: '100%',
    toolbar: { show: false },
    zoom: { enabled: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  colors: ['#0066CC', '#6753AC', '#3D7317'], // PatternFly: blue, purple, green
  stroke: {
    width: 2,
    curve: 'smooth' as const,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100],
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: data.value?.costOverview?.months ?? ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' },
    },
  },
  yaxis: {
    labels: {
      formatter: (val: number) => `$${val}k`,
      style: { cssClass: 'text-muted-500 dark:text-muted-400' },
    },
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { useSeriesColors: true },
  },
  tooltip: { theme: 'dark' },
  grid: {
    borderColor: 'rgba(0,0,0,0.05)',
  },
}))

const costChartSeries = computed(() => [
  { name: 'This Year', data: data.value?.costOverview?.thisYear ?? [] },
  { name: 'Last Year', data: data.value?.costOverview?.lastYear ?? [] },
])

// Cost Summary Stats (calculated from chart data)
const costSummary = computed(() => {
  const thisYearTotal = (data.value?.costOverview?.thisYear ?? []).reduce((sum, val) => sum + val, 0)
  const lastYearTotal = (data.value?.costOverview?.lastYear ?? []).reduce((sum, val) => sum + val, 0)
  const activeLabs = data.value?.stats?.activeLabs || 0
  const costPerLab = activeLabs > 0 ? (thisYearTotal / activeLabs) : 0

  return [
    { label: 'This Year', value: `$${thisYearTotal.toFixed(1)}k`, color: 'text-[#0066CC]' },
    { label: 'Last Year', value: `$${lastYearTotal.toFixed(1)}k`, color: 'text-[#6753AC]' },
    { label: 'Cost/Lab', value: `$${costPerLab.toFixed(1)}k`, color: 'text-[#3D7317]' },
  ]
})

// Labs Summary Chart Options
const labsChartOptions = computed(() => ({
  chart: {
    id: 'labs-summary',
    type: 'bar' as const,
    height: 280,
    width: '100%',
    toolbar: { show: false },
    redrawOnParentResize: true,
    redrawOnWindowResize: true,
  },
  colors: ['#0066CC', '#3D7317'], // PatternFly: blue, green
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '55%',
      dataLabels: { position: 'top' },
    },
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: data.value?.labsSummary?.months ?? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' },
    },
  },
  yaxis: {
    labels: {
      style: { cssClass: 'text-muted-500 dark:text-muted-400' },
    },
  },
  legend: {
    position: 'top' as const,
    horizontalAlign: 'right' as const,
    labels: { useSeriesColors: true },
  },
  tooltip: { theme: 'dark' },
  grid: {
    borderColor: 'rgba(0,0,0,0.05)',
  },
}))

const labsChartSeries = computed(() => [
  { name: 'Created', data: data.value?.labsSummary?.created ?? [] },
  { name: 'Completed', data: data.value?.labsSummary?.completed ?? [] },
])

// Labs summary totals
const labsTotals = computed(() => ({
  created: data.value?.labsSummary?.totalCreated ?? 0,
  completed: data.value?.labsSummary?.totalCompleted ?? 0,
}))

// Dynamic welcome message based on stats
const welcomeMessage = computed(() => {
  const stats = data.value?.stats
  if (!stats) return 'Loading your dashboard...'

  const parts: string[] = []
  if (stats.activeLabs > 0) {
    parts.push(`${stats.activeLabs} active lab${stats.activeLabs === 1 ? '' : 's'}`)
  }
  if (stats.completedLabs > 0) {
    parts.push(`${stats.completedLabs} completed`)
  }

  if (parts.length === 0) {
    return 'No active labs at the moment.'
  }

  return `You have ${parts.join(' and ')}.`
})
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
            <template v-if="pending && !data">
              Loading your dashboard...
            </template>
            <template v-else>
              {{ welcomeMessage }}
            </template>
          </p>
        </div>
      </div>
      <!-- Refresh Button -->
      <button
        class="text-muted-500 hover:text-primary-500 flex items-center gap-2 transition-colors"
        :disabled="pending"
        @click="refresh"
      >
        <Icon
          name="ph:arrows-clockwise"
          class="size-5"
          :class="{ 'animate-spin': pending }"
        />
        <span class="text-sm">Refresh</span>
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <Icon
        name="ph:warning-circle-duotone"
        class="size-5 text-red-500"
      />
      <p class="text-sm text-red-700 dark:text-red-400">
        Failed to load dashboard data. Please try again.
      </p>
      <button
        class="ml-auto text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
        @click="refresh"
      >
        Retry
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <NuxtLink
        v-for="stat in statCards"
        :key="stat.label"
        :to="stat.link"
        class="block"
      >
        <BaseCard
          rounded="lg"
          class="min-w-0 p-5 transition-shadow hover:shadow-lg hover:ring-2 hover:ring-primary-500/20"
        >
          <div class="flex items-center gap-4">
            <div class="bg-primary-500/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
              <Icon
                :name="stat.icon"
                class="text-primary-500 size-6"
              />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                {{ stat.label }}
              </p>
              <template v-if="pending && !data">
                <div class="bg-muted-200 dark:bg-muted-700 mt-1 h-7 w-16 animate-pulse rounded" />
              </template>
              <p
                v-else
                class="text-muted-800 dark:text-white text-2xl font-semibold"
              >
                {{ stat.value.toLocaleString() }}
              </p>
            </div>
          </div>
        </BaseCard>
      </NuxtLink>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <!-- Cost Overview Chart -->
      <BaseCard
        rounded="lg"
        class="min-w-0 overflow-hidden p-5"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-muted-800 dark:text-white text-lg font-semibold">
            Cost Overview
          </h3>
          <div class="flex gap-4">
            <template v-if="pending && !data">
              <div
                v-for="i in 3"
                :key="i"
                class="text-end"
              >
                <div class="bg-muted-200 dark:bg-muted-700 mb-1 h-3 w-12 animate-pulse rounded" />
                <div class="bg-muted-200 dark:bg-muted-700 h-5 w-16 animate-pulse rounded" />
              </div>
            </template>
            <template v-else>
              <div
                v-for="item in costSummary"
                :key="item.label"
                class="text-end"
              >
                <p class="text-muted-400 text-xs">
                  {{ item.label }}
                </p>
                <p :class="[item.color, 'font-semibold']">
                  {{ item.value }}
                </p>
              </div>
            </template>
          </div>
        </div>
        <ClientOnly>
          <template v-if="pending && !data">
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <div class="flex items-center gap-2">
                <Icon
                  name="ph:spinner"
                  class="size-5 animate-spin"
                />
                <p class="text-muted-400">
                  Loading chart...
                </p>
              </div>
            </div>
          </template>
          <div
            v-else
            class="w-full"
          >
            <apexchart
              type="area"
              height="280"
              width="100%"
              :options="costChartOptions"
              :series="costChartSeries"
            />
          </div>
          <template #fallback>
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <p class="text-muted-400">
                Loading chart...
              </p>
            </div>
          </template>
        </ClientOnly>
      </BaseCard>

      <!-- Labs Summary Chart -->
      <BaseCard
        rounded="lg"
        class="min-w-0 overflow-hidden p-5"
      >
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-muted-800 dark:text-white text-lg font-semibold">
            Labs Summary
          </h3>
          <div class="flex gap-4">
            <template v-if="pending && !data">
              <div
                v-for="i in 2"
                :key="i"
                class="text-end"
              >
                <div class="bg-muted-200 dark:bg-muted-700 mb-1 h-3 w-16 animate-pulse rounded" />
                <div class="bg-muted-200 dark:bg-muted-700 h-5 w-12 animate-pulse rounded" />
              </div>
            </template>
            <template v-else>
              <div class="text-end">
                <p class="text-muted-400 text-xs">
                  Total Created
                </p>
                <p class="font-semibold text-[#0066CC]">
                  {{ labsTotals.created }}
                </p>
              </div>
              <div class="text-end">
                <p class="text-muted-400 text-xs">
                  Total Completed
                </p>
                <p class="font-semibold text-[#3D7317]">
                  {{ labsTotals.completed }}
                </p>
              </div>
            </template>
          </div>
        </div>
        <ClientOnly>
          <template v-if="pending && !data">
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <div class="flex items-center gap-2">
                <Icon
                  name="ph:spinner"
                  class="size-5 animate-spin"
                />
                <p class="text-muted-400">
                  Loading chart...
                </p>
              </div>
            </div>
          </template>
          <div
            v-else
            class="w-full"
          >
            <apexchart
              type="bar"
              height="280"
              width="100%"
              :options="labsChartOptions"
              :series="labsChartSeries"
            />
          </div>
          <template #fallback>
            <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
              <p class="text-muted-400">
                Loading chart...
              </p>
            </div>
          </template>
        </ClientOnly>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
/* Constrain ApexCharts to prevent overflow */
:deep(.apexcharts-canvas) {
  max-width: 100% !important;
}

:deep(.apexcharts-svg) {
  max-width: 100% !important;
}
</style>
