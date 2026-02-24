<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'
import type { RequestNote } from '~/composables/useRequests'

const props = defineProps<{
  requestId: number | null
}>()

const emit = defineEmits<{
  updated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const VALID_STATUSES = ['Pending', 'Active', 'Approved', 'Running', 'Hibernating', 'Denied', 'Completed']

const IANA_TIMEZONES = [
  { value: 'America/New_York', label: 'America/New_York (Eastern)' },
  { value: 'America/Chicago', label: 'America/Chicago (Central)' },
  { value: 'America/Denver', label: 'America/Denver (Mountain)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (Pacific)' },
  { value: 'America/Anchorage', label: 'America/Anchorage (Alaska)' },
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (Hawaii)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore (SGT)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST)' },
  { value: 'Australia/Perth', label: 'Australia/Perth (AWST)' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland (NZST)' },
  { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (BRT)' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
]

// Form state
const status = ref('')
const timezone = ref('')
const notes = ref<(RequestNote & { edited: boolean; newContent: string })[]>([])
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

// Fetch request data when modal opens
const fetchRequest = async () => {
  if (!props.requestId) return

  loading.value = true
  error.value = null

  try {
    const data = await $fetch<{
      status: string
      timezone: string
      notes: RequestNote[]
    }>(`/api/requests/${props.requestId}`)

    status.value = data.status
    timezone.value = data.timezone
    notes.value = data.notes.map((note) => ({
      ...note,
      edited: false,
      newContent: note.content,
    }))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load request'
  } finally {
    loading.value = false
  }
}

// Track if any changes were made
const hasChanges = computed(() => {
  return notes.value.some((note) => note.edited && note.newContent !== note.content)
})

const handleNoteEdit = (noteId: number, content: string) => {
  const note = notes.value.find((n) => n.id === noteId)
  if (note) {
    note.newContent = content
    note.edited = content !== note.content
  }
}

const handleSubmit = async () => {
  if (!props.requestId) return

  submitting.value = true
  error.value = null

  try {
    // Update request status and timezone
    await $fetch(`/api/requests/${props.requestId}`, {
      method: 'PATCH',
      body: { status: status.value, timezone: timezone.value },
    })

    // Update edited notes
    const editedNotes = notes.value.filter((note) => note.edited && !note.immutable)
    for (const note of editedNotes) {
      await $fetch(`/api/requests/${props.requestId}/notes/${note.id}`, {
        method: 'PATCH',
        body: { content: note.newContent },
      })
    }

    emit('updated')
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to save changes'
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  error.value = null
  open.value = false
}

watch(open, (isOpen) => {
  if (isOpen && props.requestId) {
    fetchRequest()
  } else {
    status.value = ''
    timezone.value = ''
    notes.value = []
    error.value = null
  }
})
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-[100] bg-muted-800/70 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-[101] w-full max-w-2xl max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl border border-muted-200 bg-white p-6 shadow-xl dark:border-muted-700 dark:bg-muted-800 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"
      >
        <div class="mb-4 flex items-center justify-between">
          <DialogTitle class="text-lg font-semibold text-muted-800 dark:text-muted-100">
            Edit Request
          </DialogTitle>
          <DialogClose as-child>
            <BaseButtonIcon size="sm" rounded="full" @click="handleCancel">
              <Icon name="lucide:x" class="size-4" />
            </BaseButtonIcon>
          </DialogClose>
        </div>

        <DialogDescription class="mb-4 text-sm text-muted-500 dark:text-muted-400">
          Edit the request status, timezone, and notes.
        </DialogDescription>

        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Icon name="ph:spinner" class="size-8 animate-spin text-primary-500" />
        </div>

        <!-- Form -->
        <form v-else @submit.prevent="handleSubmit">
          <!-- Status Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Status
            </label>
            <select
              v-model="status"
              :disabled="submitting"
              class="w-full rounded-lg border border-muted-300 bg-muted-50 px-3 py-2 text-sm text-muted-600 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-muted-700 dark:bg-muted-900 dark:text-muted-200"
            >
              <option v-for="s in VALID_STATUSES" :key="s" :value="s">
                {{ s }}
              </option>
            </select>
          </div>

          <!-- Timezone Field -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Timezone
            </label>
            <select
              v-model="timezone"
              :disabled="submitting"
              class="w-full rounded-lg border border-muted-300 bg-muted-50 px-3 py-2 text-sm text-muted-600 transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-muted-700 dark:bg-muted-900 dark:text-muted-200"
            >
              <option v-for="tz in IANA_TIMEZONES" :key="tz.value" :value="tz.value">
                {{ tz.label }}
              </option>
            </select>
          </div>

          <!-- Notes Section -->
          <div v-if="notes.length > 0" class="mb-4">
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Notes ({{ notes.length }})
            </label>
            <div class="space-y-3 max-h-72 overflow-y-auto pr-1">
              <div
                v-for="note in notes"
                :key="note.id"
                class="rounded-lg border border-muted-200 dark:border-muted-700 p-3"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-muted-600 dark:text-muted-300">
                      {{ note.author?.name || 'Unknown' }}
                    </span>
                    <span class="text-xs text-muted-400">
                      {{ new Date(note.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                  <div v-if="note.immutable" class="flex items-center gap-1 text-muted-400">
                    <Icon name="lucide:lock" class="size-3.5" />
                    <span class="text-xs">Immutable</span>
                  </div>
                </div>
                <BaseTextarea
                  :model-value="note.newContent"
                  :disabled="submitting || note.immutable"
                  :rows="2"
                  :class="{ 'opacity-60 cursor-not-allowed': note.immutable }"
                  @update:model-value="(val: string) => handleNoteEdit(note.id, val)"
                />
                <p v-if="note.immutable" class="mt-1 text-xs text-muted-400">
                  This note cannot be edited
                </p>
              </div>
            </div>
          </div>

          <div v-if="error" class="mb-4 rounded-lg bg-danger-100 p-3 text-sm text-danger-600 dark:bg-danger-500/20 dark:text-danger-400">
            {{ error }}
          </div>

          <div class="flex justify-end gap-3">
            <BaseButton
              type="button"
              color="muted"
              :disabled="submitting"
              @click="handleCancel"
            >
              Cancel
            </BaseButton>
            <BaseButton
              type="submit"
              color="primary"
              :disabled="submitting"
              :loading="submitting"
            >
              Save Changes
            </BaseButton>
          </div>
        </form>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
}

.animate-fade-in {
  animation: fade-in 150ms ease-out;
}

.animate-fade-out {
  animation: fade-out 150ms ease-in;
}

.animate-scale-in {
  animation: scale-in 150ms ease-out;
}

.animate-scale-out {
  animation: scale-out 150ms ease-in;
}
</style>
