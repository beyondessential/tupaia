/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import camelcaseKeys from 'camelcase-keys';
import { TupaiaWebEntitiesRequest } from '@tupaia/types';

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
        columns: ['entity_hierarchy.name', 'entity_hierarchy.canonical_types', 'config'],
      })
    )[0];
    const {
      'entity_hierarchy.name': hierarchyName,
      // TODO: Filter entities by canonical_types and config.frontendExcluded
      // 'entity_hierarchy.canonical_types': canonicalTypes,
      // config: projectConfig,
    } = project;

    const flatEntities = await ctx.services.entity.getDescendantsOfEntity(
      hierarchyName,
      rootEntityCode,
      { filter: DEFAULT_FILTER, fields: DEFAULT_FIELDS, ...query },
      query.includeRootEntity || false,
    );

    return camelcaseKeys(flatEntities, { deep: true });
  }
}
