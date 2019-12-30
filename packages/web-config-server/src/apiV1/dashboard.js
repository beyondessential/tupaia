import { DashboardGroup, DashboardReport } from '/models';
import { DhisTranslationHandler } from './utils';

export default class extends DhisTranslationHandler {
  buildData = async req => {
    const { entity } = this;
    const { code: entityCode, name: entityName } = entity;
    const organisationLevel = entity.getOrganisationLevel();
    const userGroups = await req.getUserGroups(entityCode);
    // based on organisationLevel, organisationUnit, userGroups and ancestors
    // return all matching userGroup and dashboard group name configs
    // (can have same userGroup in different dashboard group names)
    const dashboardGroups = await DashboardGroup.getDashboardGroups(
      userGroups,
      organisationLevel,
      entity,
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
              const views = await Promise.all(
                dashboardReportIds.map(async viewId => {
                  const report = await DashboardReport.findById(viewId);
                  return { viewId, ...report.viewJson, requiresDataFetch: !!report.dataBuilder };
                }),
              );

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
userGroups: [ 'Public', 'Donor', 'Admin' ]

*******************************************************************************
Raw result in query (DashboardGroups.getDashboardGroups)
[ anonymous {
    userGroup: 'Public',
    organisationLevel: 'Country',
    organisationUnitCode: 'World',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 11,
    dashboardGroupName: 'General' },
  anonymous {
    userGroup: 'Donor',
    organisationLevel: 'Country',
    organisationUnitCode: 'World',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 12,
    dashboardGroupName: 'General' },
  anonymous {
    userGroup: 'Donor',
    organisationLevel: 'Country',
    organisationUnitCode: 'DL',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 13,
    dashboardGroupName: 'General' },
  anonymous {
    userGroup: 'Admin',
    organisationLevel: 'Country',
    organisationUnitCode: 'World',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 14,
    dashboardGroupName: 'General' },
  anonymous {
    userGroup: 'Admin',
    organisationLevel: 'Country',
    organisationUnitCode: 'DL',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 15,
    dashboardGroupName: 'General' },
  anonymous {
    userGroup: 'Admin',
    organisationLevel: 'Country',
    organisationUnitCode: 'World',
    dashboardReports: [1, 4, 15],
    dashboardGroupId: 16,
    dashboardGroupName: 'Clinical' } ]

*******************************************************************************
before data builder (dashboardGroups from DashboardGroup.getDashboardGroups)
{
  General: {
    Public:
      anonymous {
        userGroup: 'Public',
        organisationLevel: 'Country',
        organisationUnitCode: 'World',
        dashboardReports: [1, 15, 3],
        dashboardGroupId: 11,
        dashboardGroupName: 'General' },
     Donor:
      anonymous {
        userGroup: 'Donor',
        organisationLevel: 'Country',
        organisationUnitCode: 'DL',
        dashboardReports: [1, 15, 3],
        dashboardGroupId: 13,
        dashboardGroupName: 'General' },
     Admin:
      anonymous {
        userGroup: 'Admin',
        organisationLevel: 'Country',
        organisationUnitCode: 'DL',
        dashboardReports: [1, 15, 3],
        dashboardGroupId: 15,
        dashboardGroupName: 'General' } },
  Clinical:
   { Admin:
      anonymous {
        userGroup: 'Admin',
        organisationLevel: 'Country',
        organisationUnitCode: 'World',
        dashboardReports: [1, 15, 3],
        dashboardGroupId: 16,
        dashboardGroupName: 'Clinical'
      }
    }
  }
*******************************************************************************\
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
