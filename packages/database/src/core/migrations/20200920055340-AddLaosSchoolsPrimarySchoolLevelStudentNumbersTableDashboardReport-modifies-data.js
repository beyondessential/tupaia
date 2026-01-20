'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_CODE = 'LA_Laos_Schools_School_Laos_Schools_User';

const REPORT_ID = 'Laos_Schools_Number_Of_Students_Primary_School';

const DATA_BUILDER_CONFIG = {
  rows: ['Girls', 'Boys', 'Total'],
  cells: [
    ['SchPop009', 'SchPop011', 'SchPop013', 'SchPop015', 'SchPop017', 'SchPop019', '$rowTotal'],
    ['SchPop010', 'SchPop012', 'SchPop014', 'SchPop016', 'SchPop018', 'SchPop020', '$rowTotal'],
    [
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
    'Pre-Primary (Grade 0)',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Total',
  ],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Number of Students: Primary School',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  displayOnEntityConditions: {
    attributes: {
      type: 'Primary',
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
      "code" = '${DASHBOARD_GROUP_CODE}';
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
    "code" = '${DASHBOARD_GROUP_CODE}';
    `);
};

exports._meta = {
  version: 1,
};
