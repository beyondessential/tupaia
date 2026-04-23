import { Request } from 'express';
import { DatatrakWebEntitiesRequest } from '@tupaia/types';
import { Route } from '@tupaia/server-boilerplate';
import { camelcaseKeys } from '@tupaia/tsutils';

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
      columns: ['code', 'id', 'name', 'parent_id', 'type', 'updated_at_sync_tick', 'attributes'],
      limit,
      sort,
    });

    return camelcaseKeys(
      entities.map(({ code, id, name, parent_id, type, updated_at_sync_tick, attributes }) => ({
        code,
        id,
        name,
        parent_id,
        type,
        updated_at_sync_tick,
        attributes,
      })),
    );
  }
}
