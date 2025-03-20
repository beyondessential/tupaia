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

const dashboardGroupCodes = [
  'FJ_Covid_Fiji_Country_COVID-19',
  'FJ_Covid_Fiji_District_COVID-19',
  'FJ_Covid_Fiji_Village_COVID-19',
  'FJ_Covid_Fiji_SubDistrict_COVID-19',
];
const mapOverlayIds = [
  'FJ_COVID_TRACKING_Dose_1_Facility',
  'FJ_COVID_TRACKING_Dose_2_Facility',
  'FJ_COVID_TRACKING_Dose_1_SubDistrict',
  'FJ_COVID_TRACKING_Dose_1_District',
  'FJ_COVID_TRACKING_Dose_2_SubDistrict',
  'FJ_COVID_TRACKING_Dose_2_District',
  'FJ_COVID_TRACKING_Dose_1_SubDistrict_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_1_District_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_2_SubDistrict_Percentage_Vaccinated',
  'FJ_COVID_TRACKING_Dose_2_District_Percentage_Vaccinated',
];
const projectCode = 'supplychain_fiji';
const newUserGroup = 'Public';
const oldUserGroup = 'Donor';
const oldMapOverlayUserGroup = 'Fiji Supply Chain';

exports.up = async function (db) {
  return db.runSql(`
    update "dashboardGroup" 
    set "userGroup" = '${newUserGroup}' 
    where code in (${arrayToDbString(dashboardGroupCodes)});

    update "mapOverlay" 
    set "userGroup" = '${newUserGroup}' 
    where id in (${arrayToDbString(mapOverlayIds)});

    update "project" 
    set "user_groups" = '{${newUserGroup}}' 
    where code = '${projectCode}';

  `);
};

exports.down = function (db) {
  return db.runSql(`
    update "dashboardGroup" 
    set "userGroup" = '${oldUserGroup}' 
    where code in (${arrayToDbString(dashboardGroupCodes)});

    update "mapOverlay" 
    set "userGroup" = '${oldMapOverlayUserGroup}' 
    where id in (${arrayToDbString(mapOverlayIds)});

    update "project" 
    set "user_groups" = '{${oldUserGroup}}' 
    where code = '${projectCode}';

  `);
};

exports._meta = {
  version: 1,
};
