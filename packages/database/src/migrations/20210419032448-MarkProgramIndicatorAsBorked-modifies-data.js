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

const Total_Positive_Malaria_Cases = '6053d19e61f76a6917000008';

exports.up = async function (db) {
  await db.runSql(
    `update data_source SET config = config || '{"dhisIndicatorWrappingBug": true}' WHERE id = '${Total_Positive_Malaria_Cases}';`,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
