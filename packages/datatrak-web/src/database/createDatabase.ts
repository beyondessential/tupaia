import { ModelRegistry, migrate } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';
import { DatatrakWebModelRegistry } from '../types/model';

export const createDatabase = async (): Promise<{
  database: DatatrakDatabase;
  models: DatatrakWebModelRegistry;
}> => {
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database) as DatatrakWebModelRegistry;

  await migrate(database);
  return { database, models };
};
