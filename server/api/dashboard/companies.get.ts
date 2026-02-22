export default defineEventHandler(async (event) => {
  requireAuth(event)

  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      logoUrl: true,
    },
  })

  return companies
})
