/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator } from '@tupaia/auth';
import { EntityServerModelRegistry, Context } from '../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      authenticator: Authenticator;
      models: EntityServerModelRegistry;
      context: Context;
    }

    export interface Response {
      context: Context;
    }
  }
}
