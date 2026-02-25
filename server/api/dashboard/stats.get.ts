import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const db = await getDb()
  const [totalLabs, activeLabs, deniedLabs, completedLabs] = await Promise.all([
    db.lab.count(),
    db.lab.count({ where: { state: { in: ['Running', 'Hibernating'] } } }),
    db.lab.count({ where: { state: 'Denied' } }),
    db.lab.count({ where: { state: 'Completed' } }),
  ])

  return {
    totalLabs,
    activeLabs,
    deniedLabs,
    completedLabs,
  }
})
