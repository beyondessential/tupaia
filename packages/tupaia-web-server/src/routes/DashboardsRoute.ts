/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';

export type DashboardsRequest = Request<any, any, any, any>;

export class DashboardsRoute extends Route<DashboardsRequest> {
  public async buildResponse() {
    const { query, ctx } = this.req;
    const { organisationUnitCode, projectCode } = query;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: JSON.stringify(['entity.code', 'entity_hierarchy.name']),
      })
    )[0];
    const baseEntity = await ctx.services.entity.getEntity(
      project['entity_hierarchy.name'],
      organisationUnitCode,
    );

    const dashboards = await ctx.services.central.fetchResources('dashboards', {
      filter: { root_entity_code: baseEntity.code },
    });

    return Promise.all(
      dashboards.map(async (dash: any) => ({
        ...dash,
        items: await ctx.services.central.fetchResources(
          `dashboards/${dash.id}/dashboardRelations`,
        ),
      })),
    );
  }
}
