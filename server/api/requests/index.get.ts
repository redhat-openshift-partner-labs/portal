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
    ...(type === 'active' ? { state: { in: activeStatuses } } : {}),
    ...(type === 'archived' ? { state: { in: archivedStatuses } } : {}),
    ...(companyId ? { companyId } : {}),
  }

  const labs = await prisma.lab.findMany({
    where: whereClause,
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
        },
      },
      _count: {
        select: {
          noteRecords: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Map to request-like response for frontend compatibility
  return labs.map((lab) => ({
    id: lab.id,
    cluster: lab.clusterName,
    generatedName: lab.generatedName,
    company: lab.company ? {
      id: lab.company.id,
      name: lab.company.companyName,
      logoUrl: lab.company.logoUrl,
    } : null,
    companyName: lab.companyName,
    timezone: lab.region, // Map region to timezone for compatibility
    status: lab.state,
    startDate: lab.startDate.toISOString(),
    endDate: lab.endDate.toISOString(),
    notesCount: lab._count.noteRecords,
    cloudProvider: lab.cloudProvider,
    openshiftVersion: lab.openshiftVersion,
    clusterSize: lab.clusterSize,
  }))
})
