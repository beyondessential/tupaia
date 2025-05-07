import { NON_SYNCING_TABLES } from '../constants';

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

// TODO: fix type for driver
export async function initSyncComponents(driver: any, isBrowser: boolean = false) {
  // add column: holds last update tick, default to -999 (not marked for sync) on facility,
  // and 0 (will be caught in any initial sync) on central server
  // triggers will overwrite the default for future data, but this works for existing data
  const initialValue = isBrowser ? -999 : 0; // -999 on facility, 0 on central server
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

  console.log('Finished initializing sync components');
}
