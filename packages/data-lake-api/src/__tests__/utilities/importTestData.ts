import { SqlQuery } from '@tupaia/database';
import { DataLakeDatabase } from '../../DataLakeDatabase';

const columns = [
  'entity_code',
  'date',
  'data_element_code',
  'data_group_code',
  'event_id',
  'value',
  'value_type',
];

export const importTestData = async (
  database: DataLakeDatabase,
  data: Record<string, string>[],
) => {
  const dataRows = data.map(analytic => columns.map(column => analytic[column]));
  const query = new SqlQuery<void>(
    `
      INSERT INTO analytics ("${columns.join('", "')}")
      ${SqlQuery.values(dataRows)}
  `,
    dataRows.flat(),
  );
  await query.executeOnDatabase(database);
};
