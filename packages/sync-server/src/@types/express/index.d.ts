import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { CentralSyncManager } from '../../sync';
import { SyncServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: SyncServerModelRegistry;
      ctx: {
        centralSyncManager: CentralSyncManager;
      };
    }
  }
}
