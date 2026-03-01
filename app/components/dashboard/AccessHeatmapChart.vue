<script setup lang="ts">
interface AccessByDateData {
  readonly date: string
  readonly count: number
}

const props = defineProps<{
  data: readonly AccessByDateData[] | null
  pending: boolean
}>()

const chartOptions = computed(() => {
  if (!props.data || props.data.length === 0) {
    return null
  }

  // Get date range (last 6 months for compact display)
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Filter data to last 6 months
  const filteredData = props.data.filter((item) => {
    const date = new Date(item.date)
    return date >= sixMonthsAgo && date <= endDate
  })

  if (filteredData.length === 0) return null

  // Find max value for color scale
  const maxValue = Math.max(...filteredData.map(d => d.count), 1)

  // Format data for ECharts calendar heatmap
  const heatmapData = filteredData.map(item => [item.date, item.count])

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      formatter: (params: { value: [string, number] }) => {
        const [date, count] = params.value
        return `${date}<br/><strong>${count}</strong> accesses`
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: maxValue,
      inRange: {
        color: ['#f3f4f6', '#dcfce7', '#86efac', '#22c55e', '#15803d'], // gray-100 to green-700
      },
    },
    calendar: {
      left: 40,
      right: 10,
      top: 20,
      bottom: 10,
      cellSize: [12, 12],
      range: [
        `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`,
        `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`,
      ],
      itemStyle: {
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 2,
      },
      yearLabel: { show: false },
      monthLabel: {
        color: '#9ca3af',
        fontSize: 10,
        nameMap: 'en',
      },
      dayLabel: {
        show: true,
        firstDay: 1,
        color: '#9ca3af',
        fontSize: 9,
        nameMap: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: heatmapData,
      },
    ],
  }
})
</script>

<template>
  <div>
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Lab Access Activity
    </h4>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[140px] items-center justify-center rounded-lg">
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
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[140px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No access data
          </p>
        </div>
      </template>
      <div
        v-else
        class="h-[140px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[140px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
