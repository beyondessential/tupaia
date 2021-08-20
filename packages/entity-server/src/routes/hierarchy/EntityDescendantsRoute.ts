/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from './format';
import {
  SingleEntityRequest,
  SingleEntityRequestParams,
  RequestBody,
  EntityRequestQuery,
  EntityResponse,
} from './types';

export type DescendantsRequest = SingleEntityRequest<
  SingleEntityRequestParams,
  EntityResponse[],
  RequestBody,
  EntityRequestQuery & { includeRootEntity?: string }
>;
export class EntityDescendantsRoute extends Route<DescendantsRequest> {
  async buildResponse() {
    const { hierarchyId, entity, fields, field, filter } = this.req.ctx;
    const { includeRootEntity: includeRootEntityString = 'false' } = this.req.query;
    const includeRootEntity = includeRootEntityString?.toLowerCase() === 'true';
    const descendants = await entity.getDescendants(hierarchyId, {
      ...filter,
    });
    const responseEntities = includeRootEntity ? [entity].concat(descendants) : descendants;

    return formatEntitiesForResponse(
      this.req.models,
      this.req.ctx,
      responseEntities,
      field || fields,
    );
  }
}
