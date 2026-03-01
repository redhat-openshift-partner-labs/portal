<script setup lang="ts">
import type {
  LabsByCompanyData,
  ActiveByCompanyData,
  ExtensionStatsData,
  AuditActivityData,
  RequestFunnelData,
} from '~/composables/useDashboard'

defineProps<{
  labsByCompany: LabsByCompanyData | null
  activeByCompany: ActiveByCompanyData | null
  extensionStats: ExtensionStatsData | null
  auditActivity: AuditActivityData | null
  requestFunnel: RequestFunnelData | null
  pending: boolean
}>()

// Tab definitions
const tabs = [
  { id: 'company', label: 'Company', icon: 'ph:buildings-duotone' },
  { id: 'extensions', label: 'Extensions', icon: 'ph:clock-countdown-duotone' },
  { id: 'activity', label: 'Activity', icon: 'ph:chart-line-up-duotone' },
  { id: 'advanced', label: 'Advanced', icon: 'ph:funnel-duotone' },
] as const

type TabId = typeof tabs[number]['id']

const activeTab = ref<TabId>('company')
</script>

<template>
  <BaseCard
    rounded="lg"
    class="min-w-0 overflow-hidden p-5"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-muted-800 dark:text-white text-lg font-semibold">
        Analytics Insights
      </h3>
    </div>

    <!-- Tab Navigation -->
    <div class="border-muted-200 dark:border-muted-700 mb-4 flex border-b">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors -mb-px"
        :class="[
          activeTab === tab.id
            ? 'border-primary-500 text-primary-500'
            : 'border-transparent text-muted-500 hover:text-muted-700 dark:hover:text-muted-300',
        ]"
        @click="activeTab = tab.id"
      >
        <Icon
          :name="tab.icon"
          class="size-4"
        />
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="min-h-[420px]">
      <!-- Company Tab -->
      <div
        v-show="activeTab === 'company'"
        class="space-y-4"
      >
        <DashboardLabsByCompanyChart
          :data="labsByCompany"
          :pending="pending"
        />
        <DashboardActiveByCompanyChart
          :data="activeByCompany"
          :pending="pending"
        />
      </div>

      <!-- Extensions Tab -->
      <div
        v-show="activeTab === 'extensions'"
        class="space-y-4"
      >
        <DashboardExtensionStatusChart
          :data="extensionStats?.byStatus ?? null"
          :pending="pending"
        />
        <DashboardExtensionDurationChart
          :data="extensionStats?.byDuration ?? null"
          :pending="pending"
        />
        <DashboardExtensionTrendChart
          :data="extensionStats?.byMonth ?? null"
          :pending="pending"
        />
      </div>

      <!-- Activity Tab -->
      <div
        v-show="activeTab === 'activity'"
        class="space-y-4"
      >
        <DashboardAccessHeatmapChart
          :data="auditActivity?.byDate ?? null"
          :pending="pending"
        />
        <DashboardLoginTypeChart
          :data="auditActivity?.byLoginType ?? null"
          :pending="pending"
        />
        <DashboardPeakHoursChart
          :data="auditActivity?.byHour ?? null"
          :pending="pending"
        />
      </div>

      <!-- Advanced Tab -->
      <div
        v-show="activeTab === 'advanced'"
        class="space-y-4"
      >
        <DashboardRequestFunnelChart
          :data="requestFunnel"
          :pending="pending"
        />
        <DashboardLifecycleTimelineChart
          :data="requestFunnel"
          :pending="pending"
        />
      </div>
    </div>
  </BaseCard>
</template>
