export function buildWhereQuery(filters: Record<string, any>, alias: string) {
  const params: any[] = [];
  const where: string[] = [];

  for (const key in filters) {
    const value = filters[key];
    if (!value) continue;

    params.push(`%${value}%`);
    where.push(`(${alias}.${key} ILIKE $${params.length})`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(" AND ")}` : "";

  return { whereSQL, params };
}
