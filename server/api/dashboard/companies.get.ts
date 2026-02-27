import { getDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const db = await getDb()
  const companies = await db.company.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
    },
  })

  // Map companyName to name for API response compatibility
  return companies.map(company => ({
    id: company.id,
    name: company.companyName,
    logoUrl: company.logoUrl,
  }))
})
