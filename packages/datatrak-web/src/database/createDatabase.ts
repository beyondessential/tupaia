import { ModelRegistry } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';
// import { MigrationManager } from './MigrationManager';

export const createDatabase = async () => {
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database);

  // TODO: Move this to when app is started when service worker is set up
  //  const migrationManager = new MigrationManager(database);
  //  await migrationManager.initialize();
  //  await migrationManager.migrate();
  return { models };
};
