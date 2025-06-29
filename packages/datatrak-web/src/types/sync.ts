import { ModelRegistry } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

export interface ProcessStreamDataParams {
  models: ModelRegistry;
  sessionId: string;
  records: SyncSnapshotAttributes[];
}
