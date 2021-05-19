do $$
declare
  tStartTime TIMESTAMP;
  source_table TEXT;
  source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_source'];

begin
  RAISE NOTICE 'Dropping analytics materialized view...';
  IF (SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename   = 'analytics'
  ))
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$removeMaterializedView('analytics', 'public');
    RAISE NOTICE 'Dropped analytics table, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Analytics Materialized View does not exist, skipping';
  END IF;

  RAISE NOTICE 'Dropping Materialized View Logs...';
  FOREACH source_table IN ARRAY source_tables_array LOOP
    IF (SELECT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename   = 'log$_' || source_table
    ))
    THEN
      EXECUTE 'DROP TRIGGER IF EXISTS ' || source_table || '_trigger' || ' ON ' || source_table;
      tStartTime := clock_timestamp();
      PERFORM mv$removeMaterializedViewLog(source_table, 'public');
      RAISE NOTICE 'Dropped Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
      EXECUTE 'CREATE TRIGGER ' || source_table || '_trigger' || ' AFTER INSERT OR UPDATE or DELETE ON ' || source_table || ' FOR EACH ROW EXECUTE PROCEDURE notification()';
    ELSE
      RAISE NOTICE 'Materialized View Log for % table does not exist, skipping', source_table;
    END IF;
  END LOOP;
end $$;
