import { ModelRegistry, browserModelClasses, migrate } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';
import { DatatrakWebModelRegistry } from '../types';

export const createDatabase = async (): Promise<{
  database: DatatrakDatabase;
  models: DatatrakWebModelRegistry;
}> => {
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database, browserModelClasses) as DatatrakWebModelRegistry;

  await migrate(database);
  return { database, models };
};
