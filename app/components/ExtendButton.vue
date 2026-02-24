<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  extend: [duration: '3d' | '1w' | '2w' | '1mo']
}>()

const handleExtend = (duration: '3d' | '1w' | '2w' | '1mo') => {
  emit('extend', duration)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <BaseButton
        size="sm"
        rounded="lg"
        variant="default"
        :disabled="loading"
      >
        <Icon
          v-if="loading"
          name="ph:spinner"
          class="size-4 animate-spin"
        />
        <Icon
          v-else
          name="lucide:calendar-plus"
          class="size-4"
        />
        <span>Extend</span>
      </BaseButton>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-32 rounded-lg border border-muted-200 bg-white p-1.5 shadow-lg dark:border-muted-700 dark:bg-muted-800"
        :side-offset="5"
        align="end"
      >
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleExtend('3d')"
        >
          +3 Days
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleExtend('1w')"
        >
          +1 Week
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleExtend('2w')"
        >
          +2 Weeks
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleExtend('1mo')"
        >
          +1 Month
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
