/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { Context, SessionCookie } from '@tupaia/server-boilerplate';
import { LesmisSessionModel, LesmisSessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      sessionModel: LesmisSessionModel;
      sessionCookie: SessionCookie;
      session: LesmisSessionType;
      ctx: Context;
    }

    export interface Response {
      ctx: Context;
    }
  }
}
