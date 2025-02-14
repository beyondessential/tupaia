/**
 * SQL for building the analytics table. If changes need to be made how to the analytics table is built
 * then please create a NEW file with a higher version.
 *
 * This is to ensure that we keep a track of changes to the analytics table in a single place, while also
 * allowing for historic migrations to be able to execute correctly
 */
export const createBuildAnalyticsTableFunction = `
CREATE OR REPLACE FUNCTION build_analytics_table(force BOOLEAN default FALSE) RETURNS void AS $$
declare
  tStartTime TIMESTAMP;
  source_table TEXT;
  source_tables_array TEXT[] := array['answer', 'survey_response', 'entity', 'survey', 'question', 'data_element'];
  pSqlStatement TEXT := '
    SELECT
      entity.code as entity_code,
      entity.name as entity_name,
      question.code as data_element_code,
      survey.code as data_group_code,
      survey_response.id as event_id,
      CASE
        WHEN question.type = ''Binary'' OR question.type = ''Checkbox''
        THEN CASE
          WHEN answer.text = ''Yes'' THEN ''1''
          ELSE ''0''
        END
        WHEN question.type = ''Entity''
        THEN answer_entity.name
        ELSE answer.text
      END as value,
      question.type as type,
      to_char(survey_response.data_time, ''YYYYMMDD'') as "day_period",
      concat(
        extract (isoyear from survey_response.data_time),
        ''W'',
        to_char(extract (week from survey_response.data_time), ''FM09''))
      as "week_period",
      to_char(survey_response.data_time, ''YYYYMM'') as "month_period",
      to_char(survey_response.data_time, ''YYYY'') as "year_period",
      survey_response.data_time as "date"
    FROM
      survey_response
    INNER JOIN
      answer ON answer.survey_response_id = survey_response.id
    INNER JOIN
      entity ON entity.id = survey_response.entity_id
    LEFT JOIN
      entity answer_entity ON answer_entity.id = answer.text
    INNER JOIN
      survey ON survey.id = survey_response.survey_id
    INNER JOIN
      question ON question.id = answer.question_id
    INNER JOIN
      data_element ON data_element.id = question.data_element_id
    WHERE data_element.service_type = ''tupaia'' AND survey_response.outdated IS FALSE AND survey_response.approval_status IN (''not_required'', ''approved'')';

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
      PERFORM mv$createMaterializedViewLog(source_table, 'public');
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
    IF (force)
    THEN
    RAISE NOTICE 'Force rebuilding analytics table';
      tStartTime := clock_timestamp();
      PERFORM mv$createMaterializedView(
          pViewName           => 'analytics_tmp',
          pSelectStatement    =>  pSqlStatement,
          pOwner              => 'public',
          pFastRefresh        =>  TRUE
      );
      RAISE NOTICE 'Created analytics table, took %', clock_timestamp() - tStartTime;
      PERFORM mv$removeMaterializedView('analytics', 'public');
      PERFORM mv$renameMaterializedView('analytics_tmp', 'analytics', 'public');
    ELSE
      RAISE NOTICE 'Analytics Materialized View already exists, skipping';
    END IF;
  END IF;
end $$ LANGUAGE plpgsql
`;
