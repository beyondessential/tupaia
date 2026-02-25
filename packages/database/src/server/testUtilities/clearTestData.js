import { AnalyticsRefresher } from '../../server/changeHandlers';

/**
 * Tables are in a topological order, ensuring any foreign keys are cleaned up correctly. Exclusions
 * are commented out, but left in sort order.
 * @see `@tupaia/sync/src/utils/getDependencyOrder`
 */
const TABLES_TO_CLEAR = /** @type {const} */ ([
  'answer',
  'task_comment',
  'task',
  'survey_screen_component',
  'survey_screen',
  'survey_response_comment',
  'survey_response',
  'survey',
  'refresh_token',
  'option',
  'one_time_login',
  'meditrak_device',
  'feed_item',
  'error_log',
  'data_element_data_group',
  'dashboard_relation',
  'dashboard_mailing_list_entry',
  'dashboard_mailing_list',
  'dashboard',
  'comment',
  'clinic',
  'api_request_log',
  'api_client',
  'ancestor_descendant_relation',
  'access_request',
  'user_favourite_dashboard_item',
  'user_entity_permission',
  'user_country_access_attempt',
  'user_account',
  'userSession',
  'tupaia_web_session',
  'sync_session',
  'sync_queued_device',
  'sync_lookup',
  'sync_group_log',
  'sync_device_tick',
  'survey_group',
  'superset_instance',
  // 'spatial_ref_sys',
  'setting',
  'report',
  'question',
  'psss_session',
  'project',
  'permission_group',
  'option_set',
  'ms1_sync_queue',
  'ms1_sync_log',
  // 'migrations',
  'meditrak_sync_queue',
  'map_overlay_group_relation',
  'map_overlay_group',
  'map_overlay',
  'login_attempts',
  // 'log$_survey_response',
  // 'log$_survey',
  // 'log$_question',
  // 'log$_entity',
  // 'log$_data_element',
  // 'log$_answer',
  'local_system_fact',
  'lesmis_session',
  'legacy_report',
  'landing_page',
  'indicator',
  'geographical_area',
  'external_database_connection',
  'entity_relation',
  'entity_parent_child_relation',
  'entity_hierarchy',
  'entity',
  'dhis_sync_queue',
  'dhis_sync_log',
  'dhis_instance',
  'datatrak_session',
  'data_table',
  'data_service_sync_group',
  'data_service_entity',
  'data_group',
  'data_element_data_service',
  'data_element',
  'dashboard_item',
  'country',
  // 'analytics',
  'admin_panel_session',
]);

export async function clearTestData(db) {
  // Safety check
  const [{ current_database }] = await db.executeSql('SELECT current_database();');
  if (current_database !== 'tupaia_test') {
    throw new Error(
      `Safety check failed: clearTestData can only be run against a database named tupaia_test, found ${current_database}.`,
    );
  }

  const sql = TABLES_TO_CLEAR.map(() => 'DELETE FROM ??;').join('\n');
  await db.wrapInTransaction(async db => {
    await db.executeSql(sql, TABLES_TO_CLEAR);
  });

  await AnalyticsRefresher.refreshAnalytics(db);
}
