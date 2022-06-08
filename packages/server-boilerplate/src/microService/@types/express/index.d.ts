/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry } from '@tupaia/database';
import { UserType } from '../../../models';

declare global {
  namespace Express {
    export interface Request {
      user: UserType;
      accessPolicy: AccessPolicy;
      models: ModelRegistry;
    }
  }
}
