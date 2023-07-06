/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

const DEFAULT_FIELDS = ['code', 'name'];

export type EntitySearchRequest = Request<any, any, any, any>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { query, params, ctx } = this.req;
    const { projectCode } = params;
    const { searchString, page = 0, pageSize = 5 } = query;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['entity_hierarchy.name'],
      })
    )[0];
    const entityHierarchyName = project['entity_hierarchy.name'];

    return ctx.services.entity.entitySearch(entityHierarchyName, searchString, {
      ...query,
      page,
      pageSize,
      fields: DEFAULT_FIELDS,
    });
  }
}
