/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  RequestBody,
  MultiEntityRequestQuery,
  EntityResponse,
} from './types';

export type MultiEntityDescendantsRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[],
  RequestBody,
  MultiEntityRequestQuery & { includeRootEntity?: boolean }
>;
export class MultiEntityDescendantsRoute extends Route<MultiEntityDescendantsRequest> {
  async buildResponse() {
    const { hierarchyId, entities, fields, field, filter } = this.req.ctx;
    const { includeRootEntity = false } = this.req.query;
    const descendants = await this.req.models.entity.getDescendantsOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      { ...filter },
    );
    const entitiesToUse = includeRootEntity ? entities.concat(descendants) : descendants;

    return formatEntitiesForResponse(this.req.models, this.req.ctx, entitiesToUse, field || fields);
  }
}
