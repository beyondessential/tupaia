/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { MicroServiceRequestContext } from '@tupaia/server-boilerplate';
import { AccessPolicy } from '@tupaia/access-policy';
import { ReportServerModelRegistry } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: ReportServerModelRegistry;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: MicroServiceRequestContext;
    }

    export interface Response {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ctx: MicroServiceRequestContext;
    }
  }
}
