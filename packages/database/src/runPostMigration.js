/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// Note, keep single quotes in table names for sql query generation.
const EXCLUDED_TABLES_FROM_TRIGGER_CREATION = [
  "'api_request_log'",
  "'dhis_sync_log'",
  "'error_log'",
  "'migrations'",
  "'feed_item'",
  "'userSession'",
  "'spatial_ref_sys'", // Reference table provided by postgis
  "'dashboardReport'",
  "'ancestor_descendant_relation'",
];

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

  // Find any table in the database that doesn't have a corresponding trigger with
  // the name {TABLE_NAME}_trigger (eg survey_response_trigger).
  const { rows: tablesWithoutTriggersResults } = await driver.runSql(`
    SELECT t.table_name
    FROM information_schema.tables t
    LEFT JOIN information_schema.table_privileges privileges
      ON t.table_name = privileges.table_name
    WHERE NOT EXISTS (
      SELECT * from pg_trigger p
      WHERE concat(lower(t.table_name), '_trigger') = p.tgname
    )
    AND privileges.privilege_type = 'TRIGGER'
    AND t.table_schema = 'public'
    AND t.table_type != 'VIEW'
    AND t.table_name NOT IN (${EXCLUDED_TABLES_FROM_TRIGGER_CREATION.join(',')});
  `);
  const tablesWithoutTriggers = tablesWithoutTriggersResults.map(row => row.table_name);

  // Create triggers for all tables that don't currently have a matched trigger.
  await Promise.all(
    tablesWithoutTriggers.map(tableName =>
      driver.runSql(`
    CREATE TRIGGER ${tableName}_trigger AFTER INSERT OR UPDATE or DELETE ON "${tableName}"
    FOR EACH ROW EXECUTE PROCEDURE notification();
  `),
    ),
  );

  driver.close(err => {
    if (tablesWithoutTriggers.length > 0) {
      console.log(`Created triggers for ${tablesWithoutTriggers.join(', ')}`);
    }
    if (err) {
      throw err;
    }
  });
};
