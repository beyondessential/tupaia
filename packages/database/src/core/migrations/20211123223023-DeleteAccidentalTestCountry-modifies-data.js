'use strict';

var dbm;
var type;
var seed;

const testCountryName = 'Klaus-Test';

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
  const selectTestCountryFromCountryTable = await db.runSql(`
    SELECT id FROM country WHERE name = '${testCountryName}';
  `);
  const [testCountry] = selectTestCountryFromCountryTable.rows;
  const testCountryId = testCountry.id;

  await db.runSql(`
    DELETE FROM country WHERE id = '${testCountryId}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
