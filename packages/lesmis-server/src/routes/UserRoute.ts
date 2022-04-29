/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { CentralConnection } from '../connections';

export type UserRequest = Request;

export class UserRoute extends Route<UserRequest> {
  private readonly centralConnection: CentralConnection;

  public constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.centralConnection = new CentralConnection(req.session);
  }

  public async buildResponse() {
    return this.centralConnection.getUser();
  }
}
