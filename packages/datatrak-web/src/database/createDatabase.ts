import { ModelRegistry, migrate } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';

export const createDatabase = async () => {
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database);

  await migrate(database);
  return { models };
};
