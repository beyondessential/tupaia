'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'bes_asset';
    ALTER TYPE public.entity_type ADD VALUE IF NOT EXISTS 'bes_office';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
