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

const updateFieldKeyInBuilderConfig = async (db, oldKey, newKey) =>
  db.runSql(`
    UPDATE
      "dashboardReport"
    SET
      "dataBuilderConfig" = "dataBuilderConfig"
        - '${oldKey}'
        || jsonb_build_object('${newKey}', "dataBuilderConfig"->>'${oldKey}')
    WHERE
      "dataBuilderConfig" ? '${oldKey}';
`);

exports.up = async function (db) {
  await updateFieldKeyInBuilderConfig(db, 'organisationUnitLevel', 'organisationUnitType');
};

exports.down = async function (db) {
  await updateFieldKeyInBuilderConfig(db, 'organisationUnitType', 'organisationUnitLevel');
};

exports._meta = {
  version: 1,
};
