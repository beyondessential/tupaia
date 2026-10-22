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

/**
 * `db-migrate` passes `?` operator through to PostgreSQL, but Knex will try to interpret it as a
 * binding! Run this migration server-side only and let update sync to DataTrak clients.
 */
exports.up = async function (db) {
  await db.runSql(`
    UPDATE entity
    SET metadata = metadata - 'ms1'
    WHERE metadata ? 'ms1';

    UPDATE survey
    SET integration_metadata = integration_metadata - 'ms1'
    WHERE integration_metadata ? 'ms1';

    -- config is VARCHAR, not JSONB. (Expected to be no-op anyway)
    UPDATE survey_screen_component
    SET config = (config::jsonb #- '{entity,fields,metadata,ms1}')::text
    WHERE config::jsonb #> '{entity,fields,metadata,ms1}' IS NOT NULL;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
