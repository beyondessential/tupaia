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

const HIERARCHY_CODE = 'covidau';

exports.up = async function (db) {
  await db.runSql(
    `UPDATE entity_hierarchy SET canonical_types = '{country, district, sub_district, postcode}' WHERE name = '${HIERARCHY_CODE}';`,
  );
};

exports.down = async function (db) {
  await db.runSql(
    `UPDATE entity_hierarchy SET canonical_types = '{}' WHERE name = '${HIERARCHY_CODE}';`,
  );
};

exports._meta = {
  version: 1,
};
