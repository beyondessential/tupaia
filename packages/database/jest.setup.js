import { configureEnv } from './src/server/configureEnv';
import { clearTestData, getTestDatabase } from './src/server/testUtilities';

configureEnv();

beforeAll(async () => {
  // RN-1853: the production CHECK constraint forces sub-country entities to have a
  // non-null project_id. Many tests across this package create dummy entities (default
  // type 'facility') without a project, which would all fail under the CHECK. Drop it
  // here so the existing test fixtures keep working — the constraint is verified in
  // production via the migration itself, and per-project canonical-walk scoping has
  // dedicated coverage in EntityParentChildRelationBuilderProjectScoping.test.js.
  const database = getTestDatabase();
  await database.executeSql(
    `ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_project_id_check;`,
  );
});

afterAll(async () => {
  const database = getTestDatabase();
  await clearTestData(database);
  await database.closeConnections();
});
