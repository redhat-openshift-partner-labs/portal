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
}>()

const open = defineModel<boolean>('open', { default: false })

const noteContent = ref('')
const isImmutable = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

const handleSubmit = async () => {
  if (!props.requestId || !noteContent.value.trim()) return

  submitting.value = true
  error.value = null

  try {
    const { addNote } = useRequestDetail(props.requestId)
    await addNote(noteContent.value.trim(), isImmutable.value)
    noteContent.value = ''
    isImmutable.value = false
    open.value = false
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to add note'
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  noteContent.value = ''
  isImmutable.value = false
  error.value = null
  open.value = false
}

watch(open, (isOpen) => {
  if (!isOpen) {
    noteContent.value = ''
    isImmutable.value = false
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
            Add Note
          </DialogTitle>
          <DialogClose as-child>
            <BaseButtonIcon size="sm" rounded="full" @click="handleCancel">
              <Icon name="lucide:x" class="size-4" />
            </BaseButtonIcon>
          </DialogClose>
        </div>

        <DialogDescription class="mb-4 text-sm text-muted-500 dark:text-muted-400">
          Add a note to this reservation request.
        </DialogDescription>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <BaseTextarea
              v-model="noteContent"
              placeholder="Enter your note..."
              :rows="4"
              :disabled="submitting"
            />
          </div>

          <div class="mb-4">
            <BaseCheckbox
              v-model="isImmutable"
              :disabled="submitting"
              color="primary"
              label="Make immutable"
            />
            <p class="text-muted-400 mt-1 ms-7 text-xs">
              Immutable notes cannot be edited after creation
            </p>
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
              :disabled="submitting || !noteContent.trim()"
              :loading="submitting"
            >
              Add Note
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
