<script setup lang="ts">
interface StateBreakdown {
  readonly state: string
  readonly count: number
}

interface RequestsByTypeBreakdown {
  readonly requestType: string
  readonly label: string
  readonly count: number
  readonly byState: readonly StateBreakdown[]
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

// Color palette for states (from LifecycleTimelineChart)
const stateColors: Record<string, string> = {
  Pending: '#f59e0b', // amber-500
  Approved: '#0ea5e9', // sky-500
  Running: '#8b5cf6', // violet-500
  Hibernating: '#64748b', // slate-500
}

const chartOptions = computed(() => {
  if (!props.data || props.data.breakdown.length === 0) {
    return null
  }

  // Collect unique states from the data
  const uniqueStates = new Set<string>()
  for (const item of props.data.breakdown) {
    for (const stateData of item.byState) {
      uniqueStates.add(stateData.state)
    }
  }

  // Calculate total count per state (for node labels)
  const stateTotals = new Map<string, number>()
  for (const item of props.data.breakdown) {
    for (const stateData of item.byState) {
      stateTotals.set(stateData.state, (stateTotals.get(stateData.state) ?? 0) + stateData.count)
    }
  }

  // Build nodes: Layer 1 (OpenShift) + Layer 2 (Types) + Layer 3 (States)
  const nodes = [
    { name: 'OpenShift', itemStyle: { color: '#0ea5e9' } }, // sky-500
    ...props.data.breakdown.map(item => ({
      name: item.label,
      itemStyle: { color: typeColors[item.requestType] ?? '#6b7280' },
    })),
    ...Array.from(uniqueStates).map(state => ({
      name: state,
      itemStyle: { color: stateColors[state] ?? '#6b7280' },
    })),
  ]

  // Build links: OpenShift → Types + Types → States
  const links = [
    // Layer 1 → Layer 2: OpenShift to each request type
    ...props.data.breakdown.map(item => ({
      source: 'OpenShift',
      target: item.label,
      value: item.count,
    })),
    // Layer 2 → Layer 3: Each request type to its states
    ...props.data.breakdown.flatMap(item =>
      item.byState.map(stateData => ({
        source: item.label,
        target: stateData.state,
        value: stateData.count,
      })),
    ),
  ]

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
            // Check if it's a state node (third layer)
            if (stateTotals.has(params.name)) {
              return `${params.name} (${stateTotals.get(params.name)})`
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
      <div class="bg-muted-100 dark:bg-muted-800 flex h-[350px] items-center justify-center rounded-lg">
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
      <div class="bg-muted-100 dark:bg-muted-800 flex h-[350px] items-center justify-center rounded-lg">
        <p class="text-muted-400">
          No request data available
        </p>
      </div>
    </template>
    <div
      v-else
      class="h-[350px] w-full"
    >
      <VChart
        :option="chartOptions"
        autoresize
        class="h-full w-full"
      />
    </div>
    <template #fallback>
      <div class="bg-muted-100 dark:bg-muted-800 flex h-[350px] items-center justify-center rounded-lg">
        <p class="text-muted-400">
          Loading chart...
        </p>
      </div>
    </template>
  </ClientOnly>
</template>
