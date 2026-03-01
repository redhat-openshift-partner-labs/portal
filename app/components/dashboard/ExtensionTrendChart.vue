<script setup lang="ts">
interface ExtensionTrendData {
  readonly month: string
  readonly approved: number
  readonly pending: number
  readonly denied: number
}

const props = defineProps<{
  data: readonly ExtensionTrendData[] | null
  pending: boolean
}>()

const { createAreaGradient } = useECharts()

// Status colors
const statusColors = {
  approved: '#22c55e', // green-500
  pending: '#f59e0b', // amber-500
  denied: '#ef4444', // red-500
}

const chartOptions = computed(() => {
  if (!props.data || props.data.length === 0) {
    return null
  }

  const months = props.data.map(item => item.month)
  const approvedData = props.data.map(item => item.approved)
  const pendingData = props.data.map(item => item.pending)
  const deniedData = props.data.map(item => item.denied)

  // Check if all data is zero
  const totalSum = [...approvedData, ...pendingData, ...deniedData].reduce((a, b) => a + b, 0)
  if (totalSum === 0) return null

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
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
    grid: {
      left: 35,
      right: 10,
      top: 10,
      bottom: 35,
    },
    xAxis: {
      type: 'category',
      data: months,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 10,
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
        name: 'Approved',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: approvedData,
        lineStyle: { color: statusColors.approved, width: 2 },
        areaStyle: { color: createAreaGradient(statusColors.approved, 0.6, 0.1) },
      },
      {
        name: 'Pending',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: pendingData,
        lineStyle: { color: statusColors.pending, width: 2 },
        areaStyle: { color: createAreaGradient(statusColors.pending, 0.6, 0.1) },
      },
      {
        name: 'Denied',
        type: 'line',
        stack: 'total',
        smooth: true,
        symbol: 'none',
        data: deniedData,
        lineStyle: { color: statusColors.denied, width: 2 },
        areaStyle: { color: createAreaGradient(statusColors.denied, 0.6, 0.1) },
      },
    ],
  }
})
</script>

<template>
  <div>
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Extension Requests Trend
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
            No trend data
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
