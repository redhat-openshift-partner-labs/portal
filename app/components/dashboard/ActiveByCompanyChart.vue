<script setup lang="ts">
interface ActiveByCompanyData {
  readonly data: readonly { company: string, count: number }[]
}

const props = defineProps<{
  data: ActiveByCompanyData | null
  pending: boolean
}>()

const chartOptions = computed(() => {
  if (!props.data || props.data.data.length === 0) {
    return null
  }

  // Reverse for horizontal bar (top to bottom)
  const companies = [...props.data.data].reverse().map(item => item.company)
  const counts = [...props.data.data].reverse().map(item => item.count)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
      formatter: (params: Array<{ name: string, value: number, marker: string }>) => {
        const param = params[0]
        return param ? `${param.marker} ${param.name}<br/><strong>${param.value}</strong> active labs` : ''
      },
    },
    grid: {
      left: 100,
      right: 20,
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
      data: companies,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
        width: 90,
        overflow: 'truncate',
        ellipsis: '...',
      },
    },
    series: [
      {
        type: 'bar',
        data: counts,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#0ea5e9' }, // sky-500
              { offset: 1, color: '#38bdf8' }, // sky-400
            ],
          },
          borderRadius: [0, 4, 4, 0],
        },
        barWidth: 12,
        label: {
          show: true,
          position: 'right',
          color: '#9ca3af',
          fontSize: 11,
        },
      },
    ],
  }
})
</script>

<template>
  <div>
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Active Labs by Company
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
            No active labs
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
