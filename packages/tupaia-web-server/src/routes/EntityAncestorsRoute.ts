/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebEntitiesRequest, Entity } from '@tupaia/types';
import { camelcaseKeys } from '@tupaia/tsutils';
import { generateFrontendExcludedFilter, getTypesToExclude } from '../utils';

export type EntityAncestorsRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntityAncestorsRoute extends Route<EntityAncestorsRequest> {
  public async buildResponse() {
    const { params, query, ctx, models, accessPolicy } = this.req;
    const { rootEntityCode, projectCode } = params;
    const { includeRootEntity = false, ...restOfQuery } = query;

    const frontendExcludedFilter = await generateFrontendExcludedFilter(
      models,
      accessPolicy,
      projectCode,
    );

    let shouldIncludeRootEntity = includeRootEntity;

    // make sure we don't include the root entity if it's a type that should be excluded
    if (includeRootEntity) {
      const excludedTypes = await getTypesToExclude(models, accessPolicy, projectCode);
      const rootEntity = await ctx.services.entity.getEntity(rootEntityCode, projectCode);
      if (excludedTypes.includes(rootEntity.type)) {
        shouldIncludeRootEntity = false;
      }
    }

    const entities: Entity[] = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      rootEntityCode,
      {
        filter: frontendExcludedFilter,
        fields: DEFAULT_FIELDS,
        ...restOfQuery,
      },
      shouldIncludeRootEntity,
    );

    return camelcaseKeys(entities, { deep: true });
  }
}
