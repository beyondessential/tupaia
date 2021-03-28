/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry } from '@tupaia/database';
import { Context } from '../../../types';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: ModelRegistry;
      ctx: Context;
    }

    export interface Response {
      ctx: Context;
    }
  }
}
