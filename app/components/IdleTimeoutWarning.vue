<script setup lang="ts">
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

defineProps<{
  open: boolean
  secondsRemaining: number
}>()

const emit = defineEmits<{
  stayLoggedIn: []
}>()

const handleStayLoggedIn = () => {
  emit('stayLoggedIn')
}
</script>

<template>
  <DialogRoot :open="open">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-[100] bg-muted-800/70 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out"
      />
      <DialogContent
        class="fixed left-1/2 top-1/2 z-[101] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-muted-200 bg-white p-6 shadow-xl dark:border-muted-700 dark:bg-muted-800 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out"
        @escape-key-down.prevent
        @pointer-down-outside.prevent
        @interact-outside.prevent
      >
        <div class="mb-4 flex items-center gap-3">
          <div class="flex size-10 items-center justify-center rounded-full bg-warning-100 dark:bg-warning-500/20">
            <Icon name="ph:clock-duotone" class="size-5 text-warning-500" />
          </div>
          <DialogTitle class="text-lg font-semibold text-muted-800 dark:text-muted-100">
            Session Timeout
          </DialogTitle>
        </div>

        <DialogDescription class="mb-6 text-sm text-muted-500 dark:text-muted-400">
          Your session will expire due to inactivity.
          <span class="mt-2 block font-medium text-muted-700 dark:text-muted-200">
            Time remaining: {{ secondsRemaining }} second{{ secondsRemaining !== 1 ? 's' : '' }}
          </span>
        </DialogDescription>

        <div class="flex justify-end">
          <BaseButton
            color="primary"
            @click="handleStayLoggedIn"
          >
            Stay Logged In
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
