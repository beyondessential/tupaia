import type { ModelRegistry } from '@tupaia/database';
import { SyncDirections } from '@tupaia/constants';

import { SYNC_SESSION_DIRECTION } from './constants';

export type SyncDirectionValues = (typeof SyncDirections)[keyof typeof SyncDirections];

export type SyncSessionDirectionValues =
  (typeof SYNC_SESSION_DIRECTION)[keyof typeof SYNC_SESSION_DIRECTION];

export type FilteredModelRegistry = Partial<ModelRegistry>;
