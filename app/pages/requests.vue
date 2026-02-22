<script setup lang="ts">
import { differenceInDays, parseISO } from 'date-fns'

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Requests - OpenShift Partner Labs'
})

const { requests, pending, error, refresh, extendRequest, addNote } = useRequests()

// Modal state
const noteModalOpen = ref(false)
const selectedRequestId = ref<number | null>(null)
const extending = ref<number | null>(null)

// Refresh on mount
onMounted(() => {
  refresh()
})

// Calculate reservation progress percentage
const getReservationProgress = (startDate: string, endDate: string): number => {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  const now = new Date()
  const totalDays = differenceInDays(end, start)
  if (totalDays <= 0) return 100
  const elapsedDays = differenceInDays(now, start)
  return Math.round(Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)))
}

// Get status color
const getStatusColor = (status: string): 'warning' | 'primary' | 'success' | 'info' | 'muted' => {
  switch (status) {
    case 'Pending':
      return 'warning'
    case 'Active':
      return 'primary'
    case 'Approved':
      return 'success'
    case 'Running':
      return 'info'
    case 'Hibernating':
      return 'muted'
    default:
      return 'muted'
  }
}

// Handle extend action
const handleExtend = async (requestId: number, duration: '1w' | '2w' | '1mo') => {
  extending.value = requestId
  try {
    await extendRequest(requestId, duration)
  } catch (e) {
    console.error('Failed to extend request:', e)
  } finally {
    extending.value = null
  }
}

// Handle create note action
const handleCreateNote = (requestId: number) => {
  selectedRequestId.value = requestId
  noteModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-muted-800 dark:text-white text-2xl font-semibold">
          Reservation Requests
        </h1>
        <p class="text-muted-500 dark:text-muted-400 mt-1">
          Manage cluster reservation requests
        </p>
      </div>
      <button
        class="text-muted-500 hover:text-primary-500 flex items-center gap-2 transition-colors"
        :disabled="pending"
        @click="refresh"
      >
        <Icon
          name="ph:arrows-clockwise"
          class="size-5"
          :class="{ 'animate-spin': pending }"
        />
        <span class="text-sm">Refresh</span>
      </button>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <Icon name="ph:warning-circle-duotone" class="size-5 text-red-500" />
      <p class="text-sm text-red-700 dark:text-red-400">
        Failed to load requests. Please try again.
      </p>
      <button
        class="ml-auto text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
        @click="refresh"
      >
        Retry
      </button>
    </div>

    <!-- Loading State -->
    <template v-if="pending && requests.length === 0">
      <BaseCard rounded="lg" class="p-8">
        <div class="flex flex-col items-center justify-center gap-4">
          <Icon name="ph:spinner" class="text-primary-500 size-8 animate-spin" />
          <p class="text-muted-500 dark:text-muted-400">Loading requests...</p>
        </div>
      </BaseCard>
    </template>

    <!-- Empty State -->
    <template v-else-if="!pending && requests.length === 0 && !error">
      <BaseCard rounded="lg" class="p-8">
        <div class="flex flex-col items-center justify-center gap-4">
          <div class="bg-muted-100 dark:bg-muted-800 flex size-16 items-center justify-center rounded-full">
            <Icon name="ph:clipboard-text-duotone" class="text-muted-400 size-8" />
          </div>
          <div class="text-center">
            <h3 class="text-muted-800 dark:text-white text-lg font-semibold">No requests yet</h3>
            <p class="text-muted-500 dark:text-muted-400 mt-1">
              Reservation requests will appear here once they are created.
            </p>
          </div>
        </div>
      </BaseCard>
    </template>

    <!-- Requests Table -->
    <TairoTable v-else rounded="lg">
      <template #header>
        <TairoTableHeading uppercase class="w-1/4 ps-4">
          Cluster
        </TairoTableHeading>
        <TairoTableHeading uppercase class="w-1/6">
          TimeZone
        </TairoTableHeading>
        <TairoTableHeading uppercase class="w-1/6">
          Status
        </TairoTableHeading>
        <TairoTableHeading uppercase class="w-1/4">
          Reservation
        </TairoTableHeading>
        <TairoTableHeading uppercase class="w-20 pe-4 text-end">
          Action
        </TairoTableHeading>
      </template>

      <TairoTableRow v-for="request in requests" :key="request.id">
        <!-- Cluster Column -->
        <TairoTableCell spaced class="ps-4">
          <div class="flex items-center gap-3">
            <div class="bg-primary-500/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Icon name="ph:cube-duotone" class="text-primary-500 size-5" />
            </div>
            <div class="min-w-0">
              <p class="text-muted-800 dark:text-white truncate font-medium">
                {{ request.cluster }}
              </p>
              <p class="text-muted-500 dark:text-muted-400 truncate text-xs">
                {{ request.company.name }}
              </p>
            </div>
          </div>
        </TairoTableCell>

        <!-- TimeZone Column -->
        <TairoTableCell spaced light>
          <span class="text-muted-500 dark:text-muted-400">
            {{ request.timezone }}
          </span>
        </TairoTableCell>

        <!-- Status Column -->
        <TairoTableCell spaced>
          <BaseTag
            :color="getStatusColor(request.status)"
            rounded="full"
            size="sm"
          >
            {{ request.status }}
          </BaseTag>
        </TairoTableCell>

        <!-- Reservation Column -->
        <TairoTableCell spaced>
          <div class="flex items-center gap-3">
            <BaseProgressCircle
              :value="getReservationProgress(request.startDate, request.endDate)"
              :size="40"
              :thickness="3"
            />
            <span class="text-muted-500 dark:text-muted-400 text-sm">
              {{ getReservationProgress(request.startDate, request.endDate) }}% elapsed
            </span>
          </div>
        </TairoTableCell>

        <!-- Action Column -->
        <TairoTableCell spaced class="pe-4 text-end">
          <div class="relative flex justify-end">
            <div
              v-if="extending === request.id"
              class="flex items-center gap-2"
            >
              <Icon name="ph:spinner" class="text-primary-500 size-4 animate-spin" />
            </div>
            <RequestActionsDropdown
              v-else
              :request-id="request.id"
              @extend="(duration) => handleExtend(request.id, duration)"
              @create-note="handleCreateNote(request.id)"
            />
          </div>
        </TairoTableCell>
      </TairoTableRow>
    </TairoTable>

    <!-- Note Modal -->
    <RequestNoteModal
      v-model:open="noteModalOpen"
      :request-id="selectedRequestId"
    />
  </div>
</template>
