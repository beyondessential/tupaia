/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchProjectsRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>,
  { search?: string }
>;

const projectsEndpoint = 'projects';

export class FetchProjectsRoute extends Route<FetchProjectsRequest> {
  public async buildResponse() {
    const { central: centralApi } = this.req.ctx.services;
    const { search } = this.req.query;
    const filter: Record<string, unknown> = {};
    const columns = JSON.stringify(['code', 'entity.name']);
    if (search) {
      filter['entity.name'] = {
        comparator: `ilike`,
        comparisonValue: `%${search}%`,
        castAs: 'text',
      };
    }
    const projects = await centralApi.fetchResources(projectsEndpoint, {
      columns,
      filter,
    });
    return projects;
  }
}
