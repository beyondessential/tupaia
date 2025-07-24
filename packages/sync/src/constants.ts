export const SYNC_SESSION_DIRECTION = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
};

export const DEBUG_LOG_TYPES = {
  SYNC_LOOKUP_UPDATE: 'syncLookupUpdate',
};

// Internal sync facts
export const FACT_CURRENT_SYNC_TICK = 'currentSyncTick';
export const FACT_LAST_SUCCESSFUL_SYNC_PULL = 'lastSuccessfulSyncPull';
export const FACT_LAST_SUCCESSFUL_SYNC_PUSH = 'lastSuccessfulSyncPush';
export const FACT_LOOKUP_UP_TO_TICK = 'lastSuccessfulLookupTableUpdate';
export const FACT_SYNC_TRIGGER_CONTROL = 'syncTrigger';

export const SYNC_TICK_FLAGS = {
  INCOMING_FROM_CENTRAL_SERVER: -1,
  LAST_UPDATED_ELSEWHERE: -999,
  SYNC_LOOKUP_PLACEHOLDER: -1,
};

export const NON_SYNCING_TABLES = [
  'access_request',
  'ancestor_descendant_relation',
  'analytics',
  'api_client',
  'api_request_log',
  'comment',
  'dashboard',
  'dashboard_item',
  'dashboard_mailing_list',
  'dashboard_mailing_list_entry',
  'dashboard_relation',
  'dashboard_report',
  'data_element_data_group',
  'data_element_data_service',
  'data_service_entity',
  'data_service_sync_group',
  'data_table',
  'debug_log',
  'dhis_instance',
  'entity_relation',
  'external_database_connection',
  'facility',
  'feed_item',
  'geographical_area',
  'indicator',
  'landing_page',
  'legacy_report',
  'local_system_fact',
  'log$_answer',
  'log$_data_element',
  'log$_entity',
  'log$_question',
  'log$_survey',
  'log$_survey_response',
  'map_overlay',
  'map_overlay_group',
  'map_overlay_group_relation',
  'meditrak_device',
  'meditrak_sync_queue',
  'migrations',
  'one_time_login',
  'refresh_token',
  'report',
  'spatial_ref_sys',
  'superset_instance',
  'survey_response_comment',
  'sync_device_tick',
  'sync_group_log',
  'sync_session',
  'user_country_access_attempt',
  'user_entity_permission',
  'user_favourite_dashboard_item',
  'user_session',
];
