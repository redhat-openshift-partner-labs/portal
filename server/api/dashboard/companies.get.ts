interface Company {
  id: number
  name: string
  logo_url: string | null
}

export default defineEventHandler(async (event) => {
  requireAuth(event)

  const companies = await query<Company>(`
    SELECT id, name, logo_url
    FROM companies
    ORDER BY name
  `)

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    logoUrl: company.logo_url,
  }))
})
