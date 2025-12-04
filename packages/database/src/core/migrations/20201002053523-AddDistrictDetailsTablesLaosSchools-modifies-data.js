'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT_DISTRICT_INFO = {
  id: 'Laos_Schools_District_Details_Table_District_Info',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: ['District code', 'District population', 'Priority district'],
    cells: [
      [
        {
          key: 'District_code',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: 'code',
        },
      ],
      ['SDP001'],
      ['SPD001'],
    ],
    columns: ['main'],
    entityAggregation: {
      dataSourceEntityType: 'sub_district',
    },
  },
  viewJson: {
    name: 'District details table',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

const REPORT_PROVINCE_INFO = {
  id: 'Laos_Schools_District_Details_Table_Province_Info',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: ['Province', 'Province code', 'Province population'],
    cells: [
      [
        {
          key: 'Province_name',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          ancestorType: 'district',
          field: 'name',
        },
      ],
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
      includeSiblingData: true,
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

const REPORT_NUMBER_OF_SCHOOLS_BY_TYPE = {
  id: 'Laos_Schools_Number_Of_Schools_By_Type_Table',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: ['Number of pre-schools', 'Number of primary schools', 'Number of secondary schools'],
    cells: [
      [
        {
          key: 'Pre_Primary_School_Count',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: '$countDescendantsMatchingConditions',
          conditions: [
            { field: 'type', value: 'school' },
            { field: 'subType', value: 'Pre-School' },
          ],
        },
      ],
      [
        {
          key: 'Primary_School_Count',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: '$countDescendantsMatchingConditions',
          conditions: [
            { field: 'type', value: 'school' },
            { field: 'subType', value: 'Primary' },
          ],
        },
      ],
      [
        {
          key: 'Secondary_School_Count',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: '$countDescendantsMatchingConditions',
          conditions: [
            { field: 'type', value: 'school' },
            { field: 'subType', value: 'Secondary' },
          ],
        },
      ],
    ],
    columns: ['main'],
  },
  viewJson: {
    name: 'Number of schools by type table',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_District_Laos_Schools_User';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const addReport = async (db, report) => {
  await insertObject(db, 'dashboardReport', report);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${report.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

const deleteReport = async (db, report) => {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${report.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${report.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.up = async function (db) {
  await addReport(db, REPORT_DISTRICT_INFO);
  await addReport(db, REPORT_PROVINCE_INFO);
  await addReport(db, REPORT_NUMBER_OF_SCHOOLS_BY_TYPE);
};

exports.down = async function (db) {
  await deleteReport(db, REPORT_DISTRICT_INFO);
  await deleteReport(db, REPORT_PROVINCE_INFO);
  await deleteReport(db, REPORT_NUMBER_OF_SCHOOLS_BY_TYPE);
};

exports._meta = {
  version: 1,
};
