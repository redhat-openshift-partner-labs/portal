<script setup lang="ts">
interface RequestsByTypeBreakdown {
  readonly requestType: string
  readonly label: string
  readonly count: number
}

interface RequestsByTypeData {
  readonly total: number
  readonly breakdown: readonly RequestsByTypeBreakdown[]
}

const props = defineProps<{
  data: RequestsByTypeData | null
  pending: boolean
}>()

// Color palette for request types
const typeColors: Record<string, string> = {
  general: '#22c55e', // green-500
  ocpv: '#a855f7', // purple-500
  engineering: '#f97316', // orange-500
  nvidia: '#84cc16', // lime-500
  rosa: '#ec4899', // pink-500
  rhoai: '#14b8a6', // teal-500
}

const chartOptions = computed(() => {
  if (!props.data || props.data.breakdown.length === 0) {
    return null
  }

  // Build nodes
  const nodes = [
    { name: 'OpenShift', itemStyle: { color: '#0ea5e9' } }, // sky-500
    ...props.data.breakdown.map(item => ({
      name: item.label,
      itemStyle: { color: typeColors[item.requestType] ?? '#6b7280' },
    })),
  ]

  // Build links from OpenShift to each request type
  const links = props.data.breakdown.map(item => ({
    source: 'OpenShift',
    target: item.label,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#fff',
      },
      formatter: (params: { data: { source?: string, target?: string, value?: number, name?: string } }) => {
        if (params.data.source && params.data.target) {
          return `${params.data.source} → ${params.data.target}<br/><strong>${params.data.value}</strong> requests`
        }
        return params.data.name
      },
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency',
        },
        nodeAlign: 'left',
        nodeWidth: 20,
        nodeGap: 12,
        layoutIterations: 0,
        data: nodes,
        links,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5,
          opacity: 0.6,
        },
        label: {
          position: 'right',
          color: '#9ca3af', // muted-400
          fontSize: 12,
          formatter: (params: { name: string, value: number }) => {
            if (params.name === 'OpenShift') {
              return `OpenShift (${props.data?.total ?? 0})`
            }
            return `${params.name} (${params.value})`
          },
        },
      },
    ],
  }
})
</script>

<template>
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
    <template v-else-if="!chartOptions || data?.breakdown.length === 0">
      <div class="bg-muted-100 dark:bg-muted-800 flex h-[280px] items-center justify-center rounded-lg">
        <p class="text-muted-400">
          No request data available
        </p>
      </div>
    </template>
    <div
      v-else
      class="h-[280px] w-full"
    >
      <VChart
        :option="chartOptions"
        autoresize
        class="h-full w-full"
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
</template>
