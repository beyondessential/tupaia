/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import {
  Entity,
  DashboardItem,
  DashboardRelation,
  Dashboard,
  TupaiaWebDashboardsRequest,
} from '@tupaia/types';
import { orderBy } from '@tupaia/utils';

interface DashboardWithItems extends Dashboard {
  items: DashboardItem[];
}

export type DashboardsRequest = Request<
  TupaiaWebDashboardsRequest.Params,
  TupaiaWebDashboardsRequest.ResBody,
  TupaiaWebDashboardsRequest.ReqBody,
  TupaiaWebDashboardsRequest.ReqQuery
>;

export class DashboardsRoute extends Route<DashboardsRequest> {
  public async buildResponse() {
    const { params, ctx } = this.req;
    const { projectCode, entityCode } = params;

    // We're including the root entity in this request, so we don't need to double up fetching it
    const entities = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      entityCode,
      {},
      true,
    );
    const rootEntity = entities.find((e: Entity) => e.code === entityCode);

    const dashboards = await ctx.services.central.fetchResources('dashboards', {
      filter: { root_entity_code: entities.map((e: Entity) => e.code) },
    });

    const sortedDashboards = orderBy(dashboards, ['sort_order', 'name']);

    // Fetch all dashboard relations
    const dashboardRelations = await ctx.services.central.fetchResources('dashboardRelations', {
      filter: {
        // Attached to the given dashboards
        dashboard_id: {
          comparator: 'IN',
          comparisonValue: sortedDashboards.map((d: Dashboard) => d.id),
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
        },
      },
    });

    const dashboardItems = await ctx.services.central.fetchResources('dashboardItems', {
      filter: {
        id: {
          comparator: 'IN',
          comparisonValue: dashboardRelations.map((dr: DashboardRelation) => dr.child_id),
        },
      },
    });

    const dashboardsWithItems = sortedDashboards.map((dashboard: Dashboard) => {
      const childRelations = dashboardRelations.filter(
        (relation: DashboardRelation) => relation.dashboard_id === dashboard.id,
      );
      const childItemIds = childRelations.map((relation: DashboardRelation) => relation.child_id);
      return {
        ...dashboard,
        items: dashboardItems.filter((item: DashboardItem) => childItemIds.includes(item.id)),
      };
    });

    const response = dashboardsWithItems.filter(
      (dashboard: DashboardWithItems) => dashboard.items.length > 0,
    );

    return camelcaseKeys(response, { deep: true, stopPaths: ['items.config.presentationOptions'] });
  }
}
