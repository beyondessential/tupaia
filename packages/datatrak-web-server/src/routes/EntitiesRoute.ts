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
    const {
      query: { filter, limit, sort },
      models,
    } = this.req;

    const entities = await models.entity.find(filter, {
      limit,
      sort,
    });
    return entities.map(({ id, type, name, code, parent_id: parentId }) => ({
      id,
      type,
      name,
      code,
      parent_id: parentId,
    }));
  }
}
