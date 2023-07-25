/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';

export type EntityAncestorsRequest = Request<any, any, any, any>;

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntityAncestorsRoute extends Route<EntityAncestorsRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { entityCode, projectCode } = params;
    const { includeRootEntity = false, ...restOfQuery } = query;

    const entities = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      entityCode,
      { fields: DEFAULT_FIELDS, ...restOfQuery },
      includeRootEntity,
    );

    return camelcaseKeys(entities, { deep: true });
  }
}
