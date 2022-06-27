/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { UserType } from '@tupaia/server-boilerplate';
import { MeditrakAppServerModelRegistry, RequestContext } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      user?: UserType;
      models: MeditrakAppServerModelRegistry;
      ctx: RequestContext;
    }

    export interface Response {
      ctx: RequestContext;
    }
  }
}
