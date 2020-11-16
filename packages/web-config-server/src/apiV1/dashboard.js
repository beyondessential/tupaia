import { filterEntities } from '@tupaia/utils';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';

const NO_DATA_AT_LEVEL_DASHBOARD_ID = 'no_data_at_level';
const NO_ACCESS_DASHBOARD_ID = 'no_access';

const checkEntityAgainstConditions = (entity, conditions = {}) =>
  filterEntities([entity], conditions).length === 1;

export default class extends RouteHandler {
  static PermissionsChecker = PermissionsChecker;

  buildResponse = async () => {
    const { entity, query } = this;
    const { code: entityCode, name: entityName } = entity;
    const organisationLevel = entity.getOrganisationLevel();
    const userGroups = await this.req.getUserGroups(entityCode);
    // based on organisationLevel, organisationUnit, userGroups and ancestors
    // return all matching userGroup and dashboard group name configs
    // (can have same userGroup in different dashboard group names)
    const hierarchyId = await this.fetchHierarchyId();
    const dashboardGroups = await this.models.dashboardGroup.getDashboardGroups(
      userGroups,
      organisationLevel,
      entity,
      query.projectCode,
      hierarchyId,
    );

    const allDashboardGroups = await this.models.dashboardGroup.getAllDashboardGroups(
      organisationLevel,
      entity,
      query.projectCode,
      hierarchyId,
    );

    // No dashboards available
    if (!Object.keys(dashboardGroups).length && !Object.keys(allDashboardGroups).length) {
      const noDataAtLevelDashboard = await this.fetchDashboardViews(entity, [
        NO_DATA_AT_LEVEL_DASHBOARD_ID,
      ]);
      return { General: { Public: { views: noDataAtLevelDashboard } } };
    }

    // No access to available dashboards
    if (!Object.keys(dashboardGroups).length && Object.keys(allDashboardGroups).length) {
      const noAccessDashboard = await this.fetchDashboardViews(entity, [NO_ACCESS_DASHBOARD_ID]);
      return { General: { Public: { views: noAccessDashboard } } };
    }

    // Aggregate dashboardGroups into api response format
    // Examples from/to aggregation listed at the bottom of this file
    const returnJson = {};
    await Promise.all(
      Object.keys(dashboardGroups).map(async dashboardGroupName => {
        // from { } to { General: {} }
        if (!dashboardGroups[dashboardGroupName]) {
          returnJson[dashboardGroupName] = {};
        } else {
          await Promise.all(
            Object.keys(dashboardGroups[dashboardGroupName]).map(async userGroupKey => {
              // from { General: {} } to General: { Public: {} }
              if (!returnJson[dashboardGroupName]) returnJson[dashboardGroupName] = {};
              // from { General: {} } to { General: { Public: {..orgUnitInfo..} }
              if (!returnJson[dashboardGroupName][userGroupKey]) {
                returnJson[dashboardGroupName][userGroupKey] = {
                  organisationUnitType: organisationLevel,
                  organisationUnitCode: entityCode,
                  name: entityName,
                };
              }
              const {
                id: dashboardGroupId,
                dashboardReports: dashboardReportIds,
              } = dashboardGroups[dashboardGroupName][userGroupKey];
              // from { General: { Public: {} } to { General: { Public: { views: [...] } }
              returnJson[dashboardGroupName][userGroupKey].views = await this.fetchDashboardViews(
                entity,
                dashboardReportIds,
              );
              // from { General: { Public: {} } to { General: { Public: { dashboardGroupId: 11 } }
              returnJson[dashboardGroupName][userGroupKey].dashboardGroupId = dashboardGroupId;
            }),
          );
        }
      }),
    );

    return returnJson;
  };

  fetchDashboardViews = async (entity, dashboardReportIds) => {
    const views = [];
    for (let i = 0; i < dashboardReportIds.length; i++) {
      const viewId = dashboardReportIds[i];
      const reports = await this.models.dashboardReport.find({
        id: viewId,
      });

      reports.forEach(report => {
        const { viewJson, dataBuilder, drillDownLevel } = report;
        const { displayOnEntityConditions, ...restOfViewJson } = viewJson; // Avoid sending displayOnEntityConditions to the frontend
        const view = {
          viewId,
          drillDownLevel,
          ...restOfViewJson,
          requiresDataFetch: !!dataBuilder,
        };

        if (checkEntityAgainstConditions(entity, displayOnEntityConditions)) {
          views.push(view);
        }
      });
    }
    return views;
  };
}

/*
api response:
{ General:
   { Public:
      { organisationUnitType: 'Country',
        organisationUnitCode: 'DL',
        name: 'Demo Land',
        views: [ { viewId: "1" }, ...],
        dashboardGroupId: 11 },
     Donor:
      { organisationUnitType: 'Country',
        organisationUnitCode: 'DL',
        name: 'Demo Land',
        views: [ { viewId: "1" }, ...],
        dashboardGroupId: 13 },
     Admin:
      { organisationUnitType: 'Country',
        organisationUnitCode: 'DL',
        name: 'Demo Land',
        views: [ { viewId: "1" }, ...],
        dashboardGroupId: 15 } },
  Clinical:
   { Admin:
      { organisationUnitType: 'Country',
        organisationUnitCode: 'DL',
        name: 'Demo Land',
        views: [ { viewId: "1" }, ...],
        dashboardGroupId: 16 }
  }
}
*/
