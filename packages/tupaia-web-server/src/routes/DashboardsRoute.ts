/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';

export type DashboardsRequest = Request<any, any, any, any>;

export class DashboardsRoute extends Route<DashboardsRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { projectCode, entityCode } = params;

    const project = (
      await ctx.services.central.fetchResources('projects', {
        filter: { code: projectCode },
        columns: JSON.stringify(['entity.code', 'entity_hierarchy.name']),
      })
    )[0];

    // We're including the root entity in this request, so we don't need to double up fetching it
    const entities = await ctx.services.entity.getAncestorsOfEntity(
      project['entity_hierarchy.name'],
      entityCode,
      {},
      true
    );
    const rootEntity = entities.find((e: any) => e.code === entityCode);

    const dashboards = await ctx.services.central.fetchResources('dashboards', {
      filter: { root_entity_code: entities.map((e: any) => e.code) },
    });

    // Fetch all dashboard relations
    const dashboardRelations = await ctx.services.central.fetchResources(
      'dashboardRelations',
      {
        filter: {
          // Attached to the given dashboards
          dashboard_id: {
            comparator: 'IN',
            comparisonValue: dashboards.map((d: any) => d.id),
          },
          // For the root entity type
          entity_types: {
            comparator: '@>',
            comparisonValue: [rootEntity.type],
          },
          // Within the selected project
          project_codes: {
            comparator: '@>',
            comparisonValue: [projectCode],
          }
        }
      }
    );

    const dashboardItems = await ctx.services.central.fetchResources(
      'dashboardItems',
      {
        filter: {
          id: {
            comparator: 'IN',
            comparisonValue: dashboardRelations.map((dr: any) => dr.child_id),
          }
        }
      }
    );

    const dashboardsWithItems = dashboards.map((dashboard: any) => {
      const childRelations = dashboardRelations.filter((relation: any) => relation.dashboard_id === dashboard.id);
      const childItemIds = childRelations.map((relation: any) => relation.child_id);
      return {
        ...dashboard,
        items: dashboardItems.filter((item: any) => childItemIds.includes(item.id)),
      };
    });

    const response = dashboardsWithItems.filter((dashboard: any) => dashboard.items.length > 0);

    return camelcaseKeys(response, { deep: true });
  }
}
