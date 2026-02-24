export default defineEventHandler(async (event) => {
  requireAuth(event)

  const companies = await prisma.company.findMany({
    orderBy: { companyName: 'asc' },
    select: {
      id: true,
      companyName: true,
      logoUrl: true,
    },
  })

  // Map companyName to name for API response compatibility
  return companies.map((company) => ({
    id: company.id,
    name: company.companyName,
    logoUrl: company.logoUrl,
  }))
})
