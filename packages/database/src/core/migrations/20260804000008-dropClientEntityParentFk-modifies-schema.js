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
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_parent_id_fkey;`);
};

exports.down = async function (db) {
  // Re-adding the constraint would fail against synced data (dangling world
  // references, see above), so down is a no-op.
};

exports._meta = {
  version: 1,
  // Browser-only: central keeps its FK; only the client replica drops it.
  targets: ['browser'],
};
