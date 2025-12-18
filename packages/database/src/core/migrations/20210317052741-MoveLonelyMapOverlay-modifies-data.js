'use strict';

import { generateId, insertObject } from '../utilities';

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
  await db.runSql(
    `DELETE FROM map_overlay_group_relation where child_id = 'LA_EOC_Dengue_Cases_By_Week';`,
  );
  await db.runSql(`DELETE FROM map_overlay_group where code = 'LA_EOC_Communicable_Diseases';`);

  const dengueMapOverlayGroupId = (
    await db.runSql(`SELECT id FROM map_overlay_group WHERE code = 'LAOS_EOC_Dengue';`)
  ).rows[0].id;

  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: dengueMapOverlayGroupId,
    child_id: 'LA_EOC_Dengue_Cases_By_Week',
    child_type: 'mapOverlay',
    sort_order: 0, // put first as it has the nicest looking vis
  });

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
