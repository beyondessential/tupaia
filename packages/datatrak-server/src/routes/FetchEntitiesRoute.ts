/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchEntitiesRequest = Request<
  { hierarchy: string },
  Record<string, unknown>[],
  Record<string, never>,
  { search?: string; type: string }
>;

export class FetchEntitiesRoute extends Route<FetchEntitiesRequest> {
  public async buildResponse() {
    const { entity: entityApi } = this.req.ctx.services;
    const { hierarchy } = this.req.params;
    const { search, type } = this.req.query;
    const filter: Record<string, unknown> = {};
    if (type) {
      filter.type = type;
    }
    if (search) {
      filter.name = {
        comparator: `ilike`,
        comparisonValue: `search`,
      };
    }
    const entities = await entityApi.getDescendantsOfEntity(hierarchy, hierarchy, {
      fields: ['code', 'name'],
      filter,
    });
    return entities;
  }
}
