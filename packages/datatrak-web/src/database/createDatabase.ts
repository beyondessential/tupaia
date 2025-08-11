import { ModelRegistry, browserModelClasses, migrate } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';
import { DatatrakWebModelRegistry } from '../types';

export const createDatabase = async (): Promise<{
  database: DatatrakDatabase;
  models: DatatrakWebModelRegistry;
}> => {
  const database = new DatatrakDatabase();

  await migrate(database);

  await database.waitForChangeChannel();

  const models = new ModelRegistry(database, browserModelClasses) as DatatrakWebModelRegistry;

  return { database, models };
};
