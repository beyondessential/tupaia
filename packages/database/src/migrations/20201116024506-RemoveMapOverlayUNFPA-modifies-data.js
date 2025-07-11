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
  const { rows } = await db.runSql(`
    SELECT id FROM map_overlay_group WHERE code = 'Services_provided'
  `);
  const [{ id: servicesProvidedId }] = rows;

  return db.runSql(`
    UPDATE "mapOverlay"
      SET "projectCodes" = array_remove("projectCodes",'unfpa')
    FROM map_overlay_group_relation
    WHERE map_overlay_group_relation.map_overlay_group_id = '${servicesProvidedId}'
      AND map_overlay_group_relation.child_id = "mapOverlay".id;
  `);
};

exports.down = async function (db) {
  const { rows } = await db.runSql(`
    SELECT id FROM map_overlay_group WHERE code = 'Services_provided'
  `);
  const [{ id: servicesProvidedId }] = rows;

  return db.runSql(`
    UPDATE "mapOverlay"
      SET "projectCodes" = array_prepend('unfpa',"projectCodes")
    FROM map_overlay_group_relation
    WHERE map_overlay_group_relation.map_overlay_group_id = '${servicesProvidedId}'
      AND map_overlay_group_relation.child_id = "mapOverlay".id;
  `);
};

exports._meta = {
  version: 1,
};
