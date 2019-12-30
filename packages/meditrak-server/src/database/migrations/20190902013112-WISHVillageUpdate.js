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

exports.up = async function(db) {
  // Removing Veilolo Settlement and Waivula Settlement as requested
  const entities = await db.runSql(`
      SELECT * FROM entity WHERE code IN ('FJ_WIU', 'FJ_VIO');
  `);
  const [entity1 = {}, entity2 = {}] = entities.rows;
  return db.runSql(`
      DELETE FROM entity WHERE id IN ('${entity1.id}', '${entity2.id}');
      UPDATE meditrak_sync_queue SET type = 'delete' WHERE record_id IN ('${entity1.id}', '${entity2.id}');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
