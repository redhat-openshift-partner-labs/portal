<script setup lang="ts">
import { differenceInDays, parseISO } from 'date-fns'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const companyId = computed(() => Number(route.params.id))

const { requests, pending, error, refresh, extendRequest, addNote } = useCompanyRequests(companyId)
const { canEdit } = useAuth()

// Company name derived from first request
const companyName = computed(() => {
  if (requests.value.length > 0) {
    return requests.value[0]?.company.name || 'Company'
  }
  return 'Company'
})

useHead({
  title: computed(() => `${companyName.value} Requests - OpenShift Partner Labs`)
})

// Modal state
const noteModalOpen = ref(false)
const editModalOpen = ref(false)
const extensionConfirmModalOpen = ref(false)
const selectedRequestId = ref<number | null>(null)
const extending = ref<number | null>(null)
const pendingExtensionRequestId = ref<number | null>(null)
const pendingExtensionDuration = ref<'3d' | '1w' | '2w' | '1mo' | null>(null)

// Search state
const searchQuery = ref('')

// Refresh on mount
onMounted(() => {
  refresh()
})

// Define active and archived statuses
const activeStatuses = ['Pending', 'Approved', 'Running', 'Hibernating']
const archivedStatuses = ['Denied', 'Completed']

// Filter requests based on search query
const filteredRequests = computed(() => {
  if (!searchQuery.value.trim()) {
    return requests.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return requests.value.filter((request) => {
    return (
      request.generatedName.toLowerCase().includes(query) ||
      request.timezone.toLowerCase().includes(query) ||
      request.status.toLowerCase().includes(query)
    )
  })
})

// Separate active and archived requests
const activeRequests = computed(() => {
  return filteredRequests.value.filter((r) => activeStatuses.includes(r.status))
})

const archivedRequests = computed(() => {
  return filteredRequests.value.filter((r) => archivedStatuses.includes(r.status))
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

// Get status classes for colored pills
const getStatusClasses = (status: string): string => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20'
    case 'Approved':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
    case 'Running':
      return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-inset ring-sky-500/20'
    case 'Hibernating':
      return 'bg-muted-500/10 text-muted-600 dark:text-muted-400 ring-1 ring-inset ring-muted-500/20'
    case 'Denied':
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20'
    case 'Completed':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
    default:
      return 'bg-muted-500/10 text-muted-600 dark:text-muted-400 ring-1 ring-inset ring-muted-500/20'
  }
}

// Initiate extension - show confirmation modal
const initiateExtend = (requestId: number, duration: '3d' | '1w' | '2w' | '1mo') => {
  pendingExtensionRequestId.value = requestId
  pendingExtensionDuration.value = duration
  extensionConfirmModalOpen.value = true
}

// Handle confirmed extension
const handleExtendConfirmed = async () => {
  if (!pendingExtensionRequestId.value || !pendingExtensionDuration.value) return

  extending.value = pendingExtensionRequestId.value
  try {
    await extendRequest(pendingExtensionRequestId.value, pendingExtensionDuration.value)
  } catch (e) {
    console.error('Failed to extend request:', e)
  } finally {
    extending.value = null
    pendingExtensionRequestId.value = null
    pendingExtensionDuration.value = null
  }
}

// Handle extension cancelled
const handleExtendCancelled = () => {
  pendingExtensionRequestId.value = null
  pendingExtensionDuration.value = null
}

// Handle create note action
const handleCreateNote = (requestId: number) => {
  selectedRequestId.value = requestId
  noteModalOpen.value = true
}

// Handle edit action
const handleEdit = (requestId: number) => {
  selectedRequestId.value = requestId
  editModalOpen.value = true
}

// Handle edit modal update
const handleEditUpdated = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div class="mb-2">
          <NuxtLink
            to="/requests"
            class="text-muted-500 hover:text-primary-500 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <Icon name="lucide:arrow-left" class="size-4" />
            <span>Back to Requests</span>
          </NuxtLink>
        </div>
        <h1 class="text-muted-800 dark:text-white text-2xl font-semibold">
          {{ companyName }} Requests
        </h1>
        <p class="text-muted-500 dark:text-muted-400 mt-1">
          All reservation requests for this company
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

    <!-- Search Input -->
    <div class="relative w-full sm:max-w-xs">
      <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
        <Icon name="ph:magnifying-glass" class="text-muted-400 size-5" />
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search requests..."
        class="border-muted-300 bg-muted-50 text-muted-600 placeholder:text-muted-300 focus:border-primary-500 focus:ring-primary-500 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-200 dark:placeholder:text-muted-600 dark:focus:border-primary-500 w-full rounded-lg border py-2 pe-4 ps-10 text-sm transition-colors focus:outline-none focus:ring-1"
      >
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
            <h3 class="text-muted-800 dark:text-white text-lg font-semibold">No requests found</h3>
            <p class="text-muted-500 dark:text-muted-400 mt-1">
              This company has no reservation requests yet.
            </p>
          </div>
        </div>
      </BaseCard>
    </template>

    <!-- No Search Results -->
    <template v-else-if="!pending && filteredRequests.length === 0 && searchQuery.trim()">
      <BaseCard rounded="lg" class="p-8">
        <div class="flex flex-col items-center justify-center gap-4">
          <div class="bg-muted-100 dark:bg-muted-800 flex size-16 items-center justify-center rounded-full">
            <Icon name="ph:magnifying-glass-duotone" class="text-muted-400 size-8" />
          </div>
          <div class="text-center">
            <h3 class="text-muted-800 dark:text-white text-lg font-semibold">No results found</h3>
            <p class="text-muted-500 dark:text-muted-400 mt-1">
              No requests match "{{ searchQuery }}". Try a different search term.
            </p>
          </div>
        </div>
      </BaseCard>
    </template>

    <!-- Tables -->
    <template v-else>
      <!-- Active Requests Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-muted-800 dark:text-white text-lg font-semibold">Active Requests</h2>
          <span class="bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-full px-2.5 py-0.5 text-xs font-medium">
            {{ activeRequests.length }}
          </span>
        </div>

        <template v-if="activeRequests.length > 0">
          <TairoTable rounded="lg">
            <template #header>
              <TairoTableHeading uppercase class="ps-4">
                Cluster Name
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                TimeZone
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                Status
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                Reservation
              </TairoTableHeading>
              <TairoTableHeading uppercase class="pe-4 text-end">
                Action
              </TairoTableHeading>
            </template>

            <TairoTableRow v-for="request in activeRequests" :key="request.id">
              <!-- Cluster Name Column -->
              <TairoTableCell spaced class="ps-4">
                <div class="flex items-center gap-3">
                  <div class="bg-primary-500/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon name="ph:cube-duotone" class="text-primary-500 size-5" />
                  </div>
                  <NuxtLink
                    :to="`/requests/${request.id}`"
                    class="text-muted-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 truncate font-medium underline decoration-muted-300 underline-offset-2 transition-colors hover:decoration-primary-500 dark:decoration-muted-600 dark:hover:decoration-primary-400"
                  >
                    {{ request.generatedName }}
                  </NuxtLink>
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
                  variant="none"
                  rounded="full"
                  size="sm"
                  :class="getStatusClasses(request.status)"
                >
                  {{ request.status }}
                </BaseTag>
              </TairoTableCell>

              <!-- Reservation Column -->
              <TairoTableCell spaced>
                <div class="flex items-center gap-3">
                  <BaseProgressCircle
                    :model-value="getReservationProgress(request.startDate, request.endDate)"
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
                <div class="flex items-center justify-end gap-2">
                  <ExtendButton
                    :loading="extending === request.id"
                    @extend="(duration) => initiateExtend(request.id, duration)"
                  />
                  <BaseButton
                    v-if="canEdit"
                    size="sm"
                    rounded="lg"
                    variant="default"
                    @click="handleEdit(request.id)"
                  >
                    <Icon name="lucide:pencil" class="size-4" />
                    <span>Edit</span>
                  </BaseButton>
                  <BaseButton
                    size="sm"
                    rounded="lg"
                    variant="default"
                    @click="handleCreateNote(request.id)"
                  >
                    <Icon name="lucide:message-square-plus" class="size-4" />
                    <span>Note</span>
                  </BaseButton>
                </div>
              </TairoTableCell>
            </TairoTableRow>
          </TairoTable>
        </template>

        <template v-else>
          <BaseCard rounded="lg" class="p-6">
            <p class="text-muted-500 dark:text-muted-400 text-center text-sm">
              No active requests
            </p>
          </BaseCard>
        </template>
      </div>

      <!-- Archived Requests Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <h2 class="text-muted-800 dark:text-white text-lg font-semibold">Archived Requests</h2>
          <span class="bg-muted-500/10 text-muted-600 dark:text-muted-400 rounded-full px-2.5 py-0.5 text-xs font-medium">
            {{ archivedRequests.length }}
          </span>
        </div>

        <template v-if="archivedRequests.length > 0">
          <TairoTable rounded="lg">
            <template #header>
              <TairoTableHeading uppercase class="ps-4">
                Cluster Name
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                TimeZone
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                Status
              </TairoTableHeading>
              <TairoTableHeading uppercase>
                Reservation
              </TairoTableHeading>
              <TairoTableHeading uppercase class="pe-4 text-end">
                Action
              </TairoTableHeading>
            </template>

            <TairoTableRow v-for="request in archivedRequests" :key="request.id">
              <!-- Cluster Name Column -->
              <TairoTableCell spaced class="ps-4">
                <div class="flex items-center gap-3">
                  <div class="bg-muted-500/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon name="ph:cube-duotone" class="text-muted-400 size-5" />
                  </div>
                  <NuxtLink
                    :to="`/requests/${request.id}`"
                    class="text-muted-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 truncate font-medium underline decoration-muted-300 underline-offset-2 transition-colors hover:decoration-primary-500 dark:decoration-muted-600 dark:hover:decoration-primary-400"
                  >
                    {{ request.generatedName }}
                  </NuxtLink>
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
                  variant="none"
                  rounded="full"
                  size="sm"
                  :class="getStatusClasses(request.status)"
                >
                  {{ request.status }}
                </BaseTag>
              </TairoTableCell>

              <!-- Reservation Column -->
              <TairoTableCell spaced>
                <div class="flex items-center gap-3">
                  <BaseProgressCircle
                    :model-value="getReservationProgress(request.startDate, request.endDate)"
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
                <div class="flex items-center justify-end gap-2">
                  <BaseButton
                    v-if="canEdit"
                    size="sm"
                    rounded="lg"
                    variant="default"
                    @click="handleEdit(request.id)"
                  >
                    <Icon name="lucide:pencil" class="size-4" />
                    <span>Edit</span>
                  </BaseButton>
                  <BaseButton
                    size="sm"
                    rounded="lg"
                    variant="default"
                    @click="handleCreateNote(request.id)"
                  >
                    <Icon name="lucide:message-square-plus" class="size-4" />
                    <span>Note</span>
                  </BaseButton>
                </div>
              </TairoTableCell>
            </TairoTableRow>
          </TairoTable>
        </template>

        <template v-else>
          <BaseCard rounded="lg" class="p-6">
            <p class="text-muted-500 dark:text-muted-400 text-center text-sm">
              No archived requests
            </p>
          </BaseCard>
        </template>
      </div>
    </template>

    <!-- Note Modal -->
    <RequestNoteModal
      v-model:open="noteModalOpen"
      :request-id="selectedRequestId"
    />

    <!-- Edit Modal -->
    <RequestEditModal
      v-model:open="editModalOpen"
      :request-id="selectedRequestId"
      @updated="handleEditUpdated"
    />

    <!-- Extension Confirmation Modal -->
    <RequestExtensionConfirmModal
      v-model:open="extensionConfirmModalOpen"
      :duration="pendingExtensionDuration"
      @confirm="handleExtendConfirmed"
      @cancel="handleExtendCancelled"
    />
  </div>
</template>
