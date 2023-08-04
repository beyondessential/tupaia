/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';
import { UserType } from '../../../models';
import { ServerBoilerplateModelRegistry } from '../../../types';

declare global {
  namespace Express {
    export interface Request {
      user: UserType;
      accessPolicy: AccessPolicy;
      models: ServerBoilerplateModelRegistry;
      apiRequestLogId: string;
    }
  }
}
