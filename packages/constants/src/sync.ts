export enum SyncTickFlags {
  INCOMING_FROM_CENTRAL_SERVER = -1,
  LAST_UPDATED_ELSEWHERE = -999,
  SYNC_LOOKUP_PLACEHOLDER = -1,
}

// Important! Syncing tables should also be added to SYNCING_TABLES in @tupaia/database/initSyncComponents.js
export enum SyncDirections {
  DO_NOT_SYNC = 'do_not_sync',
  PUSH_TO_CENTRAL = 'push_to_central',
  PULL_FROM_CENTRAL = 'pull_from_central',
  BIDIRECTIONAL = 'bidirectional',
}

export const COLUMNS_EXCLUDED_FROM_SYNC = ['updatedAtSyncTick'] as const;

const NEVER_USE_ZERO = Symbol('zero');
export const SYNC_STREAM_MESSAGE_KIND = {
  // This should never be used, so we make it impossible to
  [NEVER_USE_ZERO]: 0x0000,

  // Control messages start with 0xf
  END: 0xf001,

  // Application messages start with 0x0
  SESSION_WAITING: 0x0001,
  PULL_WAITING: 0x0002,
  PULL_CHANGE: 0x0003,
  PUSH_WAITING: 0x0004,
} as const;

// Internal sync facts
export const FACT_CURRENT_SYNC_TICK = 'currentSyncTick';
export const FACT_LAST_SUCCESSFUL_SYNC_PULL = 'lastSuccessfulSyncPull';
export const FACT_LAST_SUCCESSFUL_SYNC_PUSH = 'lastSuccessfulSyncPush';
export const FACT_LOOKUP_UP_TO_TICK = 'lastSuccessfulLookupTableUpdate';
export const FACT_SYNC_TRIGGER_CONTROL = 'syncTrigger';
export const FACT_PROJECTS_IN_SYNC = 'projectsInSync';
export const FACT_CURRENT_USER_ID = 'currentUserId';
