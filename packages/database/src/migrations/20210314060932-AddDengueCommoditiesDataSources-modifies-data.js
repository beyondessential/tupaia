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
    code: 'mSupply_559794bf',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'EKWzHRGV4Vy', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_478a343e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'R78zgTs3U43', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_d55ddc00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'VlftBWjzl7S', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_08491c00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'X3hnyjBFwqs', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_477d943e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'zr4pznzsg1L', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_9dd1cc00',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'A9pngHYYgBr', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_4777c43e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'rsMZx9Ly5dM', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_4771c43e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'D1YXUIwOcEj', isDataRegional: false },
  },
  {
    id: generateId(),
    code: 'mSupply_476b743e',
    type: 'dataElement',
    service_type: 'dhis',
    config: { dhisId: 'LUJbmqaEWjK', isDataRegional: false },
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
