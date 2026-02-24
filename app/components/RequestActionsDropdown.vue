<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'reka-ui'

const props = defineProps<{
  requestId: number
}>()

const emit = defineEmits<{
  extend: [duration: '3d' | '1w' | '2w' | '1mo']
  createNote: []
}>()

const handleExtend = (duration: '3d' | '1w' | '2w' | '1mo') => {
  emit('extend', duration)
}

const handleCreateNote = () => {
  emit('createNote')
}

const handleViewDetails = () => {
  navigateTo(`/requests/${props.requestId}`)
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <BaseButtonIcon size="sm" rounded="lg">
        <Icon name="lucide:more-horizontal" class="size-4" />
      </BaseButtonIcon>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-44 rounded-lg border border-muted-200 bg-white p-1.5 shadow-lg dark:border-muted-700 dark:bg-muted-800"
        :side-offset="5"
        align="end"
      >
        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleViewDetails"
        >
          <Icon name="lucide:eye" class="size-4" />
          <span>Details</span>
        </DropdownMenuItem>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            class="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          >
            <div class="flex items-center gap-3">
              <Icon name="lucide:calendar-plus" class="size-4" />
              <span>Extend</span>
            </div>
            <Icon name="lucide:chevron-right" class="size-3" />
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              class="min-w-32 rounded-lg border border-muted-200 bg-white p-1.5 shadow-lg dark:border-muted-700 dark:bg-muted-800"
              :side-offset="8"
            >
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
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator class="my-1 h-px bg-muted-200 dark:bg-muted-700" />

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleCreateNote"
        >
          <Icon name="lucide:message-square-plus" class="size-4" />
          <span>Create Note</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
