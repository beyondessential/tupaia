import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerModelRegistry, RequestContext } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: ReportServerModelRegistry;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: RequestContext;
    }

    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: RequestContext;
    }
  }
}
