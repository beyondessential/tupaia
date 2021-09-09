'use strict';

import { generateId, insertObject } from '../utilities';

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

const DATA_ELEMENTS = [
  {
    id: generateId(),
    code: 'MAL_3645d4bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'mpX1hnzcNdF', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_199ffeec',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'F16bAt5LL2Y', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_46cfdeec',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'sQbkGMFRJXA', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_566bceec',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'ZGHrs4XUnwd', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_47bb143e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'mQ1LF5UiwaY', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_ORS',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'ycYSHUUwAUR', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_5de7d4bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'O38zgx6BCBe', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_5de2a4bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'jb7ERAfv5VQ', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_47b2b43e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'XTyihjzrD0M', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_Artesunate',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'd5PaDVS1Nyt', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_Paracetemol',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'pf5IhI1mwdC', isDataRegional: false, dhisDataType: 'Indicator' },
  },
];

exports.up = async function (db) {
  for (const dataElement of DATA_ELEMENTS) {
    await insertObject(db, 'data_source', dataElement);
  }
};

exports.down = async function (db) {
  for (const dataElement of DATA_ELEMENTS) {
    await db.runSql(`
      DELETE FROM data_source
      where code = '${dataElement.code}'
    `);
  }
};

exports._meta = {
  version: 1,
};
