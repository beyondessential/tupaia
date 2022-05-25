/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { CentralConnection } from '../connections';

export type RegisterRequest = Request;

export class RegisterRoute extends Route<RegisterRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public buildResponse() {
    return this.centralConnection.registerUser(this.req.body);
  }
}
