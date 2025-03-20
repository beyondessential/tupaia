import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import { getConnectionConfig } from './getConnectionConfig';

const DEFAULT_MIGRATIONS_PATH = path.resolve(__dirname, '/packages/database/src/core/migrations');

export class MigrationManager {
  client = null;
  config = null;

  constructor(config = {}) {
    this.config = {
      ...config,
      migrationsPath: config.migrationsPath || DEFAULT_MIGRATIONS_PATH,
      logger: config.logger || {
        info: message => console.log(message),
        error: message => console.error(message),
      },
    };
    this.client = new PGlite(getConnectionConfig);
  }

  async initialize() {
    await this.createMigrationsTable();
  }

  async close() {
    await this.client.close();
  }

  async createMigrationsTable() {
    await this.client.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async loadMigrationFiles() {
    const migrationFiles = import.meta.glob('../../core/migrations/*.js', { eager: true });
    const migrations = [];

    const sortedMigrationFiles = Object.fromEntries(
      Object.entries(migrationFiles).sort((a, b) => a[0].localeCompare(b[0])),
    );

    for (const [name, migrationModule] of Object.entries(sortedMigrationFiles)) {
      const targets = migrationModule._meta.targets || [];

      // Only run migration if it is intended for the browser
      if (!targets.includes('browser')) {
        continue;
      }

      const version = migrationModule._meta.version;

      migrations.push({
        version,
        name,
        // Wrap the up/down functions to handle both direct SQL and db.runSql format
        up: async () => {
          await migrationModule.up({
            runSql: sql => this.client.exec(sql),
          });
        },
        down: async () => {
          await migrationModule.down({
            runSql: sql => this.client.exec(sql),
          });
        },
      });
    }
  }

  async getExecutedMigrations() {
    const result = await this.client.query('SELECT * FROM migrations ORDER BY version ASC');
    return result.rows;
  }

  async migrate() {
    const { logger } = this.config;
    try {
      const migrations = await this.loadMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();
      const pendingMigrations = migrations.filter(
        m => !executedMigrations.find(em => em.version === m.version),
      );

      //wrap in transaction to ensure atomicity
      await this.client.transaction(async transaction => {
        for (const migration of pendingMigrations) {
          logger.info(`Executing migration ${migration.version}: ${migration.name}`);
          await migration.up(); // Now calls the wrapped function
          await transaction.exec('INSERT INTO migrations (version, name) VALUES ($1, $2)', [
            migration.version,
            migration.name,
          ]);
          logger.info(`Successfully executed migration ${migration.version}`);
        }
      });
    } catch (error) {
      logger.error(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  async rollback(steps = 1) {
    const { logger } = this.config;
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationsToRollback = executedMigrations.slice(-steps);

      if (migrationsToRollback.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }

      const migrations = await this.loadMigrationFiles();

      await this.client.transaction(async transaction => {
        for (const migrationRecord of migrationsToRollback.reverse()) {
          const migration = migrations.find(m => m.version === migrationRecord.version);
          if (!migration) {
            throw new Error(`Migration file not found for version ${migrationRecord.version}`);
          }

          logger.info(`Rolling back migration ${migration.version}: ${migration.name}`);
          await transaction.exec(migration.down);
          await transaction.exec('DELETE FROM migrations WHERE version = $1', [migration.version]);
          logger.info(`Successfully rolled back migration ${migration.version}`);
        }
      });
    } catch (error) {
      logger.error(`Rollback failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
