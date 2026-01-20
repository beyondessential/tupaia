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

const REPORT_ID = 'Laos_Schools_Number_Of_Students_Secondary_School';

const DATA_BUILDER_CONFIG = {
  rows: ['Girls', 'Boys', 'Total'],
  cells: [
    [
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
      '$total',
    ],
  ],
  columns: [
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
  name: 'Number of Students: Secondary School',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  displayOnEntityConditions: {
    attributes: {
      type: 'Secondary',
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
