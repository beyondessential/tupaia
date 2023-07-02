'use strict';

import { insertObject } from '../utilities/migration';
import { arrayToDbString } from '../utilities';

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

const DASHBOARD_GROUP_CODES = [
  'WS_Unfpa_Facility',
  'MH_Unfpa_Facility',
  'TO_Unfpa_Facility',
  'FM_Unfpa_Facility',
  'VU_Unfpa_Facility',
  'FJ_Unfpa_Facility',
  'SB_Unfpa_Facility',
  'DL_Unfpa_Facility',
  'KI_Unfpa_Facility',
];

const REPORT_ID = 'UNFPA_RH_Stock_Cards_Use_Matrix';

const DATA_BUILDER_CONFIG = {
  rows: [
    'Male condoms',
    'Female condoms',
    'Combined oral contraceptive',
    'Progesterone only pill',
    'Injectable contraceptives',
    'IUDs',
    'Implant contraceptives',
    'Emergency contraceptives',
  ],
  cells: [
    ['RHS6UNFPA1206', 'RHS6UNFPA1210', 'RHS6UNFPA1211'],
    ['RHS6UNFPA1219', 'RHS6UNFPA1223', 'RHS6UNFPA1224'],
    ['RHS6UNFPA1232', 'RHS6UNFPA1236', 'RHS6UNFPA1237'],
    ['RHS6UNFPA1245', 'RHS6UNFPA1249', 'RHS6UNFPA1250'],
    ['RHS6UNFPA1258', 'RHS6UNFPA1262', 'RHS6UNFPA1263'],
    ['RHS6UNFPA1271', 'RHS6UNFPA1275', 'RHS6UNFPA1276'],
    ['RHS6UNFPA1284', 'RHS6UNFPA1288', 'RHS6UNFPA1289'],
    ['RHS6UNFPA1297', 'RHS6UNFPA1301', 'RHS6UNFPA1302'],
  ],
  columns: [
    'Managed at this Facility',
    'Stock card used at this facility',
    'Stock card up to date',
  ],
};

const VIEW_JSON = {
  name: 'Stock Card Use at Facility Level for RH Products',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  periodGranularity: 'one_year_at_a_time',
  showPeriodRange: 'all',
  presentationOptions: {
    1: {
      color: 'green',
      label: '',
      description: "**Green** indicates 'Yes' to the corresponding indicator.\n",
    },
    0: {
      color: 'red',
      label: '',
      description: "**Red** indicates 'No' to the corresponding indicator.\n",
    },
  },
};

const REPORT = {
  id: REPORT_ID,
  dataBuilder: 'tableOfDataValues',
  dataBuilderConfig: DATA_BUILDER_CONFIG,
  viewJson: VIEW_JSON,
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);

  return db.runSql(`
    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = "dashboardReports" || '{ ${REPORT.id} }'
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';

    UPDATE
      "dashboardGroup"
    SET
      "dashboardReports" = array_remove("dashboardReports", '${REPORT.id}')
    WHERE
      "code" in (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
