import { AccessPolicy } from '@tupaia/access-policy';
import { EntityServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: EntityServerModelRegistry;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: any;
    }

    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: any;
    }
  }
}
