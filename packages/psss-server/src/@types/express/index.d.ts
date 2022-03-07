/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PsssSessionType } from '../../models/PsssSession';

declare global {
  namespace Express {
    export interface Request {
      session: PsssSessionType;
    }

    export interface Response {
    }
  }
}
