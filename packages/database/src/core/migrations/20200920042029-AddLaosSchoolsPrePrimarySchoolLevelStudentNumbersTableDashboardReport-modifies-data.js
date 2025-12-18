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

const REPORT_ID = 'Laos_Schools_Number_Of_Students_Pre_Primary_School';

const DATA_BUILDER_CONFIG = {
  rows: ['Girls', 'Boys', 'Total'],
  cells: [
    ['SchPop001', 'SchPop003', 'SchPop005', 'SchPop007', '$rowTotal'],
    ['SchPop002', 'SchPop004', 'SchPop006', 'SchPop008', '$rowTotal'],
    ['$columnTotal', '$columnTotal', '$columnTotal', '$columnTotal', '$total'],
  ],
  columns: ['Nursery', 'Kinder 1', 'Kinder 2', 'Kinder 3', 'Total'],
  entityAggregation: {
    dataSourceEntityType: 'school',
  },
};

const VIEW_JSON = {
  name: 'Number of Students: Pre-Primary School',
  type: 'matrix',
  placeholder: '/static/media/PEHSMatrixPlaceholder.png',
  displayOnEntityConditions: {
    attributes: {
      type: 'Pre-School',
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
