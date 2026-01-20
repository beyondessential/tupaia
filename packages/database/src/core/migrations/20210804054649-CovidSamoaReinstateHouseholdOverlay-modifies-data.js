'use strict';

import { codeToId, insertObject, generateId } from '../utilities';

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
const mapOverlayGroupCode = 'COVID19_Samoa';
const mapOverlayId = 'WS_COVID_Household_Vaccination_Status';
const reportCode = 'WS_COVID_Household_Vaccination_Status';

const mapOverlayGroupRelation = groupId => ({
  id: generateId(),
  map_overlay_group_id: groupId,
  child_id: mapOverlayId,
  child_type: 'mapOverlay',
  sort_order: 4,
});

exports.up = async function (db) {
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', mapOverlayGroupCode);
  await insertObject(db, 'map_overlay_group_relation', mapOverlayGroupRelation(mapOverlayGroupId));
  await db.runSql(`
    update report
        set config = jsonb_set(config, '{transform,1,where}', '"notEq($row.HVS_covidstatus, ''Fully vaccinated'')"')
        where code = '${reportCode}';
  `);
  return null;
};

exports.down = function (db) {
  return db.runSql(`
    delete from "map_overlay_group_relation" where "child_id" = '${mapOverlayId}';
  `);
};

exports._meta = {
  version: 1,
};
