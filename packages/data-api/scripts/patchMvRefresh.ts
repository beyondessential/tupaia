// @ts-expect-error db-migrate has no types unfortunately
import DBMigrate from 'db-migrate';
import { requireEnv } from '@tupaia/utils';
import { getConnectionConfig } from '@tupaia/database';
import { configureEnv } from '../src/configureEnv';

configureEnv(); // Load the environment variables into process.env

const migrationInstance = DBMigrate.getInstance(
  true,
  {
    cwd: `${__dirname}/patches`,
    config: {
      defaultEnv: 'tupaia',
      tupaia: {
        driver: 'pg',
        schema: requireEnv('DB_MV_USER'),
        ...getConnectionConfig({ userEnv: 'DB_MV_USER', passEnv: 'DB_MV_PASSWORD' }),
      },
    },
  },
  async (migrator: any, _internals: any, originalError: Error, migrationError: Error) => {
    if (originalError) {
      console.error('db-migrate error:', originalError);
      process.exit(1);
    }
    if (migrationError) {
      console.error('Migration error:', migrationError);
      process.exit(1);
    }

    const { driver } = migrator;
    try {
      driver.close();
    } catch (err) {
      console.error('Error closing database connection', err);
      process.exit(1);
    }
  },
);

migrationInstance.run();
