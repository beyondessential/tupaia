import { AccessPolicy } from '@tupaia/access-policy';
import { UserRecord } from '../../../models';
import { ServerBoilerplateModelRegistry } from '../../../types';

declare global {
  namespace Express {
    export interface Request {
      user: UserRecord;
      accessPolicy: AccessPolicy;
      models: ServerBoilerplateModelRegistry;
      apiRequestLogId: string;
    }
  }
}
