// composables/useCompanyRequests.ts

import type { RequestItem, RequestNote } from './useRequests'

export const useCompanyRequests = (companyId: number | Ref<number>) => {
  const resolvedId = toRef(companyId)
  const requests = useState<RequestItem[]>(`company-requests-${toValue(companyId)}`, () => [])
  const pending = useState(`company-requests-pending-${toValue(companyId)}`, () => false)
  const error = useState<Error | null>(`company-requests-error-${toValue(companyId)}`, () => null)

  const refresh = async () => {
    if (pending.value) return

    pending.value = true
    error.value = null

    try {
      requests.value = await $fetch<RequestItem[]>(`/api/requests?company=${resolvedId.value}`)
    } catch (e) {
      error.value = e as Error
    } finally {
      pending.value = false
    }
  }

  const extendRequest = async (id: number, duration: '3d' | '1w' | '2w' | '1mo') => {
    const result = await $fetch<RequestItem>(`/api/requests/${id}/extend`, {
      method: 'POST',
      body: { duration },
    })

    // Update the request in the list
    const index = requests.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const existingRequest = requests.value[index]
      if (existingRequest) {
        requests.value[index] = { ...existingRequest, endDate: result.endDate }
      }
    }

    return result
  }

  const addNote = async (id: number, content: string, immutable = false) => {
    const result = await $fetch<RequestNote>(`/api/requests/${id}/notes`, {
      method: 'POST',
      body: { content, immutable },
    })

    // Update notes count in the list
    const index = requests.value.findIndex((r) => r.id === id)
    if (index !== -1) {
      const existingRequest = requests.value[index]
      if (existingRequest) {
        requests.value[index] = {
          ...existingRequest,
          notesCount: existingRequest.notesCount + 1,
        }
      }
    }

    return result
  }

  return {
    requests: readonly(requests),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    extendRequest,
    addNote,
  }
}
