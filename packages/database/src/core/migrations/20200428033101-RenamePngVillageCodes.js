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

const LAE_ORAKI_ID = '5dc35b6761f76a18373b5be9'; // Incorrect spelling
const LAE_OKARI_ID = '5e70645d61f76a411c00036d'; // Correct spelling

exports.up = function (db) {
  return db.runSql(`
    UPDATE entity e
      SET parent_id = '${LAE_OKARI_ID}'
      WHERE parent_id = '${LAE_ORAKI_ID}';
  
    DELETE FROM entity 
      WHERE id = '${LAE_ORAKI_ID}';

    UPDATE entity
      SET code = 'PG_' || code
      WHERE type = 'village' AND country_code = 'PG';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE entity 
      SET code = trim(leading 'PG_' from code)
      WHERE type = 'village' AND country_code = 'PG';
  `);
};

exports._meta = {
  version: 1,
};
