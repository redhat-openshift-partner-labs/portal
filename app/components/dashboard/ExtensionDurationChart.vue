<script setup lang="ts">
interface ExtensionDurationData {
  readonly duration: string
  readonly label: string
  readonly count: number
}

const props = defineProps<{
  data: readonly ExtensionDurationData[] | null
  pending: boolean
}>()

const chartOptions = computed(() => {
  if (!props.data || props.data.length === 0) {
    return null
  }

  const labels = props.data.map(item => item.label)
  const counts = props.data.map(item => item.count)

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      axisPointer: { type: 'shadow' },
    },
    grid: {
      left: 40,
      right: 10,
      top: 10,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9ca3af',
        fontSize: 11,
      },
      splitLine: {
        lineStyle: { color: 'rgba(0, 0, 0, 0.05)' },
      },
    },
    series: [
      {
        type: 'bar',
        data: counts,
        itemStyle: {
          color: '#a855f7', // purple-500
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '50%',
        label: {
          show: true,
          position: 'top',
          color: '#9ca3af',
          fontSize: 10,
        },
      },
    ],
  }
})
</script>

<template>
  <div>
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Extension Duration Distribution
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
            No duration data
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
