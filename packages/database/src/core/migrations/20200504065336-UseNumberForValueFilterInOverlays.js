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

const updateMeasureBuilderConfigValue = (db, { id, path, value }) =>
  db.runSql(`
    UPDATE
      "mapOverlay"
    SET
      "measureBuilderConfig"= jsonb_set(
        "measureBuilderConfig",
        '{${path}}',
        '${value}'
      )
    WHERE id = '${id}';
`);

const OVERLAY_IDS = [
  'STRIVE_FIS_Village_Percent_mRDT_Positive_In_Week',
  'STRIVE_FIS_Village_Percent_mRDT_Positive_PF_In_Week',
  'STRIVE_FIS_Village_Percent_mRDT_Positive_Non_PF_In_Week',
  'STRIVE_FIS_Village_Percent_mRDT_Positive_Mixed_In_Week',
];

const CONFIG_CHANGE = {
  path: ['measureBuilders', 'denominator', 'measureBuilderConfig', 'dataValues', 'STR_CRF165'],
  oldValue: '"1"',
  newValue: 1,
};

exports.up = async function (db) {
  return Promise.all(
    OVERLAY_IDS.map(id =>
      updateMeasureBuilderConfigValue(db, {
        id,
        path: CONFIG_CHANGE.path,
        value: CONFIG_CHANGE.newValue,
      }),
    ),
  );
};

exports.down = async function (db) {
  return Promise.all(
    CONFIG_CHANGE.map(({ id, path, oldValue }) =>
      updateMeasureBuilderConfigValue(db, {
        id,
        path: CONFIG_CHANGE.path,
        value: CONFIG_CHANGE.oldValue,
      }),
    ),
  );
};

exports._meta = {
  version: 1,
};
