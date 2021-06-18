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

const deleteOverlayRelation = async (db, id) => {
  return db.runSql(`
    delete from "map_overlay_group_relation" where "child_id" = '${id}';
  `);
};

exports.up = async function (db) {
  await deleteOverlayRelation(db, 'FJ_COVID_TRACKING_Dose_1_Facility');
  await deleteOverlayRelation(db, 'FJ_COVID_TRACKING_Dose_2_Facility');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
