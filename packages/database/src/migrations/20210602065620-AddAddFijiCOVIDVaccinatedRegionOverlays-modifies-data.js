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

const createMapOverlay = (doseNum, level) => ({
  id: `FJ_COVID_TRACKING_Dose_${doseNum}_${level}`,
  name: `COVID-19 Vaccine Dose ${doseNum} (${level})`,
  userGroup: 'COVID-19',
  dataElementCode: doseNum === 1 ? 'COVIDVac4' : 'COVIDVac8',
  measureBuilderConfig: {
    entityAggregation: {
      dataSourceEntityType: 'facility',
    },
  },
  measureBuilder: 'sumPerOrgUnit',
  presentationOptions: {
    scaleType: 'neutral',
    scaleColorScheme: 'default-reverse',
    displayType: 'shaded-spectrum',
    scaleBounds: {
      left: {
        min: 0,
        max: 0,
      },
    },
    measureLevel: level,
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
  const mapOverlayGroupId = await codeToId(db, 'map_overlay_group', 'COVID19_Fiji');

  await insertOverlay(db, createMapOverlay(1, 'SubDistrict'), mapOverlayGroupId);
  await insertOverlay(db, createMapOverlay(1, 'District'), mapOverlayGroupId);
  await insertOverlay(db, createMapOverlay(2, 'SubDistrict'), mapOverlayGroupId);
  await insertOverlay(db, createMapOverlay(2, 'District'), mapOverlayGroupId);
};

exports.down = async function (db) {
  await deleteOverlay(db, createMapOverlay(1, 'SubDistrict'));
  await deleteOverlay(db, createMapOverlay(1, 'District'));
  await deleteOverlay(db, createMapOverlay(2, 'SubDistrict'));
  await deleteOverlay(db, createMapOverlay(2, 'District'));
};
