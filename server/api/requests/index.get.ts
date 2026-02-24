export default defineEventHandler(async (event) => {
  requireAuth(event)

  const query = getQuery(event)
  const type = query.type as 'active' | 'archived' | undefined
  const companyId = query.company ? Number(query.company) : undefined

  // Define status filters
  const activeStatuses = ['Pending', 'Active', 'Approved', 'Running', 'Hibernating']
  const archivedStatuses = ['Denied', 'Completed']

  // Build where clause based on type and company filters
  const whereClause = {
    ...(type === 'active' ? { status: { in: activeStatuses } } : {}),
    ...(type === 'archived' ? { status: { in: archivedStatuses } } : {}),
    ...(companyId ? { companyId } : {}),
  }

  const requests = await prisma.request.findMany({
    where: whereClause,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
        },
      },
      _count: {
        select: {
          notes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return requests.map((request) => ({
    id: request.id,
    cluster: request.cluster,
    company: request.company,
    timezone: request.timezone,
    status: request.status,
    startDate: request.startDate.toISOString(),
    endDate: request.endDate.toISOString(),
    notesCount: request._count.notes,
  }))
})
