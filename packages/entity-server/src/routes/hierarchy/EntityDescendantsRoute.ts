/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponseObject,
} from './types';

export type DescendantsRequest = HierarchyRequest<
  HierarchyRequestParams,
  EntityResponseObject[],
  HierarchyRequestBody,
  HierarchyRequestQuery & { includeRootEntity?: boolean }
>;
export class EntityDescendantsRoute extends Route<DescendantsRequest> {
  async buildResponse() {
    const { includeRootEntity = false } = this.req.query;
    const descendants = await this.req.ctx.entity.getDescendants(this.req.ctx.hierarchyId, {
      country_code: this.req.ctx.allowedCountries,
    });
    const responseEntities = includeRootEntity
      ? [this.req.ctx.entity].concat(descendants)
      : descendants;
    return this.res.ctx.formatEntitiesForResponse(responseEntities);
  }
}
