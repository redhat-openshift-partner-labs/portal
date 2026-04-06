// composables/useDashboard.ts

export interface DashboardStats {
  totalLabs: number
  activeLabs: number
  deniedLabs: number
  completedLabs: number
}

export interface CostOverview {
  thisYear: number[]
  lastYear: number[]
  months: string[]
}

export interface LabsSummary {
  created: number[]
  completed: number[]
  totalCreated: number
  totalCompleted: number
  months: string[]
}

export interface Company {
  id: number
  name: string
  logoUrl: string | null
}

export interface RequestsByType {
  total: number
  breakdown: Array<{
    requestType: string
    label: string
    count: number
    byState: Array<{ state: string, count: number }>
  }>
}

// New analytics types
export interface LabsByCompanyData {
  readonly data: readonly { readonly company: string, readonly count: number }[]
  readonly other: number
}

export interface ActiveByCompanyData {
  readonly data: readonly { readonly company: string, readonly count: number }[]
}

export interface ExtensionStatsData {
  readonly byStatus: {
    readonly approved: number
    readonly pending: number
    readonly denied: number
  }
  readonly byDuration: readonly {
    readonly duration: string
    readonly label: string
    readonly count: number
  }[]
  readonly byMonth: readonly {
    readonly month: string
    readonly approved: number
    readonly pending: number
    readonly denied: number
  }[]
}

export interface AuditActivityData {
  readonly byDate: readonly {
    readonly date: string
    readonly count: number
  }[]
  readonly byLoginType: { readonly [x: string]: number }
  readonly byHour: readonly number[]
}

export interface RequestFunnelData {
  readonly pending: number
  readonly approved: number
  readonly running: number
  readonly completed: number
  readonly denied: number
}

export interface DashboardData {
  stats: DashboardStats
  costOverview: CostOverview
  labsSummary: LabsSummary
  companies: Company[]
  requestsByType: RequestsByType
  // Analytics data
  labsByCompany: LabsByCompanyData | null
  activeByCompany: ActiveByCompanyData | null
  extensionStats: ExtensionStatsData | null
  auditActivity: AuditActivityData | null
  requestFunnel: RequestFunnelData | null
}

export const useDashboard = () => {
  const data = useState<DashboardData | null>('dashboard-data', () => null)
  const pending = useState('dashboard-pending', () => false)
  const error = useState<Error | null>('dashboard-error', () => null)

  const refresh = async () => {
    if (pending.value) return

    pending.value = true
    error.value = null

    try {
      const [
        stats,
        costOverview,
        labsSummary,
        companies,
        requestsByType,
        labsByCompany,
        activeByCompany,
        extensionStats,
        auditActivity,
        requestFunnel,
      ] = await Promise.all([
        $fetch<DashboardStats>('/api/dashboard/stats'),
        $fetch<CostOverview>('/api/dashboard/cost-overview'),
        $fetch<LabsSummary>('/api/dashboard/labs-summary'),
        $fetch<Company[]>('/api/dashboard/companies'),
        $fetch<RequestsByType>('/api/dashboard/requests-by-type'),
        $fetch<LabsByCompanyData>('/api/dashboard/labs-by-company'),
        $fetch<ActiveByCompanyData>('/api/dashboard/active-by-company'),
        $fetch<ExtensionStatsData>('/api/dashboard/extension-stats'),
        $fetch<AuditActivityData>('/api/dashboard/audit-activity'),
        $fetch<RequestFunnelData>('/api/dashboard/request-funnel'),
      ])

      data.value = {
        stats,
        costOverview,
        labsSummary,
        companies,
        requestsByType,
        labsByCompany,
        activeByCompany,
        extensionStats,
        auditActivity,
        requestFunnel,
      }
    }
    catch (e) {
      error.value = e as Error
    }
    finally {
      pending.value = false
    }
  }

  return {
    data: readonly(data),
    pending: readonly(pending),
    error: readonly(error),
    refresh,
  }
}
