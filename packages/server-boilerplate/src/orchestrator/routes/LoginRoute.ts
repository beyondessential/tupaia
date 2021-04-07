/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { AccessPolicy } from '@tupaia/access-policy';
import { AuthConnection, AuthResponse } from '../auth';
import { Route } from '../../routes';
import { EmptyObject } from '../../types';
import { Credentials } from '../types';

export interface LoginRequest extends Request<EmptyObject, AuthResponse, Credentials> {
  ctx: {
    verifyLogin?: (accessPolicy: AccessPolicy) => void;
  };
}

export class LoginRoute extends Route<LoginRequest> {
  private authConnection: AuthConnection;

  constructor(req: LoginRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.authConnection = new AuthConnection();
  }

  async buildResponse() {
    const credentials = this.req.body;

    const response = await this.authConnection.login(credentials);

    const session = await this.req.sessionModel.createSession(response);
    const { id, email, accessPolicy } = session;

    this.req.session = session;
    this.req.sessionCookie = { id, email };

    if (this.req.ctx.verifyLogin) {
      this.req.ctx.verifyLogin(accessPolicy);
    }

    return { user: response.user };
  }
}
