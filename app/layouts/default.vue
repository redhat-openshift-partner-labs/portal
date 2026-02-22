<script setup lang="ts">
const { logout } = useAuth()
const { isWarningVisible, secondsRemaining, stayLoggedIn } = useIdleTimeout()
</script>

<template>
  <TairoCollapseLayout>
    <TairoCollapseSidebar>
      <TairoCollapseSidebarHeader>My App</TairoCollapseSidebarHeader>
      <TairoCollapseSidebarLinks class="px-4 space-y-1 grow">
        <TairoCollapseSidebarLink
          to="/dashboard"
          label="Dashboard"
          icon="ph:chart-line-duotone"
        />
        <TairoCollapseSidebarLink
          to="/requests"
          label="Requests"
          icon="ph:git-pull-request-duotone"
        />
        <TairoCollapseSidebarLink
          to="/docs"
          label="Docs"
          icon="ph:book-open-duotone"
        />
        <TairoCollapseSidebarLink
          to="/archive"
          label="Archive"
          icon="ph:archive-duotone"
        />
      </TairoCollapseSidebarLinks>
      <div class="px-4 pb-4">
        <button
          class="text-muted-500 hover:text-primary-500 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors"
          @click="logout"
        >
          <Icon name="ph:sign-out-duotone" class="size-5" />
          <span>Logout</span>
        </button>
      </div>
    </TairoCollapseSidebar>

    <TairoCollapseContent>
      <slot />
    </TairoCollapseContent>

    <IdleTimeoutWarning
      :open="isWarningVisible"
      :seconds-remaining="secondsRemaining"
      @stay-logged-in="stayLoggedIn"
    />
  </TairoCollapseLayout>
</template>