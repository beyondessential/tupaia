('use strict');

import { codeToId, deleteObject } from '../utilities';

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

const DASHBOARD_CODE = 'PG_COVID_19_Surveillance';

exports.up = async function (db) {
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_CODE);
  await deleteObject(db, 'dashboard_relation', { dashboard_id: dashboardId });
  return deleteObject(db, 'dashboard', { id: dashboardId });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
