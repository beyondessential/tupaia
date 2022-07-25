/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { Authenticator } from '@tupaia/auth';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      authenticator: Authenticator;
    }
  }
}
