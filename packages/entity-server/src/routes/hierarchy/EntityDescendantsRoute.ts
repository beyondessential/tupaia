/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '../Route';
import {
  HierarchyRequest,
  HierarchyResponse,
  HierarchyRequestParams,
  EntityResponseObject,
} from './types';

export class EntityDescendantsRoute extends Route<
  HierarchyRequest<HierarchyRequestParams, EntityResponseObject[]>,
  HierarchyResponse<EntityResponseObject[]>
> {
  async buildResponse() {
    return this.res.context.formatEntitiesForResponse(
      [this.req.context.entity].concat(
        await this.req.context.entity.getDescendants(this.req.context.hierarchyId, {
          country_code: this.req.context.allowedCountries,
        }),
      ),
    );
  }
}
