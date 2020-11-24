/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { PsssSessionModel, PsssSessionType } from './models';

export interface PsssRequest extends Request {
  sessionModel: PsssSessionModel;
  sessionId?: string;
  session?: PsssSessionType;
}

export interface PsssResponseBody {
  accessPolicy?: {};
  error?: string;
}
