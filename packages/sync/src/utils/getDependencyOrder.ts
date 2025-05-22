import { compact, groupBy, mapValues } from 'lodash';

import { TupaiaDatabase } from '@tupaia/database';

interface Dependency {
  table_name: string;
  depends_on: string;
}

export async function getDependencyOrder(database: TupaiaDatabase): Promise<string[]> {
  const sorted: string[] = [];
  const dependencies = (await database.executeSql(`
    WITH all_tables AS (
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ),

    foreign_keys AS (
      SELECT
        tc.table_name   AS child_table,
        ccu.table_name  AS parent_table
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.constraint_schema = kcu.constraint_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.constraint_schema = tc.constraint_schema
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
    )

    SELECT DISTINCT
      t.table_name      AS table_name,
      fk.parent_table   AS depends_on
    FROM
      all_tables t
      LEFT JOIN foreign_keys fk
        ON t.table_name = fk.child_table
    ORDER BY
      t.table_name, fk.parent_table;
  `)) as Dependency[];
  const groupedDependencies = new Map(
    Object.entries(
      mapValues(groupBy(dependencies, 'table_name'), v => compact(v.map(d => d.depends_on))),
    ),
  );

  console.log('groupedDependencies', groupedDependencies);
  while (groupedDependencies.size > 0) {
    for (const [modelName, dependsOn] of groupedDependencies) {
      // console.log('modelName', modelName);
      // console.log('sorted', sorted);
      const dependenciesStillToSort = dependsOn.filter(
        d => groupedDependencies.has(d) && d !== modelName,
      );
      if (dependenciesStillToSort.length === 0) {
        sorted.push(modelName);
        groupedDependencies.delete(modelName);
      }
    }
  }

  console.log('sorted', sorted);

  return sorted;
}
