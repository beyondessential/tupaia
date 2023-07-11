'use strict';

var dbm;
var type;
var seed;

const Public_Health_Services = 'Public Health Services';
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
      delete from entity
      where name = '${Public_Health_Services}'
  `);

  return db.runSql(`
      delete from clinic
      where name = '${Public_Health_Services}'
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
