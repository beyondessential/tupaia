'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT = {
  id: 'Laos_Schools_District_Details_Table',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: [
      'District code',
      'District population',
      'Priority district',
      'Province',
      'Province code',
      'Province population',
      'Number of Pre-schools',
      'Number of Primary schools',
      'Number of Secondary schools',
    ],
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
      ['SPP001'],
      [
        {
          key: 'Pre_Primary_School_Count',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: '$countDescendantsMatchingConditions',
          conditions: [
            { field: 'type', value: 'school' },
            { field: 'subType', value: 'Pre-Primary' },
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
    entityAggregation: {
      dataSourceEntityType: ['district', 'sub_district'],
      aggregationEntityType: 'sub_district',
      aggregationType: 'RAW',
    },
  },
  viewJson: {
    name: 'District details table',
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

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
