/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment';

const COMPARISON = `LIKE '%_test%'`;
const getDeleteStatement = (table, mainCondition = `id ${COMPARISON}`, extraConditions = []) => {
  const conditions = [mainCondition, ...extraConditions];
  return `DELETE FROM "${table}" WHERE ${conditions.join(' OR ')};`;
};

// tables are in a significant order, ensuring any foreign keys are cleaned up correctly
const TABLES_TO_CLEAR = [
  'api_request_log',
  'access_request',
  'answer',
  'survey_response',
  'survey_response_comment',
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
  'ancestor_descendant_relation',
  'entity_relation',
  'project',
  'entity',
  'data_source',
  'comment',
  'entity_hierarchy',
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
  'dashboardGroup',
  'dashboardReport',
  'mapOverlay',
];

export function clearTestData(db, testStartTime = moment().format('YYYY-MM-DD HH:mm:ss')) {
  const mainConditions = {
    dashboardGroup: `code ${COMPARISON}`, // id of dashboard group is still Integer, so have the mainCondition test on code rather than id
  };

  const extraConditions = {
    api_request_log: [`request_time >= '${testStartTime}'`],
    answer: [`question_id ${COMPARISON}`, `survey_response_id ${COMPARISON}`],
    survey_response: [`survey_id ${COMPARISON}`, `entity_id ${COMPARISON}`],
    survey_screen_component: [`question_id ${COMPARISON}`],
    survey: [`code LIKE 'test%'`, `name ${COMPARISON}`], // name comparison is for clearing test data when importing new surveys using excel files
    user_entity_permission: [`permission_group_id ${COMPARISON}`],
    user_account: [`email = 'test.user@tupaia.org'`, `first_name = 'Automated test'`],
    clinic: [`country_id ${COMPARISON}`],
    entity: [`code LIKE 'test%'`, `code ${COMPARISON}`, `parent_id ${COMPARISON}`],
    entity_relation: [`child_id ${COMPARISON}`, `parent_id ${COMPARISON}`],
    meditrak_sync_queue: [`record_id ${COMPARISON}`],
  };
  const sql = TABLES_TO_CLEAR.reduce(
    (acc, table) =>
      `${acc}\n${getDeleteStatement(table, mainConditions[table], extraConditions[table])}`,
    '',
  );
  return db.executeSql(sql);
}
