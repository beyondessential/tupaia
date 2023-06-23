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

exports.up = async function (db) {
  // Move `eventOrgUnit` to the top level of `integration_metadata`
  await db.runSql(`
    UPDATE survey SET integration_metadata = integration_metadata
      || jsonb_build_object('eventOrgUnit', integration_metadata->'dhis2'->'eventOrgUnit')
    WHERE integration_metadata->'dhis2' ? 'eventOrgUnit'
  `);

  await db.runSql(`UPDATE survey SET integration_metadata = integration_metadata - 'dhis2';`);
  await db.runSql(`ALTER TABLE survey ALTER COLUMN integration_metadata SET DEFAULT '{}'`);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
