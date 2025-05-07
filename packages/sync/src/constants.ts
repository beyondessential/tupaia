export const SYNC_DIRECTIONS = {
  DO_NOT_SYNC: 'do_not_sync',
  PUSH_TO_CENTRAL: 'push_to_central',
  PULL_FROM_CENTRAL: 'pull_from_central',
  BIDIRECTIONAL: 'bidirectional',
};

export const SYNC_SESSION_DIRECTION = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing',
};

export const SYNC_LOOKUP_PLACEHOLDER_SYNC_TICK = -1;

export const DEBUG_LOG_TYPES = {
  SYNC_LOOKUP_UPDATE: 'syncLookupUpdate',
};

// Internal sync facts
export const FACT_CURRENT_SYNC_TICK = 'currentSyncTick';
export const FACT_LAST_SUCCESSFUL_SYNC_PULL = 'lastSuccessfulSyncPull';
export const FACT_LAST_SUCCESSFUL_SYNC_PUSH = 'lastSuccessfulSyncPush';
export const FACT_LOOKUP_UP_TO_TICK = 'lastSuccessfulLookupTableUpdate';
export const FACT_SYNC_TRIGGER_CONTROL = 'syncTrigger';

export const COLUMNS_EXCLUDED_FROM_SYNC = ['updatedAtSyncTick'];

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
  'local_system_facts',
  'migrations',
  'sync_sessions',
  'sync_lookup',
  'debug_logs',
  'sync_device_ticks',
];
