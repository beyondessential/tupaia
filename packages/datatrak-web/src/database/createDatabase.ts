import { ModelRegistry, migrate } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';

export const createDatabase = async () => {
  console.log('4');
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database);

  await migrate(database);
  return { models };
};
