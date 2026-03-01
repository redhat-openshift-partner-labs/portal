import { getDb } from '../../utils/db'

export interface RequestFunnelData {
  pending: number
  approved: number
  running: number
  completed: number
  denied: number
}

export default defineEventHandler(async (event): Promise<RequestFunnelData> => {
  requireAuth(event)

  const db = await getDb()

  // Get counts for each state
  // The funnel shows how many labs are in each state
  // Pending -> Approved -> Running -> Completed (with Denied as a branch)
  const [pending, approved, running, hibernating, completed, denied] = await Promise.all([
    db.lab.count({ where: { state: 'Pending' } }),
    db.lab.count({ where: { state: 'Approved' } }),
    db.lab.count({ where: { state: 'Running' } }),
    db.lab.count({ where: { state: 'Hibernating' } }),
    db.lab.count({ where: { state: 'Completed' } }),
    db.lab.count({ where: { state: 'Denied' } }),
  ])

  // Combine Running and Hibernating as "Running" for funnel
  // since Hibernating is just a temporary state within the running phase
  return {
    pending,
    approved,
    running: running + hibernating,
    completed,
    denied,
  }
})
