/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { formatEntitiesForResponse } from '../format';
import {
  SingleEntityRequest,
  SingleEntityRequestParams,
  RequestBody,
  SingleEntityRequestQuery,
  EntityResponse,
} from '../types';
import { getMatchingRelatives } from './getMatchingRelatives';

export type RelativesRequest = SingleEntityRequest<
  SingleEntityRequestParams,
  EntityResponse[],
  RequestBody,
  SingleEntityRequestQuery
>;
export class EntityRelativesRoute extends Route<RelativesRequest> {
  async buildResponse() {
    const { models, ctx } = this.req;
    const { fields, field } = ctx;

    const responseEntities = await getMatchingRelatives(models, ctx);

    return formatEntitiesForResponse(
      this.req.models,
      this.req.ctx,
      responseEntities,
      field || fields,
    );
  }
}
