/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { TranslatableRoute } from '@tupaia/server-boilerplate';
import { EntityConnection } from '../connections';

export class EntityRoute extends TranslatableRoute {
  private readonly entityConnection: EntityConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
    this.translationSchema = {
      domain: 'lesmis',
      layout:{
        type: 'object',
        valuesToTranslate: ['name'],
      }
    }
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    return this.entityConnection.getEntity(entityCode);
  }
}
