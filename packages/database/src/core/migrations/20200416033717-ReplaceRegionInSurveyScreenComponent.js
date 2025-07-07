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

const updateTextInComponentConfig = async (db, oldValue, newValue) =>
  db.runSql(`
    UPDATE "survey_screen_component" SET config = REPLACE(config, '"${oldValue}"', '"${newValue}"');
`);

exports.up = async function (db) {
  await updateTextInComponentConfig(db, 'region', 'district');
};

exports.down = async function (db) {
  await updateTextInComponentConfig(db, 'district', 'region');
};

exports._meta = {
  version: 1,
};
