<script setup lang="ts">
const props = defineProps<{
  data: readonly number[] | null
  pending: boolean
}>()

const chartOptions = computed(() => {
  if (!props.data || props.data.length !== 24) {
    return null
  }

  const total = props.data.reduce((a, b) => a + b, 0)
  if (total === 0) return null

  // Create hour labels (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return '12am'
    if (i === 12) return '12pm'
    if (i < 12) return `${i}am`
    return `${i - 12}pm`
  })

  // Find peak hour
  const maxCount = Math.max(...props.data)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ axisValue: string, value: number, marker: string }>) => {
        const param = params[0]
        return param ? `${param.marker} ${param.axisValue}<br/><strong>${param.value}</strong> accesses` : ''
      },
    },
    grid: {
      left: 35,
      right: 10,
      top: 10,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 9,
        interval: 3, // Show every 4th hour
        rotate: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10,
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
    series: [
      {
        type: 'bar',
        data: props.data.map((count, _index) => ({
          value: count,
          itemStyle: {
            // Highlight peak hours
            color: count === maxCount && count > 0 ? '#f59e0b' : '#0ea5e9',
            borderRadius: [2, 2, 0, 0],
          },
        })),
        barWidth: '70%',
      },
    ],
  }
})

// Peak hour info
const peakHourInfo = computed(() => {
  if (!props.data || props.data.length !== 24) return null
  const maxCount = Math.max(...props.data)
  if (maxCount === 0) return null
  const peakHour = props.data.indexOf(maxCount)
  const hourLabel = peakHour === 0 ? '12am' : peakHour === 12 ? '12pm' : peakHour < 12 ? `${peakHour}am` : `${peakHour - 12}pm`
  return { hour: hourLabel, count: maxCount }
})
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <h4 class="text-muted-600 dark:text-muted-400 text-sm font-medium">
        Peak Access Hours
      </h4>
      <span
        v-if="peakHourInfo"
        class="text-xs text-amber-500"
      >
        Peak: {{ peakHourInfo.hour }} ({{ peakHourInfo.count }})
      </span>
    </div>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[120px] items-center justify-center rounded-lg">
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
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[120px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No hourly data
          </p>
        </div>
      </template>
      <div
        v-else
        class="h-[120px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[120px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
