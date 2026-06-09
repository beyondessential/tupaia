'use strict';

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
const PERMISSION_GROUP_NAME = 'Tonga Screening Forms CH11/HP02';
const PARENT_NAME = 'Tonga Health Promotion Unit';

exports.up = async function (db) {
  const parentId = (
    await db.runSql(`select "id" from "permission_group" where "name"='${PARENT_NAME}';`)
  ).rows[0].id;
  return db.runSql(`
    update "permission_group"
    set "parent_id" = '${parentId}'
    where "name" = '${PERMISSION_GROUP_NAME}';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "permission_group"
    set "parent_id" = NULL
    where "name" = '${PERMISSION_GROUP_NAME}';
  `);
};

exports._meta = {
  version: 1,
};
