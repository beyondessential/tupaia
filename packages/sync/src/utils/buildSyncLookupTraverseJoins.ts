import { DatabaseModel } from '@tupaia/database';

import { buildSyncLookupSelect } from './buildSyncLookupSelect';

export function buildSyncLookupTraverseJoins(
  tablesToTraverse: string[],
  customForeignKeys?: Record<
    string,
    { fromTable: string; fromKey: string; toTable: string; toKey: string }
  >,
) {
  return tablesToTraverse
    .slice(1)
    .map((table, i) => {
      const previousTable = tablesToTraverse[i];

      // Check if there's a custom foreign key relation defined
      const customRelation = customForeignKeys?.[`${previousTable}_${table}`];

      if (customRelation) {
        return `
          LEFT JOIN ${customRelation.toTable} ON ${customRelation.fromTable}.${customRelation.fromKey} = ${customRelation.toTable}.${customRelation.toKey}
        `;
      }

      // Default to standard naming convention
      return `
        LEFT JOIN ${table} ON ${previousTable}.${table}_id = ${table}.id
      `;
    })
    .join('\n');
}
