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

const props = defineProps<{
  requestId: number | null
  requestName?: string
}>()

const emit = defineEmits<{
  denied: []
}>()

const open = defineModel<boolean>('open', { default: false })

const reason = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (!props.requestId || !reason.value.trim()) return

  submitting.value = true
  error.value = null

  try {
    await $fetch(`/api/requests/${props.requestId}/deny`, {
      method: 'POST',
      body: { reason: reason.value.trim() },
    })
    reason.value = ''
    emit('denied')
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to deny request'
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  reason.value = ''
  error.value = null
  open.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    reason.value = ''
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
            Deny Request
          </DialogTitle>
          <DialogClose as-child>
            <BaseButtonIcon size="sm" rounded="full" @click="handleCancel">
              <Icon name="lucide:x" class="size-4" />
            </BaseButtonIcon>
          </DialogClose>
        </div>

        <DialogDescription class="mb-4 text-sm text-muted-500 dark:text-muted-400">
          <template v-if="requestName">
            You are about to deny <strong class="text-muted-700 dark:text-muted-200">{{ requestName }}</strong>.
          </template>
          <template v-else>
            You are about to deny this request.
          </template>
          Please provide a reason for the denial.
        </DialogDescription>

        <!-- Warning banner -->
        <div class="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
          <Icon name="ph:warning-duotone" class="size-5 shrink-0 text-amber-500" />
          <p class="text-sm text-amber-700 dark:text-amber-400">
            This action cannot be undone. Once denied, the request cannot be edited.
          </p>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-medium text-muted-700 dark:text-muted-300 mb-2">
              Reason for Denial <span class="text-danger-500">*</span>
            </label>
            <BaseTextarea
              v-model="reason"
              placeholder="Enter the reason for denying this request..."
              :rows="4"
              :disabled="submitting"
            />
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
              color="danger"
              :disabled="submitting || !reason.trim()"
              :loading="submitting"
            >
              Deny Request
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
