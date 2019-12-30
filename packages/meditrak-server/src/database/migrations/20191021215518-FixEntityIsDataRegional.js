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
    UPDATE
      entity
    SET
      metadata = jsonb_set(metadata, '{dhis}', metadata->'dhis' || '{"isDataRegional": true}')
    WHERE
      (metadata#>>'{dhis, isDataRegional}')::boolean IS false AND
      country_code <> 'TO';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
