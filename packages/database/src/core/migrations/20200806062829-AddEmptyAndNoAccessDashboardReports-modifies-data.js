'use strict';

import { insertObject } from '../utilities';

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

const NO_ACCESS_DASHBOARD = {
  id: 'no_access',
  viewJson: {
    name: 'Basic Project Information',
    type: 'component',
    componentName: 'NoAccessDashboard',
  },
};

const NO_DATA_AT_LEVEL_DASHBOARD = {
  id: 'no_data_at_level',
  viewJson: {
    name: 'Basic Project Information',
    type: 'component',
    componentName: 'NoDataAtLevelDashboard',
  },
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', NO_ACCESS_DASHBOARD);
  await insertObject(db, 'dashboardReport', NO_DATA_AT_LEVEL_DASHBOARD);
};

exports.down = function (db) {
  return db.runSql(`
      DELETE FROM "dashboardReport" WHERE id = '${NO_ACCESS_DASHBOARD.id}' OR id = '${NO_DATA_AT_LEVEL_DASHBOARD.id}';
    `);
};

exports._meta = {
  version: 1,
};
