import { ModelRegistry } from '@tupaia/database';

import { SYNC_DIRECTIONS, SYNC_SESSION_DIRECTION } from './constants';

export type SyncDirectionValues = (typeof SYNC_DIRECTIONS)[keyof typeof SYNC_DIRECTIONS];

export type SyncSessionDirectionValues =
  (typeof SYNC_SESSION_DIRECTION)[keyof typeof SYNC_SESSION_DIRECTION];

export type FilteredModelRegistry = Partial<ModelRegistry>;
