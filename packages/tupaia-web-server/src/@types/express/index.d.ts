import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { SessionCookie } from '@tupaia/server-boilerplate';

import { TupaiaWebServerModelRegistry } from '../../types';
import { TupaiaWebSessionRecord, TupaiaWebSessionModel } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      sessionModel: TupaiaWebSessionModel;
      sessionCookie?: SessionCookie;
      session: TupaiaWebSessionRecord;
      ctx: {
        services: TupaiaApiClient;
      };
      models: TupaiaWebServerModelRegistry;
    }
  }
}
