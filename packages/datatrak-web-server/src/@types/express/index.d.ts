/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { AccessPolicy } from '@tupaia/access-policy';
import { TupaiaApiClient } from '@tupaia/api-client';
import { SessionCookie } from '@tupaia/server-boilerplate';
import { DataTrakSessionRecord, DataTrakSessionModel } from '../../models';
import { DatatrakWebServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      sessionModel: DataTrakSessionModel;
      sessionCookie?: SessionCookie;
      session: DataTrakSessionRecord;
      ctx: {
        services: TupaiaApiClient;
      };
      models: DatatrakWebServerModelRegistry;
    }
  }
}
