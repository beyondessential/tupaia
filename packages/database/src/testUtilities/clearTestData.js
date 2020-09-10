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
  'access_request',
  'alert_comment',
  'alert',
  'answer',
  'survey_response',
  'survey_screen_component',
  'survey_screen',
  'question',
  'survey',
  'survey_group',
  'dhis_sync_log',
  'dhis_sync_queue',
  'data_element_data_group',
  'data_source',
  'clinic',
  'entity',
  'data_source',
  'comment',
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
  'user_entity_permission',
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
    survey_screen_component: [`question_id ${COMPARISON}`],
    survey: [`name LIKE 'test_%'`], //For testing importing new surveys
    user_entity_permission: [`permission_group_id ${COMPARISON}`],
    user_account: [`email = 'test.user@tupaia.org'`, `first_name = 'Automated test'`],
    clinic: [`country_id ${COMPARISON}`],
    entity: [`code LIKE 'test%'`, `code LIKE '%test'`],
    meditrak_sync_queue: [`record_id ${COMPARISON}`],
  };
  const sql = TABLES_TO_CLEAR.reduce(
    (acc, table) => `${acc}\n${getDeleteStatement(table, extraConditions[table])}`,
    '',
  );
  return db.executeSql(sql);
}
