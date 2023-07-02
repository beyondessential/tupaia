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

export type MultiEntityDescendantsRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[],
  MultiEntityRequestBody,
  EntityRequestQuery & { searchString: string }
>;
export class MultiEntityDescendantsRoute extends Route<MultiEntityDescendantsRequest> {
  public async buildResponse() {
    // const { hierarchyId, entities, fields, field, filter } = this.req.ctx;

    // SELECT * FROM entity WHERE POSITION('hau' IN LOWER(name)) > 0 ORDER BY POSITION('hau' IN LOWER(name)) = 1 DESC, name ASC;
    // LOWER works to ignore case, remove that if we're doing a case sensitive search

    return [];
    // return formatEntitiesForResponse(this.req.models, this.req.ctx, entitiesToUse, field || fields);
  }
}
