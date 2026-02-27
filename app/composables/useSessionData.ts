// composables/useSessionData.ts
export const useSessionData = () => {
  const data = useState<Record<string, unknown> | null>('session_data', () => null)

  const refresh = async () => {
    try {
      const response = await $fetch('/api/session/data')
      data.value = response as Record<string, unknown> | null
    }
    catch {
      data.value = null
    }
  }

  const clear = () => {
    data.value = null
  }

  return {
    data: readonly(data),
    refresh,
    clear,
  }
}
