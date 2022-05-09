/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { MeditrakAppServerModelRegistry, RequestContext } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      models: MeditrakAppServerModelRegistry;
      ctx: RequestContext;
    }

    export interface Response {
      models: MeditrakAppServerModelRegistry;
      ctx: RequestContext;
    }
  }
}
