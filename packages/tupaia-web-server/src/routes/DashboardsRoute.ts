/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import camelcaseKeys from 'camelcase-keys';
import { Route } from '@tupaia/server-boilerplate';
import { Entity, DashboardItem, Dashboard, TupaiaWebDashboardsRequest } from '@tupaia/types';
import { orderBy } from '@tupaia/utils';

import { DashboardRelationType } from '../models/DashboardRelation';

interface DashboardWithItems extends Dashboard {
  items: DashboardItem[];
}

export type DashboardsRequest = Request<
  TupaiaWebDashboardsRequest.Params,
  TupaiaWebDashboardsRequest.ResBody,
  TupaiaWebDashboardsRequest.ReqBody,
  TupaiaWebDashboardsRequest.ReqQuery
>;

const NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE = 'no_data_at_level';
const NO_ACCESS_DASHBOARD_ITEM_CODE = 'no_access';
const DEFAULT_PAGE_SIZE = 'ALL';

export class DashboardsRoute extends Route<DashboardsRequest> {
  private getNoDataDashboard = async (
    rootEntityCode: Entity['code'],
    staticDashboardItemCode: string,
  ) => {
    const { models } = this.req;
    const noDataItem = await models.dashboardItem.findOne({
      code: staticDashboardItemCode,
    });

    const { code, legacy, report_code: reportCode, id, config } = noDataItem;
    return camelcaseKeys(
      [
        {
          name: 'General', // just a dummy dashboard
          id: 'General',
          code: 'General',
          rootEntityCode,
          items: [
            {
              code,
              legacy,
              reportCode,
              id,
              config,
            },
          ],
        },
      ],
      {
        deep: true,
      },
    );
  };
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
      sort: ['sort_order', 'name'],
    });

    if (!dashboards.length) {
      return this.getNoDataDashboard(rootEntity, NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE);
    }

    // Fetch all dashboard relations
    const dashboardRelations = await this.req.models.dashboardRelation.find({
      // Attached to the given dashboards
      dashboard_id: dashboards.map((d: Dashboard) => d.id),
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
    });

    // The dashboards themselves are fetched from central to ensure permission checking
    const dashboardItems = await ctx.services.central.fetchResources('dashboardItems', {
      filter: {
        id: {
          comparator: 'IN',
          comparisonValue: dashboardRelations.map((dr: DashboardRelationType) => dr.child_id),
        },
      },
      // Override the default limit of 100 records
      pageSize: DEFAULT_PAGE_SIZE,
    });

    // Merged and sorted to make mapping easier
    const mergedItemRelations = orderBy(
      dashboardRelations.map((relation: DashboardRelationType) => ({
        relation,
        item: dashboardItems.find((item: DashboardItem) => item.id === relation.child_id),
      })),
      [
        ({ relation }: { relation: DashboardRelationType }) =>
          relation.sort_order === null ? 1 : 0, // Puts null values last
        ({ relation }: { relation: DashboardRelationType }) => relation.sort_order,
        ({ item }: { item: DashboardItem }) => item.code,
      ],
    );

    const dashboardsWithItems = dashboards.map((dashboard: Dashboard) => {
      return {
        ...dashboard,
        // Filter by the relations, map to the items
        items: mergedItemRelations
          .filter(
            ({ relation }: { relation: DashboardRelationType }) =>
              relation.dashboard_id === dashboard.id,
          )
          .map(({ item }: { item: DashboardItem }) => ({
            ...item,
          })),
      };
    });

    const response = dashboardsWithItems.filter(
      (dashboard: DashboardWithItems) => dashboard.items.length > 0,
    );

    if (!response.length) {
      const dashboardCode = dashboardRelations.length
        ? NO_ACCESS_DASHBOARD_ITEM_CODE
        : NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE;
      return this.getNoDataDashboard(rootEntity.code, dashboardCode);
    }

    return camelcaseKeys(response, {
      deep: true,
      stopPaths: ['items.config.presentationOptions', 'items.config.chartConfig'], // these need to not be converted to camelcase because they directly relate to the name of values in the data that is returned
    });
  }
}
