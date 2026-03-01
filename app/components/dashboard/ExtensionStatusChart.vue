<script setup lang="ts">
interface ExtensionStatusData {
  readonly approved: number
  readonly pending: number
  readonly denied: number
}

const props = defineProps<{
  data: ExtensionStatusData | null
  pending: boolean
}>()

// Status colors
const statusColors = {
  approved: '#22c55e', // green-500
  pending: '#f59e0b', // amber-500
  denied: '#ef4444', // red-500
}

const chartOptions = computed(() => {
  if (!props.data) {
    return null
  }

  const total = props.data.approved + props.data.pending + props.data.denied
  if (total === 0) return null

  const seriesData = [
    { name: 'Approved', value: props.data.approved, itemStyle: { color: statusColors.approved } },
    { name: 'Pending', value: props.data.pending, itemStyle: { color: statusColors.pending } },
    { name: 'Denied', value: props.data.denied, itemStyle: { color: statusColors.denied } },
  ].filter(item => item.value > 0)

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
      textStyle: { color: '#9ca3af', fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
    },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '45%'],
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
            fontSize: 12,
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
const totalRequests = computed(() => {
  if (!props.data) return 0
  return props.data.approved + props.data.pending + props.data.denied
})
</script>

<template>
  <div class="relative">
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Extension Request Status
    </h4>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[160px] items-center justify-center rounded-lg">
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
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[160px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No extension requests
          </p>
        </div>
      </template>
      <div
        v-else
        class="relative h-[160px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
        <!-- Center label -->
        <div class="pointer-events-none absolute inset-x-0 top-0 flex h-[130px] items-center justify-center">
          <div class="text-center">
            <p class="text-muted-800 dark:text-white text-lg font-bold">
              {{ totalRequests }}
            </p>
            <p class="text-muted-400 text-xs">
              Total
            </p>
          </div>
        </div>
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[160px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
