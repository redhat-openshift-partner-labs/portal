import { getDb } from '../../utils/db'

export interface ActiveByCompanyData {
  data: Array<{ company: string, count: number }>
}

export default defineEventHandler(async (event): Promise<ActiveByCompanyData> => {
  requireAuth(event)

  const db = await getDb()

  // Get active labs (Running, Hibernating) grouped by company
  const activeByCompany = await db.lab.groupBy({
    by: ['companyName'],
    where: {
      state: {
        in: ['Running', 'Hibernating'],
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  })

  return {
    data: activeByCompany.map(item => ({
      company: item.companyName,
      count: item._count.id,
    })),
  }
})
