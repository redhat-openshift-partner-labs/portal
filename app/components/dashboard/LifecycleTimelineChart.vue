<script setup lang="ts">
interface RequestFunnelData {
  readonly pending: number
  readonly approved: number
  readonly running: number
  readonly completed: number
  readonly denied: number
}

const props = defineProps<{
  data: RequestFunnelData | null
  pending: boolean
}>()

// State colors
const stateColors = {
  pending: '#f59e0b', // amber-500
  approved: '#0ea5e9', // sky-500
  running: '#a855f7', // purple-500
  completed: '#22c55e', // green-500
  denied: '#ef4444', // red-500
}

const chartOptions = computed(() => {
  if (!props.data) {
    return null
  }

  const total = props.data.pending + props.data.approved + props.data.running + props.data.completed + props.data.denied
  if (total === 0) return null

  const states = ['Pending', 'Approved', 'Running', 'Completed', 'Denied']
  const values = [
    props.data.pending,
    props.data.approved,
    props.data.running,
    props.data.completed,
    props.data.denied,
  ]

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string, value: number, marker: string }>) => {
        const param = params[0]
        const percent = total > 0 ? ((param?.value ?? 0) / total * 100).toFixed(1) : 0
        return param ? `${param.marker} ${param.name}<br/><strong>${param.value}</strong> labs (${percent}%)` : ''
      },
    },
    grid: {
      left: 70,
      right: 30,
      top: 10,
      bottom: 10,
      containLabel: false,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'category',
      data: [...states].reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
      },
    },
    series: [
      {
        type: 'bar',
        data: [...values].reverse().map((value, index) => {
          const stateKey = [...states].reverse()[index]?.toLowerCase() as keyof typeof stateColors
          return {
            value,
            itemStyle: {
              color: stateColors[stateKey] ?? '#6b7280',
              borderRadius: [0, 4, 4, 0],
            },
          }
        }),
        barWidth: 16,
        label: {
          show: true,
          position: 'right',
          color: '#9ca3af',
          fontSize: 11,
          formatter: (params: { value: number }) => {
            const percent = total > 0 ? (params.value / total * 100).toFixed(0) : 0
            return `${params.value} (${percent}%)`
          },
        },
      },
    ],
  }
})
</script>

<template>
  <div>
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Lab State Distribution
    </h4>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[180px] items-center justify-center rounded-lg">
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
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[180px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No state data
          </p>
        </div>
      </template>
      <div
        v-else
        class="h-[180px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[180px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
