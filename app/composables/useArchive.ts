// composables/useArchive.ts

import type { RequestItem, RequestNote } from './useRequests'

export interface DenialReason {
  reason: string
  deniedBy: string
  deniedAt: string
}

export const useArchive = () => {
  const requests = useState<RequestItem[]>('archive-list', () => [])
  const pending = useState('archive-pending', () => false)
  const error = useState<Error | null>('archive-error', () => null)

  const refresh = async () => {
    if (pending.value) return

    pending.value = true
    error.value = null

    try {
      requests.value = await $fetch<RequestItem[]>('/api/requests?type=archived')
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      pending.value = false
    }
  }

  const addNote = async (id: number, content: string, immutable = false) => {
    const result = await $fetch<RequestNote>(`/api/requests/${id}/notes`, {
      method: 'POST',
      body: { content, immutable },
    })

    // Update notes count in the list
    const index = requests.value.findIndex(r => r.id === id)
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

  const fetchDenialReason = async (id: number): Promise<DenialReason | null> => {
    return await $fetch<DenialReason | null>(`/api/requests/${id}/denial-reason`)
  }

  const denyRequest = async (id: number, reason: string) => {
    const result = await $fetch(`/api/requests/${id}/deny`, {
      method: 'POST',
      body: { reason },
    })

    // Update the request status in the list
    const index = requests.value.findIndex(r => r.id === id)
    if (index !== -1) {
      const existingRequest = requests.value[index]
      if (existingRequest) {
        requests.value[index] = {
          ...existingRequest,
          status: 'Denied',
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
    addNote,
    fetchDenialReason,
    denyRequest,
  }
}
