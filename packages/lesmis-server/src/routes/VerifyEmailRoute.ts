/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';

export class VerifyEmailRoute extends Route {
  private readonly meditrakConnection: MeditrakConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  async buildResponse() {
    const { emailToken } = this.req.params;

    const response = await this.meditrakConnection.verifyEmail(emailToken);
    if (response.emailVerified === 'true') {
      return response;
    }

    throw Error('Email was not correctly verified');
  }
}
