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
  await db.runSql(`ALTER TABLE entity ADD COLUMN IF NOT EXISTS duplicate_ids TEXT[];`);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE entity DROP COLUMN IF EXISTS duplicate_ids;`);
};

exports._meta = {
  version: 1,
  // Browser-only: on central `duplicate_ids` is a computed sync-blob field, not a
  // real column. Only the client replica materialises it so the offline QR scanner
  // can resolve a scanned id → code → local project copy.
  targets: ['browser'],
};
