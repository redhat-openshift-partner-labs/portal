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
  duration: '3d' | '1w' | '2w' | '1mo' | null
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const open = defineModel<boolean>('open', { default: false })

const durationLabel = computed(() => {
  switch (props.duration) {
    case '3d':
      return '3 Days'
    case '1w':
      return '1 Week'
    case '2w':
      return '2 Weeks'
    case '1mo':
      return '1 Month'
    default:
      return ''
  }
})

const handleConfirm = () => {
  emit('confirm')
  open.value = false
}

const handleCancel = () => {
  emit('cancel')
  open.value = false
}
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
            Confirm Extension
          </DialogTitle>
          <DialogClose as-child>
            <BaseButtonIcon size="sm" rounded="full" @click="handleCancel">
              <Icon name="lucide:x" class="size-4" />
            </BaseButtonIcon>
          </DialogClose>
        </div>

        <DialogDescription class="sr-only">
          Confirm that you want to extend the reservation by {{ durationLabel }}.
        </DialogDescription>

        <!-- Warning Icon -->
        <div class="mb-4 flex justify-center">
          <div class="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
            <Icon name="ph:warning-circle-duotone" class="size-10 text-amber-500" />
          </div>
        </div>

        <!-- Warning Message -->
        <div class="mb-6 text-center">
          <p class="text-muted-800 dark:text-muted-100 font-medium mb-2">
            You are about to extend this reservation by {{ durationLabel }}.
          </p>
          <p class="text-muted-600 dark:text-muted-400 text-sm">
            If you continue, a message will be dispatched notifying lab managers of this extension.
          </p>
          <p class="text-amber-600 dark:text-amber-400 text-sm font-medium mt-3">
            Please ensure you have discussed this extension with a manager prior to continuing if you have not already.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <BaseButton
            type="button"
            color="muted"
            @click="handleCancel"
          >
            Cancel
          </BaseButton>
          <BaseButton
            type="button"
            color="primary"
            @click="handleConfirm"
          >
            Confirm Extension
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
