/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { AuthConnection, AuthResponse } from '../auth';
import { Route } from '../../routes';
import { EmptyObject } from '../../types';

export interface OneTimeLoginRequest extends Request<EmptyObject, AuthResponse, { token: string }> {
  ctx: {
    verifyLogin?: (accessPolicy: AccessPolicy) => void;
  };
}

export class OneTimeLoginRoute extends Route<OneTimeLoginRequest> {
  private authConnection: AuthConnection;

  public constructor(req: OneTimeLoginRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.authConnection = new AuthConnection();
  }

  public async buildResponse() {
    const { token } = this.req.body;

    const response = await this.authConnection.oneTimeLogin(token);

    if (this.req.ctx.verifyLogin) {
      this.req.ctx.verifyLogin(new AccessPolicy(response.accessPolicy));
    }

    const session = await this.req.sessionModel.createSession(response);
    const { id, email } = session;

    this.req.session = session;
    this.req.sessionCookie = { id, email };

    return { user: response.user };
  }
}
