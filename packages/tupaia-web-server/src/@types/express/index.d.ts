/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';

import { TupaiaWebSessionType, TupaiaWebSessionModel } from '../../models';

interface SessionCookie {
  id: string;
  email: string;
  reset?: () => void;
}

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
    }
  }
}
