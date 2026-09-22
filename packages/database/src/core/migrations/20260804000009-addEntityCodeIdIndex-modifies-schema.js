'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

// The MediTrak sync's canonical-entity filter runs `SELECT MIN(id) FROM entity
// GROUP BY code` on every sync request (see meditrakSyncQuery.js). Post-epic
// the entity table has multiple rows per code, so this aggregate grows with the
// table. A (code, id) index lets it resolve via an index-only scan instead of a
// full sequential scan + sort. (entity_code_project_id_unique is on
// (code, project_id) and doesn't help a GROUP BY code MIN(id).)
exports.up = async function (db) {
  await db.runSql(`CREATE INDEX IF NOT EXISTS entity_code_id_idx ON entity (code, id);`);
};

exports.down = async function (db) {
  await db.runSql(`DROP INDEX IF EXISTS entity_code_id_idx;`);
};

exports._meta = {
  version: 1,
  // Server-only: the canonical filter is a central-server sync concern.
  targets: ['server'],
};
