/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { EntityType } from '../../models';
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
    const responseEntities: EntityType[] = [];
    await Promise.all(
      entities.map(async entity => {
        const descendants = await entity.getDescendants(hierarchyId, {
          ...filter,
        });
        const entitiesToUse = includeRootEntity ? [entity].concat(descendants) : descendants;
        responseEntities.push(...entitiesToUse);
      }),
    );

    return formatEntitiesForResponse(
      this.req.models,
      this.req.ctx,
      responseEntities,
      field || fields,
    );
  }
}
