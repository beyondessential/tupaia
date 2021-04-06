/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { SessionCookie } from '../../types';
import { SessionModel, SessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      sessionModel: SessionModel;
      sessionCookie?: SessionCookie;
      session?: SessionType;
    }
  }
}
