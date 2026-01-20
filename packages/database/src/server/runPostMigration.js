import { initSyncComponents } from '../core/sync/initSyncComponents';
import { arrayToDbString } from '../core/utilities';

const TABLES_REQUIRING_TRIGGER_CREATION = [
  'access_request',
  'ancestor_descendant_relation',
  'answer',
  'clinic',
  'country',
  'data_element',
  'entity',
  'entity_hierarchy',
  'entity_relation',
  'geographical_area',
  'indicator',
  'map_overlay',
  'map_overlay_group',
  'meditrak_device',
  'option',
  'option_set',
  'permission_group',
  'question',
  'survey',
  'survey_group',
  'survey_response',
  'survey_screen',
  'survey_screen_component',
  'user_entity_permission',
  'task',
];

// tables that should only have records created and deleted, and will throw an error if an update is
// attempted
const IMMUTABLE_TABLES = ['ancestor_descendant_relation'];

const getSelectForTablesWithoutTriggers = triggerSuffix => `
  SELECT t.table_name
    FROM information_schema.tables t
    LEFT JOIN information_schema.table_privileges privileges
      ON t.table_name = privileges.table_name
    WHERE NOT EXISTS (
      SELECT * from pg_trigger p
      WHERE p.tgname = concat(lower(t.table_name), '${triggerSuffix}')
    )
    AND privileges.privilege_type = 'TRIGGER'
    AND t.table_schema = 'public'
    AND t.table_type != 'VIEW'
    AND t.table_name NOT LIKE 'log$_%'
`;

export const runPostMigration = async driver => {
  // ensure PostGIS is installed
  const { rows: postgisExtension } = await driver.runSql(`
    SELECT COUNT(1) FROM pg_extension WHERE extname = 'postgis';
  `);
  if (!parseInt(postgisExtension[0].count, 10)) {
    throw new Error(
      "PostGIS extension is required. Install the binaries and run 'CREATE EXTENSION postgis;' in postgres to install it.",
    );
  }

  // Find any table in the database from the required list that doesn't have a corresponding notification trigger with
  // the name {TABLE_NAME}_trigger (eg survey_response_trigger).
  const { rows: tablesWithoutNotifierResults } = await driver.runSql(`
    ${getSelectForTablesWithoutTriggers('_trigger')}
    AND t.table_name IN (${arrayToDbString(TABLES_REQUIRING_TRIGGER_CREATION)});
  `);
  const tablesWithoutNotifier = tablesWithoutNotifierResults.map(row => row.table_name);

  // Create notification triggers for all tables that don't currently have a matched trigger.
  await Promise.all(
    tablesWithoutNotifier.map(tableName =>
      driver.runSql(`
        CREATE TRIGGER ${tableName}_trigger AFTER INSERT OR UPDATE OR DELETE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE notification();
      `),
    ),
  );

  // Find any table in the database that doesn't have a corresponding notification trigger with
  // the name {TABLE_NAME}_immutable_trigger (eg survey_response_immutable_trigger).
  const { rows: tablesWithoutImmutableTriggerResults } = await driver.runSql(`
    ${getSelectForTablesWithoutTriggers('_immutable_trigger')}
    AND t.table_name IN (${arrayToDbString(IMMUTABLE_TABLES)});
  `);
  const tablesWithoutImmutableTrigger = tablesWithoutImmutableTriggerResults.map(
    row => row.table_name,
  );

  // Create immutable triggers for all tables that don't currently have a matched trigger.
  await Promise.all(
    tablesWithoutImmutableTrigger.map(tableName =>
      driver.runSql(`
        CREATE TRIGGER ${tableName}_immutable_trigger AFTER UPDATE ON "${tableName}"
        FOR EACH ROW EXECUTE PROCEDURE immutable_table();
      `),
    ),
  );

  await initSyncComponents(driver);

  driver.close(err => {
    if (tablesWithoutNotifier.length > 0) {
      console.log(`Created change notification triggers for ${tablesWithoutNotifier.join(', ')}`);
    }
    if (tablesWithoutImmutableTrigger.length > 0) {
      console.log(
        `Created immutable warning triggers for ${tablesWithoutImmutableTrigger.join(', ')}`,
      );
    }
    if (err) {
      throw err;
    }
  });
};
