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

const updateMeasureBuilderConfig = async (db, { field, oldValue, newValue }) =>
  db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig" = jsonb_set("measureBuilderConfig", '{${field}}', '"${newValue}"')
    WHERE
      "measureBuilderConfig"->>'${field}' = '${oldValue}'
`);

exports.up = async function (db) {
  await updateMeasureBuilderConfig(db, {
    field: 'aggregationEntityType',
    oldValue: 'region',
    newValue: 'district',
  });
  await updateMeasureBuilderConfig(db, {
    field: 'dataSourceEntityType',
    oldValue: 'region',
    newValue: 'district',
  });
};

exports.down = async function (db) {
  await updateMeasureBuilderConfig(db, {
    field: 'aggregationEntityType',
    oldValue: 'district',
    newValue: 'region',
  });
  await updateMeasureBuilderConfig(db, {
    field: 'dataSourceEntityType',
    oldValue: 'district',
    newValue: 'region',
  });
};

exports._meta = {
  version: 1,
};
