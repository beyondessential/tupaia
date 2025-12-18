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

const OVERLAY_IDS = ['STRIVE_WTF_mRDT_Tests_Radius', 'STRIVE_WTF_Consultations_Radius'];

const updateOverlay = async (db, id) => {
  const { rows } = await db.runSql(`SELECT * FROM "mapOverlay" WHERE id = '${id}'`);
  const [overlay] = rows;

  const measureBuilderConfig = {
    ...overlay.measureBuilderConfig,
    aggregations: [{ type: 'FINAL_EACH_DAY' }, { type: 'SUM' }],
  };
  delete measureBuilderConfig.aggregationType;

  return db.runSql(
    `UPDATE "mapOverlay"
    SET "measureBuilderConfig" = '${JSON.stringify(measureBuilderConfig)}'
    WHERE id = '${id}'`,
  );
};

exports.up = async function (db) {
  for (const id of OVERLAY_IDS) {
    await updateOverlay(db, id);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
