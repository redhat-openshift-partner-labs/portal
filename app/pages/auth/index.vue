<script setup lang="ts">
definePageMeta({
  layout: 'empty',
  title: 'Login',
})

const route = useRoute()
const { login } = useAuth()

const handleGoogleLogin = () => {
  const redirectUrl = route.query.redirect as string | undefined
  login(redirectUrl)
}
</script>

<template>
  <div class="dark:bg-muted-900 flex min-h-screen bg-white">
    <!-- Left Panel - Login Form -->
    <div
      class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-2/5 lg:flex-none"
    >
      <div class="dark:bg-muted-900 relative mx-auto w-full max-w-sm bg-white">
        <!-- Branding -->
        <div class="mb-8 text-center">
          <div class="mb-6 flex justify-center">
            <div class="flex size-16 items-center justify-center rounded-xl bg-primary-500">
              <Icon
                name="ph:cube-duotone"
                class="size-8 text-white"
              />
            </div>
          </div>
          <h1 class="text-muted-800 dark:text-white text-2xl font-semibold">
            OpenShift Partner Labs
          </h1>
          <p class="text-muted-500 dark:text-muted-400 mt-2">
            Manage your cluster reservations in one place
          </p>
        </div>

        <!-- Features List -->
        <div class="mb-8 space-y-3">
          <div class="flex items-center gap-3">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
              <Icon
                name="ph:flask-duotone"
                class="size-4 text-primary-500"
              />
            </div>
            <span class="text-muted-600 dark:text-muted-300 text-sm">Manage lab environments</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
              <Icon
                name="ph:clock-duotone"
                class="size-4 text-primary-500"
              />
            </div>
            <span class="text-muted-600 dark:text-muted-300 text-sm">Extend reservations when needed</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-500/10">
              <Icon
                name="ph:chart-line-duotone"
                class="size-4 text-primary-500"
              />
            </div>
            <span class="text-muted-600 dark:text-muted-300 text-sm">Gain valuable insights</span>
          </div>
        </div>

        <!-- Login Button -->
        <button
          id="login"
          class="border-muted-300 dark:border-muted-600 dark:bg-muted-800 focus-visible:nui-focus hover:bg-muted-50 dark:hover:bg-muted-700 relative inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border bg-white px-6 py-4 text-muted-800 transition-colors dark:text-white"
          @click="handleGoogleLogin"
        >
          <Icon
            name="logos:google-icon"
            class="size-5"
          />
          <span class="font-medium">Continue with Google</span>
        </button>

        <!-- Footer Note -->
        <p class="text-muted-400 mt-6 text-center text-xs">
          Access restricted to authorized Red Hat partners
        </p>
      </div>
    </div>

    <!-- Right Panel - Branding -->
    <div
      class="bg-muted-100 dark:bg-muted-800 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-3/5"
    >
      <div class="mx-auto flex w-full max-w-lg flex-col items-center px-8">
        <img
          class="mb-8 w-64"
          src="/img/logos/brands/openshift-logo.svg"
          alt="OpenShift"
          width="256"
          height="256"
        >
        <p class="text-muted-600 dark:text-muted-400 text-center text-lg">
          The trusted platform for enterprise Kubernetes
        </p>
      </div>
    </div>
  </div>
</template>
