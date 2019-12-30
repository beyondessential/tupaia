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
  await db.removeColumn('geographical_area', 'organisation_unit_code');
  await db.addColumn('geographical_area', 'code', { type: 'text' });
  await db.runSql(`
    UPDATE geographical_area
    SET code = entity.code
    FROM entity
    WHERE geographical_area.name = entity.name AND entity.type = 'region';
  `);
  return null;
};

exports.down = async function(db) {
  await db.addColumn('geographical_area', 'organisation_unit_code', { type: 'varchar' });
  await db.removeColumn('geographical_area', 'code');
  return null;
};

exports._meta = {
  version: 1,
};
