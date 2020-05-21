/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

const COMPARISON = `LIKE '%_test%'`;
const getDeleteStatement = (table, extraConditions = []) => {
  const conditions = [`id ${COMPARISON}`, ...extraConditions];
  return `DELETE FROM ${table} WHERE ${conditions.join(' OR ')};`;
};

// tables are in a significant order, ensuring any foreign keys are cleaned up correctly
const TABLES_TO_CLEAR = [
  'api_request_log',
  'answer',
  'survey_response',
  'survey_screen_component',
  'survey_screen',
  'question',
  'survey',
  'survey_group',
  'dhis_sync_log',
  'dhis_sync_queue',
  'clinic',
  'entity',
  'entity_relation',
  'geographical_area',
  'country',
  'feed_item',
  'meditrak_device',
  'meditrak_sync_queue',
  'ms1_sync_queue',
  'ms1_sync_log',
  'one_time_login',
  'option',
  'option_set',
  'refresh_token',
  'user_country_permission',
  'user_clinic_permission',
  'user_geographical_area_permission',
  'permission_group',
  'user_reward',
  'api_client',
  'user_account',
];

export function clearTestData(db, testStartTime = moment().format('YYYY-MM-DD HH:mm:ss')) {
  const extraConditions = {
    api_request_log: [`request_time >= '${testStartTime}'`],
    answer: [`question_id ${COMPARISON}`, `survey_response_id ${COMPARISON}`],
    survey_response: [`survey_id ${COMPARISON}`, `entity_id ${COMPARISON}`],
    survey: [`code LIKE 'test%'`],
    user_country_permission: [`permission_group_id ${COMPARISON}`],
    user_account: [`email = 'test.user@tupaia.org'`, `first_name = 'Automated test'`],
    clinic: [`country_id ${COMPARISON}`],
    entity: [`code LIKE 'test%'`],
    meditrak_sync_queue: [`record_id ${COMPARISON}`],
  };
  const sql = TABLES_TO_CLEAR.reduce(
    (acc, table) => `${acc}\n${getDeleteStatement(table, extraConditions[table])}`,
    '',
  );
  return db.executeSql(sql);
}
