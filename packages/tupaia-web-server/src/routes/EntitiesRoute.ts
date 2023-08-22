/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';
import { generateFrontendExcludedFilter } from '../utils';

export type EntitiesRequest = Request<
  TupaiaWebEntitiesRequest.Params,
  TupaiaWebEntitiesRequest.ResBody,
  TupaiaWebEntitiesRequest.ReqBody,
  TupaiaWebEntitiesRequest.ReqQuery
>;

const DEFAULT_FILTER = {
  generational_distance: {
    comparator: '<=',
    comparisonValue: 2,
  },
};

const DEFAULT_FIELDS = ['parent_code', 'code', 'name', 'type'];

export class EntitiesRoute extends Route<EntitiesRequest> {
  public async buildResponse() {
    const { params, query, ctx } = this.req;
    const { rootEntityCode, projectCode } = params;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: ['config'],
      })
    )[0];
    const { config } = project;

    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      projectCode,
      rootEntityCode,
      {
        filter: { ...DEFAULT_FILTER, ...generateFrontendExcludedFilter(config) },
        fields: DEFAULT_FIELDS,
        ...query,
      },
      query.includeRootEntity || false,
    );

    return camelcaseKeys(flatEntities, { deep: true });
  }
}
