import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';
import { camelcaseKeys, ensure } from '@tupaia/tsutils';
import {
  DashboardItem,
  DashboardMailingList,
  DashboardMailingListEntry,
  Entity,
  TupaiaWebDashboardsRequest,
} from '@tupaia/types';
import { orderBy } from '@tupaia/utils';

interface DashboardMailingListWithEntityCode extends DashboardMailingList {
  'entity.code': string;
}

export interface DashboardsRequest
  extends Request<
    TupaiaWebDashboardsRequest.Params,
    TupaiaWebDashboardsRequest.ResBody,
    TupaiaWebDashboardsRequest.ReqBody,
    TupaiaWebDashboardsRequest.ReqQuery
  > {}

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
          mailingLists: [],
        },
      ],
      {
        deep: true,
      },
    );
  };

  public async buildResponse() {
    const {
      accessPolicy,
      ctx,
      models,
      params: { projectCode, entityCode },
      session,
    } = this.req;

    // We're including the root entity in this request, so we don't need to double up fetching it
    const entities: Entity[] = await ctx.services.entity.getAncestorsOfEntity(
      projectCode,
      entityCode,
      {},
      true,
    );
    const rootEntity = ensure(entities.find(e => e.code === entityCode));

    const rootEntityPermissions = rootEntity.country_code
      ? accessPolicy.getPermissionGroups([rootEntity.country_code])
      : accessPolicy.getPermissionGroups(); // country_code is null for project level

    const dashboards = await models.dashboard.find(
      {
        root_entity_code: entities.map(e => e.code),
      },
      { sort: ['sort_order ASC', 'name ASC'] },
    );

    if (dashboards.length === 0) {
      return this.getNoDataDashboard(rootEntity.code, NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE);
    }

    // Fetch all dashboard relations for the given dashboards, project code and root entity type. This is so we can then filter the dashboard items by the permissions of the root entity and the entity attributes, which means we can determine whether to show a 'no access' dashboard item or not

    const dashboardIds = dashboards.map(d => d.id);
    const dashboardRelations =
      await models.dashboardRelation.findDashboardRelationsForEntityAndProject(
        dashboardIds,
        rootEntity.code,
        projectCode,
      );

    // The dashboards themselves are fetched from central to ensure permission checking

    const dashboardItems: DashboardItem[] = await ctx.services.central.fetchResourcesWithPost(
      'dashboardItems',
      { pageSize: DEFAULT_PAGE_SIZE }, // Override the default limit of 100 records
      {
        // Potentially hundreds of dashboard items, hence POST method with body to avoid 414 error
        filter: {
          id: {
            comparator: 'IN',
            comparisonValue: dashboardRelations.map(dr => dr.child_id),
          },
        },
      },
    );

    // Merged and sorted to make mapping easier
    const mergedItemRelations = orderBy(
      dashboardRelations
        .filter(relation =>
          relation.permission_groups.some(permissionGroup =>
            rootEntityPermissions.includes(permissionGroup),
          ),
        )
        .map(relation => ({
          relation,
          item: ensure(dashboardItems.find(di => di.id === relation.child_id)),
        })),
      [
        ({ relation }) => (relation.sort_order === null ? 1 : 0), // Puts null values last
        ({ relation }) => relation.sort_order,
        ({ item }) => item.config?.name,
      ],
    );

    const dashboardMailingLists: DashboardMailingListWithEntityCode[] =
      await ctx.services.central.fetchResources('dashboardMailingLists', {
        filter: {
          dashboard_id: {
            comparator: 'IN',
            comparisonValue: dashboards.map(d => d.id),
          },
        },
        columns: ['id', 'entity.code', 'dashboard_id', 'admin_permission_groups'],
        // Override the default limit of 100 records
        pageSize: DEFAULT_PAGE_SIZE,
      });

    const dashboardMailingListEntries: DashboardMailingListEntry[] = session
      ? await ctx.services.central.fetchResources('dashboardMailingListEntries', {
          filter: {
            dashboard_mailing_list_id: {
              comparator: 'IN',
              comparisonValue: dashboardMailingLists.map(dml => dml.id),
            },
          },
          // Override the default limit of 100 records
          pageSize: DEFAULT_PAGE_SIZE,
        })
      : [];

    const mailingLists = dashboardMailingLists.map(list => ({
      dashboardId: list.dashboard_id,
      entityCode: list['entity.code'],
      isSubscribed: session
        ? dashboardMailingListEntries.some(
            entry =>
              entry.dashboard_mailing_list_id === list.id &&
              entry.email === session.email &&
              entry.subscribed,
          )
        : false,
      isAdmin: session
        ? list.admin_permission_groups.some(permissionGroup =>
            rootEntityPermissions.includes(permissionGroup),
          )
        : false,
    }));

    const dashboardsWithMetadata = dashboards.map(rawDashboard => {
      // but we can't strip it because typescript doesn't know about it
      const { model, ...dashboard } = rawDashboard;
      return {
        ...dashboard,
        // Filter by the relations, map to the items
        items: mergedItemRelations
          .filter(({ relation }) => relation.dashboard_id === dashboard.id)
          .map(({ item }) => ({
            ...item,
          })),
        mailingLists: mailingLists
          .filter(list => list.dashboardId === dashboard.id)
          .map(({ entityCode: mailingListEntityCode, isSubscribed, isAdmin }) => ({
            entityCode: mailingListEntityCode,
            isSubscribed,
            isAdmin,
          })),
      };
    });

    const response = dashboardsWithMetadata.filter(dashboard => dashboard.items.length > 0);

    if (response.length === 0) {
      const dashboardCode =
        dashboardRelations.length > 0
          ? NO_ACCESS_DASHBOARD_ITEM_CODE
          : NO_DATA_AT_LEVEL_DASHBOARD_ITEM_CODE;
      return this.getNoDataDashboard(rootEntity.code, dashboardCode);
    }

    return camelcaseKeys(response, {
      deep: true,
      stopPaths: [
        'items.config.presentationOptions',
        'items.config.chartConfig',
        'items.config.segmentConfig',
      ], // these need to not be converted to camelcase because they directly relate to the name of values in the data that is returned
    });
  }
}
