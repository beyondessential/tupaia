'use strict';

import { insertObject } from '../utilities';

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

const mapOverlaysGroupsRelationData = [
  {
    mapOverlayGroupName: 'RH Commodity Months of Stock (National Warehouse)',
    map_overlay_group_id: '5f2c7ddb61f76a513a000013',
    items: [
      { id: '5f2c7ddb61f76a513a00005e', child_id: 'RH_MOS_4752843e_Regional', sort_order: 0 },
      { id: '5f2c7ddb61f76a513a000059', child_id: 'RH_MOS_3ff944bf_Regional', sort_order: 0 },
      { id: '5f2c7ddb61f76a513a00005f', child_id: 'RH_MOS_542a34bf_Regional', sort_order: 0 },
    ],
  },
  {
    mapOverlayGroupName: 'Reproductive Health Commodities (mSupply)',
    map_overlay_group_id: '5f2c7ddb61f76a513a000028',
    items: [
      { id: '5f2c7ddb61f76a513a0000a4', child_id: 'UNFPA_RH_SAYANA_Press', sort_order: 9 },
      { id: '5f2c7ddb61f76a513a000029', child_id: 'UNFPA_RH_Norethisterone_amp', sort_order: 10 },
      {
        id: '5f2c7ddb61f76a513a00009f',
        child_id: 'UNFPA_RH_Etonogestrel-releasing_implant',
        sort_order: 4,
      },
    ],
  },
];

exports.up = async function (db) {
  //  Remove these items in map overlay group (check @Params: mapOverlaysGroupsRelationData)
  for (const relations of mapOverlaysGroupsRelationData) {
    for (const item of relations.items) {
      await db.runSql(`
        delete from map_overlay_group_relation mogr
        using map_overlay_group mog
        where mog."name" = '${relations.mapOverlayGroupName}' 
        and mogr.child_id = '${item.child_id}'
      `);
    }
  }
};

exports.down = async function (db) {
  // Restore these items in 'map_overlay_group_relation' table
  for (const restoreData of mapOverlaysGroupsRelationData) {
    for (const item of restoreData.items) {
      const data = {
        child_type: 'mapOverlay',
        map_overlay_group_id: restoreData.map_overlay_group_id,
        ...item,
      };
      await insertObject(db, 'map_overlay_group_relation', data);
    }
  }
};

exports._meta = {
  version: 1,
};
