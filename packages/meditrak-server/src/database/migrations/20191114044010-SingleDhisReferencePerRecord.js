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
  await db.addColumn('dhis_sync_log', 'dhis_reference', { type: 'text' });
  await db.runSql(`
    UPDATE dhis_sync_log
      SET dhis_reference = dhis_references[1]
      WHERE cardinality(dhis_references) = 1
  `);
  return db.removeColumn('dhis_sync_log', 'dhis_references');
};

exports.down = async function(db) {
  await db.addColumn('dhis_sync_log', 'dhis_references', { type: 'text[]' });
  await db.runSql(`
    UPDATE dhis_sync_log
      SET dhis_references[1] = dhis_reference
      WHERE dhis_reference IS NOT NULL;
  `);
  return db.removeColumn('dhis_sync_log', 'dhis_reference');
};

exports._meta = {
  version: 1,
};
