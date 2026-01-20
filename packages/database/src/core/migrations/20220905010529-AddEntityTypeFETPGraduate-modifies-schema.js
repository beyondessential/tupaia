'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    ALTER TYPE public.entity_type ADD VALUE 'fetp_graduate';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
