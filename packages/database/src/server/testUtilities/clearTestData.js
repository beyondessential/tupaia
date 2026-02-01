import { AnalyticsRefresher } from '../../server/changeHandlers';

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
  'data_element',
  'clinic',
  'dashboard_relation',
  'dashboard',
  'dashboard_item',
  'report',
  'legacy_report',
  'ancestor_descendant_relation',
  'entity_relation',
  'project',
  'entity',
  'data_group',
  'indicator',
  'comment',
  'entity_hierarchy',
  'entity_parent_child_relation',
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
  'api_client',
  'user_account',
  'map_overlay_group_relation',
  'map_overlay_group',
  'map_overlay',
  'login_attempts',
  'sync_queued_device',
  'sync_session',
  'sync_device_tick',
];

export async function clearTestData(db) {
  // Safety check
  const [row] = await db.executeSql(`SELECT current_database();`);
  const { current_database } = row;
  if (current_database !== 'tupaia_test') {
    throw new Error(
      `Safety check failed: clearTestData can only be run against a database named tupaia_test, found ${current_database}.`,
    );
  }

  const sql = TABLES_TO_CLEAR.reduce((acc, table) => `${acc}\nDELETE FROM ${table};`, '');

  await db.executeSql(sql);
  await AnalyticsRefresher.refreshAnalytics(db);
}
