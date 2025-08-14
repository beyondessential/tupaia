import { Request } from 'express';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';

export interface EntitiesRequest
  extends Request<
    DatatrakWebEntitiesRequest.Params,
    DatatrakWebEntitiesRequest.ResBody,
    DatatrakWebEntitiesRequest.ReqBody,
    DatatrakWebEntitiesRequest.ReqQuery
  > {}

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const {
      query: { filter, limit, sort },
      models,
    } = this.req;

    const entities = await models.entity.find(filter, {
      columns: ['code', 'id', 'name', 'parent_id', 'type'],
      limit,
      sort,
    });

    return entities.map(({ code, id, name, parent_id, type }) => ({
      code,
      id,
      name,
      parent_id,
      type,
    }));
  }
}
