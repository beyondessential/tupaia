/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry } from '@tupaia/database';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      models: ModelRegistry;
    }
  }
}
