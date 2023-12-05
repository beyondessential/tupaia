/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';

export type EntitiesRequest = Request<
  DatatrakWebEntitiesRequest.Params,
  DatatrakWebEntitiesRequest.ResBody,
  DatatrakWebEntitiesRequest.ReqBody,
  DatatrakWebEntitiesRequest.ReqQuery
>;

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { query, models } = this.req;
    const { filter } = query;
    const entities = await models.entity.find(filter);
    return entities.map(({ id, type, name, code, parent_id: parentId }) => ({
      id,
      type,
      name,
      code,
      parent_id: parentId,
    }));
  }
}
