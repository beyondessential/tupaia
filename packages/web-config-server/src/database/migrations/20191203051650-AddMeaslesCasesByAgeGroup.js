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
  gte5: 'CD_Measles_Age_Gte5_Cases',
  lt5: 'CD_Measles_Age_Lt5_Cases',
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

const getBuilderConfig = ({ operator, value }) => ({
  dataValues: { CD94: { value, operator } },
  programCode: 'CD8',
  dataSourceType: 'custom',
});

exports.up = async function(db) {
  await insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: MAP_OVERLAY_IDS.gte5,
    name: 'Age >= 5 yrs Measles Cases',
    measureBuilderConfig: getBuilderConfig({ operator: '>=', value: 5 }),
  });
  return insertObject(db, 'mapOverlay', {
    ...BASE_OVERLAY,
    id: MAP_OVERLAY_IDS.lt5,
    name: 'Age < 5 yrs Measles Cases',
    measureBuilderConfig: getBuilderConfig({ operator: '<', value: 5 }),
  });
};

exports.down = async function(db) {
  await db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.gte5}'`);
  return db.runSql(`DELETE FROM "mapOverlay" WHERE id = '${MAP_OVERLAY_IDS.lt5}'`);
};

exports._meta = {
  version: 1,
};
