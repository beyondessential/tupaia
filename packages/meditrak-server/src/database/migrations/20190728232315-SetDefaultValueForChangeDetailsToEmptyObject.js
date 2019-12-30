'use strict';

var dbm;
var type;
var seed;

const TABLE = 'dhis_sync_queue';
const COLUMN = 'details';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  await db.runSql(`UPDATE ${TABLE} SET ${COLUMN} = '{}' WHERE ${COLUMN} IS NULL;`);
  return db.runSql(`ALTER TABLE ${TABLE} ALTER COLUMN ${COLUMN} SET DEFAULT '{}'`);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
