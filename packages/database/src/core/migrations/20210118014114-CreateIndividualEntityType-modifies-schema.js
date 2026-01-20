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
  await db.runSql(`
    ALTER TYPE public.entity_type ADD VALUE 'individual';
  `);
};

exports.down = function (db) {
  // In case we need to remove 'case' entity_type:
  //
  // To remove value for ALTER TYPE in psql:
  //    alter table 'entity' alter 'type' type text;
  //    drop type entity_type;
  //    create type entity_type as enum('world', 'project', 'country',...);
  //    alter table 'entity' alter 'type' type entity_type using type::entity_type;
  //
  // https://stackoverflow.com/a/56777227
  return null;
};

exports._meta = {
  version: 1,
};
