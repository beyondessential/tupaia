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

exports.up = function (db) {
  return db.runSql(`
    update entity
    set bounds = 'POLYGON ((110 6.5, -155.5 6.5, -155.5 -40, 149 -40, 110 6.5))'
    where code = 'World'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    update entity
    set bounds = 'POLYGON ((149 6.5, -155.5 6.5, -155.5 -30, 149 -30, 149 6.5))'
    where code = 'World'
  `);
};

exports._meta = {
  version: 1,
};
