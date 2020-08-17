import { DashboardGroup, DashboardReport } from '/models';
import { RouteHandler } from './RouteHandler';
import { PermissionsChecker } from './permissions';
import { checkEntityAgainstConditions } from './utils';

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
    const dashboardGroups = await DashboardGroup.getDashboardGroups(
      userGroups,
      organisationLevel,
      entity,
      query.projectCode,
      hierarchyId,
    );

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
              const views = [];

              for (let i = 0; i < dashboardReportIds.length; i++) {
                const viewId = dashboardReportIds[i];
                const report = await DashboardReport.findOne({
                  id: viewId,
                  drillDownLevel: null, //drillDownLevel = null so that only the parent reports are selected, we don't want drill down reports at this level.
                });

                const { viewJson, dataBuilder } = report;
                const { displayOnEntityConditions, ...restOfViewJson } = viewJson; //Avoid sending displayOnEntityConditions to the frontend
                const view = { viewId, ...restOfViewJson, requiresDataFetch: !!dataBuilder };

                if (checkEntityAgainstConditions(entity, displayOnEntityConditions)) {
                  views.push(view);
                }
              }

              returnJson[dashboardGroupName][userGroupKey].views = views;
              // from { General: { Public: {} } to { General: { Public: { dashboardGroupId: 11 } }
              returnJson[dashboardGroupName][userGroupKey].dashboardGroupId = dashboardGroupId;
            }),
          );
        }
      }),
    );

    return returnJson;
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
