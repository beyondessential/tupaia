import { initSyncComponents } from '../core/sync/initSyncComponents';
import { MigrationManager } from './MigrationManager';

class DatatrakDatabaseAdapter {
  constructor(database) {
    this.database = database;
  }

  async runSql(sql) {
    const results = await this.database.executeSql(sql);
    return { rows: results };
  }
}

export const migrate = async database => {
  const migrationManager = new MigrationManager(database);
  await migrationManager.initialize();
  await migrationManager.migrate();

  await initSyncComponents(new DatatrakDatabaseAdapter(database), true);
};
