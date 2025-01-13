/**
 * SQL for dropping the analytics log tables. If changes need to be made how to the analytics table is built
 * then please create a NEW file with a higher version.
 *
 * This is to ensure that we keep a track of changes to the analytics table in a single place, while also
 * allowing for historic migrations to be able to execute correctly
 */
export const createDropAnalyticsLogTablesFunction = `
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
`;
