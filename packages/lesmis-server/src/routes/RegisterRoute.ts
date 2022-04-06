/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { MeditrakConnection } from '../connections';

export type RegisterRequest = Request;

export class RegisterRoute extends Route<RegisterRequest> {
  private readonly meditrakConnection: MeditrakConnection;

  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.meditrakConnection = new MeditrakConnection(req.session);
  }

  public buildResponse() {
    return this.meditrakConnection.registerUser(this.req.body);
  }
}
