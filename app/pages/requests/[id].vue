<script setup lang="ts">
import { differenceInDays, parseISO, format } from 'date-fns'

const route = useRoute()
const router = useRouter()

const requestId = computed(() => Number(route.params.id))
const fromArchive = computed(() => route.query.from === 'archive')

definePageMeta({
  layout: 'default'
})

const { request, pending, error, refresh, extendRequest, addNote } = useRequestDetail(requestId)
const { canEdit } = useAuth()

// Modal state
const noteModalOpen = ref(false)
const editModalOpen = ref(false)
const extending = ref(false)
const extensionConfirmModalOpen = ref(false)
const pendingExtensionDuration = ref<'3d' | '1w' | '2w' | '1mo' | null>(null)

useHead({
  title: computed(() => request.value ? `${request.value.generatedName} - Requests` : 'Request Details')
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

// Check if request is archived (Denied or Completed)
const isArchived = computed(() => {
  if (!request.value) return false
  return ['Denied', 'Completed'].includes(request.value.status)
})

// Back link based on where user came from
const backLink = computed(() => fromArchive.value ? '/archive' : '/requests')
const backLabel = computed(() => fromArchive.value ? 'Back to Archive' : 'Back to Requests')

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
const initiateExtend = (duration: '3d' | '1w' | '2w' | '1mo') => {
  pendingExtensionDuration.value = duration
  extensionConfirmModalOpen.value = true
}

// Handle confirmed extension
const handleExtendConfirmed = async () => {
  if (!pendingExtensionDuration.value) return

  extending.value = true
  try {
    await extendRequest(pendingExtensionDuration.value)
  } catch (e) {
    console.error('Failed to extend:', e)
  } finally {
    extending.value = false
    pendingExtensionDuration.value = null
  }
}

// Handle extension cancelled
const handleExtendCancelled = () => {
  pendingExtensionDuration.value = null
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
        :to="backLink"
        class="text-muted-500 hover:text-primary-500 inline-flex items-center gap-2 transition-colors"
      >
        <Icon name="lucide:arrow-left" class="size-4" />
        <span class="text-sm">{{ backLabel }}</span>
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
                  {{ request.generatedName }}
                </h1>
                <BaseTag
                  variant="none"
                  rounded="full"
                  size="sm"
                  :class="getStatusClasses(request.status)"
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

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Extend Actions (hidden for archived requests) -->
            <template v-if="!isArchived">
              <template v-if="extending">
                <Icon name="ph:spinner" class="text-primary-500 size-5 animate-spin" />
              </template>
              <template v-else>
                <BaseButton size="sm" color="muted" @click="initiateExtend('3d')">
                  +3 Days
                </BaseButton>
                <BaseButton size="sm" color="muted" @click="initiateExtend('1w')">
                  +1 Week
                </BaseButton>
                <BaseButton size="sm" color="muted" @click="initiateExtend('2w')">
                  +2 Weeks
                </BaseButton>
                <BaseButton size="sm" color="primary" @click="initiateExtend('1mo')">
                  +1 Month
                </BaseButton>
              </template>
            </template>
            <!-- Edit Button (only for users with edit permission, not for archived requests) -->
            <BaseButton
              v-if="canEdit && !isArchived"
              size="sm"
              color="default"
              @click="editModalOpen = true"
            >
              <Icon name="lucide:pencil" class="me-1 size-4" />
              Edit
            </BaseButton>
          </div>
        </div>
      </BaseCard>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-4">
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

        <!-- Submitted -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-14 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Icon name="ph:paper-plane-tilt-duotone" class="size-6 text-blue-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Submitted
              </p>
              <p class="text-muted-800 dark:text-white text-xl font-semibold">
                {{ formatDate(request.createdAt) }}
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

      <!-- Request Details -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <!-- OpenShift Version -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-500/10">
              <Icon name="ph:cube-duotone" class="size-6 text-rose-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                OpenShift Version
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.openshiftVersion || 'N/A' }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Request Type -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10">
              <Icon name="ph:tag-duotone" class="size-6 text-amber-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Request Type
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.requestType || 'N/A' }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Reservation (Lease Time) -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
              <Icon name="ph:clock-duotone" class="size-6 text-cyan-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Reservation
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.leaseTime || 'N/A' }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Sponsor -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
              <Icon name="ph:handshake-duotone" class="size-6 text-purple-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Sponsor
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.sponsor || 'N/A' }}
              </p>
            </div>
          </div>
        </BaseCard>

        <!-- Primary Contact -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sky-500/10">
              <Icon name="ph:user-duotone" class="size-6 text-sky-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Primary Contact
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.primaryContact?.firstName }} {{ request.primaryContact?.lastName }}
              </p>
              <a
                v-if="request.primaryContact?.email"
                :href="`mailto:${request.primaryContact.email}`"
                class="text-primary-500 hover:text-primary-600 text-sm"
              >
                {{ request.primaryContact.email }}
              </a>
            </div>
          </div>
        </BaseCard>

        <!-- Secondary Contact -->
        <BaseCard rounded="lg" class="p-5">
          <div class="flex items-center gap-4">
            <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
              <Icon name="ph:user-duotone" class="size-6 text-teal-500" />
            </div>
            <div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                Secondary Contact
              </p>
              <p class="text-muted-800 dark:text-white text-lg font-semibold">
                {{ request.secondaryContact?.firstName }} {{ request.secondaryContact?.lastName }}
              </p>
              <a
                v-if="request.secondaryContact?.email"
                :href="`mailto:${request.secondaryContact.email}`"
                class="text-primary-500 hover:text-primary-600 text-sm"
              >
                {{ request.secondaryContact.email }}
              </a>
            </div>
          </div>
        </BaseCard>
      </div>

      <!-- Description -->
      <BaseCard v-if="request.description" rounded="lg" class="p-5">
        <div class="flex gap-4">
          <div class="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
            <Icon name="ph:text-align-left-duotone" class="size-6 text-indigo-500" />
          </div>
          <div>
            <p class="text-muted-500 dark:text-muted-400 mb-2 text-sm">
              Description
            </p>
            <p class="text-muted-700 dark:text-muted-300 text-sm whitespace-pre-wrap">
              {{ request.description }}
            </p>
          </div>
        </div>
      </BaseCard>

      <!-- Notes Section -->
      <div class="grid grid-cols-12 gap-6">
        <BaseCard rounded="lg" class="col-span-12 p-6 md:col-span-6">
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
          <div class="max-h-[400px] space-y-4 overflow-y-auto">
            <div
              v-for="note in request.notes"
              :key="note.id"
              class="border-muted-200 dark:border-muted-700 rounded-lg border p-4"
            >
              <div class="mb-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
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
                <div v-if="note.immutable" class="flex items-center gap-1 text-muted-400" title="This note cannot be edited">
                  <Icon name="lucide:lock" class="size-3.5" />
                  <span class="text-xs">Immutable</span>
                </div>
              </div>
              <p class="text-muted-600 dark:text-muted-300 text-sm">
                {{ note.content }}
              </p>
            </div>
          </div>
        </template>
        </BaseCard>

        <!-- Extensions Log -->
        <BaseCard rounded="lg" class="col-span-12 p-6 md:col-span-3">
          <h2 class="text-muted-800 dark:text-white mb-4 text-lg font-semibold">
            Extension History
          </h2>

          <!-- Empty Extensions -->
          <template v-if="!request.extensionHistory || request.extensionHistory.length === 0">
            <div class="flex flex-col items-center justify-center gap-3 py-8">
              <div class="bg-muted-100 dark:bg-muted-800 flex size-12 items-center justify-center rounded-full">
                <Icon name="ph:calendar-plus-duotone" class="text-muted-400 size-6" />
              </div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                No extensions yet.
              </p>
            </div>
          </template>

          <!-- Extensions List -->
          <template v-else>
            <div class="max-h-[320px] space-y-3 overflow-y-auto">
              <div
                v-for="ext in request.extensionHistory"
                :key="ext.id"
                class="border-muted-200 dark:border-muted-700 rounded-lg border p-3"
              >
                <p class="text-muted-800 dark:text-white text-sm font-medium">
                  {{ ext.extension || 'Unknown' }}
                </p>
                <p class="text-muted-500 dark:text-muted-400 mt-1 text-xs">
                  {{ ext.requestedBy || 'Unknown user' }}
                </p>
                <p class="text-muted-400 mt-1 text-xs">
                  {{ ext.date ? formatDate(ext.date) : 'No date' }}
                </p>
              </div>
            </div>
          </template>
        </BaseCard>

        <!-- Cluster Logins Log -->
        <BaseCard rounded="lg" class="col-span-12 p-6 md:col-span-3">
          <h2 class="text-muted-800 dark:text-white mb-4 text-lg font-semibold">
            Cluster Logins
          </h2>

          <!-- Empty Logins -->
          <template v-if="!request.clusterLogins || request.clusterLogins.length === 0">
            <div class="flex flex-col items-center justify-center gap-3 py-8">
              <div class="bg-muted-100 dark:bg-muted-800 flex size-12 items-center justify-center rounded-full">
                <Icon name="ph:sign-in-duotone" class="text-muted-400 size-6" />
              </div>
              <p class="text-muted-500 dark:text-muted-400 text-sm">
                No logins recorded.
              </p>
            </div>
          </template>

          <!-- Logins List -->
          <template v-else>
            <div class="max-h-[320px] space-y-3 overflow-y-auto">
              <div
                v-for="login in request.clusterLogins"
                :key="login.id"
                class="border-muted-200 dark:border-muted-700 rounded-lg border p-3"
              >
                <p class="text-muted-800 dark:text-white text-sm font-medium">
                  {{ login.loginName || 'Unknown' }}
                </p>
                <p class="text-muted-500 dark:text-muted-400 mt-1 text-xs">
                  {{ login.loginType || 'unknown' }}
                </p>
                <p class="text-muted-400 mt-1 text-xs">
                  {{ login.accessTime ? formatDate(login.accessTime) : 'No access time' }}
                </p>
              </div>
            </div>
          </template>
        </BaseCard>
      </div>
    </template>

    <!-- Note Modal (for detail page) -->
    <RequestNoteModal
      v-model:open="noteModalOpen"
      :request-id="request?.id ?? null"
      :force-immutable="isArchived"
    />

    <!-- Edit Modal -->
    <RequestEditModal
      v-model:open="editModalOpen"
      :request-id="request?.id ?? null"
      @updated="refresh"
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
