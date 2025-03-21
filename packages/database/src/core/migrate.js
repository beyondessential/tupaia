import { getDbMigrator } from '../server/getDbMigrator';
import { configureEnv } from '../server/configureEnv';

configureEnv();

const migrator = getDbMigrator(true);
migrator.run();
