/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';
import { generateFrontendExcludedFilter } from '../utils';

export type EntityAncestorsRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntityAncestorsRoute extends Route<EntityAncestorsRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, projectCode } = params;
    const { includeRootEntity = false, ...restOfQuery } = query;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['config'],
      })
    )[0];
    const { config } = project;

    const entities = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      rootEntityCode,
      { filter: generateFrontendExcludedFilter(config), fields: DEFAULT_FIELDS, ...restOfQuery },
      includeRootEntity,
    );

    return camelcaseKeys(entities, { deep: true });
  }
}
