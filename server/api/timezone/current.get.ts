export default defineEventHandler(async (event) => {
  const { timezone } = getQuery(event)

  if (!timezone || typeof timezone !== 'string') {
    throw createError({ statusCode: 400, message: 'timezone query parameter is required' })
  }

  const data = await $fetch('https://timeapi.io/api/v1/time/current/zone', {
    query: { timezone },
  })

  return data
})