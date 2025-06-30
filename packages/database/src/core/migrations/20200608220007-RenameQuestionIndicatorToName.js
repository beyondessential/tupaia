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

const OLD_NAME = 'indicator';
const NEW_NAME = 'name';

exports.up = function (db) {
  return db.runSql(`
    ALTER TABLE
      question
    RENAME COLUMN
      ${OLD_NAME}
    TO
      ${NEW_NAME};
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE
      question
    RENAME COLUMN
      ${NEW_NAME}
    TO
      ${OLD_NAME};
  `);
};

exports._meta = {
  version: 1,
};
