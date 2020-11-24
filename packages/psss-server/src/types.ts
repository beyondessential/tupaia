/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { ParamsDictionary, Query } from 'express-serve-static-core';
import { PsssSessionModel, PsssSessionType } from './models';

export interface SessionCookie {
  id: string;
  email: string;
  reset: () => void;
}

interface PsssRequestBody {}

export interface PsssRequest<>extends Request<ParamsDictionary, unknown, PsssRequestBody, Query> {
  sessionModel: PsssSessionModel;
  sessionCookie?: SessionCookie;
  session?: PsssSessionType;
}

export interface PsssResponseBody {
  accessPolicy?: {};
  error?: string;
}
