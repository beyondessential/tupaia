import { SyncTickFlags } from '@tupaia/constants';

export const NON_SYNCING_TABLES = [
  'access_request',
  'ancestor_descendant_relation',
  'analytics',
  'api_client',
  'api_request_log',
  'comment',
  'dashboard',
  'dashboard_item',
  'dashboard_mailing_list',
  'dashboard_mailing_list_entry',
  'dashboard_relation',
  'dashboard_report',
  'data_element_data_group',
  'data_element_data_service',
  'data_service_entity',
  'data_service_sync_group',
  'data_table',
  'debug_log',
  'dhis_instance',
  'entity_relation',
  'external_database_connection',
  'facility',
  'feed_item',
  'geographical_area',
  'indicator',
  'landing_page',
  'legacy_report',
  'local_system_fact',
  'log$_answer',
  'log$_data_element',
  'log$_entity',
  'log$_question',
  'log$_survey',
  'log$_survey_response',
  'map_overlay',
  'map_overlay_group',
  'map_overlay_group_relation',
  'meditrak_device',
  'meditrak_sync_queue',
  'migrations',
  'one_time_login',
  'refresh_token',
  'report',
  'spatial_ref_sys',
  'superset_instance',
  'survey_response_comment',
  'sync_device_tick',
  'sync_group_log',
  'sync_session',
  'user_country_access_attempt',
  'user_entity_permission',
  'user_favourite_dashboard_item',
  'user_session',
  'tombstone',
  'sync_lookup',
];

const TABLES_WITHOUT_COLUMN_QUERY = `
  SELECT
    pg_class.relname as table
  FROM
    pg_catalog.pg_class
  JOIN
    pg_catalog.pg_namespace
  ON
    pg_class.relnamespace = pg_namespace.oid
  LEFT JOIN
    pg_catalog.pg_attribute
  ON
    pg_attribute.attrelid = pg_class.oid
  AND
    pg_attribute.attname = 'updated_at_sync_tick'
  WHERE
    pg_namespace.nspname = 'public'
  AND
    pg_class.relkind = 'r'
  AND
    pg_attribute.attname IS NULL
  AND
    pg_class.relname NOT IN (${NON_SYNCING_TABLES.map(t => `'${t}'`).join(',')});
`;

const TABLES_WITHOUT_TRIGGER_QUERY = `
  SELECT
    t.table_name as table
  FROM
    information_schema.tables t
  LEFT JOIN
    information_schema.table_privileges privileges
  ON
    t.table_name = privileges.table_name AND privileges.table_schema = 'public'
  WHERE
    NOT EXISTS (
      SELECT
        *
      FROM
        pg_trigger p
      WHERE
        p.tgname = substring(concat('set_', lower(t.table_name), '_updated_at_sync_tick'), 0, 64)
    )
  AND
    privileges.privilege_type = 'TRIGGER'
  AND
    t.table_schema = 'public'
  AND
    t.table_type != 'VIEW'
  AND
    t.table_name NOT IN (${NON_SYNCING_TABLES.map(t => `'${t}'`).join(',')});
`;

const getTablesQuery = (withTrigger = false) => `
  SELECT
    t.table_name as table
  FROM
    information_schema.tables t
  LEFT JOIN
    information_schema.table_privileges privileges
  ON
    t.table_name = privileges.table_name AND privileges.table_schema = 'public'
  WHERE
    ${withTrigger ? 'EXISTS' : 'NOT EXISTS'} (
      SELECT
        *
      FROM
        pg_trigger p
      WHERE
        p.tgname = substring(concat('add_', lower(t.table_name), '_tombstone_on_delete'), 0, 64)
    )
  AND
    privileges.privilege_type = 'TRIGGER'
  AND
    t.table_schema = 'public'
  AND
    t.table_type != 'VIEW'
  AND
    t.table_name NOT IN (${NON_SYNCING_TABLES.map(t => `'${t}'`).join(',')});
`;

const TABLES_WITHOUT_TRIGGER_FOR_DELETE_QUERY = getTablesQuery(false);
export const TABLES_WITH_TRIGGER_FOR_DELETE_QUERY = getTablesQuery(true);

export async function initSyncComponents(driver, isClient = false) {
  // add column: holds last update tick, default to -999 (not modified locally) on client,
  // and 0 (will be caught in any initial sync) on central server
  // triggers will overwrite the default for future data, but this works for existing data
  const initialValue = isClient ? SyncTickFlags.LAST_UPDATED_ELSEWHERE : 0; // -999 on client, 0 on central server
  const { rows: tablesWithoutColumn } = await driver.runSql(TABLES_WITHOUT_COLUMN_QUERY);
  for (const { table } of tablesWithoutColumn) {
    console.log(`Adding updated_at_sync_tick column to ${table}`);
    await driver.runSql(`
      ALTER TABLE "${table}" ADD COLUMN updated_at_sync_tick BIGINT NOT NULL DEFAULT ${initialValue};
    `);

    await driver.runSql(`
      CREATE INDEX ${table}_updated_at_sync_tick_index ON "${table}"(updated_at_sync_tick);
    `);
  }

  // add trigger: before insert or update, set updated_at (overriding any that is passed in)
  const { rows: tablesWithoutTrigger } = await driver.runSql(TABLES_WITHOUT_TRIGGER_QUERY);
  for (const { table } of tablesWithoutTrigger) {
    console.log(`Adding updated_at_sync_tick trigger to ${table}`);
    await driver.runSql(`
      CREATE TRIGGER set_${table}_updated_at_sync_tick
      BEFORE INSERT OR UPDATE ON "${table}"
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at_sync_tick();
    `);
  }

  const { rows: tablesWithoutTriggerForDelete } = await driver.runSql(
    TABLES_WITHOUT_TRIGGER_FOR_DELETE_QUERY,
  );
  for (const { table } of tablesWithoutTriggerForDelete) {
    console.log(`Adding add_to_tombstone_on_delete trigger for delete to ${table}`);
    await driver.runSql(`
      CREATE TRIGGER add_${table}_tombstone_on_delete
      BEFORE DELETE ON "${table}"
      FOR EACH ROW
      EXECUTE FUNCTION add_to_tombstone_on_delete();
    `);
  }

  console.log('Finished initializing sync components');
}
