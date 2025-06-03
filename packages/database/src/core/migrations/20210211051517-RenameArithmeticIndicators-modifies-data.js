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
    UPDATE indicator i
    SET builder = 'analyticArithmetic',
    config = regexp_replace(i."config"::text, '\\"builder\\"\\: \\"arithmetic\\"','"builder": "analyticArithmetic"','g')::jsonb 
    WHERE builder = 'arithmetic';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE indicator i
    SET builder = 'arithmetic',
    config = regexp_replace(i."config"::text, '\\"builder\\"\\: \\"analyticArithmetic\\"','"builder": "arithmetic"','g')::jsonb 
    WHERE builder = 'analyticArithmetic';
  `);
};

exports._meta = {
  version: 1,
};
