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

// Funnel colors
const funnelColors = {
  pending: '#f59e0b', // amber-500
  approved: '#0ea5e9', // sky-500
  running: '#a855f7', // purple-500
  completed: '#22c55e', // green-500
}

const chartOptions = computed(() => {
  if (!props.data) {
    return null
  }

  // Calculate cumulative totals for funnel visualization
  // Each stage shows how many requests have reached or passed that stage
  const total = props.data.pending + props.data.approved + props.data.running + props.data.completed + props.data.denied

  if (total === 0) return null

  // For a proper funnel, we show the count at each stage
  // The funnel narrows as requests progress through stages
  const funnelData = [
    {
      name: 'Pending',
      value: props.data.pending,
      itemStyle: { color: funnelColors.pending },
    },
    {
      name: 'Approved',
      value: props.data.approved,
      itemStyle: { color: funnelColors.approved },
    },
    {
      name: 'Running',
      value: props.data.running,
      itemStyle: { color: funnelColors.running },
    },
    {
      name: 'Completed',
      value: props.data.completed,
      itemStyle: { color: funnelColors.completed },
    },
  ]

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      formatter: (params: { name: string, value: number, marker: string }) => {
        return `${params.marker} ${params.name}<br/><strong>${params.value}</strong> labs`
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        type: 'funnel',
        left: 40,
        right: 40,
        top: 10,
        bottom: 10,
        width: '80%',
        minSize: '20%',
        maxSize: '100%',
        sort: 'none', // Keep order as provided
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          fontSize: 11,
          fontWeight: 'bold',
          formatter: (params: { name: string, value: number }) => {
            return `${params.name}\n${params.value}`
          },
        },
        labelLine: {
          show: false,
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 13,
          },
        },
        data: funnelData,
      },
    ],
  }
})

// Denied count for separate display
const deniedCount = computed(() => props.data?.denied ?? 0)
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between">
      <h4 class="text-muted-600 dark:text-muted-400 text-sm font-medium">
        Request State Funnel
      </h4>
      <span
        v-if="deniedCount > 0"
        class="flex items-center gap-1 text-xs text-red-500"
      >
        <Icon
          name="ph:prohibit"
          class="size-3"
        />
        {{ deniedCount }} denied
      </span>
    </div>
    <ClientOnly>
      <template v-if="pending && !data">
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[200px] items-center justify-center rounded-lg">
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
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[200px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            No funnel data
          </p>
        </div>
      </template>
      <div
        v-else
        class="h-[200px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
      </div>
      <template #fallback>
        <div class="bg-muted-100 dark:bg-muted-800 flex h-[200px] items-center justify-center rounded-lg">
          <p class="text-muted-400 text-sm">
            Loading...
          </p>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
