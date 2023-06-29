/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type EntitySearchRequest = Request<any, any, any, any>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { query, params, ctx } = this.req;
    const { projectCode } = params;
    const { searchString, page = 0, pageSize = 5 } = query;

    const entities = await ctx.services.entity.getDescendants();
  }
}
