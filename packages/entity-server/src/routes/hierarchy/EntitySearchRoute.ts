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
  MultiEntityRequestParams,
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { searchString: string }
>;
export class EntitySearchRoute extends Route<EntitySearchRequest> {
  public async buildResponse() {
    const { /* hierarchyId, */ fields, field /* filter */ } = this.req.ctx;
    const { searchString: rawString } = this.req.query;
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
        // TODO: Limit and offset
      },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entities, field || fields);
  }
}
