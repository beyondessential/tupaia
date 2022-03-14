/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, NextFunction } from 'express';
import { TranslatableResponse, TranslatableRoute } from '@tupaia/server-boilerplate';
import { EntityConnection } from '../connections';

export type EntitiesRequest = Request<{ entityCode: string }, any, any, any>;

export class EntitiesRoute extends TranslatableRoute<
  EntitiesRequest,
  TranslatableResponse<EntitiesRequest>
> {
  private readonly entityConnection: EntityConnection;

  constructor(
    req: EntitiesRequest,
    res: TranslatableResponse<EntitiesRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'array',
        where: entry => entry.type !== 'school', // Schools are always in laotian
        items: {
          type: 'object',
          valuesToTranslate: ['name'],
        },
      },
    };
  }

  async buildResponse() {
    const { entityCode } = this.req.params;
    const queryParameters = this.req.query;
    return this.entityConnection.getEntities(entityCode, queryParameters);
  }
}
