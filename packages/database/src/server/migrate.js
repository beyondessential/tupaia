import { getDbMigrator } from './getDbMigrator';
import { configureEnv } from './configureEnv';

configureEnv();

const migrator = getDbMigrator(true);
migrator.run();
