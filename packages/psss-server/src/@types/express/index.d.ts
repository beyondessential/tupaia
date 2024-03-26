/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PsssSessionRecord } from '../../models/PsssSession';

declare global {
  namespace Express {
    export interface Request {
      session: PsssSessionRecord;
    }

    export interface Response {}
  }
}
