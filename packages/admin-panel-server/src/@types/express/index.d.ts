/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';

import { AdminPanelSessionRecord } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      session: AdminPanelSessionRecord;
      ctx: {
        services: TupaiaApiClient;
      };
    }
  }
}
