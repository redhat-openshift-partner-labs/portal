<script setup lang="ts">
interface LabsByCompanyData {
  readonly data: readonly { company: string, count: number }[]
  readonly other: number
}

const props = defineProps<{
  data: LabsByCompanyData | null
  pending: boolean
}>()

// Color palette for companies
const companyColors = [
  '#0ea5e9', // sky-500
  '#a855f7', // purple-500
  '#22c55e', // green-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
  '#84cc16', // lime-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#64748b', // slate-500
  '#6b7280', // gray-500 for "Other"
]

const chartOptions = computed(() => {
  if (!props.data || props.data.data.length === 0) {
    return null
  }

  const seriesData = [
    ...props.data.data.map((item, index) => ({
      name: item.company,
      value: item.count,
      itemStyle: { color: companyColors[index] ?? companyColors[0] },
    })),
  ]

  // Add "Other" if there are more companies
  if (props.data.other > 0) {
    seriesData.push({
      name: 'Other',
      value: props.data.other,
      itemStyle: { color: companyColors[10] ?? '#6b7280' },
    })
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' },
      formatter: (params: { name: string, value: number, percent: number, marker: string }) => {
        return `${params.marker} ${params.name}<br/><strong>${params.value}</strong> labs (${params.percent}%)`
      },
    },
    legend: {
      show: false,
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '80%'],
        center: ['50%', '50%'],
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
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff',
            formatter: (params: { name: string, percent: number }) => {
              return `${params.name}\n${params.percent}%`
            },
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

// Total labs count for center display
const totalLabs = computed(() => {
  if (!props.data) return 0
  return props.data.data.reduce((sum, item) => sum + item.count, 0) + props.data.other
})
</script>

<template>
  <div class="relative">
    <h4 class="text-muted-600 dark:text-muted-400 mb-2 text-sm font-medium">
      Labs by Company
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
            No data available
          </p>
        </div>
      </template>
      <div
        v-else
        class="relative h-[180px] w-full"
      >
        <VChart
          :option="chartOptions"
          autoresize
          class="h-full w-full"
        />
        <!-- Center label -->
        <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <p class="text-muted-800 dark:text-white text-xl font-bold">
              {{ totalLabs }}
            </p>
            <p class="text-muted-400 text-xs">
              Total
            </p>
          </div>
        </div>
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
