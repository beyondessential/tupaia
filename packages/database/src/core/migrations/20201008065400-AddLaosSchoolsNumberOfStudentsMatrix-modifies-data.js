'use strict';

import { insertObject, arrayToDbString } from '../utilities/migration';

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
  'LA_Laos_Schools_Country_Laos_Schools_User',
  'LA_Laos_Schools_Province_Laos_Schools_User',
  'LA_Laos_Schools_District_Laos_Schools_User',
];

const REPORT_ID = 'Laos_Schools_Number_Of_Students_Matrix';

const DATA_BUILDER_CONFIG = {
  rows: ['Girls', 'Boys', 'Total'],
  cells: [
    [
      'SchPop009',
      'SchPop011',
      'SchPop013',
      'SchPop015',
      'SchPop017',
      'SchPop019',
      'SchPop021',
      'SchPop023',
      'SchPop025',
      'SchPop027',
      'SchPop029',
      'SchPop031',
      'SchPop033',
      '$rowTotal',
    ],
    [
      'SchPop010',
      'SchPop012',
      'SchPop014',
      'SchPop016',
      'SchPop018',
      'SchPop020',
      'SchPop022',
      'SchPop024',
      'SchPop026',
      'SchPop028',
      'SchPop030',
      'SchPop032',
      'SchPop034',
      '$rowTotal',
    ],
    [
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$columnTotal',
      '$total',
    ],
  ],
  columns: [
    'Pre-primary',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'Grade 10',
    'Grade 11',
    'Grade 12',
    'Total',
  ],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Number of Students',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
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
      "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
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
    "code" IN (${arrayToDbString(DASHBOARD_GROUP_CODES)});
  `);
};

exports._meta = {
  version: 1,
};
