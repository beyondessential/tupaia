'use strict';

import groupBy from 'lodash.groupby';
import { insertObject, generateId } from '../utilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const selectUniqueDashboardGroupNameAndOrgUnitCombo = async db => {
  const dashboardGroups = await db.runSql(`
    SELECT name, "organisationUnitCode"
    FROM "dashboardGroup"
    GROUP BY name, "organisationUnitCode";
  `);

  return dashboardGroups.rows;
};

const selectDashboardGroupsByNameAndOrgUnitCode = async (db, name, organisationUnitCode) => {
  const dashboardGroups = await db.runSql(`
    SELECT *
    FROM "dashboardGroup"
    WHERE name = '${name}'
    AND "organisationUnitCode" = '${organisationUnitCode}';
  `);

  return dashboardGroups.rows;
};

const getDashboardReportById = async (db, id) => {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports;
};

const getDashboardItemByCode = async (db, code) => {
  const { rows: dashboardItems } = await db.runSql(`
      SELECT * FROM dashboard_item
      WHERE code = '${code}';
  `);
  return dashboardItems[0] || null;
};

const getLegacyReportByCode = async (db, code) => {
  const { rows: legacyReports } = await db.runSql(`
      SELECT * FROM legacy_report
      WHERE code = '${code}';
  `);
  return legacyReports[0] || null;
};

const getDashboardRelationByDashboardAndChildId = async (db, dashboardId, childId) => {
  const { rows: dashboardRelations } = await db.runSql(`
      SELECT * FROM dashboard_relation
      WHERE dashboard_id = '${dashboardId}'
      AND child_id = '${childId}';
  `);
  return dashboardRelations[0] || null;
};

const createDrillDownDashboardItems = async (db, drillDownDashboardReports) => {
  for (let i = 0; i < drillDownDashboardReports.length; i++) {
    const drillDownDashboardReport = drillDownDashboardReports[i];
    const {
      id: drillDownCode,
      dataBuilder: drillDownDataBuilder,
      dataBuilderConfig: drillDownDataBuilderConfig,
      viewJson: drillDownViewJson,
      dataServices: drillDownDataServices,
    } = drillDownDashboardReport;
    const newDrillDownReportCode = `${drillDownCode}_DrillDown_${i + 1}`;
    const drillDownDashboardItem = await getDashboardItemByCode(db, newDrillDownReportCode);
    const legacyReport = await getLegacyReportByCode(db, newDrillDownReportCode);

    if (!drillDownDashboardItem) {
      if (drillDownDashboardReports[i + 1]) {
        // there is another drill down level
        const nextDrillDownReportCode = `${drillDownCode}_DrillDown_${i + 2}`;

        drillDownViewJson.drillDown = {
          itemCode: nextDrillDownReportCode,
        };
      }

      await insertObject(db, 'dashboard_item', {
        id: generateId(),
        code: newDrillDownReportCode,
        config: drillDownViewJson,
        report_code: newDrillDownReportCode,
        legacy: true,
      });
    }

    if (!legacyReport) {
      await insertObject(db, 'legacy_report', {
        id: generateId(),
        code: newDrillDownReportCode,
        data_builder: drillDownDataBuilder,
        data_builder_config: drillDownDataBuilderConfig,
        data_services: drillDownDataServices,
      });
    }
  }
};

const migrateLinkedDashboardReports = async db => {
  const uniqueDashboardGroupNameAndOrgUnitCombo = await selectUniqueDashboardGroupNameAndOrgUnitCombo(
    db,
  );

  for (const { name, organisationUnitCode } of uniqueDashboardGroupNameAndOrgUnitCombo) {
    const dashboardGroups = await selectDashboardGroupsByNameAndOrgUnitCode(
      db,
      name,
      organisationUnitCode,
    );
    const dashboardId = generateId();
    const dashboardCode = `${organisationUnitCode}_${name.replace(' ', '_')}`;
    await insertObject(db, 'dashboard', {
      id: dashboardId,
      code: dashboardCode,
      name,
      root_entity_code: organisationUnitCode,
    });

    // There are a few dashboard groups that have the same name and same organisationUnitCode,
    // just different permission groups. So we have to group them like this and combine the dashboard reports
    // together to assign the sort_order correctly.
    const dashboardGroupsByNameAndOrgUnit = groupBy(
      dashboardGroups,
      ({ name: dashboardGroupName, organisationUnitCode: orgUnitCode }) =>
        `${dashboardGroupName}|${orgUnitCode}`,
    );

    for (const dashboardGroupsSubSet of Object.values(dashboardGroupsByNameAndOrgUnit)) {
      const combinedDashboardReports = [
        ...new Set(dashboardGroupsSubSet.map(d => d.dashboardReports).flat()),
      ];
      for (let i = 0; i < combinedDashboardReports.length; i++) {
        const dashboardReportId = combinedDashboardReports[i];
        const dashboardReports = await getDashboardReportById(db, dashboardReportId);
        if (!dashboardReports || dashboardReports.length === 0) {
          continue; // there's no dashboard reports with this id?
        }

        const mainDashboardReport = dashboardReports.filter(d => d.drillDownLevel === null)[0];
        const {
          id: reportCode,
          dataBuilder,
          dataBuilderConfig,
          viewJson,
          dataServices,
        } = mainDashboardReport;
        const drillDownDashboardReports = dashboardReports
          .filter(d => d.drillDownLevel !== null)
          .sort((d1, d2) => d1.drillDownLevel - d2.drillDownLevel);

        // Creating Drill Down Dashboard Items
        if (drillDownDashboardReports.length > 0) {
          if (!viewJson.drillDown) {
            viewJson.drillDown = {};
          }
          viewJson.drillDown.itemCode = `${drillDownDashboardReports[0].id}_DrillDown_1`;

          await createDrillDownDashboardItems(db, drillDownDashboardReports);
        }

        if (!dataBuilder) {
          viewJson.noDataFetch = true;
        }

        const entityTypes = [
          ...new Set(
            dashboardGroups
              .filter(d => d.dashboardReports.includes(dashboardReportId))
              .map(({ organisationLevel }) => {
                if (organisationLevel === 'SubDistrict') {
                  return 'sub_district';
                }

                if (organisationLevel === 'SubFacility') {
                  return 'sub_facility';
                }

                return organisationLevel.toLowerCase();
              }),
          ),
        ];
        const projectCodes = [
          ...new Set(
            dashboardGroups
              .filter(d => d.dashboardReports.includes(dashboardReportId))
              .map(d => d.projectCodes)
              .flat(),
          ),
        ];
        const userGroups = [
          ...new Set(
            dashboardGroups
              .filter(d => d.dashboardReports.includes(dashboardReportId))
              .map(d => d.userGroup),
          ),
        ];
        const dashboardItem = await getDashboardItemByCode(db, reportCode);
        const legacyReport = await getLegacyReportByCode(db, reportCode);
        const dashboardItemId = dashboardItem ? dashboardItem.id : generateId();
        const dashboardRelation = await getDashboardRelationByDashboardAndChildId(
          db,
          dashboardId,
          dashboardItemId,
        );

        // Create main Dashboard Items
        if (!dashboardItem) {
          await insertObject(db, 'dashboard_item', {
            id: dashboardItemId,
            code: reportCode,
            config: viewJson,
            report_code: dataBuilder ? reportCode : null,
            legacy: true,
          });
        }

        if (!legacyReport && dataBuilder) {
          await insertObject(db, 'legacy_report', {
            id: generateId(),
            code: reportCode,
            data_builder: dataBuilder,
            data_builder_config: dataBuilderConfig,
            data_services: dataServices,
          });
        }

        if (!dashboardRelation) {
          await insertObject(db, 'dashboard_relation', {
            id: generateId(),
            dashboard_id: dashboardId,
            child_id: dashboardItemId,
            sort_order: i,
            permission_groups: `{${userGroups.toString()}}`,
            entity_types: `{${entityTypes.toString()}}`,
            project_codes: `{${projectCodes.toString()}}`,
          });
        }
      }
    }
  }
};

const migrateUnlinkedDashboardReports = async db => {
  const { rows: dashboardReports } = await db.runSql(`
    SELECT DISTINCT "dashboardReport".* FROM "dashboardReport"
    LEFT OUTER JOIN "dashboardGroup"
    ON "dashboardReport".id = ANY("dashboardGroup"."dashboardReports")
    WHERE "dashboardGroup"."dashboardReports" is null;
  `);

  for (const dashboardReport of dashboardReports) {
    const {
      id: reportCode,
      dataBuilder,
      dataBuilderConfig,
      viewJson,
      dataServices,
    } = dashboardReport;

    if (!dataBuilder) {
      viewJson.noDataFetch = true;
    }

    await insertObject(db, 'dashboard_item', {
      id: generateId(),
      code: reportCode,
      config: viewJson,
      report_code: dataBuilder ? reportCode : null,
      legacy: true,
    });

    if (dataBuilder) {
      await insertObject(db, 'legacy_report', {
        id: generateId(),
        code: reportCode,
        data_builder: dataBuilder,
        data_builder_config: dataBuilderConfig,
        data_services: dataServices,
      });
    }
  }
};

exports.up = async function (db) {
  await migrateLinkedDashboardReports(db);
  await migrateUnlinkedDashboardReports(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
