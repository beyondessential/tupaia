/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { UserRecord } from '@tupaia/server-boilerplate';
import { MeditrakAppServerModelRegistry, RequestContext } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      models: MeditrakAppServerModelRegistry;
      ctx: RequestContext;
      user?: UserRecord;
      accessPolicy?: AccessPolicy;
    }

    export interface Response {
      ctx: RequestContext;
    }
  }
}
