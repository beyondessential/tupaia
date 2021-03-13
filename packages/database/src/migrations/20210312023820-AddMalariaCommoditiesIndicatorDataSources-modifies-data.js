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
    code: 'MAL_ACT_6x1',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'mpX1hnzcNdF', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_ACT_6x2',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'F16bAt5LL2Y', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_ACT_6x3',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'sQbkGMFRJXA', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_ACT_6x4',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'ZGHrs4XUnwd', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_G6PD_RDT',
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
    code: 'MAL_Primaquine_15_mg',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'O38zgx6BCBe', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_Primaquine_7_5_mg',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'jb7ERAfv5VQ', isDataRegional: false, dhisDataType: 'Indicator' },
  },
  {
    id: generateId(),
    code: 'MAL_RDT',
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
    code: 'MAL_Paracetamol',
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
