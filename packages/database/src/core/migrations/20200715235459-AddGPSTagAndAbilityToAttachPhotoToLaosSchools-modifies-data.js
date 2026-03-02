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

exports.up = async function (db) {
  await db.runSql(`
  UPDATE question
  SET hook = 'entityCoordinates'
  WHERE code = 'SchFDgps';

  UPDATE question
  SET hook = 'entityImage'
  WHERE code = 'SchFDpho';
`);
};

exports.down = async function (db) {
  await db.runSql(`
  UPDATE question
  SET hook = null
  WHERE code = 'SchFDgps';

  UPDATE question
  SET hook = null
  WHERE code = 'SchFDpho';
`);
};

exports._meta = {
  version: 1,
};
