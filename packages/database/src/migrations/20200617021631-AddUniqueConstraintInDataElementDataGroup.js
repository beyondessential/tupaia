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

const deleteDuplicates = async db =>
  db.runSql(`
    DELETE FROM data_element_data_group t1
    USING data_element_data_group t2
    WHERE
      t1.id > t2.id AND
      t1.data_element_id = t2.data_element_id AND
      t1.data_group_id = t2.data_group_id
`);

exports.up = async function (db) {
  await deleteDuplicates(db);
  await db.runSql(`
    ALTER TABLE data_element_data_group
    ADD CONSTRAINT data_element_data_group_unique UNIQUE (data_element_id, data_group_id)`);
};

exports.down = async function (db) {
  await db.runSql(
    `ALTER TABLE data_element_data_group DROP CONSTRAINT data_element_data_group_unique`,
  );
};

exports._meta = {
  version: 1,
};
