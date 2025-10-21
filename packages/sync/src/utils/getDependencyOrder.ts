import { compact, groupBy, mapValues } from 'lodash';

import { BaseDatabase, DatabaseModel } from '@tupaia/database';
import { isNotNullish } from '@tupaia/tsutils';

interface Dependency {
  table_name: string;
  depends_on: string;
}

export async function getDependencyOrder(database: BaseDatabase): Promise<string[]> {
  const sorted: string[] = [];
  const dependencies = (await database.executeSql(`
    WITH all_tables AS (
      SELECT c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
        AND c.relkind = 'r'  -- regular tables only
    ),
    foreign_keys AS (
      SELECT DISTINCT
        cl.relname AS child_table,
        fcl.relname AS depends_on
      FROM pg_constraint con
      JOIN pg_class cl ON con.conrelid = cl.oid
      JOIN pg_class fcl ON con.confrelid = fcl.oid
      JOIN pg_namespace n ON cl.relnamespace = n.oid
      WHERE con.contype = 'f'
        AND n.nspname = 'public'
    )
    SELECT
      t.table_name,
      fk.depends_on
    FROM all_tables t
    LEFT JOIN foreign_keys fk ON t.table_name = fk.child_table
    ORDER BY t.table_name, fk.depends_on;
  `)) as Dependency[];
  const groupedDependencies = new Map(
    Object.entries(
      mapValues(groupBy(dependencies, 'table_name'), v => compact(v.map(d => d.depends_on))),
    ),
  );

  while (groupedDependencies.size > 0) {
    for (const [modelName, dependsOn] of groupedDependencies) {
      const dependenciesStillToSort = dependsOn.filter(
        d => groupedDependencies.has(d) && d !== modelName,
      );
      if (dependenciesStillToSort.length === 0) {
        sorted.push(modelName);
        groupedDependencies.delete(modelName);
      }
    }
  }

  return sorted;
}

export const sortModelsByDependencyOrder = async (
  models: DatabaseModel[],
): Promise<DatabaseModel[]> => {
  const orderedDependencies = await getDependencyOrder(models[0].database);
  const recordNames = new Set(models.map(r => r.databaseRecord));

  return orderedDependencies
    .filter(dep => recordNames.has(dep))
    .map(dep => models.find(r => r.databaseRecord === dep))
    .filter(isNotNullish);
};
