import { ModelRegistry, modelClasses } from '@tupaia/database';
import { SyncSnapshotAttributes } from '@tupaia/sync';

export interface DatatrakWebModelRegistry extends ModelRegistry {
  readonly localSystemFact: modelClasses.LocalSystemFact;
}

export interface ProcessStreamDataParams {
  models: ModelRegistry;
  sessionId: string;
  records: SyncSnapshotAttributes[];
}
