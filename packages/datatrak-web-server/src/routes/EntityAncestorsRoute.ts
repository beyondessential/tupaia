import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitiesRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { ENTITY_ANCESTORS_DEFAULT_FIELDS } from '@tupaia/constants';

export type EntityAncestorsRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

export class EntityAncestorsRoute extends Route<EntityAncestorsRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { rootEntityCode, projectCode } = params;

    const entities: Entity[] = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      rootEntityCode,
      {
        fields: ENTITY_ANCESTORS_DEFAULT_FIELDS,
      },
      true,
    );

    return camelcaseKeys(entities, { deep: true });
  }
}
