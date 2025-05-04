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

const parentPermission = 'Fiji Restricted Data';
const childPermission = 'Fiji Data Collection';

const nameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM "permission_group" WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

exports.up = async function (db) {
  const parentId = await nameToId(db, parentPermission);
  await db.runSql(`
    UPDATE "permission_group" 
    SET parent_id = '${parentId}'
    WHERE name = '${childPermission}'
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
