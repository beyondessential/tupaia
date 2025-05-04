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

const createMapOverlay = doseNum => ({
  id: `FJ_COVID_TRACKING_Dose_${doseNum}_Facility`,
  name: `COVID-19 Vaccine Dose ${doseNum} (Facility)`,
  userGroup: 'Fiji Supply Chain',
  dataElementCode: doseNum === 1 ? 'COVIDVac4' : 'COVIDVac8',
  measureBuilderConfig: {
    aggregations: [
      {
        type: 'FINAL_EACH_DAY',
      },
    ],
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  measureBuilder: 'sumAllPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    displayType: 'spectrum',
    scaleBounds: {
      left: {
        max: 1,
        min: 1,
      },
    },
    measureLevel: 'Facility',
    scaleColorScheme: 'default',
    hideByDefault: {
      null: true,
    },
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

const deleteOverlay = async (db, overlay) => {
  return db.runSql(`
    delete from "mapOverlay" where "id" = '${overlay.id}';
    delete from "map_overlay_group_relation" where "child_id" = '${overlay.id}';
  `);
};

exports.up = async function (db) {
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Vaccine_Fiji');

  await insertOverlay(db, createMapOverlay(1), mapOverlayGroupId);
  await insertOverlay(db, createMapOverlay(2), mapOverlayGroupId);
};

exports.down = async function (db) {
  await deleteOverlay(db, createMapOverlay(1));
  await deleteOverlay(db, createMapOverlay(2));
};
