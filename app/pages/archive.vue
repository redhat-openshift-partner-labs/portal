<script setup lang="ts">
import { differenceInDays, parseISO } from 'date-fns'

const route = useRoute()

definePageMeta({
  layout: 'default'
})

useHead({
  title: 'Archive - OpenShift Partner Labs'
})

const { requests, pending, error, refresh, addNote } = useArchive()
const { getLabel: getRequestTypeLabel } = useRequestTypeLabels()

// Status filter from query param
const statusFilter = computed(() => route.query.status as string | undefined)

// Modal state
const noteModalOpen = ref(false)
const selectedRequestId = ref<number | null>(null)
const denialReasonModalOpen = ref(false)
const selectedDenialRequest = ref<{ id: number; name: string } | null>(null)

// Search and pagination state
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizeOptions = [10, 25, 50, 100]

// Refresh on mount
onMounted(() => {
  refresh()
})

// Filtered requests based on status filter and search query
const filteredRequests = computed(() => {
  let result = requests.value

  // Apply status filter from query param (Denied or Completed)
  if (statusFilter.value) {
    result = result.filter((request) => request.status === statusFilter.value)
  }

  // Apply search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter((request) => {
      return (
        request.generatedName.toLowerCase().includes(query) ||
        request.company.name.toLowerCase().includes(query) ||
        request.timezone.toLowerCase().includes(query) ||
        request.status.toLowerCase().includes(query) ||
        request.requestType.toLowerCase().includes(query) ||
        getRequestTypeLabel(request.requestType).toLowerCase().includes(query)
      )
    })
  }

  return result
})

// Pagination computed values
const totalRecords = computed(() => filteredRequests.value.length)
const totalPages = computed(() => Math.ceil(totalRecords.value / pageSize.value))
const startIndex = computed(() => (currentPage.value - 1) * pageSize.value)
const endIndex = computed(() => Math.min(startIndex.value + pageSize.value, totalRecords.value))

// Paginated requests
const paginatedRequests = computed(() => {
  return filteredRequests.value.slice(startIndex.value, endIndex.value)
})

// Reset to page 1 when search or page size changes
watch([searchQuery, pageSize], () => {
  currentPage.value = 1
})

// Pagination navigation
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const goToPrevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToNextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Generate visible page numbers for pagination
const visiblePages = computed(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 3) {
      pages.push(1, 2, 3, 4, 5, -1, total)
    } else if (current >= total - 2) {
      pages.push(1, -1, total - 4, total - 3, total - 2, total - 1, total)
    } else {
      pages.push(1, -1, current - 1, current, current + 1, -1, total)
    }
  }

  return pages
})

// Calculate planned duration (original reservation period)
const getPlannedDuration = (startDate: string, endDate: string): number => {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return Math.max(0, differenceInDays(end, start))
}

// Calculate actual duration (start to completion date)
const getActualDuration = (startDate: string, completedAt: string | null, status: string): number | null => {
  // For Denied requests, there was no actual reservation
  if (status === 'Denied') return null
  // For Completed requests without completedAt (legacy data), return null
  if (!completedAt) return null
  const start = parseISO(startDate)
  const completed = parseISO(completedAt)
  return Math.max(0, differenceInDays(completed, start))
}

// Format duration as human-readable string
const formatDuration = (days: number): string => {
  if (days === 0) return '0 days'
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  const weeks = Math.floor(days / 7)
  const remainingDays = days % 7
  if (remainingDays === 0) {
    return weeks === 1 ? '1 week' : `${weeks} weeks`
  }
  return `${weeks}w ${remainingDays}d`
}

// Determine if actual duration was early, exact, or late compared to planned
const getDurationStatus = (planned: number, actual: number | null): 'early' | 'exact' | 'late' | null => {
  if (actual === null) return null
  if (actual < planned) return 'early'
  if (actual > planned) return 'late'
  return 'exact'
}

// Get icon and color for duration status indicator
const getDurationIndicator = (status: 'early' | 'exact' | 'late' | null) => {
  switch (status) {
    case 'early':
      return { icon: 'ph:arrow-down', color: 'text-emerald-500' }
    case 'exact':
      return { icon: 'ph:arrow-right', color: 'text-sky-500' }
    case 'late':
      return { icon: 'ph:arrow-up', color: 'text-amber-500' }
    default:
      return null
  }
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

// Handle create note action
const handleCreateNote = (requestId: number) => {
  selectedRequestId.value = requestId
  noteModalOpen.value = true
}

// Handle view denial reason action
const handleViewDenialReason = (request: { id: number; generatedName: string }) => {
  selectedDenialRequest.value = { id: request.id, name: request.generatedName }
  denialReasonModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-muted-800 dark:text-white text-2xl font-semibold">
          Archived Requests
        </h1>
        <p class="text-muted-500 dark:text-muted-400 mt-1">
          View denied and completed reservation requests
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

    <!-- Active Filter Indicator -->
    <div
      v-if="statusFilter"
      class="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 p-3 dark:border-primary-800 dark:bg-primary-900/20"
    >
      <Icon name="ph:funnel-duotone" class="size-5 text-primary-500" />
      <p class="text-sm text-primary-700 dark:text-primary-400">
        Showing only <strong>{{ statusFilter }}</strong> requests
      </p>
      <NuxtLink
        to="/archive"
        class="ml-auto text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-200"
      >
        Clear filter
      </NuxtLink>
    </div>

    <!-- Search and Page Size Controls -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <!-- Search Input -->
      <div class="relative w-full sm:max-w-xs">
        <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
          <Icon name="ph:magnifying-glass" class="text-muted-400 size-5" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search archived requests..."
          class="border-muted-300 bg-muted-50 text-muted-600 placeholder:text-muted-300 focus:border-primary-500 focus:ring-primary-500 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-200 dark:placeholder:text-muted-600 dark:focus:border-primary-500 w-full rounded-lg border py-2 pe-4 ps-10 text-sm transition-colors focus:outline-none focus:ring-1"
        >
      </div>

      <!-- Page Size Dropdown -->
      <div class="flex items-center gap-2">
        <span class="text-muted-500 dark:text-muted-400 text-sm">Show</span>
        <select
          v-model="pageSize"
          class="border-muted-300 bg-muted-50 text-muted-600 focus:border-primary-500 focus:ring-primary-500 dark:border-muted-700 dark:bg-muted-800 dark:text-muted-200 dark:focus:border-primary-500 rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-1"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span class="text-muted-500 dark:text-muted-400 text-sm">entries</span>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="error"
      class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <Icon name="ph:warning-circle-duotone" class="size-5 text-red-500" />
      <p class="text-sm text-red-700 dark:text-red-400">
        Failed to load archived requests. Please try again.
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
          <p class="text-muted-500 dark:text-muted-400">Loading archived requests...</p>
        </div>
      </BaseCard>
    </template>

    <!-- Empty State -->
    <template v-else-if="!pending && requests.length === 0 && !error">
      <BaseCard rounded="lg" class="p-8">
        <div class="flex flex-col items-center justify-center gap-4">
          <div class="bg-muted-100 dark:bg-muted-800 flex size-16 items-center justify-center rounded-full">
            <Icon name="ph:archive-duotone" class="text-muted-400 size-8" />
          </div>
          <div class="text-center">
            <h3 class="text-muted-800 dark:text-white text-lg font-semibold">No archived requests</h3>
            <p class="text-muted-500 dark:text-muted-400 mt-1">
              Denied and completed requests will appear here.
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
              No archived requests match "{{ searchQuery }}". Try a different search term.
            </p>
          </div>
        </div>
      </BaseCard>
    </template>

    <!-- Requests Table -->
    <template v-else>
      <TairoTable rounded="lg">
        <template #header>
          <TairoTableHeading uppercase class="ps-4">
            Type
          </TairoTableHeading>
          <TairoTableHeading uppercase>
            Cluster Name
          </TairoTableHeading>
          <TairoTableHeading uppercase>
            Company
          </TairoTableHeading>
          <TairoTableHeading uppercase>
            TimeZone
          </TairoTableHeading>
          <TairoTableHeading uppercase>
            Status
          </TairoTableHeading>
          <TairoTableHeading uppercase>
            Planned/Actual
          </TairoTableHeading>
          <TairoTableHeading uppercase class="pe-4 text-end">
            Action
          </TairoTableHeading>
        </template>

        <TairoTableRow v-for="request in paginatedRequests" :key="request.id">
          <!-- Type Column -->
          <TairoTableCell spaced class="ps-4">
            <span class="text-muted-600 dark:text-muted-300">
              {{ getRequestTypeLabel(request.requestType) }}
            </span>
          </TairoTableCell>

          <!-- Cluster Name Column -->
          <TairoTableCell spaced>
            <div class="flex items-center gap-3">
              <div class="bg-primary-500/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                <Icon name="ph:cube-duotone" class="text-primary-500 size-5" />
              </div>
              <NuxtLink
                :to="`/requests/${request.id}?from=archive`"
                class="text-muted-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 truncate font-medium underline decoration-muted-300 underline-offset-2 transition-colors hover:decoration-primary-500 dark:decoration-muted-600 dark:hover:decoration-primary-400"
              >
                {{ request.generatedName }}
              </NuxtLink>
            </div>
          </TairoTableCell>

          <!-- Company Column -->
          <TairoTableCell spaced>
            <NuxtLink
              :to="`/companies/${request.company.id}/requests`"
              class="text-muted-600 dark:text-muted-300 hover:text-primary-500 dark:hover:text-primary-400 truncate underline decoration-muted-300 underline-offset-2 transition-colors hover:decoration-primary-500 dark:decoration-muted-600 dark:hover:decoration-primary-400"
            >
              {{ request.company.name }}
            </NuxtLink>
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

          <!-- Planned/Actual Duration Column -->
          <TairoTableCell spaced>
            <div class="flex flex-col gap-0.5">
              <span class="text-muted-600 dark:text-muted-300 text-sm">
                {{ formatDuration(getPlannedDuration(request.startDate, request.endDate)) }}
              </span>
              <span class="text-muted-400 dark:text-muted-500 text-xs flex items-center gap-1">
                <template v-if="getActualDuration(request.startDate, request.completedAt, request.status) !== null">
                  <Icon
                    v-if="getDurationIndicator(getDurationStatus(getPlannedDuration(request.startDate, request.endDate), getActualDuration(request.startDate, request.completedAt, request.status)))"
                    :name="getDurationIndicator(getDurationStatus(getPlannedDuration(request.startDate, request.endDate), getActualDuration(request.startDate, request.completedAt, request.status)))!.icon"
                    :class="['size-3', getDurationIndicator(getDurationStatus(getPlannedDuration(request.startDate, request.endDate), getActualDuration(request.startDate, request.completedAt, request.status)))!.color]"
                  />
                  {{ formatDuration(getActualDuration(request.startDate, request.completedAt, request.status)!) }}
                </template>
                <template v-else>
                  N/A
                </template>
              </span>
            </div>
          </TairoTableCell>

          <!-- Action Column -->
          <TairoTableCell spaced class="pe-4 text-end">
            <div class="flex items-center justify-end gap-2">
              <BaseButton
                v-if="request.status === 'Denied'"
                size="sm"
                rounded="lg"
                variant="default"
                @click="handleViewDenialReason(request)"
              >
                <Icon name="ph:x-circle-duotone" class="size-4" />
                <span>Denial Reason</span>
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

      <!-- Pagination -->
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <!-- Results Info -->
        <p class="text-muted-500 dark:text-muted-400 text-sm">
          Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ totalRecords }} entries
        </p>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1" class="flex items-center gap-1">
          <!-- Previous Button -->
          <button
            :disabled="currentPage === 1"
            class="flex size-9 items-center justify-center rounded-lg border transition-colors"
            :class="[
              currentPage === 1
                ? 'border-muted-200 text-muted-300 cursor-not-allowed dark:border-muted-700 dark:text-muted-600'
                : 'border-muted-300 text-muted-500 hover:bg-muted-100 hover:text-muted-700 dark:border-muted-700 dark:text-muted-400 dark:hover:bg-muted-800 dark:hover:text-muted-200'
            ]"
            @click="goToPrevPage"
          >
            <Icon name="lucide:chevron-left" class="size-4" />
          </button>

          <!-- Page Numbers -->
          <template v-for="(page, index) in visiblePages" :key="index">
            <span
              v-if="page === -1"
              class="text-muted-400 flex size-9 items-center justify-center"
            >
              ...
            </span>
            <button
              v-else
              class="flex size-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors"
              :class="[
                page === currentPage
                  ? 'border-primary-500 bg-primary-500 text-white'
                  : 'border-muted-300 text-muted-500 hover:bg-muted-100 hover:text-muted-700 dark:border-muted-700 dark:text-muted-400 dark:hover:bg-muted-800 dark:hover:text-muted-200'
              ]"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </template>

          <!-- Next Button -->
          <button
            :disabled="currentPage === totalPages"
            class="flex size-9 items-center justify-center rounded-lg border transition-colors"
            :class="[
              currentPage === totalPages
                ? 'border-muted-200 text-muted-300 cursor-not-allowed dark:border-muted-700 dark:text-muted-600'
                : 'border-muted-300 text-muted-500 hover:bg-muted-100 hover:text-muted-700 dark:border-muted-700 dark:text-muted-400 dark:hover:bg-muted-800 dark:hover:text-muted-200'
            ]"
            @click="goToNextPage"
          >
            <Icon name="lucide:chevron-right" class="size-4" />
          </button>
        </div>
      </div>
    </template>

    <!-- Note Modal -->
    <RequestNoteModal
      v-model:open="noteModalOpen"
      :request-id="selectedRequestId"
    />

    <!-- Denial Reason Modal -->
    <DenialReasonModal
      v-model:open="denialReasonModalOpen"
      :request-id="selectedDenialRequest?.id ?? null"
      :request-name="selectedDenialRequest?.name"
    />
  </div>
</template>
