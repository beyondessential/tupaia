/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  HierarchyRequest,
  HierarchyRequestParams,
  HierarchyRequestBody,
  HierarchyRequestQuery,
  EntityResponse,
} from './types';

export type DescendantsRequest = HierarchyRequest<
  HierarchyRequestParams,
  EntityResponse[],
  HierarchyRequestBody,
  HierarchyRequestQuery & { includeRootEntity?: boolean }
>;
export class EntityDescendantsRoute extends Route<DescendantsRequest> {
  async buildResponse() {
    const { hierarchyId, entity, allowedCountries, fields, flat } = this.req.ctx;
    const { includeRootEntity = false } = this.req.query;
    const descendants = await entity.getDescendants(hierarchyId, {
      country_code: allowedCountries,
    });
    const responseEntities = includeRootEntity ? [entity].concat(descendants) : descendants;
    if (flat) {
      return formatEntitiesForResponse(this.req.models, this.req.ctx, responseEntities, flat);
    }
    return formatEntitiesForResponse(this.req.models, this.req.ctx, responseEntities, fields);
  }
}
