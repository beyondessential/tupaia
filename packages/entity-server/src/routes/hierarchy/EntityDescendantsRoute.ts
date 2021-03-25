/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';
import {
  HierarchyRequest,
  HierarchyResponse,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponseObject,
} from './types';

export class EntityDescendantsRoute extends Route<
  HierarchyRequest<
    HierarchyRequestParams,
    EntityResponseObject[],
    HierarchyRequestBody,
    HierarchyRequestQuery & { includeRootEntity?: boolean }
  >,
  HierarchyResponse<EntityResponseObject[]>
> {
  async buildResponse() {
    const { includeRootEntity = false } = this.req.query;
    const descendants = await this.req.context.entity.getDescendants(this.req.context.hierarchyId, {
      country_code: this.req.context.allowedCountries,
    });
    const responseEntities = includeRootEntity
      ? [this.req.context.entity].concat(descendants)
      : descendants;
    return this.res.context.formatEntitiesForResponse(responseEntities);
  }
}
