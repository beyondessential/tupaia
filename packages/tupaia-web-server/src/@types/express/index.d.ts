/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { SessionCookie } from '@tupaia/server-boilerplate';

import { TupaiaWebServerModelRegistry } from '../../types';
import { TupaiaWebSessionType, TupaiaWebSessionModel } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      sessionModel: TupaiaWebSessionModel;
      sessionCookie?: SessionCookie;
      session: TupaiaWebSessionType;
      ctx: {
        services: TupaiaApiClient;
      };
      models: TupaiaWebServerModelRegistry;
    }
  }
}
