export interface IdleTimeoutOptions {
  /** Inactivity timeout in milliseconds (default: 10 minutes) */
  timeout?: number
  /** Show warning X milliseconds before logout (default: 1 minute) */
  warningTime?: number
  /** Callback when warning should show */
  onWarning?: () => void
  /** Callback on timeout (default: logout) */
  onTimeout?: () => void
}

const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
] as const

const TEN_MINUTES = 10 * 60 * 1000
const ONE_MINUTE = 60 * 1000

export const useIdleTimeout = (options: IdleTimeoutOptions = {}) => {
  const {
    timeout = TEN_MINUTES,
    warningTime = ONE_MINUTE,
    onWarning,
    onTimeout,
  } = options

  const { user, logout } = useAuth()

  const isWarningVisible = ref(false)
  const secondsRemaining = ref(0)

  let idleTimer: ReturnType<typeof setTimeout> | null = null
  let warningTimer: ReturnType<typeof setTimeout> | null = null
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  const clearTimers = () => {
    if (idleTimer) {
      clearTimeout(idleTimer)
      idleTimer = null
    }
    if (warningTimer) {
      clearTimeout(warningTimer)
      warningTimer = null
    }
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  const handleTimeout = () => {
    clearTimers()
    isWarningVisible.value = false
    if (onTimeout) {
      onTimeout()
    } else {
      logout()
    }
  }

  const showWarning = () => {
    isWarningVisible.value = true
    secondsRemaining.value = Math.ceil(warningTime / 1000)
    onWarning?.()

    // Start countdown
    countdownInterval = setInterval(() => {
      secondsRemaining.value--
      if (secondsRemaining.value <= 0) {
        if (countdownInterval) {
          clearInterval(countdownInterval)
          countdownInterval = null
        }
      }
    }, 1000)
  }

  const resetTimers = () => {
    clearTimers()
    isWarningVisible.value = false

    // Only set timers if user is authenticated
    if (!user.value) return

    // Set warning timer (fires warningTime ms before timeout)
    const warningDelay = timeout - warningTime
    if (warningDelay > 0) {
      warningTimer = setTimeout(showWarning, warningDelay)
    }

    // Set timeout timer
    idleTimer = setTimeout(handleTimeout, timeout)
  }

  const handleActivity = () => {
    // Only reset if warning is not visible, or always reset to dismiss warning
    resetTimers()
  }

  const stayLoggedIn = () => {
    resetTimers()
  }

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // User came back to tab, reset timers
      resetTimers()
    }
  }

  const start = () => {
    if (!import.meta.client) return

    // Add event listeners for activity
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true })
    })

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Start the timers
    resetTimers()
  }

  const stop = () => {
    if (!import.meta.client) return

    clearTimers()
    isWarningVisible.value = false

    // Remove event listeners
    ACTIVITY_EVENTS.forEach((event) => {
      window.removeEventListener(event, handleActivity)
    })

    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  // Watch for auth state changes
  watch(
    () => user.value,
    (newUser) => {
      if (newUser) {
        start()
      } else {
        stop()
      }
    },
    { immediate: true }
  )

  // Cleanup on unmount
  onUnmounted(() => {
    stop()
  })

  return {
    isWarningVisible: readonly(isWarningVisible),
    secondsRemaining: readonly(secondsRemaining),
    stayLoggedIn,
    start,
    stop,
  }
}
