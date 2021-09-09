/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { EntityConnection } from '../connections';

export class EntityRoute extends Route {
  private readonly entityConnection: EntityConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    return this.entityConnection.getEntity(entityCode);
  }
}
