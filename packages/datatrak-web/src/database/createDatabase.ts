import { ModelRegistry, MigrationManager } from '@tupaia/database';

import { DatatrakDatabase } from './DatatrakDatabase';

export const createDatabase = async () => {
  console.log('4');
  const database = new DatatrakDatabase();
  const models = new ModelRegistry(database);

  // TODO: Move this to when app is started when service worker is set up
   const migrationManager = new MigrationManager(database);
   await migrationManager.initialize();
   await migrationManager.migrate();
  return { models };
};
