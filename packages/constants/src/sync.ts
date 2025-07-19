export enum SyncTickFlags {
  INCOMING_FROM_CENTRAL_SERVER = -1,
  LAST_UPDATED_ELSEWHERE = -999,
  SYNC_LOOKUP_PLACEHOLDER = -1,
}

export enum SyncDirections {
  DO_NOT_SYNC = 'do_not_sync', // Important! Non-syncing tables should also be added to NON_SYNCING_TABLES in @tupaia/database/initSyncComponents.js
  PUSH_TO_CENTRAL = 'push_to_central',
  PULL_FROM_CENTRAL = 'pull_from_central',
  BIDIRECTIONAL = 'bidirectional',
}

export const COLUMNS_EXCLUDED_FROM_SYNC = ['updatedAtSyncTick'];
