export interface DashboardStats {
  total_labs: number
  active_labs: number
  total_users: number
  completed_sessions: number
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const [stats] = await query<DashboardStats>(`
    SELECT
      (SELECT COUNT(*) FROM labs) as total_labs,
      (SELECT COUNT(*) FROM labs WHERE status = 'active') as active_labs,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM sessions WHERE completed = true) as completed_sessions
  `)

  return {
    totalLabs: Number(stats?.total_labs ?? 0),
    activeLabs: Number(stats?.active_labs ?? 0),
    totalUsers: Number(stats?.total_users ?? 0),
    completedSessions: Number(stats?.completed_sessions ?? 0),
  }
})
