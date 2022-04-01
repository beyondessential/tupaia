/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, NextFunction } from 'express';
import { TranslatableResponse, TranslatableRoute } from '@tupaia/server-boilerplate';
import { EntityConnection } from '../connections';

export type EntityRequest = Request<{ entityCode: string }, any, any, any>;

export class EntityRoute extends TranslatableRoute<
  EntityRequest,
  TranslatableResponse<EntityRequest>
> {
  private readonly entityConnection: EntityConnection;

  public constructor(
    req: EntityRequest,
    res: TranslatableResponse<EntityRequest>,
    next: NextFunction,
  ) {
    super(req, res, next);

    this.entityConnection = new EntityConnection(req.session);
    this.translationSchema = {
      domain: 'lesmis',
      layout: {
        type: 'object',
        valuesToTranslate: ['name'],
      },
    };
  }

  public async buildResponse() {
    const { entityCode } = this.req.params;
    return this.entityConnection.getEntity(entityCode);
  }
}
