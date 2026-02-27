// composables/useDashboard.ts

export interface DashboardStats {
  totalLabs: number
  activeLabs: number
  totalUsers: number
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

export interface DashboardData {
  stats: DashboardStats
  costOverview: CostOverview
  labsSummary: LabsSummary
  companies: Company[]
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
      const [stats, costOverview, labsSummary, companies] = await Promise.all([
        $fetch<DashboardStats>('/api/dashboard/stats'),
        $fetch<CostOverview>('/api/dashboard/cost-overview'),
        $fetch<LabsSummary>('/api/dashboard/labs-summary'),
        $fetch<Company[]>('/api/dashboard/companies'),
      ])

      data.value = {
        stats,
        costOverview,
        labsSummary,
        companies,
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
