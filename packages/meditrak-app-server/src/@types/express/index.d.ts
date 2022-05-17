/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { RequestContext } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      ctx: RequestContext;
    }

    export interface Response {
      ctx: RequestContext;
    }
  }
}
