'use strict';

import { insertObject } from '../utilities/migration';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */

const REPORT_PART_1 = {
  id: 'Laos_Schools_School_Details_Table_1',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: [
      'Name of school',
      'Alternative school name',
      'School code',
      'Province',
      'District',
      'District population',
      'Priority district',
      'Village',
      'Village population',
    ],
    cells: [
      [
        {
          key: 'Name_of_school',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: 'name',
        },
      ],
      [
        {
          key: 'Alternative_school_name',
          operator: 'COMBINE_TEXT',
          dataElements: ['SchFDalt1', 'SchFDalt2'],
        },
      ],
      [
        {
          key: 'Code_of_school',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: 'code',
        },
      ],
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
          key: 'District_name',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          ancestorType: 'sub_district',
          field: 'name',
        },
      ],
      ['SDP001'],
      ['SPD001'],
      [
        {
          key: 'Village_name',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          ancestorType: 'village',
          field: 'name',
        },
      ],
      ['SVP001'],
    ],
    columns: ['main'],
    entityAggregation: {
      dataSourceEntityType: ['school', 'district', 'sub_district', 'village'],
      aggregationEntityType: 'school',
      aggregationType: 'RAW',
    },
  },
  viewJson: {
    name: 'School details table part 1',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

const REPORT_PART_2 = {
  id: 'Laos_Schools_School_Details_Table_2',
  dataBuilder: 'nonMatrixTableFromCells',
  dataBuilderConfig: {
    rows: [
      'School type',
      'Location',
      'Distance to main road',
      'Telephone number',
      'Development partner support',
    ],
    cells: [
      [
        {
          key: 'Type_of_school',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: 'subType',
        },
      ],
      [
        {
          key: 'School_Location',
          operator: 'ORG_UNIT_METADATA',
          orgUnitCode: '{organisationUnitCode}',
          field: 'coordinates',
        },
      ],
      [
        {
          key: 'Distance_To_Main_Road',
          operator: 'FORMAT',
          dataElement: 'SchDISmr',
          format: '{value}km',
        },
      ],
      ['SchCVD026b'],
      [
        {
          key: 'Alternative_school_name',
          operator: 'COMBINE_BINARY_AS_STRING',
          dataElementToString: {
            SchDP_WB: 'World Bank',
            SchDP_WC: 'World Concern Laos',
            SchDP_WR: 'World Renew',
            SchDP_WV: 'World Vision',
            SchDP_CRS: 'Catholic Relief Services (CRS)',
            SchDP_HII: 'Humanity & Inclusion - Handicap International',
            SchDP_RtR: 'Room to Read',
            SchDP_WFP: 'World Food Programme (WFP)',
            SchDP_AEAL: 'Aide et Action Laos (AEAL)',
            SchDP_Plan: 'Plan International',
            SchDP_UNICEF: 'UNICEF',
          },
        },
      ],
    ],
    columns: ['main'],
    entityAggregation: {
      dataSourceEntityType: 'school',
    },
  },
  viewJson: {
    name: 'School details table part 2',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
};

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_School_Laos_Schools_User';

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT_PART_1);
  await insertObject(db, 'dashboardReport', REPORT_PART_2);

  await db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_PART_1.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT_PART_2.id} }'
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT_PART_1.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_PART_1.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';

    DELETE FROM "dashboardReport" WHERE id = '${REPORT_PART_2.id}';
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT_PART_2.id}')
    WHERE
      "code" = '${DASHBOARD_GROUP_CODE}';
  `);
};

exports._meta = {
  version: 1,
};
