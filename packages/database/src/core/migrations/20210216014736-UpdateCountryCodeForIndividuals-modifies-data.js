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

// the ids of the individuals that need to have their country_code updated
const INDIVIDUAL_IDS_TO_UPDATE = ['6018bde661f76a5311069bf2', '6018bde661f76a5311069c03'];

exports.up = async function (db) {
  INDIVIDUAL_IDS_TO_UPDATE.forEach(async individual => {
    await db.runSql(`
      UPDATE "entity" SET "country_code"='SB' WHERE "id"='${individual}';
    `);
  });
};

exports.down = async function (db) {
  INDIVIDUAL_IDS_TO_UPDATE.forEach(async individual => {
    await db.runSql(`
      UPDATE "entity" SET "country_code"='PG' WHERE "id"='${individual}';
    `);
  });
};

exports._meta = {
  version: 1,
};
