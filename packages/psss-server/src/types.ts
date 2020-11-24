/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { PsssSessionModel, PsssSessionType } from './models';

export interface SessionCookie {
  id: string;
  email: string;
  reset: () => void;
}

export interface PsssRequest extends Request {
  sessionModel: PsssSessionModel;
  sessionCookie?: SessionCookie;
  session?: PsssSessionType;
}

export interface PsssResponseBody {
  accessPolicy?: {};
  error?: string;
}
