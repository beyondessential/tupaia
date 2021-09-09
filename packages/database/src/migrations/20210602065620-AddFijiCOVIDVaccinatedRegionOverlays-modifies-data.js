'use strict';

import { insertObject, generateId, codeToId } from '../utilities';

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

const getOverlayId = (doseNum, level) => `FJ_COVID_TRACKING_Dose_${doseNum}_${level}`;

const createMapOverlay = (doseNum, aggregationEntityType, level, overlayLevelName) => ({
  id: getOverlayId(doseNum, level),
  name: `COVID-19 Vaccine Dose ${doseNum} (${overlayLevelName})`,
  userGroup: 'Fiji Supply Chain',
  dataElementCode: doseNum === 1 ? 'COVIDVac4' : 'COVIDVac8',
  measureBuilderConfig: {
    aggregations: [
      {
        type: 'FINAL_EACH_DAY',
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'sub_district',
      aggregationEntityType,
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    displayType: 'shaded-spectrum',
    scaleBounds: {
      left: {
        max: 1,
        min: 1,
      },
    },
    measureLevel: level,
    scaleColorScheme: 'default',
  },
  countryCodes: '{FJ}',
  projectCodes: '{supplychain_fiji}',
});

const insertOverlay = async (db, overlay, mapOverlayGroupId) => {
  await insertObject(db, 'mapOverlay', overlay);
  await insertObject(db, 'map_overlay_group_relation', {
    id: generateId(),
    map_overlay_group_id: mapOverlayGroupId,
    child_id: overlay.id,
    child_type: 'mapOverlay',
  });
};

const deleteOverlay = async (db, overlayId) => {
  return db.runSql(`
    delete from "mapOverlay" where "id" = '${overlayId}';
    delete from "map_overlay_group_relation" where "child_id" = '${overlayId}';
  `);
};

exports.up = async function (db) {
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Vaccine_Fiji');

  await insertOverlay(
    db,
    createMapOverlay(1, undefined, 'SubDistrict', 'Sub-Division'),
    mapOverlayGroupId,
  );
  await insertOverlay(
    db,
    createMapOverlay(1, 'district', 'District', 'Division'),
    mapOverlayGroupId,
  );
  await insertOverlay(
    db,
    createMapOverlay(2, undefined, 'SubDistrict', 'Sub-Division'),
    mapOverlayGroupId,
  );
  await insertOverlay(
    db,
    createMapOverlay(2, 'district', 'District', 'Division'),
    mapOverlayGroupId,
  );
};

exports.down = async function (db) {
  await deleteOverlay(db, getOverlayId(1, 'SubDistrict'));
  await deleteOverlay(db, getOverlayId(1, 'District'));
  await deleteOverlay(db, getOverlayId(2, 'SubDistrict'));
  await deleteOverlay(db, getOverlayId(2, 'District'));
};
