do $$
declare
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
      answer.text as value,
      question.type as type,
      date_trunc(''day'', survey_response.data_time) as "day_period",
      date_trunc(''week'', survey_response.data_time) as "week_period",
      date_trunc(''month'', survey_response.data_time) as "month_period",
      date_trunc(''year'', survey_response.data_time) as "year_period",
      survey_response.data_time as "date"
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
    WHERE data_source.service_type = ''tupaia'' AND survey_response.outdated IS FALSE';

begin
  RAISE NOTICE 'Creating Materialized View Logs...';

  FOREACH source_table IN ARRAY source_tables_array LOOP
    IF (SELECT NOT EXISTS (
      SELECT FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename   = 'log$_' || source_table
    ))
    THEN
      EXECUTE 'ALTER TABLE ' || source_table || ' DISABLE TRIGGER ' || source_table || '_trigger';
      tStartTime := clock_timestamp();
      PERFORM mv$createMaterializedViewlog(source_table, 'public');
      RAISE NOTICE 'Created Materialized View Log for % table, took %', source_table, clock_timestamp() - tStartTime;
      EXECUTE 'ALTER TABLE ' || source_table || ' ENABLE TRIGGER ' || source_table || '_trigger';
    ELSE
      RAISE NOTICE 'Materialized View Log for % table already exists, skipping', source_table;
    END IF;
  END LOOP;


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
