'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT_PROVINCE = {
  id: 'Laos_Schools_Province_Details_Table_1',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: ['Province code', 'Province population'],
    cells: [
      [
        {
          key: 'Province_code',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          ancestorType: 'district',
          field: 'code',
        },
      ],
      ['SDP001'],
    ],
    columns: ['main'],
    entityAggregation: {
      dataSourceEntityType: 'sub_district',
      aggregationEntityType: 'district',
      aggregationType: 'SUM_PER_ORG_GROUP',
    },
  },
  viewJson: {
    name: 'Province details table',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

const PROVINCE_DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_Province_Laos_Schools_User';
const NATIONAL_DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_Country_Laos_Schools_User';

const SCHOOLS_BY_TYPE_REPORT_ID = 'Laos_Schools_Number_Of_Schools_By_Type_Table';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const addReportToDashboard = (db, reportId, dashboardCode) => {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${reportId} }'
    WHERE
      "code" = '${dashboardCode}';
  `);
};

const deleteReportFromDashboard = (db, reportId, dashboardCode) => {
  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${reportId}')
    WHERE
      "code" = '${dashboardCode}';
  `);
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT_PROVINCE);
  await addReportToDashboard(db, REPORT_PROVINCE.id, PROVINCE_DASHBOARD_GROUP_CODE);
  await addReportToDashboard(db, SCHOOLS_BY_TYPE_REPORT_ID, PROVINCE_DASHBOARD_GROUP_CODE);
  await addReportToDashboard(db, SCHOOLS_BY_TYPE_REPORT_ID, NATIONAL_DASHBOARD_GROUP_CODE);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${REPORT_PROVINCE.id}';`);
  await deleteReportFromDashboard(db, REPORT_PROVINCE.id, PROVINCE_DASHBOARD_GROUP_CODE);
  await deleteReportFromDashboard(db, SCHOOLS_BY_TYPE_REPORT_ID, PROVINCE_DASHBOARD_GROUP_CODE);
  await deleteReportFromDashboard(db, SCHOOLS_BY_TYPE_REPORT_ID, NATIONAL_DASHBOARD_GROUP_CODE);
};

exports._meta = {
  version: 1,
};
