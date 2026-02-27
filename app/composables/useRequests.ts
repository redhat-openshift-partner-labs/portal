// composables/useRequests.ts

export interface RequestCompany {
  id: number
  name: string
  logoUrl: string | null
}

export interface RequestItem {
  id: number
  cluster: string
  generatedName: string
  company: RequestCompany
  timezone: string
  status: 'Pending' | 'Approved' | 'Running' | 'Hibernating' | 'Denied' | 'Completed'
  startDate: string
  endDate: string
  completedAt: string | null
  notesCount: number
  requestType: string
}

export interface NoteAuthor {
  id: number
  name: string
  picture: string | null
}

export interface RequestNote {
  id: number
  content: string
  author: NoteAuthor | null
  immutable: boolean
  createdAt: string
}

export interface ExtensionHistoryItem {
  id: number
  extension: string | null
  requestedBy: string | null
  date: string | null
  status: string | null
  createdAt: string | null
}

export interface ClusterLogin {
  id: number
  loginName: string | null
  loginType: string | null
  accessTime: string | null
}

export interface ContactInfo {
  firstName: string
  lastName: string
  email: string
}

export interface RequestDetail extends Omit<RequestItem, 'notesCount'> {
  createdAt: string
  updatedAt: string
  notes: RequestNote[]
  extensionHistory: ExtensionHistoryItem[]
  clusterLogins: ClusterLogin[]
  openshiftVersion: string
  requestType: string
  sponsor: string
  primaryContact: ContactInfo
  secondaryContact: ContactInfo
  description: string
  leaseTime: string
}

export const useRequests = () => {
  const requests = useState<RequestItem[]>('requests-list', () => [])
  const pending = useState('requests-pending', () => false)
  const error = useState<Error | null>('requests-error', () => null)

  const refresh = async () => {
    if (pending.value) return

    pending.value = true
    error.value = null

    try {
      requests.value = await $fetch<RequestItem[]>('/api/requests?type=active')
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      pending.value = false
    }
  }

  const extendRequest = async (id: number, duration: '3d' | '1w' | '2w' | '1mo') => {
    const result = await $fetch<RequestItem>(`/api/requests/${id}/extend`, {
      method: 'POST',
      body: { duration },
    })

    // Update the request in the list
    const index = requests.value.findIndex(r => r.id === id)
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

  return {
    requests: readonly(requests),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    extendRequest,
    addNote,
  }
}

export const useRequestDetail = (id: number | Ref<number>) => {
  const resolvedId = toRef(id)
  const request = useState<RequestDetail | null>(`request-detail-${toValue(id)}`, () => null)
  const pending = useState(`request-detail-pending-${toValue(id)}`, () => false)
  const error = useState<Error | null>(`request-detail-error-${toValue(id)}`, () => null)

  const refresh = async () => {
    if (pending.value) return

    pending.value = true
    error.value = null

    try {
      request.value = await $fetch<RequestDetail>(`/api/requests/${resolvedId.value}`)
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      pending.value = false
    }
  }

  const extendRequest = async (duration: '3d' | '1w' | '2w' | '1mo') => {
    const result = await $fetch<RequestItem & { extension: ExtensionHistoryItem }>(`/api/requests/${resolvedId.value}/extend`, {
      method: 'POST',
      body: { duration },
    })

    if (request.value) {
      request.value = {
        ...request.value,
        endDate: result.endDate,
        extensionHistory: [result.extension, ...request.value.extensionHistory],
      }
    }

    return result
  }

  const addNote = async (content: string, immutable = false) => {
    const result = await $fetch<RequestNote>(`/api/requests/${resolvedId.value}/notes`, {
      method: 'POST',
      body: { content, immutable },
    })

    if (request.value) {
      request.value = {
        ...request.value,
        notes: [result, ...request.value.notes],
      }
    }

    return result
  }

  return {
    request: readonly(request),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
    extendRequest,
    addNote,
  }
}
