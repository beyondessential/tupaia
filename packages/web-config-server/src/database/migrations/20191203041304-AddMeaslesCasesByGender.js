'use strict';

import { insertObject } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const MAP_OVERLAY_IDS = {
  male: 'CD_Measles_Male_Cases',
  female: 'CD_Measles_Female_Cases',
};
const BASE_OVERLAY = {
  groupName: 'Communicable Diseases',
  userGroup: 'Tonga Communicable Diseases',
  dataElementCode: 'value',
  displayType: 'radius',
  isDataRegional: false,
  values: [{ color: 'blue', value: 'other' }, { color: 'grey', value: null }],
  measureBuilder: 'countEventsPerOrgUnit',
  countryCodes: '{TO}',
};

const getBuilderConfigForGender = gender => ({
  dataValues: { CD95: gender },
  programCode: 'CD8',
  dataSourceType: 'custom',
});

exports.up = async function(db) {
  await insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: MAP_OVERLAY_IDS.male,
    name: 'Male Measles Cases',
    measureBuilderConfig: getBuilderConfigForGender('Male'),
  });
  return insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: MAP_OVERLAY_IDS.female,
    name: 'Female Measles Cases',
    measureBuilderConfig: getBuilderConfigForGender('Female'),
  });
};

exports.down = async function(db) {
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.male}'`);
  return db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.female}'`);
};

exports._meta = {
  version: 1,
};
