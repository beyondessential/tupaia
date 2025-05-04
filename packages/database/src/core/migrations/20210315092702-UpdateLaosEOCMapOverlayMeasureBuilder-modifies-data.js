'use strict';

import { updateValues, arrayToDbString } from '../utilities';

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

const OVERLAY_IDS = [
  'LAOS_EOC_Total_Malaria_Cases_By_Sub_District',
  'LAOS_EOC_Total_Malaria_Deaths_By_Sub_District',
  'LAOS_EOC_Total_Measles_Deaths_By_Sub_District',
  'LAOS_EOC_Total_Measles_Cases_By_Sub_District',
  'LAOS_EOC_Total_Malaria_Cases_By_Facility',
  'LAOS_EOC_Total_Malaria_Deaths_By_Facility',
  'LAOS_EOC_Total_Measles_Cases_By_Facility',
  'LAOS_EOC_Total_Measles_Deaths_By_Facility',
];

async function getMapOverlayById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "mapOverlay"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function updateBuilderConfigByOverlayId(db, newConfig, overlayId) {
  return updateValues(db, 'mapOverlay', { measureBuilderConfig: newConfig }, { id: overlayId });
}

exports.up = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilder" = 'sumLatestPerOrgUnit'
    WHERE id IN (${arrayToDbString(OVERLAY_IDS)});
  `);

  for (const overlayId of OVERLAY_IDS) {
    const mapOverlay = await getMapOverlayById(db, overlayId);
    const { measureBuilderConfig } = mapOverlay;
    delete measureBuilderConfig.aggregationType;
    await updateBuilderConfigByOverlayId(db, measureBuilderConfig, overlayId);
  }
};

exports.down = async function (db) {
  await db.runSql(`
    UPDATE "mapOverlay"
    SET "measureBuilder" = 'valueForOrgGroup'
    WHERE id IN (${arrayToDbString(OVERLAY_IDS)});
  `);

  for (const overlayId of OVERLAY_IDS) {
    const mapOverlay = await getMapOverlayById(db, overlayId);
    const { measureBuilderConfig } = mapOverlay;
    measureBuilderConfig.aggregationType = 'SUM';
    await updateBuilderConfigByOverlayId(db, measureBuilderConfig, overlayId);
  }
};

exports._meta = {
  version: 1,
};
