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
 * Browser counterpart to RemoveDataLakeServiceType. No DataTrak table uses `service_type`, so the
 * type can simply be recreated.
 */
exports.up = async function (db) {
  await db.runSql(`
    DROP TYPE service_type;
    CREATE TYPE service_type AS ENUM ('dhis', 'tupaia', 'indicator', 'weather', 'kobo', 'superset');
  `);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'data-lake';`);
};

exports._meta = {
  version: 1,
  targets: ['browser'],
};
