import { BaseDatabase, ModelRegistry, browserModelClasses, migrate } from '@tupaia/database';

import { DatatrakWebModelRegistry } from '../types';
import { DatatrakDatabase } from './DatatrakDatabase';

export const createDatabase = async (): Promise<{
  database: DatatrakDatabase;
  models: DatatrakWebModelRegistry;
}> => {
  const database = new DatatrakDatabase();

  await migrate(database);

  const models = new ModelRegistry(
    database as BaseDatabase,
    browserModelClasses,
  ) as DatatrakWebModelRegistry;

  return { database, models };
};
