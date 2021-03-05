do $$ 
declare
  iNewLogTableCount INTEGER := 0;
  tStartTime TIMESTAMP;
  source_table TEXT;
  source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_source'];
  pSqlStatement TEXT := '
    SELECT
      entity.code as entity_code,
      entity.name as entity_name,
      question.code as data_element_code,
      survey.code as data_group_code,
      survey_response.id as event_id,
      date_trunc(''day'', survey_response.submission_time) as "day_period",
      date_trunc(''week'', survey_response.submission_time) as "week_period",
      date_trunc(''month'', survey_response.submission_time) as "month_period",
      date_trunc(''year'', survey_response.submission_time) as "year_period",
      answer.text as value,
      answer.type as answer_type,
      survey_response.submission_time as "date"
    FROM
      survey_response
    INNER JOIN
      answer ON answer.survey_response_id = survey_response.id
    INNER JOIN
      entity ON entity.id = survey_response.entity_id
    INNER JOIN
      survey ON survey.id = survey_response.survey_id
    INNER JOIN
      question ON question.id = answer.question_id
    INNER JOIN 
      data_source ON data_source.id = question.data_source_id
    WHERE data_source.service_type = ''tupaia''';

begin 
  RAISE NOTICE 'Creating Materialized View Logs...';

  FOREACH source_table IN ARRAY source_tables_array LOOP
    IF (SELECT NOT EXISTS (
      SELECT FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename   = 'log$_' || source_table
    )) 
    THEN
      EXECUTE 'DROP TRIGGER IF EXISTS ' || source_table || '_trigger' || ' ON ' || source_table;
      tStartTime := clock_timestamp();
      PERFORM mv$createMaterializedViewlog(source_table, 'public');
      RAISE NOTICE 'Created Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
      EXECUTE 'CREATE TRIGGER ' || source_table || '_trigger' || ' AFTER INSERT OR UPDATE or DELETE ON ' || source_table || ' FOR EACH ROW EXECUTE PROCEDURE notification()';
      iNewLogTableCount := iNewLogTableCount + 1;
    ELSE
      RAISE NOTICE 'Materialized View Log for % table already exists, skipping', source_table;
    END IF;
  END LOOP;
  RAISE NOTICE 'Created % Materialized View Logs', iNewLogTableCount;


  RAISE NOTICE 'Creating analytics materialized view...';
  IF (SELECT NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public'
    AND tablename   = 'analytics'
  ))
  THEN
    tStartTime := clock_timestamp();
    PERFORM mv$createMaterializedView(
        pViewName           => 'analytics',
        pSelectStatement    =>  pSqlStatement,
        pOwner              => 'public',
        pFastRefresh        =>  TRUE
    );
    RAISE NOTICE 'Created analytics table, took %', clock_timestamp() - tStartTime;
  ELSE
    RAISE NOTICE 'Analytics Materialized View already exists, skipping';
  END IF;
end $$;