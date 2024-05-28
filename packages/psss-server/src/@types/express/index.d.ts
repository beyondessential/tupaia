/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TupaiaApiClient } from '@tupaia/api-client';
import { PsssSessionRecord } from '../../models/PsssSession';

declare global {
  namespace Express {
    export interface Request {
      session: PsssSessionRecord;
      ctx: {
        services: TupaiaApiClient;
      };
    }

    export interface Response {}
  }
}
