<script setup lang="ts">
import { differenceInDays, parseISO, format } from 'date-fns'

const route = useRoute()
const router = useRouter()

const requestId = computed(() => Number(route.params.id))

definePageMeta({
  layout: 'default'
})

const { request, pending, error, refresh, extendRequest, addNote } = useRequestDetail(requestId)

// Note modal state
const noteModalOpen = ref(false)
const extending = ref(false)

useHead({
  title: computed(() => request.value ? `${request.value.cluster} - Requests` : 'Request Details')
})

// Refresh on mount
onMounted(() => {
  refresh()
})

// Calculate reservation progress percentage
const reservationProgress = computed(() => {
  if (!request.value) return 0
  const start = parseISO(request.value.startDate)
  const end = parseISO(request.value.endDate)
  const now = new Date()
  const totalDays = differenceInDays(end, start)
  if (totalDays <= 0) return 100
  const elapsedDays = differenceInDays(now, start)
  return Math.round(Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)))
})

// Days remaining
const daysRemaining = computed(() => {
  if (!request.value) return 0
  const end = parseISO(request.value.endDate)
  const now = new Date()
  const days = differenceInDays(end, now)
  return Math.max(0, days)
})

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

// Handle extend
const handleExtend = async (duration: '1w' | '2w' | '1mo') => {
  extending.value = true
  try {
    await extendRequest(duration)
  } catch (e) {
    console.error('Failed to extend:', e)
  } finally {
    extending.value = false
  }
}

// Handle add note
const handleAddNote = async (content: string) => {
  try {
    await addNote(content)
    noteModalOpen.value = false
  } catch (e) {
    console.error('Failed to add note:', e)
    throw e
  }
}

// Format date for display
const formatDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

// Format relative time for notes
const formatNoteDate = (dateStr: string) => {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a')
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Back Navigation -->
    <div>
      <NuxtLink
        to="/requests"
        class="text-muted-500 hover:text-primary-500 inline-flex items-center gap-2 transition-colors"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        <span class="text-sm">Back to Requests</span>
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
    >
      <Icon name="ph:warning-circle-duotone" class="size-5 text-red-500" />
      <p class="text-sm text-red-700 dark:text-red-400">
        Failed to load request details. Please try again.
      </p>
      <button
        class="ml-auto text-sm font-medium text-red-700 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200"
        @click="refresh"
      >
        Retry
      </button>
    </div>

    <!-- Loading State -->
    <template v-if="pending && !request">
      <BaseCard rounded="lg" class="p-8">
        <div class="flex flex-col items-center justify-center gap-4">
          <Icon name="ph:spinner" class="text-primary-500 size-8 animate-spin" />
          <p class="text-muted-500 dark:text-muted-400">Loading request details...</p>
        </div>
      </BaseCard>
    </template>

    <!-- Request Details -->
    <template v-else-if="request">
      <!-- Header Card -->
      <BaseCard rounded="lg" class="p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="bg-primary-500/10 flex size-14 shrink-0 items-center justify-center rounded-xl">
              <Icon name="ph:cube-duotone" class="text-primary-500 size-7" />
            </div>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-muted-800 dark:text-white text-xl font-semibold">
                  {{ request.cluster }}
                </h1>
                <BaseTag
                  :color="getStatusColor(request.status)"
                  rounded="full"
                  size="sm"
                >
                  {{ request.status }}
                </BaseTag>
              </div>
              <div class="text-muted-500 dark:text-muted-400 mt-1 flex items-center gap-4 text-sm">
                <span class="flex items-center gap-1">
                  <Icon name="ph:buildings-duotone" class="size-4" />
                  {{ request.company.name }}
                </span>
                <span class="flex items-center gap-1">
                  <Icon name="ph:globe-duotone" class="size-4" />
                  {{ request.timezone }}
                </span>
              </div>
            </div>
          </div>

          <!-- Extend Actions -->
          <div class="flex items-center gap-2">
            <template v-if="extending">
              <Icon name="ph:spinner" class="text-primary-500 size-5 animate-spin" />
            </template>
            <template v-else>
              <BaseButton size="sm" color="muted" @click="handleExtend('1w')">
                +1 Week
              </BaseButton>
              <BaseButton size="sm" color="muted" @click="handleExtend('2w')">
                +2 Weeks
              </BaseButton>
              <BaseButton size="sm" color="primary" @click="handleExtend('1mo')">
                +1 Month
              </BaseButton>
            </template>
          </div>
        </div>
      </BaseCard>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <!-- Reservation Progress -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <BaseProgressCircle
              :model-value="reservationProgress"
              :size="64"
              :thickness="4"
            />
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Reservation Progress
              </p>
              <p class="text-muted-800 dark:text-white text-2xl font-semibold">
                {{ reservationProgress }}%
              </p>
              <p class="text-muted-400 text-xs">
                {{ daysRemaining }} days remaining
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Start Date -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-green-500/10">
              <Icon name="ph:calendar-check-duotone" class="size-6 text-green-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Start Date
              </p>
              <p class="text-muted-800 dark:text-white text-xl font-semibold">
                {{ formatDate(request.startDate) }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- End Date -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              <Icon name="ph:calendar-x-duotone" class="size-6 text-red-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                End Date
              </p>
              <p class="text-muted-800 dark:text-white text-xl font-semibold">
                {{ formatDate(request.endDate) }}
              </p>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Notes Section -->
      <BaseCard rounded="lg" class="p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-muted-800 dark:text-white text-lg font-semibold">
            Notes
          </h2>
          <BaseButton size="sm" color="primary" @click="noteModalOpen = true">
            <Icon name="lucide:plus" class="me-1 size-4" />
            Add Note
          </BaseButton>
        </div>

        <!-- Empty Notes -->
        <template v-if="request.notes.length === 0">
          <div class="flex flex-col items-center justify-center gap-3 py-8">
            <div class="bg-muted-100 dark:bg-muted-800 flex size-12 items-center justify-center rounded-full">
              <Icon name="ph:note-duotone" class="text-muted-400 size-6" />
            </div>
            <p class="text-muted-500 dark:text-muted-400 text-sm">
              No notes yet. Add one to get started.
            </p>
          </div>
        </template>

        <!-- Notes List -->
        <template v-else>
          <div class="space-y-4">
            <div
              v-for="note in request.notes"
              :key="note.id"
              class="border-muted-200 dark:border-muted-700 rounded-lg border p-4"
            >
              <div class="mb-2 flex items-center gap-3">
                <template v-if="note.author">
                  <img
                    v-if="note.author.picture"
                    :src="note.author.picture"
                    :alt="note.author.name"
                    class="size-8 rounded-full object-cover"
                  >
                  <div
                    v-else
                    class="bg-primary-500/10 text-primary-500 flex size-8 items-center justify-center rounded-full text-sm font-semibold"
                  >
                    {{ note.author.name.charAt(0) }}
                  </div>
                  <div>
                    <p class="text-muted-800 dark:text-white text-sm font-medium">
                      {{ note.author.name }}
                    </p>
                    <p class="text-muted-400 text-xs">
                      {{ formatNoteDate(note.createdAt) }}
                    </p>
                  </div>
                </template>
                <template v-else>
                  <div class="bg-muted-100 dark:bg-muted-700 flex size-8 items-center justify-center rounded-full">
                    <Icon name="ph:user-duotone" class="text-muted-400 size-4" />
                  </div>
                  <div>
                    <p class="text-muted-500 dark:text-muted-400 text-sm">
                      Unknown Author
                    </p>
                    <p class="text-muted-400 text-xs">
                      {{ formatNoteDate(note.createdAt) }}
                    </p>
                  </div>
                </template>
              </div>
              <p class="text-muted-600 dark:text-muted-300 text-sm">
                {{ note.content }}
              </p>
            </div>
          </div>
        </template>
      </BaseCard>
    </template>

    <!-- Note Modal (for detail page) -->
    <RequestNoteModal
      v-model:open="noteModalOpen"
      :request-id="request?.id ?? null"
    />
  </div>
</template>
