export default defineEventHandler(async (event) => {
  requireAuth(event)

  const id = getRouterParam(event, 'id')
  if (!id || isNaN(Number(id))) {
    throw createError({ statusCode: 400, message: 'Invalid request ID' })
  }

  const lab = await prisma.lab.findUnique({
    where: { id: Number(id) },
    include: {
      company: {
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
        },
      },
      noteRecords: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      extensionRequests: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      audits: {
        orderBy: {
          accessTime: 'desc',
        },
      },
    },
  })

  if (!lab) {
    throw createError({ statusCode: 404, message: 'Request not found' })
  }

  return {
    id: lab.id,
    clusterId: lab.clusterId,
    generatedName: lab.generatedName,
    cluster: lab.clusterName,
    company: lab.company ? {
      id: lab.company.id,
      name: lab.company.companyName,
      logoUrl: lab.company.logoUrl,
    } : null,
    companyName: lab.companyName,
    timezone: lab.region,
    status: lab.state,
    startDate: lab.startDate.toISOString(),
    endDate: lab.endDate.toISOString(),
    createdAt: lab.createdAt.toISOString(),
    updatedAt: lab.updatedAt.toISOString(),
    // Additional lab-specific fields
    openshiftVersion: lab.openshiftVersion,
    clusterSize: lab.clusterSize,
    cloudProvider: lab.cloudProvider,
    requestType: lab.requestType,
    partner: lab.partner,
    sponsor: lab.sponsor,
    primaryContact: {
      firstName: lab.primaryFirst,
      lastName: lab.primaryLast,
      email: lab.primaryEmail,
    },
    secondaryContact: {
      firstName: lab.secondaryFirst,
      lastName: lab.secondaryLast,
      email: lab.secondaryEmail,
    },
    region: lab.region,
    alwaysOn: lab.alwaysOn,
    projectName: lab.projectName,
    leaseTime: lab.leaseTime,
    description: lab.description,
    internalNotes: lab.notes,
    hold: lab.hold,
    notes: lab.noteRecords.map((note) => ({
      id: note.id,
      content: note.note,
      author: note.userId ? { name: note.userId } : null,
      immutable: note.immutable,
      createdAt: note.createdAt.toISOString(),
    })),
    extensionHistory: lab.extensionRequests.map((ext) => ({
      id: ext.id,
      extension: ext.extension,
      requestedBy: ext.currentUser,
      date: ext.date?.toISOString() ?? null,
      status: ext.status,
      createdAt: ext.createdAt?.toISOString() ?? null,
    })),
    clusterLogins: lab.audits.map((audit) => ({
      id: audit.id,
      loginName: audit.loginName,
      loginType: audit.loginType,
      accessTime: audit.accessTime?.toISOString() ?? null,
    })),
  }
})
