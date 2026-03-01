<script setup lang="ts">
const props = defineProps<{
  data: Record<string, number> | null
  pending: boolean
}>()

// Color palette for login types
const loginTypeColors: Record<string, string> = {
  SSO: '#0ea5e9', // sky-500
  Direct: '#22c55e', // green-500
  API: '#a855f7', // purple-500
  Unknown: '#6b7280', // gray-500
}

const defaultColors = ['#f97316', '#ec4899', '#14b8a6', '#84cc16']

const chartOptions = computed(() => {
  if (!props.data || Object.keys(props.data).length === 0) {
    return null
  }

  const entries = Object.entries(props.data).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((sum, [, count]) => sum + count, 0)
  if (total === 0) return null

  const seriesData = entries.map(([type, count], index) => ({
    name: type,
    value: count,
    itemStyle: {
      color: loginTypeColors[type] ?? defaultColors[index % defaultColors.length] ?? '#6b7280',
    },
  }))

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      formatter: (params: { name: string, value: number, percent: number, marker: string }) => {
        return `${params.marker} ${params.name}<br/><strong>${params.value}</strong> (${params.percent}%)`
      },
    },
    legend: {
      show: true,
      bottom: 0,
      left: 'center',
      textStyle: { color: '#9ca3af', fontSize: 10 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 12,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 11,
            fontWeight: 'bold',
            color: '#fff',
          },
        },
        labelLine: {
          show: false,
        },
        data: seriesData,
      },
    ],
  }
})

// Total count
const totalAccesses = computed(() => {
  if (!props.data) return 0
  return Object.values(props.data).reduce((sum, count) => sum + count, 0)
})
</script>

<template>
  <div class="relative">
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Access by Login Type
    </h4>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[150px] items-center justify-center rounded-lg">
          <div class="flex items-center gap-2">
            <Icon
              name="ph:spinner"
              class="size-5 animate-spin"
            />
            <p class="text-muted-400 text-sm">
              Loading...
            </p>
          </div>
        </div>
      </template>
      <template v-else-if="!chartOptions">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[150px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No login data
          </p>
        </div>
      </template>
      <div
        v-else
        class="relative h-[150px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
        <!-- Center label -->
        <div class="pointer-events-none absolute inset-x-0 top-0 flex h-[120px] items-center justify-center">
          <div class="text-center">
            <p class="text-muted-800 dark:text-white text-lg font-bold">
              {{ totalAccesses.toLocaleString() }}
            </p>
            <p class="text-muted-400 text-xs">
              Accesses
            </p>
          </div>
        </div>
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[150px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
