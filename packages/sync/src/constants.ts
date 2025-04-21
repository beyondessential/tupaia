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

export const SYNC_LOOKUP_PENDING_UPDATE_SYNC_TICK = -1;

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
