<template>
  <TairoCollapseLayout>
    <TairoCollapseSidebar>
      <TairoCollapseSidebarHeader>My App</TairoCollapseSidebarHeader>
      <TairoCollapseSidebarLinks class="px-4 space-y-1 grow">
        <TairoCollapseSidebarLink
          to="/dashboard"
          label="Dashboard"
          icon="solar:chart-2-outline"
        />
        <TairoCollapseSidebarLink
          to="/users"
          label="Users"
          icon="solar:users-group-rounded-outline"
        />
        <TairoCollapseSidebarLink
          to="/reports"
          label="Reports"
          icon="solar:document-text-outline"
        />
        <TairoCollapseSidebarLink
          to="/settings"
          label="Settings"
          icon="solar:settings-outline"
        />
      </TairoCollapseSidebarLinks>
    </TairoCollapseSidebar>

    <TairoCollapseContent>
      <slot />
    </TairoCollapseContent>
  </TairoCollapseLayout>
</template>