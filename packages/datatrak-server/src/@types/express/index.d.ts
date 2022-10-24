/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaApiClient } from '@tupaia/api-client';

import { DatatrakSessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      session: DatatrakSessionType;
      ctx: {
        services: TupaiaApiClient;
      };
    }
  }
}
