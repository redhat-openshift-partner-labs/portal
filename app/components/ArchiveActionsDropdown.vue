<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'

const props = defineProps<{
  requestId: number
}>()

const emit = defineEmits<{
  createNote: []
}>()

const handleCreateNote = () => {
  emit('createNote')
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger as-child>
      <BaseButtonIcon
        size="sm"
        rounded="lg"
      >
        <Icon
          name="lucide:more-horizontal"
          class="size-4"
        />
      </BaseButtonIcon>
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        class="min-w-44 rounded-lg border border-muted-200 bg-white p-1.5 shadow-lg dark:border-muted-700 dark:bg-muted-800"
        :side-offset="5"
        align="end"
      >
        <DropdownMenuItem
          as="a"
          :href="`/requests/${props.requestId}?from=archive`"
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
        >
          <Icon
            name="lucide:eye"
            class="size-4"
          />
          <span>Details</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          class="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-500 transition-colors hover:bg-muted-100 hover:text-muted-700 dark:text-muted-400 dark:hover:bg-muted-700 dark:hover:text-muted-200"
          @click="handleCreateNote"
        >
          <Icon
            name="lucide:message-square-plus"
            class="size-4"
          />
          <span>Create Note</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
