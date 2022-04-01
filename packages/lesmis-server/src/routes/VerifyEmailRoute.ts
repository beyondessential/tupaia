/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';

export type VerifyEmailRequest = Request<{ emailToken: string }, any, any, any>;

export class VerifyEmailRoute extends Route<VerifyEmailRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  public constructor(req: VerifyEmailRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public async buildResponse() {
    const { emailToken } = this.req.params;
    return this.meditrakConnection.verifyEmail(emailToken);
  }
}
