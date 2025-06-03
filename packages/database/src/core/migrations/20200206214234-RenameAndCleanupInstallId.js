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
  await db.runSql('ALTER TABLE install_id RENAME TO meditrak_device;');
  // Remove multiple entries for the same `install_id` from the table
  // Those were unintentionally created because of a bug
  // * commitId: #2d330d4
  // * location: `src/models/InstallId[20]`,
  // * reason: if `existing` = true and `existing.user_id` = `userId`),
  //   a record with the same `install_id`and `user_id` will be created
  await db.runSql(`
    DELETE FROM
      meditrak_device a
    USING
      meditrak_device b
    WHERE
      a.id < b.id AND
      a.install_id = b.install_id;
  `);
  return db.runSql(
    'ALTER TABLE meditrak_device ADD CONSTRAINT meditrak_device_install_id_unique UNIQUE (install_id);',
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
