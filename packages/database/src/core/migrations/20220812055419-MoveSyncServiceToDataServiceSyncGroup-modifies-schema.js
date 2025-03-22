'use strict';

const { updateValues, findSingleRecord } = require('../utilities');

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
  // Add sync_cursor column to data_service_sync_group
  await db.runSql(
    `ALTER TABLE data_service_sync_group ADD COLUMN sync_cursor text DEFAULT '1970-01-01T00:00:00.000Z'`,
  );

  // Copy sync_cursor over to data_service_sync_group
  const syncServices = (await db.runSql('SELECT * from sync_service')).rows;
  for (let i = 0; i < syncServices.length; i++) {
    const { sync_cursor: syncCursor, service_type: serviceType } = syncServices[i];
    await updateValues(
      db,
      'data_service_sync_group',
      { sync_cursor: syncCursor },
      { service_type: serviceType },
    );
  }

  await db.runSql(`ALTER TABLE sync_service_log RENAME TO sync_group_log;`);
  await db.runSql(`ALTER TABLE sync_group_log RENAME COLUMN service_code TO sync_group_code;`);

  await db.runSql(`DROP TABLE sync_service;`);

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
