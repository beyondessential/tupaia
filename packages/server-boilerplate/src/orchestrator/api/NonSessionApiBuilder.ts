/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';

import { AccessPolicy } from '@tupaia/access-policy';
import { UnauthenticatedError } from '@tupaia/utils';

import { attachEmptySession } from '../routes';
import { ApiBuilder } from './ApiBuilder';
import { buildOrchestratorBearerAuthMiddleware } from '../auth';

/**
 * Another version of Orchestration server which does not relies on session.
 * Authentication/Authorization will be done by access token.
 */
export class NonSessionApiBuilder extends ApiBuilder {
  useSessionCookie() {
    // no session cookie
  }

  get defaultAttachSession() {
    return attachEmptySession;
  }

  verifyAuth(verify: (accessPolicy: AccessPolicy) => void) {
    this.verifyAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
      try {
        const { accessPolicy } = req;
        if (!accessPolicy) {
          throw new UnauthenticatedError('Access Policy is not attached to the request');
        }

        verify(accessPolicy);

        next();
      } catch (error) {
        next(error);
      }
    };
    return this;
  }

  useBearerAuth() {
    this.app.use(buildOrchestratorBearerAuthMiddleware());
    return this;
  }

  addLoginAndLogoutRoutes() {
    // No login and logout
  }
}
