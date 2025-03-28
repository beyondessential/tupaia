import { ModelRegistry } from '../ModelRegistry';
import { TupaiaDatabase } from '../TupaiaDatabase';
import { configureEnv } from '../configureEnv';

let database = null;

configureEnv();

export function getTestDatabase() {
  if (!database) {
    process.env.DB_NAME = 'tupaia_test'; // Ensure that we're connecting to the test database
    database = new TupaiaDatabase();
  }
  return database;
}

export function getTestModels() {
  return new ModelRegistry(getTestDatabase(), {}, true);
}
