/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Context } from '@tupaia/server-boilerplate';
import { LesmisSessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      session: LesmisSessionType;
      ctx: Context;
    }

    export interface Response {
      ctx: Context;
    }
  }
}
