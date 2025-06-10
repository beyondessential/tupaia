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
  'analytics',
  'superset_instance',
  'log$_answer',
  'log$_data_element',
  'log$_entity',
  'log$_question',
  'log$_survey',
  'log$_survey_response',
  'spatial_ref_sys',
  'local_system_fact',
  'migrations',
  'sync_session',
  'sync_lookup',
  'debug_log',
  'sync_device_tick',
];
