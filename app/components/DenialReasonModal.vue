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
import { format } from 'date-fns'

interface DenialReason {
  reason: string
  deniedBy: string
  deniedAt: string
}

const props = defineProps<{
  requestId: number | null
  requestName?: string
}>()

const open = defineModel<boolean>('open', { default: false })

const denialReason = ref<DenialReason | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchDenialReason = async () => {
  if (!props.requestId) return

  loading.value = true
  error.value = null

  try {
    const data = await $fetch<DenialReason | null>(`/api/requests/${props.requestId}/denial-reason`)
    denialReason.value = data
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load denial reason'
  }
  finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a')
}

const handleClose = () => {
  error.value = null
  open.value = false
}

watch(open, (isOpen) => {
  if (isOpen && props.requestId) {
    fetchDenialReason()
  }
  else {
    denialReason.value = null
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
        class="fixed left-1/2 top-1/2 z-[101] w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-muted-200 bg-white p-6 shadow-xl dark:border-muted-700 dark:bg-muted-800 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"
      >
        <div class="mb-4 flex items-center justify-between">
          <DialogTitle class="text-lg font-semibold text-muted-800 dark:text-muted-100">
            Denial Reason
          </DialogTitle>
          <DialogClose as-child>
            <BaseButtonIcon
              size="sm"
              rounded="full"
              @click="handleClose"
            >
              <Icon
                name="lucide:x"
                class="size-4"
              />
            </BaseButtonIcon>
          </DialogClose>
        </div>

        <DialogDescription
          v-if="requestName"
          class="mb-4 text-sm text-muted-500 dark:text-muted-400"
        >
          {{ requestName }}
        </DialogDescription>

        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex items-center justify-center py-8"
        >
          <Icon
            name="ph:spinner"
            class="size-8 animate-spin text-primary-500"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="rounded-lg bg-danger-100 p-3 text-sm text-danger-600 dark:bg-danger-500/20 dark:text-danger-400"
        >
          {{ error }}
        </div>

        <!-- No Denial Reason Found -->
        <div
          v-else-if="!denialReason"
          class="py-4 text-center text-sm text-muted-500 dark:text-muted-400"
        >
          No denial reason found for this request.
        </div>

        <!-- Denial Reason Content -->
        <div
          v-else
          class="space-y-4"
        >
          <!-- Reason -->
          <div>
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Reason
            </label>
            <div class="rounded-lg border border-muted-200 bg-muted-50 p-3 text-sm text-muted-700 dark:border-muted-700 dark:bg-muted-900 dark:text-muted-200">
              {{ denialReason.reason }}
            </div>
          </div>

          <!-- Denied By -->
          <div>
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Denied By
            </label>
            <div class="flex items-center gap-2 text-sm text-muted-600 dark:text-muted-300">
              <Icon
                name="ph:user-duotone"
                class="size-4 text-muted-400"
              />
              {{ denialReason.deniedBy }}
            </div>
          </div>

          <!-- Denied At -->
          <div>
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Denied At
            </label>
            <div class="flex items-center gap-2 text-sm text-muted-600 dark:text-muted-300">
              <Icon
                name="ph:calendar-duotone"
                class="size-4 text-muted-400"
              />
              {{ formatDate(denialReason.deniedAt) }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <BaseButton
            type="button"
            color="muted"
            @click="handleClose"
          >
            Close
          </BaseButton>
        </div>
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
