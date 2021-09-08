/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { AccessPolicy } from '@tupaia/access-policy';

import { AdminPanelSessionType } from '../../models';

declare global {
  namespace Express {
    export interface Request {
      accessPolicy: AccessPolicy;
      session: AdminPanelSessionType;
    }

    export interface Response {
      accessPolicy: AccessPolicy;
      session: AdminPanelSessionType;
    }
  }
}
