('use strict');

import { codeToId, deleteObject, generateId, insertObject } from '../utilities';

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

const DASHBOARD_GROUP = 'PG_COVID_19_Surveillance';

exports.up = async function (db) {
  const dashboardId = await codeToId(db, 'dashboard', DASHBOARD_GROUP);

  await deleteObject(db, 'dashboard_relation', { dashboard_id: dashboardId });
  await deleteObject(db, 'dashboard', { id: dashboardId });
};

exports.down = async function (db) {
  await insertObject(db, 'dashboard', {
    id: generateId(),
    code: DASHBOARD_GROUP,
    name: 'COVID 19 Surveillance',
    root_entity_code: 'TO',
  });
};

exports._meta = {
  version: 1,
};
