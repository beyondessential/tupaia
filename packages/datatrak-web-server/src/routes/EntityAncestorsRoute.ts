import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitiesRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';

export type EntityAncestorsRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['id', 'parent_code', 'code', 'name', 'type'];

export class EntityAncestorsRoute extends Route<EntityAncestorsRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, projectCode } = params;

    const entities: Entity[] = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      rootEntityCode,
      {
        fields: DEFAULT_FIELDS,
      },
      true,
    );

    return camelcaseKeys(entities, { deep: true });
  }
}
