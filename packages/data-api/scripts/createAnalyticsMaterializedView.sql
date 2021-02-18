do $$ 
declare
  tStartTime TIMESTAMP;
  pSqlStatement TEXT := '
    SELECT
      entity.code as entity_code,
      entity.name as entity_name,
      question.code as data_element_code,
      survey.code as survey_code,
      survey_response.id as event_id,
      date_trunc(''day'', survey_response.end_time) as "day_period",
      date_trunc(''week'', survey_response.end_time) as "week_period",
      date_trunc(''month'', survey_response.end_time) as "month_period",
      date_trunc(''year'', survey_response.end_time) as "year_period",
      answer.text as value,
      answer.type as answer_type,
      survey_response.end_time as "date"
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
      data_source ON data_source.code = question.code
    WHERE data_source.service_type = ''tupaia''';

begin 
  RAISE NOTICE 'Creating Materialized View Logs...';
  
  -- Drop triggers so that all the deletes don't flood the sync queue - have taken care of them manually on dhis2
  DROP TRIGGER IF EXISTS survey_response_trigger
    ON survey_response;
  DROP TRIGGER IF EXISTS answer_trigger
    ON answer;
  
  RAISE NOTICE 'Dropped triggers on survey_response and answer tables';

  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'answer','public');
  RAISE NOTICE 'Created Materialized View Log for answer table, took %', clock_timestamp() - tStartTime;
  
  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'survey_response','public');
  RAISE NOTICE 'Created Materialized View Log for survey_response table, took %', clock_timestamp() - tStartTime;

  -- Recreate triggers
  CREATE TRIGGER survey_response_trigger
    AFTER INSERT OR UPDATE or DELETE
    ON survey_response
    FOR EACH ROW EXECUTE PROCEDURE notification();
  CREATE TRIGGER answer_trigger
    AFTER INSERT OR UPDATE or DELETE
    ON answer
    FOR EACH ROW EXECUTE PROCEDURE notification();

  RAISE NOTICE 'Re-created triggers on survey_response and answer tables';
  
  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'survey','public');
  RAISE NOTICE 'Created Materialized View Log for survey table, took %', clock_timestamp() - tStartTime;
  
  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'entity','public');
  RAISE NOTICE 'Created Materialized View Log for entity table, took %', clock_timestamp() - tStartTime;
  
  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'question','public');
  RAISE NOTICE 'Created Materialized View Log for question table, took %', clock_timestamp() - tStartTime;
  
  tStartTime := clock_timestamp();
  PERFORM mv$createMaterializedViewlog( 'data_source','public');
  RAISE NOTICE 'Created Materialized View Log for data_source table, took %', clock_timestamp() - tStartTime;

  tStartTime := clock_timestamp();
  RAISE NOTICE 'Creating analytics materialized view...';
  PERFORM mv$createMaterializedView(
      pViewName           => 'analytics',
      pSelectStatement    =>  pSqlStatement,
      pOwner              => 'public',
      pFastRefresh        =>  TRUE
  );
  RAISE NOTICE 'Created analytics table, took %', clock_timestamp() - tStartTime;
end $$;