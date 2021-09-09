/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import { MultiEntityRequest, MultiEntityRequestParams, EntityResponse } from './types';

export type MultiEntityRelativesRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[]
>;
export class MultiEntityRelativesRoute extends Route<MultiEntityRelativesRequest> {
  async buildResponse() {
    const { hierarchyId, entities, fields, field, filter } = this.req.ctx;

    const relatives = await this.req.models.entity.getRelativesOfEntities(
      hierarchyId,
      entities.map(entity => entity.id),
      { ...filter },
    );

    return formatEntitiesForResponse(this.req.models, this.req.ctx, relatives, field || fields);
  }
}
