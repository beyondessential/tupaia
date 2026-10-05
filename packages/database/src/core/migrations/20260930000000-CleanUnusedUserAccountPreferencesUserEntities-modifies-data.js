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
    UPDATE user_account
    SET preferences = preferences - 'recentEntities'
    WHERE preferences ? 'recentEntities';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
