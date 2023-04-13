'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
  CREATE OR REPLACE FUNCTION drop_analytics_log_tables() RETURNS void AS $$
  declare
    tStartTime TIMESTAMP;
    source_table TEXT;
    source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_element'];
  
  begin
    IF (SELECT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename   = 'analytics'
    ))
    THEN
      RAISE NOTICE 'Must drop analytics table before dropping log tables. Run drop_analytics_table()';
    ELSE
      RAISE NOTICE 'Dropping Materialized View Logs...';
      FOREACH source_table IN ARRAY source_tables_array LOOP
        IF (SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename   = 'log$_' || source_table
        ))
        THEN
          EXECUTE 'ALTER TABLE ' || source_table || ' DISABLE TRIGGER ' || source_table || '_trigger';
          tStartTime := clock_timestamp();
          PERFORM mv$removeMaterializedViewLog(source_table, 'public');
          RAISE NOTICE 'Dropped Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
          EXECUTE 'ALTER TABLE ' || source_table || ' ENABLE TRIGGER ' || source_table || '_trigger';
        ELSE
          RAISE NOTICE 'Materialized View Log for % table does not exist, skipping', source_table;
        END IF;
      END LOOP;
    END IF;
  end $$ LANGUAGE plpgsql;
`);
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
