/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Route } from '@tupaia/server-boilerplate';
import { EntityType } from '../../../models';
import { formatEntitiesForResponse } from '../format';
import {
  MultiEntityRequest,
  MultiEntityRequestParams,
  RequestBody,
  MultiEntityRequestQuery,
  EntityResponse,
} from '../types';
import { getMatchingRelatives } from './getMatchingRelatives';

export type MultiEntityRelativesRequest = MultiEntityRequest<
  MultiEntityRequestParams,
  EntityResponse[],
  RequestBody,
  MultiEntityRequestQuery
>;
export class MultiEntityRelativesRoute extends Route<MultiEntityRelativesRequest> {
  async buildResponse() {
    const { models, ctx } = this.req;
    const { entities, fields, field } = ctx;
    const responseEntities: EntityType[] = [];
    await Promise.all(
      entities.map(async entity => {
        const entitiesToUse = await getMatchingRelatives(models, { ...ctx, entity });
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
