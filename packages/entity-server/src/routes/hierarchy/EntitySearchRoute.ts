/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  MultiEntityRequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type EntitySearchRequest = MultiEntityRequest<
  MultiEntityRequestParams & { searchString: string },
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { pageSize?: number; page?: number }
>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { /* hierarchyId, */ fields, field /* filter */ } = this.req.ctx;
    const { searchString: rawString } = this.req.params;
    const { pageSize, page } = this.req.query;
    const searchString = rawString.toLowerCase();
    const entities = await this.req.models.entity.find(
      {
        name: {
          comparator: 'ilike',
          comparisonValue: `%${searchString}%`,
        },
        // TODO: Add filter for "in hierarchy"
      },
      {
        // Put names that begin with the search string first
        // Then sort alphabetically within the two groups
        rawSort: `STARTS_WITH(LOWER(name),'${searchString}') DESC, name ASC`,
        limit: pageSize,
        offset: page && pageSize ? page * pageSize : undefined,
      },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
