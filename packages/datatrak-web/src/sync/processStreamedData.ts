import { ModelRegistry } from '@tupaia/database';
import { saveIncomingInMemoryChanges } from '@tupaia/sync';

import { insertSnapshotRecords } from './insertSnapshotRecords';

const PULL_VOLUME_THRESHOLD = 10000;

export enum PullVolumeType {
  Initial = 'INITIAL', // Full initial pull
  IncrementalHigh = 'INCREMENTAL_HIGH_VOLUME', // Incremental with many records
  IncrementalLow = 'INCREMENTAL_LOW_VOLUME', // Incremental with few records
}

export interface ProcessStreamDataParams {
  models: ModelRegistry;
  sessionId: string;
  objects: any[];
  totalObjects: any[];
}

export const PROCESS_STREAM_DATA_FUNCTIONS = {
  [PullVolumeType.Initial]: async ({ models, objects }: ProcessStreamDataParams) => {
    await saveIncomingInMemoryChanges(models, objects);
  },
  [PullVolumeType.IncrementalHigh]: async ({
    models,
    sessionId,
    objects,
  }: ProcessStreamDataParams) => {
    await insertSnapshotRecords(models.database, sessionId, objects);
  },
  [PullVolumeType.IncrementalLow]: async ({ objects, totalObjects }: ProcessStreamDataParams) => {
    totalObjects.push(...objects);
  },
};

export const getPullVolumeType = (since: number, totalToPull: number) => {
  if (since === -1) {
    return PullVolumeType.Initial;
  }

  if (totalToPull > PULL_VOLUME_THRESHOLD) {
    return PullVolumeType.IncrementalHigh;
  }

  return PullVolumeType.IncrementalLow;
};
