SELECT mvrefresh.mv$createMaterializedViewlog( 'answer','public');
SELECT mvrefresh.mv$createMaterializedViewlog( 'survey_response','public');
SELECT mvrefresh.mv$createMaterializedViewlog( 'survey','public');
SELECT mvrefresh.mv$createMaterializedViewlog( 'entity','public');
SELECT mvrefresh.mv$createMaterializedViewlog( 'question','public');
SELECT mvrefresh.mv$createMaterializedViewlog( 'data_source','public');

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
           AND data_source.service_type = ''tupaia''';

SELECT mv$createMaterializedView(
    pViewName           => 'analytics',
    pSelectStatement    =>  pSqlStatement,
    pOwner              => 'public',
    pFastRefresh        =>  TRUE
);

CREATE index analytics_data_element_code_entity_code_date_idx ON analytics(data_element_code, entity_code, date desc);
CREATE index analytics_data_element_code_entity_code_survey_code_date_idx ON analytics(data_element_code, entity_code, survey_code, date desc);
CREATE index analytics_data_element_code_entity_code_survey_code_event_id_date_idx ON analytics(data_element_code, entity_code, survey_code, event_id, date desc);