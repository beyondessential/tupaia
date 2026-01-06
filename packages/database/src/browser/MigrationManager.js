export class MigrationManager {
  client = null;
  config = null;

  constructor(client) {
    this.client = client;
  }

  async initialize() {
    await this.createMigrationsTable();
  }

  async close() {
    await this.client.close();
  }

  async createMigrationsTable() {
    await this.client.executeSql(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        run_on TIMESTAMP DEFAULT NOW()
      );
    `);
  }

  async loadMigrationFiles() {
    // For loading migration files in the browser
    const migrationFiles = import.meta.glob('../core/migrations/*.js', { eager: true });
    const migrations = [];

    const sortedMigrationFiles = Object.fromEntries(
      Object.entries(migrationFiles).sort((a, b) => a[0].localeCompare(b[0])),
    );

    for (const [name, migrationModule] of Object.entries(sortedMigrationFiles)) {
      /** @type {('browser' | 'server')[]} */
      const targets = migrationModule._meta?.targets || [];

      // Only run migration if it is intended for the browser
      if (!targets.includes('browser')) {
        continue;
      }

      migrations.push({
        name,
        // Wrap the up/down functions to handle both direct SQL and db.runSql format
        up: async database => {
          await migrationModule.up({
            runSql: sql => database.executeSql(sql),
          });
        },
        down: async database => {
          await migrationModule.down({
            runSql: sql => database.executeSql(sql),
          });
        },
      });
    }

    return migrations;
  }

  async getExecutedMigrations() {
    return await this.client.executeSql('SELECT * FROM migrations ORDER BY run_on ASC');
  }

  async migrate() {
    console.groupCollapsed('Processing migrations');
    const startTime = performance.now();
    try {
      const migrations = await this.loadMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      const pendingMigrations = migrations.filter(
        m => !executedMigrations.find(em => em.name === m.name),
      );

      if (pendingMigrations.length === 0) {
        console.log('No migrations to execute');
        return;
      }

      //wrap in transaction to ensure atomicity
      await this.client.wrapInTransaction(async database => {
        for (const migration of pendingMigrations) {
          console.log(`Executing migration: ${migration.name}`);
          await migration.up(database); // Now calls the wrapped function
          await database.executeSql('INSERT INTO migrations (name, run_on) VALUES (?, NOW())', [
            migration.name,
          ]);
          console.log(`Successfully executed migration ${migration.name}`);
        }
      });
    } catch (error) {
      console.error(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    } finally {
      console.groupEnd();
      console.log(`Processed migrations in ${performance.now() - startTime} ms`);
    }
  }

  async rollback(steps = 1) {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationsToRollback = executedMigrations.slice(-steps);

      if (migrationsToRollback.length === 0) {
        console.log('No migrations to rollback');
        return;
      }

      await this.client.transaction(async transaction => {
        for (const migration of migrationsToRollback.reverse()) {
          await transaction.exec(migration.down);
          await transaction.exec('DELETE FROM migrations WHERE name = $1', [migration.name]);
          console.log(`Successfully rolled back migration ${migration.name}`);
        }
      });
    } catch (error) {
      console.error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
