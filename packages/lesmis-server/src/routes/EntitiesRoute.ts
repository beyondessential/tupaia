/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { TranslatableRoute } from './TranslatableRoute';
import { EntityConnection } from '../connections';

export class EntitiesRoute extends TranslatableRoute {
  private readonly entityConnection: EntityConnection;
  translationSubGroup = 'entities';

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
    this.translationKeys = {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' }
        }
      }
    }
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    const queryParameters = this.req.query;
    return this.entityConnection.getEntities(entityCode, queryParameters);
  }
}
