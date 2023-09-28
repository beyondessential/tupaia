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
  await db.runSql(`ALTER TABLE meditrak_device ADD COLUMN last_login_time TIMESTAMP`);
  await db.runSql(`ALTER TABLE meditrak_device ADD COLUMN refresh_token text`);
  await db.runSql(`
      WITH meditrak_device_token AS (
        SELECT meditrak_device_id, user_id, MAX(token) AS refresh_token FROM refresh_token rt 
        WHERE meditrak_device_id IS NOT NULL 
        GROUP BY meditrak_device_id, user_id 
      )

      UPDATE meditrak_device as md
      SET refresh_token = mdt.refresh_token
      FROM meditrak_device_token mdt
      WHERE md.user_id = mdt.user_id AND md.id = mdt.meditrak_device_id
  `);
  await db.runSql(`ALTER TABLE refresh_token DROP COLUMN meditrak_device_id`);
  return null;
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE meditrak_device DROP COLUMN last_login_time`);
  await db.runSql(`ALTER TABLE meditrak_device DROP COLUMN refresh_token`);
  await db.runSql(`ALTER TABLE refresh_token ADD COLUMN meditrak_device_id text`);
  await db.runSql(
    `ALTER TABLE refresh_token ADD CONSTRAINT refresh_token_meditrak_device_id_fk FOREIGN KEY (meditrak_device_id) REFERENCES meditrak_device(id) ON UPDATE CASCADE ON DELETE CASCADE`,
  );
  return null;
};

exports._meta = {
  version: 1,
};
