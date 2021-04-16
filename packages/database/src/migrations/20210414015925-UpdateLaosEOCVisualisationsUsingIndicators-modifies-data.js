'use strict';

import { arrayToDbString } from '../utilities';

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

const DASHBOARD_IDS = [
  'Laos_EOC_Malaria_Stock_Availability_Sub_District',
  'Laos_EOC_Malaria_Stock_Availability_Facility',
  'Laos_EOC_Malaria_Critical_Item_Availability',
  'Laos_EOC_Malaria_Critical_Item_Availability_Single_Value',
];

const OVERLAY_IDS = [
  'Laos_EOC_Malaria_G6PD_RDT',
  'Laos_EOC_Malaria_Primaquine',
  'Laos_EOC_Malaria_RDT',
  'Laos_EOC_Malaria_Artesunate',
  'Laos_EOC_Malaria_ORS',
  'Laos_EOC_Malaria_ACT',
];

exports.up = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" || '{"dataPeriodType": "MONTH"}'
    WHERE id IN (${arrayToDbString(DASHBOARD_IDS)});

    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" || '{"dataPeriodType": "MONTH"}'
    WHERE id IN (${arrayToDbString(OVERLAY_IDS)});
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilderConfig" = "dataBuilderConfig" - 'dataPeriodType'
    WHERE id IN (${arrayToDbString(DASHBOARD_IDS)});

    UPDATE "mapOverlay"
    SET "measureBuilderConfig" = "measureBuilderConfig" - 'dataPeriodType'
    WHERE id IN (${arrayToDbString(OVERLAY_IDS)});
  `);
};

exports._meta = {
  version: 1,
};
