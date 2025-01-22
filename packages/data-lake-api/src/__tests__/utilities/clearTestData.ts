import { SqlQuery } from '@tupaia/database';
import { DataLakeDatabase } from '../../DataLakeDatabase';

export const clearTestData = async (database: DataLakeDatabase) => {
  const query = new SqlQuery<void>('TRUNCATE analytics');
  await query.executeOnDatabase(database);
};
