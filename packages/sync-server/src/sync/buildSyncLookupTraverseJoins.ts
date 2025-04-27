export function buildSyncLookupTraverseJoins(tablesToTraverse: string[]) {
  return tablesToTraverse
    .slice(1)
    .map(
      (table, i) => `
        LEFT JOIN ${table} ON ${tablesToTraverse[i]}.${table}_id = ${table}.id
      `,
    )
    .join('\n');
}
