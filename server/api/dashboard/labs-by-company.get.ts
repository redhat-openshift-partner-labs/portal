import { getDb } from '../../utils/db'

export interface LabsByCompanyData {
  data: Array<{ company: string, count: number }>
  other: number
}

export default defineEventHandler(async (event): Promise<LabsByCompanyData> => {
  requireAuth(event)

  const db = await getDb()

  // Get all labs grouped by company name
  const labsByCompany = await db.lab.groupBy({
    by: ['companyName'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
  })

  // Take top 10, sum rest as "Other"
  const top10 = labsByCompany.slice(0, 10).map(item => ({
    company: item.companyName,
    count: item._count.id,
  }))

  const otherCount = labsByCompany
    .slice(10)
    .reduce((sum, item) => sum + item._count.id, 0)

  return {
    data: top10,
    other: otherCount,
  }
})
